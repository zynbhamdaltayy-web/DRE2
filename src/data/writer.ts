import type { Level, Avatar } from "../types";

export type WriterApplicationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

export type WriterArticleStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "approved"
  | "published"
  | "rejected";

export type WriterLanguage =
  | "en"
  | "ar"
  | "zh-CN"
  | "ru"
  | "ku"
  | "tr"
  | "fr"
  | "de"
  | "es"
  | "it"
  | "ja"
  | "ko";

export const WRITER_LANGUAGES: ReadonlyArray<{
  code: WriterLanguage;
  name: string;
  nativeName: string;
}> = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "zh-CN", name: "Chinese", nativeName: "中文" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ku", name: "Kurdish", nativeName: "کوردی" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
];

export const WRITER_TOPICS = [
  "Daily Life",
  "School",
  "Family",
  "Travel",
  "Food",
  "Health",
  "Technology",
  "Nature",
  "Culture",
  "Science",
  "Environment",
  "Society",
  "Education",
  "Work",
  "Personal Growth",
  "Politics",
  "Law",
  "Sports",
  "Art",
] as const;

export type WriterTopic = (typeof WRITER_TOPICS)[number];

export interface WriterApplication {
  id: string;
  userId: string;

  username: string;
  displayName: string;
  email: string;
  avatar: Avatar;
  countryCode: string;

  bio: string;
  languages: WriterLanguage[];
  levels: Level[];
  topics: WriterTopic[];
  experience: string;
  motivation: string;
  writingSample: string;

