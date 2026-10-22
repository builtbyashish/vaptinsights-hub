"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  Server,
  Layers,
  FileCode,
  Shield,
  Download,
} from "lucide-react";
import { AuditReport } from "../types";

interface AuditReportViewProps {
  report: AuditReport;
  onReset: () => void;
  onOpenPromo?: () => void;
}

export function AuditReportView({ report, onReset, onOpenPromo }: AuditReportViewProps) {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "CVES" | "TELEMETRY" | "PLAYBOOK">(
    "OVERVIEW"
  );
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const isCritical = report.status === "CRITICAL_EXPOSURE";
  const isPatched = report.status === "PATCHED_SECURE";
  const isUnverified = report.status === "UNVERIFIED_PERIMETER";

  const exportMarkdownAdvisory = () => {
    const md = `# VAPT Insights Threat Advisory Report
## Target: ${report.targetUrl}
* **Status**: ${report.status}
* **Headline**: ${report.headline}
* **HTTP Status**: ${report.httpStatus}
* **Resolved Host**: ${report.resolvedEndpoint}

---

### Executive Risk Summary
${report.rationale}

---

### Detected Engine Telemetry
* Language: ${report.detectedEngine.language}
* Disclosed Version: ${report.detectedEngine.version || "Masked / Hidden"}
* SAPI Architecture: ${report.detectedEngine.sapiArchitecture || "Unknown"}
* Persistent Worker Susceptibility: ${report.detectedEngine.workerPersistence ? "YES (Exposed to state reuse)" : "NO"}

---

### Vulnerability Assessments
${report.cveAssessments
  .map(
    (c) => `#### ${c.cveId} - ${c.name}
* **Verdict**: ${c.verdict}
* **CVSS Score**: ${c.cvssScore}
* **Advisory**: ${c.advisoryId} (${c.advisoryUrl})
* **Exposure Details**: ${c.exposureDetails}
`
  )
  .join("\n")}

---

### Remediation Playbook
${report.remediationPlaybook.actionItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

#### Server Hardening Commands
${report.remediationPlaybook.hardeningCommands
  .map((cmd) => `\`\`\`bash\n# ${cmd.label} (${cmd.platform})\n${cmd.command}\n\`\`\``)
  .join("\n\n")}

