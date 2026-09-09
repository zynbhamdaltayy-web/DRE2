import {
  DRE2LEARN_OWNER_ID,
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

export function canManageWriters(
  account: Account,
): boolean {
  return hasPermission(
    account,
    "manageWriters",
  );
}

export function canManageArticles(
  account: Account,
): boolean {
  return hasPermission(
    account,
    "manageArticles",
  );
}

export function approveWriterAndCreateAccount(
  application: WriterApplication,
  reviewer: Account,
): WriterManagementResult {
  if (!canManageWriters(reviewer)) {
    return {
      success: false,
      message:
        "You do not have permission to manage writers.",
    };
  }

  const approved = approveWriterApplication(
    application,
  );

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
    message:
      "Writer application approved and writer account created.",
  };
}

export function rejectWriterApplicationForReview(
  application: WriterApplication,
  reviewer: Account,
): WriterManagementResult {
  if (!canManageWriters(reviewer)) {
    return {
      success: false,
      message:
        "You do not have permission to manage writers.",
    };
  }

  const rejected = rejectWriterApplication(
    application,
  );

  return {
    success: true,
    application: rejected,
    message: "Writer application rejected.",
  };
}

export function canEditWriterArticle(
  account: Account,
  article: WriterArticle,
): boolean {
  if (account.id === DRE2LEARN_OWNER_ID) {
    return true;
  }

  if (
    account.id === article.writerId &&
    account.role === "writer"
  ) {
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
  return hasPermission(
    account,
    "manageArticles",
  );
}

export function canDeleteWriterArticle(
  account: Account,
  article: WriterArticle,
): boolean {
  return (
    account.id === DRE2LEARN_OWNER_ID ||
    account.id === article.writerId ||
    canManageArticles(account)
  );
}

export function getWriterManagementSummary(
  applications: WriterApplication[],
  articles: WriterArticle[],
) {
  return {
    totalApplications: applications.length,
    pendingApplications: applications.filter(
      (application) =>
        application.status === "pending",
    ).length,
    approvedApplications: applications.filter(
      (application) =>
        application.status === "approved",
    ).length,
    rejectedApplications: applications.filter(
      (application) =>
        application.status === "rejected",
    ).length,
    totalArticles: articles.length,
    drafts: articles.filter(
      (article) => article.status === "draft",
    ).length,
    submitted: articles.filter(
      (article) => article.status === "submitted",
    ).length,
    underReview: articles.filter(
      (article) => article.status === "under-review",
    ).length,
    published: articles.filter(
      (article) => article.status === "published",
    ).length,
  };
}