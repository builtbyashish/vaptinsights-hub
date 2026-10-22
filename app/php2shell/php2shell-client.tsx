"use client";

import { useState } from "react";
import { AuditReport } from "./types";
import { AuditConsole } from "./components/audit-console";
import { AuditReportView } from "./components/audit-report-view";
import { ThreatIntelligence } from "./components/threat-intelligence";
import { VaptPromoModal } from "./components/vapt-promo-modal";
import { ShieldCheck, ShieldAlert, AlertOctagon } from "lucide-react";
import { SECURE_PHP_BASELINES } from "./constants";

export function Php2ShellClient() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const handleAuditStart = () => {
    setIsAuditing(true);
    setReport(null);
  };

  const handleAuditComplete = (auditResult: AuditReport) => {
    setIsAuditing(false);
    setReport(auditResult);

    // Trigger promotion modal after a brief delay so the user first sees the report loaded
    try {
      const dismissed = sessionStorage.getItem("vapt_promo_dismissed");
      if (!dismissed) {
        setTimeout(() => {
          setShowPromoModal(true);
        }, 1400);
      }
    } catch {
      setTimeout(() => {
        setShowPromoModal(true);
      }, 1400);
    }
  };

  const handleReset = () => {
    setReport(null);
    setIsAuditing(false);
  };

  const targetDomain = report
    ? (() => {
        try {
          return new URL(report.targetUrl).hostname;
        } catch {
          return undefined;
        }
      })()
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12 space-y-8 sm:space-y-10">
      {/* Editorial Workbench Hero */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-300">
          <AlertOctagon className="size-3.5 shrink-0" />
          <span className="truncate">VAPT Advisory · CVE-2026-109618 / 109619 (CVSS 9.2)</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight sm:leading-tight">
          PHP Runtime Remote Code Execution Auditor
        </h1>

        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          Evaluate public web assets against the critical PHP core multipart parser
          unbounded allocation and persistent worker state reuse flaws. Non-destructive
          perimeter telemetry and diagnostic validation.
        </p>

        {/* Patched Baselines */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-400">Patched Thresholds:</span>
          {Object.entries(SECURE_PHP_BASELINES).map(([branch, version]) => (
            <span
              key={branch}
              className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-emerald-300"
            >
              <ShieldCheck className="size-3" />
              <span>PHP {version}+</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-rose-300">
            <ShieldAlert className="size-3" />
            <span>&le; 8.1 (EOL Unpatched)</span>
          </span>
        </div>
      </div>

      {/* Main Workbench: Scope Console or Diagnostic Report */}
      <div>
        {!report ? (
          <AuditConsole
            onAuditStart={handleAuditStart}
            onAuditComplete={handleAuditComplete}
            isAuditing={isAuditing}
          />
        ) : (
          <AuditReportView
            report={report}
            onReset={handleReset}
            onOpenPromo={() => setShowPromoModal(true)}
          />
        )}
      </div>

      {/* VAPT Research Advisory */}
      <ThreatIntelligence />

      {/* Defensive Standards Notice */}
      <div className="rounded-2xl border border-slate-800 bg-[#071322] p-5 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          VAPT Insights Responsible Defensive Assessment
        </p>
        <p className="max-w-2xl mx-auto leading-relaxed text-slate-400">
          This auditor queries public response banners, SAPI telemetry, and standard RFC 1867 parser behavior. It does not dispatch weaponized exploit payloads or attempt process memory extraction.
        </p>
      </div>

      {/* VAPT Insights Platform Promo Modal */}
      <VaptPromoModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        targetDomain={targetDomain}
      />
    </div>
  );
}