---
*Report generated automatically by VAPT Insights Platform (https://vaptinsights.com).*
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VAPT_Insights_Audit_${new URL(report.targetUrl).hostname}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Risk Assessment Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-2xl sm:p-8 ${
          isCritical
            ? "border-rose-500/30 bg-[#16080e]"
            : isPatched
            ? "border-emerald-500/30 bg-[#051711]"
            : "border-amber-500/30 bg-[#171106]"
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-xl border ${
                isCritical
                  ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
                  : isPatched
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/20 text-amber-300"
              }`}
            >
              {isCritical && <ShieldAlert className="size-7" />}
              {isPatched && <ShieldCheck className="size-7" />}
              {isUnverified && <AlertTriangle className="size-7" />}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isCritical
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : isPatched
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isCritical && "Critical Vulnerability Confirmed"}
                  {isPatched && "Runtime Verified & Patched"}
                  {isUnverified && "Perimeter Masked / Unverified"}
                </span>

                <span className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-xs text-slate-300">
                  HTTP {report.httpStatus}
                </span>

                <span className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-xs text-slate-300">
                  CVSS 9.2
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {report.headline}
              </h2>

              <p className="font-mono text-xs text-slate-400 truncate max-w-2xl">
                {report.resolvedEndpoint}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start">
            {onOpenPromo && (
              <button
                type="button"
                onClick={onOpenPromo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-400 cursor-pointer shadow-sm shadow-cyan-950"
              >
                <ShieldCheck className="size-3.5 text-cyan-400" />
                <span>Full VAPT Scan</span>
              </button>
            )}

            <button
              onClick={exportMarkdownAdvisory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <Download className="size-3.5 text-cyan-400" />
              <span>Export Advisory</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>New Target</span>
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-sm leading-relaxed text-slate-300">{report.rationale}</p>
        </div>
      </div>

      {/* Security Inspector Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-[#050e18] px-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition shrink-0 whitespace-nowrap ${
            activeTab === "OVERVIEW"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="size-3.5" />
          <span>Architecture &amp; Risk</span>
        </button>

        <button
          onClick={() => setActiveTab("CVES")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition shrink-0 whitespace-nowrap ${
            activeTab === "CVES"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="size-3.5" />
          <span>Vulnerability Analysis (CVEs)</span>
        </button>

        <button
          onClick={() => setActiveTab("TELEMETRY")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition shrink-0 whitespace-nowrap ${
            activeTab === "TELEMETRY"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="size-3.5" />
          <span>Perimeter Telemetry ({report.telemetrySignals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PLAYBOOK")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition shrink-0 whitespace-nowrap ${
            activeTab === "PLAYBOOK"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal className="size-3.5" />
          <span>Remediation Playbook</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Runtime Engine Facts */}
          <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 pb-3 border-b border-slate-800">
              Disclosed Runtime Telemetry
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#040a12] border border-slate-800">
                <span className="text-slate-400">Target Language:</span>
                <span className="text-white font-bold">{report.detectedEngine.language}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#040a12] border border-slate-800">
                <span className="text-slate-400">Advertised Version:</span>
                <span
                  className={
                    report.detectedEngine.version ? "text-cyan-300 font-bold" : "text-amber-400"
                  }
                >
                  {report.detectedEngine.version || "Stripped / Masked"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#040a12] border border-slate-800">
                <span className="text-slate-400">SAPI Architecture:</span>
                <span className="text-slate-200">
                  {report.detectedEngine.sapiArchitecture || "Unknown"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#040a12] border border-slate-800">
                <span className="text-slate-400">Worker Model:</span>
                <span
                  className={
                    report.detectedEngine.workerPersistence
                      ? "text-rose-400 font-bold"
                      : "text-slate-300"
                  }
                >
                  {report.detectedEngine.workerPersistence
                    ? "Persistent Process Pool (PHP-FPM)"
                    : "Standard Request Lifecycle"}
                </span>
              </div>
            </div>
          </div>

          {/* Attack Surface & Exposure Notes */}
          <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 pb-3 border-b border-slate-800">
              Attack Surface Analysis
            </h3>

            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              {report.attackSurfaceNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-slate-800 bg-[#040a12] p-4 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-200 font-semibold block mb-1">
                Diagnostic Scope Notice:
              </span>
              {report.auditLimitations}
            </div>
          </div>

          {/* Continuous Platform Testing Callout */}
          <div className="lg:col-span-2 rounded-2xl border border-cyan-500/25 bg-[#06192d]/70 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono">
                <ShieldCheck className="size-4" />
                <span>CONTINUOUS APPLICATION SECURITY TESTING</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Move from single-vector CVE checks to continuous attack surface testing
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                PHP2Shell inspects perimeter runtime signatures. VAPT Insights continuously tests for OWASP Top 10, broken object level authorizations (BOLA), business logic flaws, and exposed perimeter assets.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
              {onOpenPromo && (
                <button
                  type="button"
                  onClick={onOpenPromo}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer text-center"
                >
                  Platform Highlights
                </button>
              )}
              <a
                href="https://vaptinsights.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-[#051322] hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 text-center"
              >
                <span>Open VAPT Insights</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === "CVES" && (
        <div className="space-y-4">
          {report.cveAssessments.map((cve) => (
            <div
              key={cve.cveId}
              className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-white">{cve.cveId}</span>
                  <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                    {cve.cvssScore}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={cve.advisoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    <span>Advisory {cve.advisoryId}</span>
                    <ExternalLink className="size-3" />
                  </a>

                  <span
                    className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      cve.verdict === "VULNERABLE"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : cve.verdict === "PATCHED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {cve.verdict}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">{cve.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{cve.mechanism}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#040a12] p-3.5 text-xs">
                <span className="font-semibold text-slate-400 block mb-0.5">
                  Target Specific Exposure:
                </span>
                <span className="text-slate-200">{cve.exposureDetails}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "TELEMETRY" && (
        <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 pb-3 border-b border-slate-800">
            Perimeter Response Signals
          </h3>

          <div className="divide-y divide-slate-800 overflow-hidden">
            {report.telemetrySignals.map((signal, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="w-28 shrink-0">
                  <span className="inline-block rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400">
                    {signal.category}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{signal.key}</span>
                    <span className="font-mono text-xs text-slate-400 truncate max-w-md">
                      = &quot;{signal.value}&quot;
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {signal.interpretation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "PLAYBOOK" && (
        <div className="space-y-6">
          {/* Action Items */}
          <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-3 border-b border-slate-800">
              Immediate Action Items
            </h3>

            <ol className="space-y-3">
              {report.remediationPlaybook.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-500/20">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Linux Package Hardening Commands */}
          <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-3 border-b border-slate-800">
              Host Remediation Commands
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {report.remediationPlaybook.hardeningCommands.map((cmd, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-[#040a12] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{cmd.label}</span>
                      <span className="ml-2 text-slate-500 text-[11px]">({cmd.platform})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(cmd.command, `${i}`)}
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      {copiedCommand === `${i}` ? (
                        <>
                          <Check className="size-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="font-mono text-cyan-300 bg-black/40 p-2 rounded border border-white/5 overflow-x-auto">
                    {cmd.command}
                  </p>

                  <p className="text-[11px] text-slate-400 font-sans">{cmd.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WAF Virtual Patching */}
          <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Perimeter WAF Virtual Patching Rules
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.remediationPlaybook.wafMitigations.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Remediation Assurance */}
          <div className="rounded-2xl border border-white/8 bg-[#040e1b] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">Automate Continuous Patch Validation</h4>
              <p className="text-[11px] text-slate-400">
                Ensure applied mitigations withstand bypass attempts with scheduled security regression audits on VAPT Insights.
              </p>
            </div>
            <a
              href="https://vaptinsights.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition whitespace-nowrap cursor-pointer"
            >
              <span>Automate with VAPT Insights</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
