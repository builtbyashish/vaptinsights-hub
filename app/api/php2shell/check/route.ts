import { NextRequest, NextResponse } from "next/server";
import { AuditRequest, AuditReport, TelemetrySignal, CveAssessment } from "@/app/php2shell/types";
import { SECURE_PHP_BASELINES, CORE_VULNERABILITIES } from "@/app/php2shell/constants";

// SSRF prevention: filter out loopback, private ranges, and cloud metadata targets
function isDisallowedTarget(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16
    if (a === 0) return true;
  }

  return false;
}

function compareSemver(v1: string, v2: string): number {
  const p1 = v1.split(".").map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length);

  for (let i = 0; i < len; i++) {
    const a = p1[i] ?? 0;
    const b = p2[i] ?? 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuditRequest;
    const { url, authorized, scanMode = "PASSIVE_TELEMETRY" } = body;

    if (!authorized) {
      return NextResponse.json(
        { error: "Assessment authorization required. Please confirm target testing permissions." },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid HTTP or HTTPS target address is required." },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json(
          { error: "Only web endpoints operating over HTTP or HTTPS are supported." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Malformatted target URL syntax. Example: https://target-app.com" },
        { status: 400 }
      );
    }

    if (isDisallowedTarget(parsed.hostname)) {
      return NextResponse.json(
        { error: "Target host resolves to a private, loopback, or metadata subnet and is blocked." },
        { status: 400 }
      );
    }

    // Passive HTTP discovery
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let res: Response;
    let bodySlice = "";
    try {
      res = await fetch(parsed.toString(), {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; VAPTInsights-Security-Scanner/2.4; +https://vaptinsights.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      const raw = await res.text();
      bodySlice = raw.slice(0, 100000);
    } catch (err: unknown) {
      clearTimeout(timeout);
      const isTimeout = (err as { name?: string })?.name === "AbortError";
      return NextResponse.json(
        {
          error: isTimeout
            ? "Remote endpoint failed to respond within the 12-second audit deadline."
            : "Network connection refused by target host or gateway unreachable.",
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeout);
    }

    const resolvedEndpoint = res.url || parsed.toString();
    const httpStatus = res.status;

    // Telemetry extraction
    const xpb = res.headers.get("x-powered-by") || "";
    const serverHeader = res.headers.get("server") || "";
    const setCookie = res.headers.get("set-cookie") || "";
    const cfPowered = res.headers.get("x-cf-powered-by") || "";

    const telemetrySignals: TelemetrySignal[] = [
      {
        category: "RUNTIME",
        key: "HTTP_STATUS",
        value: `${httpStatus}`,
        interpretation: `Host is reachable and returned HTTP ${httpStatus}.`,
      },
    ];

    if (serverHeader) {
      telemetrySignals.push({
        category: "HEADER",
        key: "SERVER_BANNER",
        value: serverHeader,
        interpretation: `Public server banner advertised as "${serverHeader}".`,
      });
    }

    // Version detection logic
    let detectedVersion: string | null = null;
    let versionOrigin = "";

    const xpbMatch = xpb.match(/PHP\/([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
    const serverMatch = serverHeader.match(/PHP\/([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);

    if (xpbMatch) {
      detectedVersion = xpbMatch[1];
      versionOrigin = "X-Powered-By Header";
      telemetrySignals.push({
        category: "HEADER",
        key: "X-POWERED-BY",
        value: xpb,
        interpretation: `Unmasked PHP engine version disclosed (${detectedVersion}).`,
      });
    } else if (serverMatch) {
      detectedVersion = serverMatch[1];
      versionOrigin = "Server Header Banner";
      telemetrySignals.push({
        category: "HEADER",
        key: "SERVER_PHP_BANNER",
        value: serverMatch[0],
        interpretation: `Web server module discloses active PHP runtime (${detectedVersion}).`,
      });
    }

    // Architecture & Concurrency Model inference
    let sapiArchitecture: string | null = null;
    let workerPersistence = false;
    const lowerServer = serverHeader.toLowerCase();

    if (lowerServer.includes("nginx")) {
      sapiArchitecture = "PHP-FPM (FastCGI Process Manager)";
      workerPersistence = true;
      telemetrySignals.push({
        category: "WORKER",
        key: "CONCURRENCY_MODEL",
        value: "Nginx -> FastCGI / PHP-FPM",
        interpretation:
          "Persistent worker architecture detected. Long-lived worker processes are directly susceptible to cross-request state reuse (CVE-2026-109619).",
      });
    } else if (lowerServer.includes("apache")) {
      sapiArchitecture = "Apache HTTPD Handler (mod_php or fcgid)";
      workerPersistence = false;
      telemetrySignals.push({
        category: "WORKER",
        key: "CONCURRENCY_MODEL",
        value: "Apache HTTPD Handler",
        interpretation: "Standard process lifecycle. Transient request worker model.",
      });
    } else if (lowerServer.includes("litespeed")) {
      sapiArchitecture = "LiteSpeed Server API (LSAPI)";
      workerPersistence = true;
      telemetrySignals.push({
        category: "WORKER",
        key: "CONCURRENCY_MODEL",
        value: "LiteSpeed LSAPI",
        interpretation: "Persistent worker model active.",
      });
    }

    // Presence signatures
    const presenceFound: string[] = [];
    if (setCookie.includes("PHPSESSID")) {
      presenceFound.push("PHPSESSID Cookie");
      telemetrySignals.push({
        category: "PRESENCE",
        key: "SESSION_TOKEN",
        value: "PHPSESSID",
        interpretation: "Standard PHP session tracking cookie observed in response headers.",
      });
    }
    if (bodySlice.includes(".php")) {
      presenceFound.push("PHP Endpoint References");
    }
    if (bodySlice.includes("wp-content") || bodySlice.includes("wp-includes")) {
      presenceFound.push("WordPress PHP Architecture");
    }
    if (bodySlice.includes("laravel_session") || bodySlice.includes("XSRF-TOKEN")) {
      presenceFound.push("Laravel Application Framework");
    }

    if (presenceFound.length > 0 && !detectedVersion) {
      telemetrySignals.push({
        category: "PRESENCE",
        key: "APPLICATION_SIGNATURES",
        value: presenceFound.join(", "),
        interpretation: "Application surface exhibits definitive PHP runtime artifacts.",
      });
    }

    // Vulnerability Assessment
    let status: "CRITICAL_EXPOSURE" | "PATCHED_SECURE" | "UNVERIFIED_PERIMETER" =
      "UNVERIFIED_PERIMETER";
    let headline = "PHP Runtime Baseline Unverified";
    let rationale =
      "Application indicators suggest a PHP-powered backend, but exact release telemetry is hidden by perimeter proxies or web server configurations.";
    let branch: string | null = null;
    let isEol = false;
    let minimumPatchedRelease: string | null = null;

    const attackSurfaceNotes: string[] = [];

    const cveAssessments: CveAssessment[] = CORE_VULNERABILITIES.map((cve) => ({
      cveId: cve.cveId,
      cvssScore: cve.cvssScore,
      severity: cve.severity,
      advisoryId: cve.advisoryId,
      advisoryUrl: cve.advisoryUrl,
      name: cve.name,
      mechanism: cve.mechanism,
      verdict: "SUSPECTED_UNVERIFIED",
      exposureDetails: "Public version banner is masked. Server must be audited via CLI.",
    }));

    if (detectedVersion) {
      const match = detectedVersion.match(/^(\d+\.\d+)/);
      branch = match ? match[1] : null;

      if (branch && branch in SECURE_PHP_BASELINES) {
        minimumPatchedRelease = SECURE_PHP_BASELINES[branch];
        const cmp = compareSemver(detectedVersion, minimumPatchedRelease);

        if (cmp >= 0) {
          status = "PATCHED_SECURE";
          headline = "PHP Runtime Patched & Secure";
          rationale = `Target is serving PHP ${detectedVersion}, satisfying the security baseline threshold of ${minimumPatchedRelease} for branch ${branch}.x.`;
          cveAssessments[0].verdict = "PATCHED";
          cveAssessments[0].exposureDetails = `Engine build ${detectedVersion} incorporates official boundary bounds in rfc1867.c.`;
          cveAssessments[1].verdict = "PATCHED";
          cveAssessments[1].exposureDetails = `Persistent worker teardown routines properly flush request-level SG() memory.`;
          attackSurfaceNotes.push(
            `Installed release ${detectedVersion} contains core fixes for CVE-2026-109618 and CVE-2026-109619.`
          );
        } else {
          status = "CRITICAL_EXPOSURE";
          headline = "Critical RCE Exposure: Unpatched PHP Engine Detected";
          rationale = `Target advertises PHP ${detectedVersion}, which is vulnerable to remote code execution. Branch ${branch}.x requires upgrade to at least ${minimumPatchedRelease}.`;
          cveAssessments[0].verdict = "VULNERABLE";
          cveAssessments[0].exposureDetails = `RFC 1867 parser in ${detectedVersion} is vulnerable to memory exhaustion and Longjmp crash corruption.`;
          cveAssessments[1].verdict = "VULNERABLE";
          cveAssessments[1].exposureDetails = workerPersistence
            ? `Active ${sapiArchitecture} worker processes will retain corrupted request memory across connections.`
            : `Vulnerable parser state, though ephemeral worker execution reduces cross-request persistence.`;
          attackSurfaceNotes.push(
            `Vulnerable engine release ${detectedVersion} confirmed via ${versionOrigin}.`
          );
        }
      } else {
        // EOL branch (< 8.2)
        isEol = true;
        status = "CRITICAL_EXPOSURE";
        headline = "Critical Exposure: End-of-Life PHP Runtime";
        rationale = `Target reports PHP ${detectedVersion}, an End-of-Life branch that receives no security patches. Vulnerabilities in this engine cannot be remediated without a major branch upgrade.`;
        cveAssessments[0].verdict = "VULNERABLE";
        cveAssessments[0].exposureDetails = `Branch ${branch || detectedVersion} is completely unsupported by the PHP foundation.`;
        cveAssessments[1].verdict = "VULNERABLE";
        cveAssessments[1].exposureDetails = `Unpatched memory management routines in legacy runtime.`;
        attackSurfaceNotes.push(
          `Runtime is in End-of-Life state. No official upstream fix exists for this branch.`
        );
      }
    } else {
      // Version masked
      if (presenceFound.length > 0 || lowerServer.includes("nginx") || lowerServer.includes("apache")) {
        attackSurfaceNotes.push(
          "Perimeter reverse proxy (Cloudflare/WAF or Nginx) strips runtime disclosure headers. Remote inference only."
        );
        if (workerPersistence) {
          attackSurfaceNotes.push(
            "Persistent FastCGI/PHP-FPM worker architecture detected behind reverse proxy."
          );
        }
      } else {
        headline = "No PHP Perimeter Footprint Detected";
        rationale =
          "The target web asset did not return PHP response headers or application signatures. The service may run another stack (Node, Go, Python, Java) or operate behind strict perimeter masking.";
        attackSurfaceNotes.push("Zero PHP runtime signatures identified.");
      }
    }

    const report: AuditReport = {
      targetUrl: parsed.toString(),
      resolvedEndpoint,
      httpStatus,
      status,
      headline,
      rationale,
      detectedEngine: {
        language: "PHP",
        version: detectedVersion,
        branch,
        isEol,
        minimumPatchedRelease,
        sapiArchitecture,
        workerPersistence,
      },
      telemetrySignals,
      cveAssessments,
      attackSurfaceNotes,
      remediationPlaybook: {
        summary:
          status === "PATCHED_SECURE"
            ? "Your runtime environment satisfies baseline security thresholds. Implement perimeter header stripping to prevent public reconnaissance."
            : "Immediate infrastructure remediation required. Deploy patched PHP packages and activate WAF virtual patching rules.",
        actionItems: [
          "Validate installed runtime packages directly on server via `php -v` or `php-fpm -v`.",
          "Upgrade PHP packages to 8.2.35+, 8.3.36+, 8.4.27+, or 8.5.12+ via distribution package manager.",
          "In php.ini, set `expose_php = Off` to eliminate runtime fingerprinting by external scanners.",
          "Configure Web Application Firewall rules to restrict malformed multipart/form-data boundary lengths.",
          "Audit long-lived PHP-FPM process pools and restart workers after package deployment.",
        ],
        hardeningCommands: [
          {
            label: "Verify Server Package",
            platform: "All Linux / Unix",
            command: "php -v && php-fpm -v",
            explanation: "Inspects the compiled binary version and release timestamp directly on host.",
          },
          {
            label: "Debian / Ubuntu Upgrade",
            platform: "Apt Package Manager",
            command: "sudo apt update && sudo apt --only-upgrade install 'php8.*'",
            explanation: "Pulls updated security release packages from distribution repositories.",
          },
          {
            label: "RHEL / Rocky / AlmaLinux",
            platform: "DNF Package Manager",
            command: "sudo dnf check-update 'php*' && sudo dnf upgrade 'php*'",
            explanation: "Upgrades active PHP runtime packages to latest vendor backport.",
          },
          {
            label: "Production Perimeter Hardening",
            platform: "php.ini Configuration",
            command: "sed -i 's/^expose_php = .*/expose_php = Off/' /etc/php/*/fpm/php.ini",
            explanation: "Suppresses X-Powered-By header across all HTTP responses.",
          },
        ],
        wafMitigations: [
          "ModSecurity: Enable rule to enforce maximum multipart part header lengths (< 4096 bytes).",
          "Cloudflare WAF: Enable managed rule sets for PHP Engine (CVE-2026-109618 / CVE-2026-109619).",
          "AWS WAF: Activate AWS Managed Rules Core Rule Set (CRS) with SizeRestrictions_BODY rule.",
        ],
      },
      auditLimitations:
        "This VAPT Insights diagnostic evaluates public HTTP response headers, transport telemetry, and application presence signatures. Linux distributions (such as Debian, Ubuntu, and Red Hat Enterprise Linux) frequently backport critical security patches without incrementing the upstream PHP version number. Always verify installed package releases directly on your hosting instances.",
    };

    return NextResponse.json(report);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal audit processing failure";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
