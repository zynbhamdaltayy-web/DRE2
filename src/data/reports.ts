export type ReportTargetType =
  | "user"
  | "message"
  | "article"
  | "room"
  | "account";

export type ReportReason =
  | "harassment"
  | "hate-speech"
  | "sexual-content"
  | "spam"
  | "scam"
  | "violence"
  | "unsafe-behavior"
  | "inappropriate-content"
  | "impersonation"
  | "privacy"
  | "other";

export type ReportStatus =
  | "pending"
  | "reviewing"
  | "resolved"
  | "rejected";

export type ReportAction =
  | "none"
  | "warning"
  | "content-removed"
  | "account-suspended"
  | "account-blocked"
  | "room-restricted";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  action: ReportAction;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  resolutionNote?: string;
}

export interface CreateReportInput {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export const REPORT_REASON_LABELS: Record<
  ReportReason,
  string
> = {
  harassment: "Harassment",
  "hate-speech": "Hate speech",
  "sexual-content": "Sexual or inappropriate content",
  spam: "Spam",
  scam: "Scam or fraud",
  violence: "Violence or threats",
  "unsafe-behavior": "Unsafe behavior",
  "inappropriate-content": "Inappropriate content",
  impersonation: "Impersonation",
  privacy: "Privacy violation",
  other: "Other",
};

export const REPORT_STATUS_LABELS: Record<
  ReportStatus,
  string
> = {
  pending: "Pending",
  reviewing: "Under review",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const REPORT_ACTION_LABELS: Record<
  ReportAction,
  string
> = {
  none: "No action",
  warning: "Warning",
  "content-removed": "Content removed",
  "account-suspended": "Account suspended",
  "account-blocked": "Account blocked",
  "room-restricted": "Room restricted",
};

function createId(): string {
  return `report-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createReport(
  input: CreateReportInput,
): Report {
  return {
    id: createId(),
    reporterId: input.reporterId.trim(),
    targetType: input.targetType,
    targetId: input.targetId.trim(),
    reason: input.reason,
    description: input.description?.trim() ?? "",
    status: "pending",
    action: "none",
    createdAt: new Date().toISOString(),
  };
}

export function validateReport(
  report: Partial<Report>,
): string[] {
  const errors: string[] = [];

  if (!report.reporterId?.trim()) {
    errors.push("Reporter is required.");
  }

  if (!report.targetId?.trim()) {
    errors.push("Target is required.");
  }

  if (!report.targetType) {
    errors.push("Target type is required.");
  }

  if (!report.reason) {
    errors.push("Report reason is required.");
  }

  return errors;
}

export function startReportReview(
  report: Report,
  reviewerId: string,
): Report {
  return {
    ...report,
    status: "reviewing",
    reviewedBy: reviewerId,
  };
}

export function resolveReport(
  report: Report,
  reviewerId: string,
  action: ReportAction,
  resolutionNote = "",
): Report {
  return {
    ...report,
    status: "resolved",
    action,
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    resolutionNote: resolutionNote.trim(),
  };
}

export function rejectReport(
  report: Report,
  reviewerId: string,
  resolutionNote = "",
): Report {
  return {
    ...report,
    status: "rejected",
    action: "none",
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    resolutionNote: resolutionNote.trim(),
  };
}

export function getPendingReports(
  reports: Report[],
): Report[] {
  return reports
    .filter(
      (report) =>
        report.status === "pending" ||
        report.status === "reviewing",
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
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
  targetType: ReportTargetType,
  targetId: string,
): Report[] {
  return reports.filter(
    (report) =>
      report.targetType === targetType &&
      report.targetId === targetId,
  );
}

export function getReportStatistics(
  reports: Report[],
) {
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
    rejected: reports.filter(
      (report) => report.status === "rejected",
    ).length,
  };
}