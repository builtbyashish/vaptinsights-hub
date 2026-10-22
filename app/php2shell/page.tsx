import { Metadata } from "next";
import { Php2ShellHeader } from "./components/php2shell-header";
import { Php2ShellClient } from "./php2shell-client";

export const metadata: Metadata = {
  title: "PHP Runtime RCE Auditor (CVE-2026-109618 & 109619) | VAPT Insights",
  description:
    "Defensive security assessment tool evaluating PHP engine multipart parser memory bounds, SAPI concurrency models, and persistent worker state exposure.",
  keywords: [
    "CVE-2026-109618",
    "CVE-2026-109619",
    "PHP RCE vulnerability audit",
    "VAPT Insights",
    "PHP multipart parser flaw",
    "FastCGI worker persistence",
  ],
};

export default function Php2ShellPage() {
  return (
    <div className="min-h-screen bg-[#07131f] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Php2ShellHeader />
      <main className="flex-1">
        <Php2ShellClient />
      </main>
    </div>
  );
}
