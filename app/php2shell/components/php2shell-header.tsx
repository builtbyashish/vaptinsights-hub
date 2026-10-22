import Link from "next/link";

export function Php2ShellHeader() {
  return (
    <header className="border-b border-white/8 bg-[#061420]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        {/* Top tier: Ecosystem Navigation */}
        <div className="flex h-9 sm:h-10 items-center justify-between border-b border-white/5">
          <a
            href="https://vaptinsights.com"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 sm:size-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M19 12H5m0 0 6 6m-6-6 6-6" />
            </svg>
            <span>Back to VAPT Insights</span>
          </a>

          <span className="text-[10px] sm:text-xs font-mono text-slate-400 hidden xs:inline-block">
            vaptinsights.com
          </span>
        </div>

        {/* Main brand row */}
        <div className="flex min-h-[4rem] items-center justify-between py-2.5 sm:py-0 gap-3">
          <Link
            href="/php2shell"
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1"
            aria-label="VAPT Insights × PHP2SHELL"
          >
            <span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-md bg-[#5966e9] text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-500/20">
              V
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">
                <span>VAPT Insights</span>{" "}
                <span className="text-cyan-300">× PHP2SHELL</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-tight truncate sm:whitespace-normal mt-0.5">
                PHP Engine Runtime Vulnerability Auditor
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-rose-300">
              <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
              CVE-2026-109618 / 109619
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-cyan-300">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Beta v1.0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