  status: WriterApplicationStatus;
  reviewerNote: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WriterArticle {
  id: string;
  writerId: string;
  title: string;
  content: string;
  language: WriterLanguage;
  level: Level;
  topic: WriterTopic;
  vocabulary: string[];
  questions: WriterArticleQuestion[];
  status: WriterArticleStatus;
  reviewerNote: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WriterArticleQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface WriterProfile {
  userId: string;
  displayName: string;
  languages: WriterLanguage[];
  levels: Level[];
  topics: WriterTopic[];
  publishedArticles: number;
  approvedArticles: number;
  totalSubmissions: number;
  joinedAt: string;
}

export interface WriterApplicationForm {
  displayName: string;
  bio: string;
  languages: WriterLanguage[];
  levels: Level[];
  topics: WriterTopic[];
  experience: string;
  motivation: string;
  writingSample: string;
}

export interface WriterArticleForm {
  title: string;
  content: string;
  language: WriterLanguage;
  level: Level;
  topic: WriterTopic;
  vocabulary: string[];
  questions: WriterArticleQuestion[];
}

export const MIN_BIO_LENGTH = 30;
export const MIN_EXPERIENCE_LENGTH = 20;
export const MIN_MOTIVATION_LENGTH = 30;
export const MIN_WRITING_SAMPLE_LENGTH = 150;

export const MIN_ARTICLE_TITLE_LENGTH = 5;
export const MIN_ARTICLE_CONTENT_LENGTH = 300;

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cleanLongText(value: string): string {
  return value.trim().replace(/\r\n/g, "\n");
}

export function getWriterLanguage(
  code: string,
): (typeof WRITER_LANGUAGES)[number] | null {
  return (
    WRITER_LANGUAGES.find((language) => language.code === code) ?? null
  );
}

export function isSupportedWriterLanguage(
  value: string,
): value is WriterLanguage {
  return WRITER_LANGUAGES.some((language) => language.code === value);
}

export function getWriterLanguageName(code: WriterLanguage): string {
  return getWriterLanguage(code)?.name ?? code;
}

export function getWriterLanguageNativeName(
  code: WriterLanguage,
): string {
  return getWriterLanguage(code)?.nativeName ?? code;
}

export function isWriterTopic(
  value: string,
): value is WriterTopic {
  return WRITER_TOPICS.includes(value as WriterTopic);
}

export function isValidWriterLevel(
  value: string,
): value is Level {
  return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(value);
}

export function createEmptyWriterApplicationForm(): WriterApplicationForm {
  return {
    displayName: "",
    bio: "",
    languages: ["en"],
    levels: ["A1", "A2", "B1", "B2"],
    topics: [],
    experience: "",
    motivation: "",
    writingSample: "",
  };
}

export function createEmptyWriterArticleForm(): WriterArticleForm {
  return {
    title: "",
    content: "",
    language: "en",
    level: "B1",
    topic: "Education",
    vocabulary: [],
    questions: [],
  };
}

export function createWriterApplication(
  userId: string,
  form: WriterApplicationForm,
  account?: {
    username?: string;
    email?: string;
    avatar?: Avatar;
    countryCode?: string;
  },
): WriterApplication {
  const timestamp = nowIso();

  return {
    id: createId("writer-application"),
    userId,

    username: cleanText(account?.username ?? ""),
    displayName: cleanText(form.displayName),
    email: cleanText(account?.email ?? ""),
    avatar: account?.avatar ?? {
      gender: "girl",
      skinTone: "medium",
      eyeColor: "brown",
      hairStyle: "long",
      hairColor: "black",
      shirtColor: "orange",
      hijab: false,
    },
    countryCode: cleanText(account?.countryCode ?? "UN"),

    bio: cleanLongText(form.bio),
    languages: [...form.languages],
    levels: [...form.levels],
    topics: [...form.topics],
    experience: cleanLongText(form.experience),
    motivation: cleanLongText(form.motivation),
    writingSample: cleanLongText(form.writingSample),

    status: "draft",
    reviewerNote: "",
    submittedAt: null,
    reviewedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function validateWriterApplication(
  form: WriterApplicationForm,
): string[] {
  const errors: string[] = [];

  if (cleanText(form.displayName).length < 2) {
    errors.push("Writer name must contain at least 2 characters.");
  }

  if (cleanLongText(form.bio).length < MIN_BIO_LENGTH) {
    errors.push(
      `Bio must contain at least ${MIN_BIO_LENGTH} characters.`,
    );
  }

  if (form.languages.length === 0) {
    errors.push("Select at least one language.");
  }

  if (form.levels.length === 0) {
    errors.push("Select at least one CEFR level.");
  }

  if (form.topics.length === 0) {
    errors.push("Select at least one writing topic.");
  }

  if (
    cleanLongText(form.experience).length <
    MIN_EXPERIENCE_LENGTH
  ) {
    errors.push(
      `Experience section must contain at least ${MIN_EXPERIENCE_LENGTH} characters.`,
    );
  }

  if (
    cleanLongText(form.motivation).length <
    MIN_MOTIVATION_LENGTH
  ) {
    errors.push(
      `Motivation must contain at least ${MIN_MOTIVATION_LENGTH} characters.`,
    );
  }

  if (
    cleanLongText(form.writingSample).length <
    MIN_WRITING_SAMPLE_LENGTH
  ) {
    errors.push(
      `Writing sample must contain at least ${MIN_WRITING_SAMPLE_LENGTH} characters.`,
    );
  }

  for (const language of form.languages) {
    if (!isSupportedWriterLanguage(language)) {
      errors.push(`Unsupported writer language: ${language}.`);
    }
  }

  for (const level of form.levels) {
    if (!isValidWriterLevel(level)) {
      errors.push(`Unsupported CEFR level: ${level}.`);
    }
  }

  for (const topic of form.topics) {
    if (!isWriterTopic(topic)) {
      errors.push(`Unsupported topic: ${topic}.`);
    }
  }

  return errors;
}

export function isWriterApplicationValid(
  form: WriterApplicationForm,
): boolean {
  return validateWriterApplication(form).length === 0;
}

export function submitWriterApplication(
  application: WriterApplication,
): WriterApplication {
  const validationErrors = validateWriterApplication({
    displayName: application.displayName,
    bio: application.bio,
    languages: application.languages,
    levels: application.levels,
    topics: application.topics,
    experience: application.experience,
    motivation: application.motivation,
    writingSample: application.writingSample,
  });

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const timestamp = nowIso();

  return {
    ...application,
    status: "pending",
    submittedAt: timestamp,
    reviewedAt: null,
    reviewerNote: "",
    updatedAt: timestamp,
  };
}

export function approveWriterApplication(
  application: WriterApplication,
  reviewerNote = "",
): WriterApplication {
  const timestamp = nowIso();

  return {
    ...application,
    status: "approved",
    reviewerNote: cleanLongText(reviewerNote),
    reviewedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function rejectWriterApplication(
  application: WriterApplication,
  reviewerNote: string,
): WriterApplication {
  const timestamp = nowIso();

  return {
    ...application,
    status: "rejected",
    reviewerNote: cleanLongText(reviewerNote),
    reviewedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function canApplyAsWriter(
  application: WriterApplication | null,
): boolean {
  if (!application) {
    return true;
  }

  return (
    application.status === "draft" ||
    application.status === "rejected"
  );
}

export function canCreateWriterArticles(
  application: WriterApplication | null,
): boolean {
  return application?.status === "approved";
}

export function createWriterArticle(
  writerId: string,
  form: WriterArticleForm,
): WriterArticle {
  const timestamp = nowIso();

  return {
    id: createId("writer-article"),
    writerId,
    title: cleanText(form.title),
    content: cleanLongText(form.content),
    language: form.language,
    level: form.level,
    topic: form.topic,
    vocabulary: form.vocabulary
      .map((word) => cleanText(word))
      .filter(Boolean),
    questions: form.questions.map((question, index) => ({
      ...question,
      id: question.id || `question-${index + 1}`,
      question: cleanText(question.question),
      options: question.options.map(cleanText),
    })),
    status: "draft",
    reviewerNote: "",
    submittedAt: null,
    reviewedAt: null,
    publishedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function validateWriterArticle(
  form: WriterArticleForm,
): string[] {
  const errors: string[] = [];

  if (
    cleanText(form.title).length <
    MIN_ARTICLE_TITLE_LENGTH
  ) {
    errors.push(
      `Article title must contain at least ${MIN_ARTICLE_TITLE_LENGTH} characters.`,
    );
  }

  if (
    cleanLongText(form.content).length <
    MIN_ARTICLE_CONTENT_LENGTH
  ) {
    errors.push(
      `Article content must contain at least ${MIN_ARTICLE_CONTENT_LENGTH} characters.`,
    );
  }

  if (!isSupportedWriterLanguage(form.language)) {
    errors.push("Article language is not supported.");
  }

  if (!isValidWriterLevel(form.level)) {
    errors.push("Article CEFR level is not valid.");
  }

  if (!isWriterTopic(form.topic)) {
    errors.push("Article topic is not valid.");
  }

  for (const question of form.questions) {
    if (cleanText(question.question).length < 5) {
      errors.push("Each question must contain a valid question.");
      break;
    }

    if (question.options.length < 2) {
      errors.push("Each question must have at least two options.");
      break;
    }

    if (
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      errors.push("A question has an invalid correct answer.");
      break;
    }
  }

  return errors;
}

export function isWriterArticleValid(
  form: WriterArticleForm,
): boolean {
  return validateWriterArticle(form).length === 0;
}

export function submitWriterArticle(
  article: WriterArticle,
): WriterArticle {
  const validationErrors = validateWriterArticle({
    title: article.title,
    content: article.content,
    language: article.language,
    level: article.level,
    topic: article.topic,
    vocabulary: article.vocabulary,
    questions: article.questions,
  });

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const timestamp = nowIso();

  return {
    ...article,
    status: "submitted",
    reviewerNote: "",
    submittedAt: timestamp,
    reviewedAt: null,
    publishedAt: null,
    updatedAt: timestamp,
  };
}

export function approveWriterArticle(
  article: WriterArticle,
  reviewerNote = "",
): WriterArticle {
  const timestamp = nowIso();

  return {
    ...article,
    status: "approved",
    reviewerNote: cleanLongText(reviewerNote),
    reviewedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function rejectWriterArticle(
  article: WriterArticle,
  reviewerNote: string,
): WriterArticle {
  const timestamp = nowIso();

  return {
    ...article,
    status: "rejected",
    reviewerNote: cleanLongText(reviewerNote),
    reviewedAt: timestamp,
    publishedAt: null,
    updatedAt: timestamp,
  };
}

export function publishWriterArticle(
  article: WriterArticle,
): WriterArticle {
  if (article.status !== "approved") {
    throw new Error(
      "Only an approved article can be published.",
    );
  }

  const timestamp = nowIso();

  return {
    ...article,
    status: "published",
    publishedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function unpublishWriterArticle(
  article: WriterArticle,
): WriterArticle {
  return {
    ...article,
    status: "approved",
    publishedAt: null,
    updatedAt: nowIso(),
  };
}

export function canSubmitWriterArticle(
  application: WriterApplication | null,
  article: WriterArticleForm,
): boolean {
  return (
    canCreateWriterArticles(application) &&
    isWriterArticleValid(article)
  );
}

export function canPublishWriterArticle(
  article: WriterArticle,
): boolean {
  return article.status === "approved";
}

export function getPublishedWriterArticles(
  articles: WriterArticle[],
): WriterArticle[] {
  return articles.filter(
    (article) => article.status === "published",
  );
}

export function getWriterArticles(
  articles: WriterArticle[],
  writerId: string,
): WriterArticle[] {
  return articles.filter(
    (article) => article.writerId === writerId,
  );
}

export function getWriterArticleById(
  articles: WriterArticle[],
  articleId: string,
): WriterArticle | null {
  return (
    articles.find((article) => article.id === articleId) ??
    null
  );
}

export function getWriterProfile(
  application: WriterApplication,
  articles: WriterArticle[],
): WriterProfile | null {
  if (application.status !== "approved") {
    return null;
  }

  const writerArticles = getWriterArticles(
    articles,
    application.userId,
  );

  return {
    userId: application.userId,
    displayName: application.displayName,
    languages: [...application.languages],
    levels: [...application.levels],
    topics: [...application.topics],
    publishedArticles: writerArticles.filter(
      (article) => article.status === "published",
    ).length,
    approvedArticles: writerArticles.filter(
      (article) =>
        article.status === "approved" ||
        article.status === "published",
    ).length,
    totalSubmissions: writerArticles.length,
    joinedAt: application.reviewedAt ?? application.createdAt,
  };
}

export function getWriterStatistics(
  articles: WriterArticle[],
  writerId: string,
): {
  total: number;
  drafts: number;
  submitted: number;
  underReview: number;
  approved: number;
  published: number;
  rejected: number;
} {
  const writerArticles = getWriterArticles(
    articles,
    writerId,
  );

  return {
    total: writerArticles.length,
    drafts: writerArticles.filter(
      (article) => article.status === "draft",
    ).length,
    submitted: writerArticles.filter(
      (article) => article.status === "submitted",
    ).length,
    underReview: writerArticles.filter(
      (article) => article.status === "under-review",
    ).length,
    approved: writerArticles.filter(
      (article) => article.status === "approved",
    ).length,
    published: writerArticles.filter(
      (article) => article.status === "published",
    ).length,
    rejected: writerArticles.filter(
      (article) => article.status === "rejected",
    ).length,
  };
}

export function getWriterStatusLabel(
  status: WriterApplicationStatus | WriterArticleStatus,
): string {
  const labels: Record<
    WriterApplicationStatus | WriterArticleStatus,
    string
  > = {
    draft: "Draft",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    submitted: "Submitted",
    "under-review": "Under Review",
    published: "Published",
  };

  return labels[status];
}

export function getWriterStatusDescription(
  status: WriterApplicationStatus | WriterArticleStatus,
): string {
  const descriptions: Record<
    WriterApplicationStatus | WriterArticleStatus,
    string
  > = {
    draft: "This work has not been submitted yet.",
    pending:
      "Your writer application is waiting for review.",
    approved:
      "You have been approved as a DRE2learn writer.",
    rejected:
      "This submission was not approved. You can revise it and submit again.",
    submitted:
      "Your article has been submitted and is waiting for review.",
    "under-review":
      "Your article is currently being reviewed.",
    published:
      "This article is published in the DRE2learn Library.",
  };

  return descriptions[status];
}

export function getWriterApplicationProgress(
  application: WriterApplicationForm,
): number {
  const fields = [
    application.displayName,
    application.bio,
    application.experience,
    application.motivation,
    application.writingSample,
  ];

  let completed = fields.filter(
    (field) => cleanLongText(field).length > 0,
  ).length;

  if (application.languages.length > 0) {
    completed += 1;
  }

  if (application.levels.length > 0) {
    completed += 1;
  }

  if (application.topics.length > 0) {
    completed += 1;
  }

  const total = 8;

  return Math.round((completed / total) * 100);
}

export function getArticleWordCount(
  content: string,
): number {
  return cleanLongText(content)
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getArticleReadingTime(
  content: string,
): number {
  const words = getArticleWordCount(content);

  if (words === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(words / 180));
}

export function normalizeWriterApplication(
  application: WriterApplication,
): WriterApplication {
  return {
    ...application,

    username: cleanText(application.username),
    displayName: cleanText(application.displayName),
    email: cleanText(application.email),
    countryCode: cleanText(application.countryCode || "UN"),

    bio: cleanLongText(application.bio),
    experience: cleanLongText(application.experience),
    motivation: cleanLongText(application.motivation),
    writingSample: cleanLongText(application.writingSample),

    languages: application.languages.filter(
      isSupportedWriterLanguage,
    ),
    levels: application.levels.filter(isValidWriterLevel),
    topics: application.topics.filter(isWriterTopic),

    reviewerNote: cleanLongText(application.reviewerNote),
  };
}

export function normalizeWriterArticle(
  article: WriterArticle,
): WriterArticle {
  return {
    ...article,
    title: cleanText(article.title),
    content: cleanLongText(article.content),
    language: isSupportedWriterLanguage(article.language)
      ? article.language
      : "en",
    level: isValidWriterLevel(article.level)
      ? article.level
      : "A1",
    topic: isWriterTopic(article.topic)
      ? article.topic
      : "Education",
    vocabulary: article.vocabulary
      .map((word) => cleanText(word))
      .filter(Boolean),
    questions: article.questions.map((question, index) => ({
      ...question,
      id: question.id || `question-${index + 1}`,
      question: cleanText(question.question),
      options: question.options.map(cleanText),
    })),
    reviewerNote: cleanLongText(article.reviewerNote),
  };
}

  
  



  

    
    
    
    
  
    
  


  
  
  