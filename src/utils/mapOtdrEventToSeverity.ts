import type { Map } from "../types/Common";
import type { Severity } from "../types/Severity";
import type { OtdrCauses } from "../types/Causes";

const severityMap: Record<Severity, Map<Severity>> = {
  INDETERMINATE: { name: "INDETERMINATE", code: 0 },
  CLEAR: { name: "CLEAR", code: 1 },
  WARNING: { name: "WARNING", code: 1 },
  MINOR: { name: "MINOR", code: 2 },
  MAJOR: { name: "MAJOR", code: 3 },
  CRITICAL: { name: "CRITICAL", code: 4 },
};

export type OtdrEvent = {
  name: OtdrCauses;
  code: number;
  severity: Map<Severity>;
};

export const mapOtdrEventToSeverity: Record<OtdrCauses, OtdrEvent> = {
  Clear: { name: "Clear", code: 0, severity: severityMap["CLEAR"] },
  "Fiber cut": {
    name: "Fiber cut",
    code: 1,
    severity: severityMap["CRITICAL"],
  },
  Injection: {
    name: "Injection",
    code: 2,
    severity: severityMap["MAJOR"],
  },
  Attenuation: {
    name: "Attenuation",
    code: 3,
    severity: severityMap["MINOR"],
  },
  "Short event level": {
    name: "Short event level",
    code: 4,
    severity: severityMap["MINOR"],
  },
  Connector: {
    name: "Connector",
    code: 0,
    severity: severityMap["MAJOR"],
  },
  "Connector bending, dirty, loose": {
    name: "Connector bending, dirty, loose",
    code: 0,
    severity: severityMap["MINOR"],
  },
  "Fiber bending": {
    name: "Fiber bending",
    code: 0,
    severity: severityMap["MINOR"],
  },
  "Fiber bending on splice or connector": {
    name: "Fiber bending on splice or connector",
    code: 0,
    severity: severityMap["MINOR"],
  },
  "Fiber break": {
    name: "Fiber break",
    code: 0,
    severity: severityMap["CRITICAL"],
  },
  "Splice break or connector disconnected": {
    name: "Splice break or connector disconnected",
    code: 0,
    severity: severityMap["CRITICAL"],
  },
  "Connector disconnected or strong bend": {
    name: "Connector disconnected or strong bend",
    code: 0,
    severity: severityMap["MAJOR"],
  },
};
