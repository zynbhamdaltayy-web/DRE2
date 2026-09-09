import {
  createReport,
  rejectReport,
  resolveReport,
  startReportReview,
  type CreateReportInput,
  type Report,
  type ReportAction,
} from "./reports";

const STORAGE_KEY = "dre2learn-reports";

export interface ReportStorageData {
  reports: Report[];
}

function readData(): ReportStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        reports: [],
      };
    }

    const parsed = JSON.parse(raw);

    return {
      reports: Array.isArray(parsed.reports)
        ? parsed.reports
        : [],
    };
  } catch {
    return {
      reports: [],
    };
  }
}

function writeData(data: ReportStorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getReportStorage(): ReportStorageData {
  return readData();
}

export function saveReportStorage(
  data: ReportStorageData,
): void {
  writeData(data);
}

export function getAllReports(): Report[] {
  return readData().reports;
}

export function saveReport(report: Report): Report {
  const data = readData();

  data.reports.push(report);

  writeData(data);

  return report;
}

export function createAndSaveReport(
  input: CreateReportInput,
): Report {
  return saveReport(createReport(input));
}

export function updateReport(
  report: Report,
): Report {
  const data = readData();

  data.reports = data.reports.map((item) =>
    item.id === report.id ? report : item,
  );

  writeData(data);

  return report;
}

export function reviewReport(
  reportId: string,
  reviewerId: string,
): Report | null {
  const data = readData();

  const report = data.reports.find(
    (item) => item.id === reportId,
  );

  if (!report) {
    return null;
  }

  const updated = startReportReview(
    report,
    reviewerId,
  );

  data.reports = data.reports.map((item) =>
    item.id === reportId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function resolveStoredReport(
  reportId: string,
  reviewerId: string,
  action: ReportAction,
  note = "",
): Report | null {
  const data = readData();

  const report = data.reports.find(
    (item) => item.id === reportId,
  );

  if (!report) {
    return null;
  }

  const updated = resolveReport(
    report,
    reviewerId,
    action,
    note,
  );

  data.reports = data.reports.map((item) =>
    item.id === reportId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function rejectStoredReport(
  reportId: string,
  reviewerId: string,
  note = "",
): Report | null {
  const data = readData();

  const report = data.reports.find(
    (item) => item.id === reportId,
  );

  if (!report) {
    return null;
  }

  const updated = rejectReport(
    report,
    reviewerId,
    note,
  );

  data.reports = data.reports.map((item) =>
    item.id === reportId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function deleteReport(
  reportId: string,
): boolean {
  const data = readData();

  const lengthBefore = data.reports.length;

  data.reports = data.reports.filter(
    (report) => report.id !== reportId,
  );

  if (data.reports.length === lengthBefore) {
    return false;
  }

  writeData(data);

  return true;
}

export function clearReportStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeReportStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData({
      reports: [],
    });
  }
}