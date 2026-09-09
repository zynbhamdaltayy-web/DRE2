import type {
  WriterApplication,
  WriterArticle,
  WriterApplicationForm,
  WriterArticleForm,
} from "./writer";

import {
  createWriterApplication,
  createWriterArticle,
  normalizeWriterApplication,
  normalizeWriterArticle,
  submitWriterApplication,
  submitWriterArticle,
  approveWriterApplication,
  rejectWriterApplication,
  approveWriterArticle,
  rejectWriterArticle,
  publishWriterArticle,
} from "./writer";

const WRITER_STORAGE_KEY = "dre2learn-writer-data";
const WRITER_STORAGE_VERSION = 1;

export interface WriterStorageData {
  version: number;
  applications: WriterApplication[];
  articles: WriterArticle[];
}

const defaultWriterStorage: WriterStorageData = {
  version: WRITER_STORAGE_VERSION,
  applications: [],
  articles: [],
};

function createStorageData(): WriterStorageData {
  return {
    version: WRITER_STORAGE_VERSION,
    applications: [],
    articles: [],
  };
}

function readStorage(): WriterStorageData {
  if (typeof window === "undefined") {
    return createStorageData();
  }

  try {
    const raw = localStorage.getItem(WRITER_STORAGE_KEY);

    if (!raw) {
      return createStorageData();
    }

    const parsed = JSON.parse(raw) as Partial<WriterStorageData>;

    if (
      !Array.isArray(parsed.applications) ||
      !Array.isArray(parsed.articles)
    ) {
      return createStorageData();
    }

    return {
      version: WRITER_STORAGE_VERSION,
      applications: parsed.applications.map(
        normalizeWriterApplication,
      ),
      articles: parsed.articles.map(
        normalizeWriterArticle,
      ),
    };
  } catch {
    return createStorageData();
  }
}

function writeStorage(data: WriterStorageData): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    WRITER_STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getWriterStorage(): WriterStorageData {
  return readStorage();
}

export function saveWriterStorage(
  data: WriterStorageData,
): void {
  writeStorage({
    version: WRITER_STORAGE_VERSION,
    applications: data.applications.map(
      normalizeWriterApplication,
    ),
    articles: data.articles.map(normalizeWriterArticle),
  });
}

export function clearWriterStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(WRITER_STORAGE_KEY);
}

export function getWriterApplication(
  userId: string,
): WriterApplication | null {
  const data = readStorage();

  return (
    data.applications.find(
      (application) => application.userId === userId,
    ) ?? null
  );
}

export function getAllWriterApplications(): WriterApplication[] {
  return readStorage().applications;
}

export function saveWriterApplication(
  application: WriterApplication,
): WriterApplication {
  const data = readStorage();

  const normalized =
    normalizeWriterApplication(application);

  const index = data.applications.findIndex(
    (item) => item.id === normalized.id,
  );

  if (index === -1) {
    data.applications.push(normalized);
  } else {
    data.applications[index] = normalized;
  }

  writeStorage(data);

  return normalized;
}

export function createAndSaveWriterApplication(
  userId: string,
  form: WriterApplicationForm,
): WriterApplication {
  const application = createWriterApplication(
    userId,
    form,
  );

  return saveWriterApplication(application);
}

export function submitAndSaveWriterApplication(
  application: WriterApplication,
): WriterApplication {
  const submitted = submitWriterApplication(application);

  return saveWriterApplication(submitted);
}

export function approveAndSaveWriterApplication(
  applicationId: string,
  reviewerNote = "",
): WriterApplication | null {
  const data = readStorage();

  const application = data.applications.find(
    (item) => item.id === applicationId,
  );

  if (!application) {
    return null;
  }

  const approved = approveWriterApplication(
    application,
    reviewerNote,
  );

  saveWriterApplication(approved);

  return approved;
}

export function rejectAndSaveWriterApplication(
  applicationId: string,
  reviewerNote: string,
): WriterApplication | null {
  const data = readStorage();

  const application = data.applications.find(
    (item) => item.id === applicationId,
  );

  if (!application) {
    return null;
  }

  const rejected = rejectWriterApplication(
    application,
    reviewerNote,
  );

  saveWriterApplication(rejected);

  return rejected;
}

