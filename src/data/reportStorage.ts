import {
  createReport,
  normalizeReport,
  resolveReport,
  dismissReport,
  startReportReview,
  type Report,
  type ReportInput,
} from "./reports";

const STORAGE_KEY = "dre2learn-reports";

export interface ReportStorageData {
  reports: Report[];
}

const DEFAULT_DATA: ReportStorageData = {
  reports: [],
};

function readData(): ReportStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        ...DEFAULT_DATA,
      };
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("reports" in parsed)
    ) {
      return {
        ...DEFAULT_DATA,
      };
    }

    const reportsValue = (
      parsed as {
        reports?: unknown;
      }
    ).reports;

    if (!Array.isArray(reportsValue)) {
      return {
        ...DEFAULT_DATA,
      };
    }

    return {
      reports: reportsValue.map((item) =>
        normalizeReport(item as Report),
      ),
    };
  } catch {
    return {
      ...DEFAULT_DATA,
    };
  }
}

function writeData(
  data: ReportStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
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

export function saveReport(
  report: Report,
): Report {
  const data = readData();

  const normalized = normalizeReport(report);

  const existingIndex = data.reports.findIndex(
    (item) => item.id === normalized.id,
  );

  if (existingIndex >= 0) {
    data.reports[existingIndex] = normalized;
  } else {
    data.reports.push(normalized);
  }

  writeData(data);

  return normalized;
}

export function createAndSaveReport(
  input: ReportInput,
): Report {
  return saveReport(createReport(input));
}

export function updateReport(
  report: Report,
): Report {
  return saveReport(report);
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
  resolution: string,
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
    resolution,
  );

  data.reports = data.reports.map((item) =>
    item.id === reportId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function dismissStoredReport(
  reportId: string,
  reason = "",
): Report | null {
  const data = readData();

  const report = data.reports.find(
    (item) => item.id === reportId,
  );

  if (!report) {
    return null;
  }

  const updated = dismissReport(
    report,
    reason,
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
    writeData(DEFAULT_DATA);
  }
}

    




    
    
  