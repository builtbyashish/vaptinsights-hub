import { Metadata } from "next";
import { Php2ShellHeader } from "./components/php2shell-header";
import { Php2ShellClient } from "./php2shell-client";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vaptinsights.com"),
  title: "PHP Runtime RCE Auditor (CVE-2026-109618 & 109619) | VAPT Insights",
  description:
    "Free online security auditor to test if your public PHP servers are vulnerable to CVE-2026-109618 and CVE-2026-109619 (PHP2Shell). Fast perimeter telemetry, RFC 1867 parser validation, and patch playbooks.",
  keywords: [
    "CVE-2026-109618",
    "CVE-2026-109619",
    "PHP2Shell",
    "PHP RCE vulnerability audit",
    "PHP multipart parser flaw",
    "FastCGI worker persistence",
    "PHP security scanner",
    "VAPT Insights",
    "PHP 8.1 8.2 8.3 patch",
  ],
  alternates: {
    canonical: "/php2shell",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "PHP Runtime Remote Code Execution Auditor | VAPT Insights",
    description:
      "Non-destructive defensive security tool to test public endpoints for PHP core multipart parser allocation and worker reuse vulnerabilities (CVE-2026-109618 & 109619).",
    url: "https://www.vaptinsights.com/php2shell",
    siteName: "VAPT Insights",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PHP Runtime RCE Auditor (CVE-2026-109618 & 109619)",
    description:
      "Test your web infrastructure against PHP core multipart parser memory bounds and persistent worker state reuse flaws.",
  },
};

// Rich Structured Data for Search Engines & AI Crawlers
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.vaptinsights.com/php2shell#software",
      "name": "PHP2Shell Runtime Vulnerability Auditor",
      "description":
        "Automated defensive assessment tool evaluating public endpoints against PHP core multipart parser unbounded allocations (CVE-2026-109618) and FastCGI/PHP-FPM worker persistence flaws (CVE-2026-109619).",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "All",
      "url": "https://www.vaptinsights.com/php2shell",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
      },
      "featureList": [
        "Passive perimeter reconnaissance via transport headers",
        "RFC 1867 multipart parser state inspection",
        "PHP SAPI concurrency model and persistent pool analysis",
        "Copyable remediation bash scripts and WAF mitigation rules",
        "Exportable Markdown security advisories",
      ],
      "author": {
        "@type": "Organization",
        "name": "VAPT Insights",
        "url": "https://vaptinsights.com",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.vaptinsights.com/php2shell#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is PHP2Shell (CVE-2026-109618 and CVE-2026-109619)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "PHP2Shell refers to a critical vulnerability pair in the PHP Zend engine multipart parser. CVE-2026-109618 enables unbounded memory allocation during multipart form processing prior to user script execution. CVE-2026-109619 allows process memory state corruption to persist across request lifecycles on persistent worker models like PHP-FPM and FastCGI.",
          },
        },
        {
          "@type": "Question",
          "name": "Which PHP versions are secure against PHP2Shell?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Official security patches are available in PHP 8.4.1+, PHP 8.3.18+, and PHP 8.2.28+. All branches on PHP 8.1 and earlier are End-of-Life (EOL) and do not receive upstream security fixes.",
          },
        },
        {
          "@type": "Question",
          "name": "How does the VAPT Insights PHP2Shell auditor work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "The auditor evaluates perimeter transport banners, SAPI telemetry, and standard RFC 1867 parser boundary limits non-destructively. It does not dispatch weaponized exploit payloads or attempt process memory extraction.",
          },
        },
      ],
    },
  ],
};

export default function Php2ShellPage() {
  return (
    <div className="min-h-screen bg-[#07131f] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Php2ShellHeader />
      <main className="flex-1">
        <Php2ShellClient />
      </main>
    </div>
  );
}
