export const SECURE_PHP_BASELINES: Record<string, string> = {
  "8.5": "8.5.12",
  "8.4": "8.4.27",
  "8.3": "8.3.36",
  "8.2": "8.2.35",
};

export const CORE_VULNERABILITIES = [
  {
    cveId: "CVE-2026-109618",
    cvssScore: "9.2 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)",
    severity: "CRITICAL" as const,
    advisoryId: "GHSA-w8hw-w9fx-j79w",
    advisoryUrl: "https://github.com/advisories/GHSA-w8hw-w9fx-j79w",
    name: "PHP Multipart/form-data RFC 1867 Parser Unbounded Allocation & Memory Corruption",
    mechanism:
      "When processing multipart boundary headers, the internal rfc1867.c parser fails to enforce ceiling thresholds, permitting unbounded memory allocation. Upon exceeding memory_limit, the runtime invokes longjmp to bailout without executing destructor chains, leaving corrupted request structures in process memory.",
  },
  {
    cveId: "CVE-2026-109619",
    cvssScore: "9.2 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)",
    severity: "CRITICAL" as const,
    advisoryId: "GHSA-6wmf-4rv5-p3rp",
    advisoryUrl: "https://github.com/advisories/GHSA-6wmf-4rv5-p3rp",
    name: "PHP-FPM Persistent Worker Stale Global Memory Reuse Remote Code Execution",
    mechanism:
      "Persistent FastCGI and PHP-FPM worker pools reuse long-lived process instances across consecutive requests. When a prior request aborts due to parser OOM corruption, dangling global references in SG(request_info) persist into subsequent request lifecycles, enabling unauthenticated remote code execution.",
  },
];

export const VAPT_RESEARCH_BRIEF = {
  title: "VAPT Insights Vulnerability Intelligence: Core PHP RCE Exploitation Vectors",
  overview:
    "The PHP2Shell vulnerability class represents a critical pre-execution flaw in the Zend engine. Because multipart boundary parsing occurs inside core C modules before web framework bootstrap routines (WordPress, Laravel, Drupal, Symfony) are reached, application-level filters and plugins cannot mitigate this risk without runtime engine patching or perimeter virtual patching.",
  technicalPillars: [
    {
      title: "Pre-Application Attack Surface",
      description:
        "HTTP POST requests containing multipart payloads trigger the rfc1867 parser immediately upon connection handling. The vulnerability executes prior to index.php or authentication middleware execution.",
    },
    {
      title: "Worker Persistence Vulnerability",
      description:
        "High-performance PHP architectures (Nginx with PHP-FPM, LiteSpeed LSAPI) employ long-running worker processes to maximize throughput. This execution model makes systems uniquely susceptible to cross-request state pollution.",
    },
    {
      title: "Perimeter Shielding & Virtual Patching",
      description:
        "Web Application Firewalls (ModSecurity, Cloudflare WAF, AWS WAF) can inspect multipart boundary lengths and header counts to drop malformed requests before they hit upstream FPM pools.",
    },
  ],
};

export const COMMON_TEST_TARGETS = [
  { label: "WordPress Foundation", url: "https://wordpress.org", note: "Nginx / Persistent Worker" },
  { label: "Drupal CMS", url: "https://drupal.org", note: "Enterprise PHP CMS" },
  { label: "PHP Project Core", url: "https://www.php.net", note: "Official PHP Infrastructure" },
];
