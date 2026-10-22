export type VulnerabilityStatus =
  | "CRITICAL_EXPOSURE"
  | "PATCHED_SECURE"
  | "UNVERIFIED_PERIMETER";

export interface CveAssessment {
  cveId: string;
  cvssScore: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  advisoryId: string;
  advisoryUrl: string;
  name: string;
  mechanism: string;
  verdict: "VULNERABLE" | "PATCHED" | "SUSPECTED_UNVERIFIED";
  exposureDetails: string;
}

export interface TelemetrySignal {
  category: "HEADER" | "RUNTIME" | "WORKER" | "PRESENCE";
  key: string;
  value: string;
  interpretation: string;
}

export interface HardeningCommand {
  label: string;
  platform: string;
  command: string;
  explanation: string;
}

export interface AuditReport {
  targetUrl: string;
  resolvedEndpoint: string;
  httpStatus: number;
  status: VulnerabilityStatus;
  headline: string;
  rationale: string;
  detectedEngine: {
    language: string;
    version: string | null;
    branch: string | null;
    isEol: boolean;
    minimumPatchedRelease: string | null;
    sapiArchitecture: string | null;
    workerPersistence: boolean;
  };
  telemetrySignals: TelemetrySignal[];
  cveAssessments: CveAssessment[];
  attackSurfaceNotes: string[];
  remediationPlaybook: {
    summary: string;
    actionItems: string[];
    hardeningCommands: HardeningCommand[];
    wafMitigations: string[];
  };
  auditLimitations: string;
}

export interface AuditRequest {
  url: string;
  authorized: boolean;
  scanMode?: "PASSIVE_TELEMETRY" | "ACTIVE_PARSER_VALIDATION";
}
