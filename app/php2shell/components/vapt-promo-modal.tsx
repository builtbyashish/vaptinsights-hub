"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Zap,
  Scan,
  FileCheck,
  ExternalLink,
  X,
  Lock,
  ArrowRight,
} from "lucide-react";

interface VaptPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDomain?: string;
}

export function VaptPromoModal({ isOpen, onClose, targetDomain }: VaptPromoModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("vapt_promo_dismissed", "true");
    } catch {
      // Ignore sessionStorage exceptions in private browsing
    }
    onClose();
  };

  const platformUrl = targetDomain
    ? `https://vaptinsights.com/?utm_source=php2shell&utm_medium=audit_modal&utm_campaign=cve_2026_check&domain=${encodeURIComponent(
        targetDomain
      )}`
    : "https://vaptinsights.com/?utm_source=php2shell&utm_medium=audit_modal&utm_campaign=cve_2026_check";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vapt-promo-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020814]/85 backdrop-blur-md transition-opacity"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#071626] p-6 sm:p-8 shadow-2xl shadow-cyan-950/60">
        {/* Subtle Ambient Radial Highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-cyan-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full bg-emerald-500/10 blur-3xl"
        />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="size-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  VAPT Insights
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Enterprise Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous Vulnerability Assessment &amp; Penetration Testing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close promotion dialog"
            className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-6 space-y-6">
          <div>
            <h2
              id="vapt-promo-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight"
            >
              Protect your entire attack surface beyond PHP core runtime flaws
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
              {targetDomain ? (
                <>
                  Your inspection on <span className="font-mono text-cyan-300 font-semibold">{targetDomain}</span> evaluates single-vector CVE exposure. Full security posture requires continuous scanning across web apps, APIs, cloud misconfigurations, and authentication boundaries.
                </>
              ) : (
                "Single-vector checks uncover perimeter indicators, but leave modern multi-tier vulnerabilities unmonitored. Continuous automated penetration testing shields your production systems 24/7."
              )}
            </p>
          </div>

          {/* Value Prop Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-[#040e1b] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300">
                <Zap className="size-4 shrink-0 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">Continuous DAST &amp; Fuzzing</h3>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Autonomous dynamic crawler scanning for business logic flaws, SSRF, SQLi, and OWASP Top 10 vulnerabilities.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#040e1b] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300">
                <Scan className="size-4 shrink-0 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">Full API Discovery &amp; BOLA</h3>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Deep analysis of OpenAPI and Postman schemas with fuzzing for broken object-level authorization and token leakage.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#040e1b] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300">
                <Lock className="size-4 shrink-0 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">Zero False-Positive Proofs</h3>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Every identified vulnerability includes reproducible HTTP request/response payloads and precise code-level patches.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#040e1b] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300">
                <FileCheck className="size-4 shrink-0 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">Audit &amp; Board Scorecards</h3>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Generate signed executive reports mapped directly to ISO 27001, SOC 2, PCI-DSS 4.0, and India DPDPA standards.
              </p>
            </div>
          </div>

          {/* Quick Stats or Free Evaluation Callout */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">
                Launch Comprehensive Application Security Testing
              </p>
              <p className="text-[11px] text-slate-300">
                Start scanning in under 3 minutes with zero-installation setup.
              </p>
            </div>
            <a
              href={platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-[#04101c] hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20"
            >
              <span>Explore Platform</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:border-white/20 hover:bg-white/5 hover:text-white transition cursor-pointer text-center"
          >
            Continue Reviewing Audit Report
          </button>

          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-[#051322] hover:bg-cyan-400 transition cursor-pointer text-center"
          >
            <span>Open VAPT Insights Platform</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
