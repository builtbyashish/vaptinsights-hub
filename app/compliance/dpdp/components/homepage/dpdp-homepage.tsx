"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { useDPDPDiscover } from "@/hooks/query-hooks/dpdp.query";
import { homepageScanSchema, normalizeScanUrl } from "@/lib/validation/dpdp-scan.schema";
import { dpdpCopy, dpdpFooterLinks } from "../../constants/dpdp-homepage";
import { DpdpHeader } from "../common/dpdp-header";
import { DpdpIcon } from "../common/dpdp-icon";
import Turnstile from "@/components/common/Turnstile";
import {
  Shield,
  Search,
  Lock,
  FileText,
  Radio,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function DpdpHomepage() {
  const router = useRouter();
  const [apiErrorMsg, setApiErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const discoverMutation = useDPDPDiscover();

  const formik = useFormik({
    initialValues: { url: "" },
    validationSchema: homepageScanSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values, { setSubmitting }) => {
      setApiErrorMsg("");
      if (!turnstileToken) {
        setApiErrorMsg("Please complete the security challenge.");
        setSubmitting(false);
        return;
      }
      const normalizedUrl = normalizeScanUrl(values.url, "origin");
      discoverMutation.mutate(
        { url: normalizedUrl, turnstileToken },
        {
          onSuccess: (data) => router.push(`/compliance/dpdp/${data.scan_id}`),
          onError: (err) => {
            setSubmitting(false);
            setApiErrorMsg(
              err.message || "Failed to analyze URL. Please check if the host resolves."
            );
          },
        }
      );
    },
  });

  const isProcessing = formik.isSubmitting || discoverMutation.isPending;
  const displayError = (formik.submitCount > 0 && formik.errors.url) || apiErrorMsg;

  return (
    <main className="min-h-screen flex flex-col bg-[#060e18] text-slate-100">
      <DpdpHeader minimal />

      {/* ━━━ HERO SECTION ━━━ */}
      <section className="relative flex-1 border-b border-white/6 py-16 sm:py-24 lg:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

            {/* Left Column: Authoritative Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                <Shield className="size-3.5" />
                <span>DPDPA 2023 Technical Compliance</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.15]">
                India&apos;s DPDP Technical Readiness Scanner
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-xl">
                Audit public web assets for Digital Personal Data Protection Act compliance.
                Inspect HTTP security headers, third-party tracker exposure, and consent
                mechanisms against statutory technical safeguards.
              </p>

              {/* Technical Scope Matrix */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                  <span>Section 8(5) Safeguards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                  <span>Notice &amp; Consent (Sec. 5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                  <span>Tracker &amp; Cookie Inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                  <span>Non-Destructive Public Scan</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Density Scanner Terminal */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="rounded-2xl border border-white/10 bg-[#081825] p-6 sm:p-7 shadow-2xl">
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="website-url"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Target Domain or URL
                    </label>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Passive Inspection
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-1 transition ${
                      displayError
                        ? "border-rose-500/50 bg-rose-950/20"
                        : inputFocused
                        ? "border-cyan-400/60 bg-[#05111b] ring-2 ring-cyan-400/20"
                        : "border-white/10 bg-[#05111b]"
                    }`}
                  >
                    <Search
                      className={`size-4 shrink-0 ${
                        inputFocused ? "text-cyan-400" : "text-slate-400"
                      }`}
                    />
                    <input
                      id="website-url"
                      name="url"
                      type="text"
                      value={formik.values.url}
                      onChange={(e) => {
                        setApiErrorMsg("");
                        formik.handleChange(e);
                      }}
                      onFocus={() => setInputFocused(true)}
                      onBlur={(e) => {
                        setInputFocused(false);
                        formik.handleBlur(e);
                      }}
                      placeholder="https://example.com"
                      className="h-12 w-full bg-transparent font-mono text-sm text-white placeholder-slate-500 outline-none"
                      aria-invalid={Boolean(displayError)}
                      aria-describedby={displayError ? "url-error" : undefined}
                    />
                  </div>

                  {displayError && (
                    <p
                      id="url-error"
                      role="alert"
                      className="text-xs font-medium text-rose-400 flex items-center gap-1.5 animate-fadeIn"
                    >
                      <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
                      {displayError}
                    </p>
                  )}

                  {/* Cloudflare Turnstile Verification */}
                  <div className="flex justify-center pt-1">
                    <Turnstile onVerify={(token) => setTurnstileToken(token)} />
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-12 rounded-xl bg-cyan-400 px-4 text-sm font-bold text-[#061420] transition hover:bg-cyan-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-[#061420]/30 border-t-[#061420] animate-spin" />
                        <span>Analyzing Technical Safeguards...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="size-4" />
                        <span>Run DPDP Technical Scan</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-6 pt-1 text-xs text-slate-400">
                    <span>No Credentials Required</span>
                    <span>·</span>
                    <span>Zero Application Overhead</span>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ TECHNICAL AUDIT DIMENSIONS ━━━ */}
      <section className="border-b border-white/6 py-16 sm:py-20 bg-[#071320]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-xl mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Statutory Technical Safeguards Evaluated
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              The Digital Personal Data Protection Act requires demonstrable technical measures to
              prevent personal data breaches. We evaluate these signals directly on your public edge.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/8 bg-[#05111b] p-5 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Lock className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-white">HTTP Security Headers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verifies Content-Security-Policy (CSP), HSTS enforcement, X-Frame-Options, and Referrer-Policy against clickjacking and cross-origin leakage.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#05111b] p-5 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Radio className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Cookie Security &amp; Flags</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Audits session cookies for mandatory Secure, HttpOnly, and SameSite attributes to guard against session interception and CSRF.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#05111b] p-5 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <FileText className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Notice &amp; Transparency</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Checks discoverability of bilingual privacy notices, data fiduciary contact details, and Grievance Redressal Officer availability.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#05111b] p-5 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <AlertTriangle className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Third-Party Data Sinks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Detects un-consented third-party trackers, external analytics scripts, and pixel beacons collecting user telemetry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ TECHNICAL PIPELINE ━━━ */}
      <section className="py-16 sm:py-20 border-b border-white/6 bg-[#060e18]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-xl mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Audit Pipeline &amp; Execution
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Automated four-phase technical assessment providing engineering-level remediation playbooks.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/8 bg-[#081825] p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-cyan-400">PHASE 01</span>
              <h3 className="text-sm font-bold text-white">Target Crawl &amp; Discovery</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Crawls sitemaps, entrypoints, and public policy paths without executing destructive testing.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#081825] p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-cyan-400">PHASE 02</span>
              <h3 className="text-sm font-bold text-white">Transport &amp; Header Audit</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspects TLS cipher suites, HSTS preloading, CSP nonce validity, and CORS headers.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#081825] p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-cyan-400">PHASE 03</span>
              <h3 className="text-sm font-bold text-white">DOM &amp; Tracker Mapping</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extracts external script resources, analytics beacons, and cookie consent interaction state.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#081825] p-5 space-y-2">
              <span className="font-mono text-xs font-bold text-cyan-400">PHASE 04</span>
              <h3 className="text-sm font-bold text-white">Remediation Scorecard</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates actionable code snippets, header configurations, and breach response templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-white/6 bg-[#050e18] py-8">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <a
              href={dpdpCopy.vaptInsightsUrl}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              <DpdpIcon name="arrow" className="size-4" />
              <span>Back to VAPT Insights</span>
            </a>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400" aria-label="Footer navigation">
              {dpdpFooterLinks.map((link) =>
                link.isExternal ? (
                  <a
                    href={link.href}
                    target={link.target}
                    rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                    key={link.label}
                    className="transition hover:text-slate-200"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} key={link.label} className="transition hover:text-slate-200">
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>
          <p className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500">
            {dpdpCopy.footer.disclaimer}
          </p>
        </div>
      </footer>
    </main>
  );
}
