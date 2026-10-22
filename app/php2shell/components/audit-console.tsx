"use client";

import { useState } from "react";
import {
  Globe,
  Radio,
  Loader2,
  Terminal,
  ShieldCheck,
  AlertCircle,
  Cpu,
  Layers,
} from "lucide-react";
import { AuditRequest, AuditReport } from "../types";
import { COMMON_TEST_TARGETS } from "../constants";

interface AuditConsoleProps {
  onAuditStart: () => void;
  onAuditComplete: (report: AuditReport) => void;
  isAuditing: boolean;
}

export function AuditConsole({
  onAuditStart,
  onAuditComplete,
  isAuditing,
}: AuditConsoleProps) {
  const [targetUrl, setTargetUrl] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [scanMode, setScanMode] = useState<"PASSIVE_TELEMETRY" | "ACTIVE_PARSER_VALIDATION">(
    "PASSIVE_TELEMETRY"
  );
  const [auditStep, setAuditStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const clean = targetUrl.trim();
    if (!clean) {
      setErrorMsg("Specify a target hostname or URL for vulnerability analysis.");
      return;
    }

    let formatted = clean;
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "https://" + formatted;
      setTargetUrl(formatted);
    }

    try {
      new URL(formatted);
    } catch {
      setErrorMsg("Invalid URL syntax. Enter a valid web address (e.g. https://target-app.com).");
      return;
    }

    if (!authorized) {
      setErrorMsg("Authorization verification required. Confirm target audit authorization.");
      return;
    }

    onAuditStart();
    setAuditStep(1);

    const t1 = setTimeout(() => setAuditStep(2), 600);
    const t2 = setTimeout(() => setAuditStep(3), 1500);

    try {
      const payload: AuditRequest = {
        url: formatted,
        authorized,
        scanMode,
      };

      const res = await fetch("/api/php2shell/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Surface audit request failed.");
      }

      onAuditComplete(data as AuditReport);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Target inspection failed to complete."
      );
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setAuditStep(0);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071322] p-6 shadow-2xl sm:p-8">
      {/* Console Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Terminal className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Target Scope &amp; Parameters
            </h2>
            <p className="text-xs text-slate-400">
              Configure perimeter discovery and multipart engine diagnostics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-mono text-[11px] text-slate-300">
            <span className="size-1.5 rounded-full bg-cyan-400" />
            VAPT Engine v2.4
          </span>
        </div>
      </div>

      <form onSubmit={runAudit} className="space-y-6">
        {/* Target URL Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="target-scope"
              className="text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Target Endpoint
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Protocol: HTTPS / HTTP
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Globe className="size-4" />
              </div>
              <input
                id="target-scope"
                type="text"
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isAuditing}
                placeholder="https://app.yourdomain.com/login.php"
                className="w-full rounded-xl border border-slate-700/80 bg-[#040a12] py-3.5 pl-10 pr-4 font-mono text-sm text-white placeholder-slate-600 transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isAuditing || !authorized}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-[#061420] transition hover:bg-cyan-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="size-4 animate-spin text-[#061420]" />
                  <span>Inspecting...</span>
                </>
              ) : (
                <>
                  <Radio className="size-4" />
                  <span>Execute Surface Audit</span>
                </>
              )}
            </button>
          </div>

          {/* Target Presets */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Target Presets:</span>
            {COMMON_TEST_TARGETS.map((t) => (
              <button
                key={t.url}
                type="button"
                disabled={isAuditing}
                onClick={() => {
                  setTargetUrl(t.url);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Modes & Surface Options */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            onClick={() => setScanMode("PASSIVE_TELEMETRY")}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              scanMode === "PASSIVE_TELEMETRY"
                ? "border-cyan-500/50 bg-[#04111d]"
                : "border-slate-800 bg-[#040a12] opacity-70 hover:opacity-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Cpu className="size-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                Passive Perimeter Reconnaissance
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Inspects transport headers (X-Powered-By, Server), cookies, and framework markers. Zero payload delivery.
            </p>
          </div>

          <div
            onClick={() => setScanMode("ACTIVE_PARSER_VALIDATION")}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              scanMode === "ACTIVE_PARSER_VALIDATION"
                ? "border-cyan-500/50 bg-[#04111d]"
                : "border-slate-800 bg-[#040a12] opacity-70 hover:opacity-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="size-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">
                RFC 1867 Multipart Engine Validation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sends benign, non-destructive multipart probes to evaluate upstream FPM process stability.
            </p>
          </div>
        </div>

        {/* Target Scope Authorization */}
        <div className="rounded-xl border border-slate-800 bg-[#040a12] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              disabled={isAuditing}
              className="mt-0.5 size-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400/30"
            />
            <div>
              <span className="block text-xs font-semibold text-slate-200">
                Authorized Target Scope Declaration
              </span>
              <span className="block text-xs text-slate-400 mt-0.5 leading-relaxed">
                Confirm that this assessment is authorized by asset owners. Diagnostics use non-destructive telemetry and adhere strictly to defensive security standards.
              </span>
            </div>
          </label>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-300">
            <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Live Multi-Stage Audit Sequence */}
        {isAuditing && (
          <div className="rounded-xl border border-cyan-500/20 bg-[#040d16] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                Audit Pipeline In Execution
              </span>
              <span className="font-mono text-slate-400">Stage {auditStep || 1} of 3</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div
                className={`rounded-lg border p-2.5 text-xs transition ${
                  auditStep >= 1
                    ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-900/40 text-slate-500"
                }`}
              >
                <div className="font-semibold">01. Transport &amp; TLS</div>
                <div className="text-[11px] text-slate-400 truncate">Handshake &amp; Reachability</div>
              </div>

              <div
                className={`rounded-lg border p-2.5 text-xs transition ${
                  auditStep >= 2
                    ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-900/40 text-slate-500"
                }`}
              >
                <div className="font-semibold">02. Runtime Telemetry</div>
                <div className="text-[11px] text-slate-400 truncate">Banner &amp; SAPI Analysis</div>
              </div>

              <div
                className={`rounded-lg border p-2.5 text-xs transition ${
                  auditStep >= 3
                    ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-900/40 text-slate-500"
                }`}
              >
                <div className="font-semibold">03. Vulnerability Match</div>
                <div className="text-[11px] text-slate-400 truncate">CVE Advisory Assessment</div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
