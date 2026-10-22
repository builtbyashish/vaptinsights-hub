import { Shield, Server, FileCode, CheckCircle2 } from "lucide-react";
import { VAPT_RESEARCH_BRIEF } from "../constants";

export function ThreatIntelligence() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-xl sm:p-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="size-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            VAPT Insights Research Advisory
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {VAPT_RESEARCH_BRIEF.title}
        </h2>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-3xl">
          {VAPT_RESEARCH_BRIEF.overview}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {VAPT_RESEARCH_BRIEF.technicalPillars.map((pillar, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-[#040a12] p-5 space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-cyan-500/10 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/20">
                0{idx + 1}
              </span>
              <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800/80 bg-[#050f1b] p-5 text-xs text-slate-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-[11px]">
          <Server className="size-4 text-cyan-400" />
          <span>Why Application CMS Plugins Cannot Mitigate Core Runtime Flaws</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          Security plugins installed inside CMS ecosystems (WordPress, Drupal, Joomla) or framework middleware (Laravel, Symfony) execute in userland memory space. The PHP multipart parser processes HTTP request bodies at the web-server gateway layer before PHP scripts are initialized. Virtual patching must occur at the web server / WAF perimeter, or via direct runtime binary updates.
        </p>
      </div>
    </div>
  );
}
