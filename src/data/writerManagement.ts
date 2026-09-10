import {
  createWriterAccount,
  hasPermission,
  type Account,
} from "./accounts";

import {
  approveWriterApplication,
  rejectWriterApplication,
  type WriterApplication,
  type WriterArticle,
} from "./writer";

export interface WriterManagementResult {
  success: boolean;
  application?: WriterApplication;
  account?: Account;
  message: string;
}

export function canManageWriters(account: Account): boolean {
  return hasPermission(account, "manageWriters");
}

export function canManageArticles(account: Account): boolean {
  return hasPermission(account, "manageArticles");
}

export function approveWriterAndCreateAccount(
  application: WriterApplication,
  reviewer: Account,
): WriterManagementResult {
  if (!canManageWriters(reviewer)) {
    return {
      success: false,
      message: "You do not have permission to manage writers.",
    };
  }

  if (application.status !== "pending") {
    return {
      success: false,
      message: "Only pending writer applications can be approved.",
    };
  }

  const approved = approveWriterApplication(application);

  const account = createWriterAccount(
    application.userId,
    application.username,
    application.displayName,
    application.email,
    application.avatar,
    application.countryCode,
  );

  return {
    success: true,
    application: approved,
    account,
    message: "Writer application approved and writer account created.",
  };
}

export function rejectWriter(
  application: WriterApplication,
  reviewer: Account,
  reviewerNote: string,
): WriterManagementResult {
  if (!canManageWriters(reviewer)) {
    return {
      success: false,
      message: "You do not have permission to manage writers.",
    };
  }

  if (application.status !== "pending") {
    return {
      success: false,
      message: "Only pending writer applications can be rejected.",
    };
  }

  const rejected = rejectWriterApplication(
    application,
    reviewerNote,
  );

  return {
    success: true,
    application: rejected,
    message: "Writer application rejected.",
  };
}

export function canEditWriterArticle(
  article: WriterArticle,
  account: Account,
): boolean {
  if (account.id === "dre2learn-owner") {
    return true;
  }

  if (article.writerId === account.id) {
    return true;
  }

  return canManageArticles(account);
}

export function canReviewWriterArticle(
  account: Account,
): boolean {
  return canManageArticles(account);
}

export function canPublishWriterArticle(
  account: Account,
): boolean {
  return canManageArticles(account);
}

export function canDeleteWriterArticle(
  article: WriterArticle,
  account: Account,
): boolean {
  if (account.id === "dre2learn-owner") {
    return true;
  }

  if (article.writerId === account.id) {
    return true;
  }

  return canManageArticles(account);
}

export function getWriterManagementSummary(
  applications: WriterApplication[],
  articles: WriterArticle[],
): {
  totalApplications: number;
  pendingApplications: number;
  approvedWriters: number;
  rejectedApplications: number;
  totalArticles: number;
  submittedArticles: number;
  underReviewArticles: number;
  approvedArticles: number;
  publishedArticles: number;
  rejectedArticles: number;
} {
  const approvedWriters = applications.filter(
    (application) => application.status === "approved",
  ).length;

  return {
    totalApplications: applications.length,

    pendingApplications: applications.filter(
      (application) => application.status === "pending",
    ).length,

    approvedWriters,

    rejectedApplications: applications.filter(
      (application) => application.status === "rejected",
    ).length,

    totalArticles: articles.length,

    submittedArticles: articles.filter(
      (article) => article.status === "submitted",
    ).length,

    underReviewArticles: articles.filter(
      (article) => article.status === "under-review",
    ).length,

    approvedArticles: articles.filter(
      (article) => article.status === "approved",
    ).length,

    publishedArticles: articles.filter(
      (article) => article.status === "published",
    ).length,

    rejectedArticles: articles.filter(
      (article) => article.status === "rejected",
    ).length,
  };
}
  


    