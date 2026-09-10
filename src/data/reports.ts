import type { Account } from "./accounts";

export type ReportTargetType =
  | "user"
  | "message"
  | "article"
  | "room"
  | "comment"
  | "other";

export type ReportReason =
  | "harassment"
  | "bullying"
  | "spam"
  | "inappropriate-content"
  | "fake-account"
  | "scam"
  | "safety"
  | "privacy"
  | "copyright"
  | "other";

export type ReportStatus =
  | "pending"
  | "reviewing"
  | "resolved"
  | "dismissed";

export type ReportPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  metadata?: Record<string, string>;
}

export interface ReportInput {
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description: string;
  priority?: ReportPriority;
  metadata?: Record<string, string>;
}

export const REPORT_REASON_LABELS: Record<
  ReportReason,
  string
> = {
  harassment: "Harassment",
  bullying: "Bullying",
  spam: "Spam",
  "inappropriate-content": "Inappropriate content",
  "fake-account": "Fake account",
  scam: "Scam or fraud",
  safety: "Safety concern",
  privacy: "Privacy violation",
  copyright: "Copyright issue",
  other: "Other",
};

export const REPORT_STATUS_LABELS: Record<
  ReportStatus,
  string
> = {
  pending: "Pending",
  reviewing: "Under review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const REPORT_PRIORITY_LABELS: Record<
  ReportPriority,
  string
> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  critical: "Critical",
};

export const REPORT_TARGET_LABELS: Record<
  ReportTargetType,
  string
> = {
  user: "User",
  message: "Message",
  article: "Article",
  room: "Room",
  comment: "Comment",
  other: "Other",
};

function createId(prefix = "report"): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function now(): string {
  return new Date().toISOString();
}

export function createReport(
  input: ReportInput,
): Report {
  const timestamp = now();

  return {
    id: createId(),
    reporterId: cleanString(input.reporterId),
    targetId: cleanString(input.targetId),
    targetType: input.targetType,
    reason: input.reason,
    description: cleanString(input.description),
    status: "pending",
    priority: input.priority ?? "normal",
    createdAt: timestamp,
    updatedAt: timestamp,
    metadata: input.metadata,
  };
}

export function normalizeReport(
  report: Report,
): Report {
  const timestamp = now();

  return {
    ...report,
    id: cleanString(report.id) || createId(),
    reporterId: cleanString(report.reporterId),
    targetId: cleanString(report.targetId),
    description: cleanString(report.description),
    status: report.status ?? "pending",
    priority: report.priority ?? "normal",
    createdAt:
      cleanString(report.createdAt) || timestamp,
    updatedAt:
      cleanString(report.updatedAt) || timestamp,
  };
}

export function assignReport(
  report: Report,
  account: Account,
): Report {
  return {
    ...report,
    assignedTo: account.id,
    status:
      report.status === "pending"
        ? "reviewing"
        : report.status,
    updatedAt: now(),
  };
}

export function startReportReview(
  report: Report,
  adminId: string,
): Report {
  return {
    ...report,
    assignedTo: cleanString(adminId) || report.assignedTo,
    status: "reviewing",
    updatedAt: now(),
  };
}

export function resolveReport(
  report: Report,
  resolution: string,
): Report {
  const timestamp = now();

  return {
    ...report,
    status: "resolved",
    resolution: cleanString(resolution),
    resolvedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function dismissReport(
  report: Report,
  reason = "",
): Report {
  const timestamp = now();

  return {
    ...report,
    status: "dismissed",
    resolution: cleanString(reason),
    resolvedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function reopenReport(
  report: Report,
): Report {
  return {
    ...report,
    status: "pending",
    resolution: undefined,
    resolvedAt: undefined,
    updatedAt: now(),
  };
}

export function updateReportPriority(
  report: Report,
  priority: ReportPriority,
): Report {
  return {
    ...report,
    priority,
    updatedAt: now(),
  };
}

export function getPendingReports(
  reports: Report[],
): Report[] {
  return reports
    .filter((report) => report.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}

export function getReportsUnderReview(
  reports: Report[],
): Report[] {
  return reports
    .filter((report) => report.status === "reviewing")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime(),
    );
}

export function getOpenReports(
  reports: Report[],
): Report[] {
  return reports
    .filter(
      (report) =>
        report.status === "pending" ||
        report.status === "reviewing",
    )
    .sort((a, b) => {
      const priorityOrder: Record<
        ReportPriority,
        number
      > = {
        critical: 4,
        high: 3,
        normal: 2,
        low: 1,
      };

      const priorityDifference =
        priorityOrder[b.priority] -
        priorityOrder[a.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
}

export function getResolvedReports(
  reports: Report[],
): Report[] {
  return reports
    .filter(
      (report) =>
        report.status === "resolved" ||
        report.status === "dismissed",
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime(),
    );
}

export function getReportsByUser(
  reports: Report[],
  userId: string,
): Report[] {
  return reports
    .filter((report) => report.reporterId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}

export function getReportsForTarget(
  reports: Report[],
  targetId: string,
): Report[] {
  return reports
    .filter((report) => report.targetId === targetId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}

export function getReportsAssignedTo(
  reports: Report[],
  accountId: string,
): Report[] {
  return reports
    .filter((report) => report.assignedTo === accountId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime(),
    );
}

export function hasExistingOpenReport(
  reports: Report[],
  reporterId: string,
  targetId: string,
): boolean {
  return reports.some(
    (report) =>
      report.reporterId === reporterId &&
      report.targetId === targetId &&
      (report.status === "pending" ||
        report.status === "reviewing"),
  );
}

export function getReportCounts(
  reports: Report[],
): {
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  critical: number;
} {
  return {
    total: reports.length,
    pending: reports.filter(
      (report) => report.status === "pending",
    ).length,
    reviewing: reports.filter(
      (report) => report.status === "reviewing",
    ).length,
    resolved: reports.filter(
      (report) => report.status === "resolved",
    ).length,
    dismissed: reports.filter(
      (report) => report.status === "dismissed",
    ).length,
    critical: reports.filter(
      (report) =>
        report.priority === "critical" &&
        (report.status === "pending" ||
          report.status === "reviewing"),
    ).length,
  };
}

export function canResolveReport(
  account: Account,
): boolean {
  return (
    account.status === "active" &&
    (account.role === "owner" ||
      account.role === "admin") &&
    account.permissions.manageReports
  );
}

export function canViewReport(
  account: Account,
): boolean {
  return (
    account.status === "active" &&
    (account.role === "owner" ||
      account.role === "admin") &&
    account.permissions.manageReports
  );
}

export function validateReportInput(
  input: ReportInput,
): string[] {
  const errors: string[] = [];

  if (!cleanString(input.reporterId)) {
    errors.push("Reporter ID is required.");
  }

  if (!cleanString(input.targetId)) {
    errors.push("Target ID is required.");
  }

  if (!input.targetType) {
    errors.push("Target type is required.");
  }

  if (!input.reason) {
    errors.push("Report reason is required.");
  }

  if (!cleanString(input.description)) {
    errors.push("Report description is required.");
  }

  if (cleanString(input.description).length > 2000) {
    errors.push(
      "Report description cannot exceed 2000 characters.",
    );
  }

  return errors;
}
  


  



  
  
    

      