export function getWriterArticles(
  writerId?: string,
): WriterArticle[] {
  const articles = readStorage().articles;

  if (!writerId) {
    return articles;
  }

  return articles.filter(
    (article) => article.writerId === writerId,
  );
}

export function getAllWriterArticles(): WriterArticle[] {
  return readStorage().articles;
}

export function getWriterArticle(
  articleId: string,
): WriterArticle | null {
  const data = readStorage();

  return (
    data.articles.find(
      (article) => article.id === articleId,
    ) ?? null
  );
}

export function saveWriterArticle(
  article: WriterArticle,
): WriterArticle {
  const data = readStorage();

  const normalized = normalizeWriterArticle(article);

  const index = data.articles.findIndex(
    (item) => item.id === normalized.id,
  );

  if (index === -1) {
    data.articles.push(normalized);
  } else {
    data.articles[index] = normalized;
  }

  writeStorage(data);

  return normalized;
}

export function createAndSaveWriterArticle(
  writerId: string,
  form: WriterArticleForm,
): WriterArticle {
  const article = createWriterArticle(writerId, form);

  return saveWriterArticle(article);
}

export function submitAndSaveWriterArticle(
  articleId: string,
): WriterArticle | null {
  const article = getWriterArticle(articleId);

  if (!article) {
    return null;
  }

  const submitted = submitWriterArticle(article);

  return saveWriterArticle(submitted);
}

export function approveAndSaveWriterArticle(
  articleId: string,
  reviewerNote = "",
): WriterArticle | null {
  const article = getWriterArticle(articleId);

  if (!article) {
    return null;
  }

  const approved = approveWriterArticle(
    article,
    reviewerNote,
  );

  return saveWriterArticle(approved);
}

export function rejectAndSaveWriterArticle(
  articleId: string,
  reviewerNote: string,
): WriterArticle | null {
  const article = getWriterArticle(articleId);

  if (!article) {
    return null;
  }

  const rejected = rejectWriterArticle(
    article,
    reviewerNote,
  );

  return saveWriterArticle(rejected);
}

export function publishAndSaveWriterArticle(
  articleId: string,
): WriterArticle | null {
  const article = getWriterArticle(articleId);

  if (!article) {
    return null;
  }

  const published = publishWriterArticle(article);

  return saveWriterArticle(published);
}

export function deleteWriterArticle(
  articleId: string,
): boolean {
  const data = readStorage();

  const originalLength = data.articles.length;

  data.articles = data.articles.filter(
    (article) => article.id !== articleId,
  );

  if (data.articles.length === originalLength) {
    return false;
  }

  writeStorage(data);

  return true;
}

export function deleteWriterApplication(
  applicationId: string,
): boolean {
  const data = readStorage();

  const originalLength = data.applications.length;

  data.applications = data.applications.filter(
    (application) => application.id !== applicationId,
  );

  if (data.applications.length === originalLength) {
    return false;
  }

  writeStorage(data);

  return true;
}

export function getPublishedArticles(): WriterArticle[] {
  return readStorage().articles.filter(
    (article) => article.status === "published",
  );
}

export function getPendingApplications(): WriterApplication[] {
  return readStorage().applications.filter(
    (application) => application.status === "pending",
  );
}

export function getSubmittedArticles(): WriterArticle[] {
  return readStorage().articles.filter(
    (article) =>
      article.status === "submitted" ||
      article.status === "under-review",
  );
}

export function getApprovedArticles(): WriterArticle[] {
  return readStorage().articles.filter(
    (article) =>
      article.status === "approved" ||
      article.status === "published",
  );
}

export function resetWriterDataForUser(
  userId: string,
): void {
  const data = readStorage();

  data.applications = data.applications.filter(
    (application) => application.userId !== userId,
  );

  data.articles = data.articles.filter(
    (article) => article.writerId !== userId,
  );

  writeStorage(data);
}

export function initializeWriterStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = localStorage.getItem(
    WRITER_STORAGE_KEY,
  );

  if (!existing) {
    writeStorage(defaultWriterStorage);
    return;
  }

  const data = readStorage();

  writeStorage(data);
}