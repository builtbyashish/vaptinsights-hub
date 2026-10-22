"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDPDPGetScan } from "@/hooks/query-hooks/dpdp.query";
import { DpdpHeader } from "../components/common/dpdp-header";
import { DpdpIcon } from "../components/common/dpdp-icon";
import { DpdpScanForm } from "../components/form/dpdp-scan-form";
import { DpdpProgress } from "../components/common/dpdp-progress";
import { DpdpReportDisplay } from "../components/report/dpdp-report-display";
import { dpdpFooterLinks, dpdpCopy } from "../constants/dpdp-homepage";
import Turnstile from "@/components/common/Turnstile";
import { setGlobalTurnstileToken } from "@/lib/turnstile-store";
import { AlertTriangle } from "lucide-react";

interface ScanPageClientProps {
  scanID: string;
}

export function ScanPageClient({ scanID }: ScanPageClientProps) {
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileTimedOut, setTurnstileTimedOut] = useState(false);

  // Guard: if the invisible challenge doesn't complete in 8s (blocked by
  // browser extension, network, etc.), show a graceful error instead of
  // an infinite spinner.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!turnstileReady) setTurnstileTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [turnstileReady]);

  const { data: scanRecord, isLoading, error, refetch } = useDPDPGetScan(
    scanID,
    turnstileReady,
  );

  const renderContent = () => {
    // Turnstile hasn't verified yet — query is intentionally disabled.
    // Show spinner instead of falling through to the error UI.
    if (!turnstileReady || isLoading) {
      return (
        <div className="mx-auto max-w-md text-center py-20">
          <div className="size-12 mx-auto rounded-full border-2 border-t-cyan-400 border-white/10 animate-spin" />
          <p className="mt-4 text-sm text-slate-400">Loading audit status data...</p>
        </div>
      );
    }

    // Only show the error UI once the query has actually fired and failed.
    if (error || !scanRecord) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
          <div className="flex justify-center">
            <AlertTriangle className="size-8 text-rose-400" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">System Error</h3>
          <p className="mt-2 text-xs text-rose-300">
            {error?.message || "Failed to load compliance record from database."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-white/10 text-xs font-semibold text-white hover:bg-white/15 transition cursor-pointer"
            >
              Retry
            </button>
            <Link 
              href="/compliance/dpdp"
              className="px-4 py-2 rounded-lg bg-cyan-400 text-xs font-semibold text-[#061420] hover:bg-cyan-300 transition"
            >
              Go Back
            </Link>
          </div>
        </div>
      );
    }

    const stage = scanRecord.stage;

    // Render depending on lifecycle stage
    if (stage === "INIT" || stage === "CONFIRMATION_PENDING") {
      return (
        <DpdpScanForm 
          key={scanRecord.scan_id + "-" + (scanRecord.discovered_privacy_policy_url || "")} 
          scanRecord={scanRecord} 
        />
      );
    }

    if (
      stage === "CONFIRMED" || 
      stage === "SCANNING" || 
      stage === "SCANNED" || 
      stage === "REPORTING"
    ) {
      return <DpdpProgress scanRecord={scanRecord} />;
    }

    if (stage === "COMPLETED") {
      return <DpdpReportDisplay scanRecord={scanRecord} />;
    }

    // Handle failure landing states
    if (stage.startsWith("ERROR_")) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center shadow-xl">
          <span className="text-3xl">❌</span>
          <h3 className="mt-4 text-base font-bold text-white uppercase tracking-wider text-rose-400">Scan Failed</h3>
          <p className="mt-2 text-xs text-rose-300">
            {scanRecord.error_message || "An error occurred during scanning or AI report generation."}
          </p>
          <div className="mt-5 pt-4 border-t border-white/5 flex justify-center gap-3">
            <Link 
              href="/compliance/dpdp"
              className="px-4 py-2 rounded-lg bg-cyan-400 text-xs font-bold text-[#061420] hover:bg-cyan-300 transition"
            >
              Start New Scan
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-[#061420] text-slate-100 flex flex-col justify-between">
      {/* Invisible Turnstile: bootstraps the session cert silently for shared-link visitors */}
      <Turnstile
        invisible
        onVerify={(token) => {
          setGlobalTurnstileToken(token);
          setTurnstileReady(true);
        }}
      />
      {/* Timeout fallback: challenge blocked (e.g. VPN / strict browser) */}
      {turnstileTimedOut && !turnstileReady && (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="mx-auto max-w-sm rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
            <span className="text-3xl">🔒</span>
            <h2 className="mt-4 text-base font-bold text-white">Security Check Failed</h2>
            <p className="mt-2 text-xs text-amber-300">
              The security verification could not be completed. This may be caused by a VPN, ad-blocker, or strict browser settings blocking Cloudflare.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-4 py-2 rounded-lg bg-white/10 text-xs font-semibold text-white hover:bg-white/15 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div>
        <DpdpHeader minimal />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          {/* Page heading + metadata */}
          {scanRecord && (
            <div className="mb-8 space-y-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500/70 mb-1">DPDPA 2023 Compliance Audit</p>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  Security &amp; Privacy Report
                </h1>
              </div>
              <div className="inline-flex flex-wrap items-center gap-2 bg-[#07192a]/60 border border-white/5 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <svg className="size-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Domain</span>
                  <span className="text-xs font-mono text-slate-200 truncate max-w-[180px] sm:max-w-none">{scanRecord.domain}</span>
                </div>
                <span className="text-white/10">·</span>
                <div className="flex items-center gap-1.5">
                  <svg className="size-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Scanned</span>
                  <span className="text-xs font-mono text-slate-200">
                    {new Date(scanRecord.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "2-digit"
                    })}
                  </span>
                </div>
                {scanRecord.stage && (
                  <>
                    <span className="text-white/10">·</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${
                        scanRecord.stage === "COMPLETED" ? "bg-emerald-400" :
                        scanRecord.stage === "CONFIRMATION_PENDING" || scanRecord.stage === "INIT" ? "bg-amber-400 animate-pulse" :
                        "bg-cyan-400 animate-pulse"
                      }`} />
                      <span className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">{scanRecord.stage.replace(/_/g, " ")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {renderContent()}

        </div>
      </div>

      <footer className="border-t border-white/8 bg-[#04101a]">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <a href={dpdpCopy.vaptInsightsUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <DpdpIcon name="arrow" className="size-4" />
              {dpdpCopy.backToVaptInsights}
            </a>
            <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-400" aria-label="Footer navigation">
              {dpdpFooterLinks.map((link) => 
                link.isExternal ? (
                  <a href={link.href} target={link.target} rel={link.target === "_blank" ? "noopener noreferrer" : undefined} key={link.label} className="transition hover:text-cyan-300">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} key={link.label} className="transition hover:text-cyan-300">
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>
          <p className="mt-8 border-t border-white/8 pt-5 text-xs text-slate-500">{dpdpCopy.footer.disclaimer}</p>
        </div>
      </footer>
    </main>
  );
}
