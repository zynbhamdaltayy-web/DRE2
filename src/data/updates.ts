import type { Account } from "./accounts";

export type UpdateType =
  | "feature"
  | "improvement"
  | "maintenance"
  | "announcement"
  | "security"
  | "education"
  | "fix";

export type UpdateStatus =
  | "draft"
  | "published"
  | "archived";

export interface AppUpdate {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type: UpdateType;
  status: UpdateStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  authorId: string;
  featured: boolean;
  version?: string;
  actionUrl?: string;
  metadata?: Record<string, string>;
  date?: string;
  isNew?: boolean;
}

export interface AppUpdateInput {
  title: string;
  message?: string;
  description?: string;
  type: UpdateType;
  authorId: string;
  version?: string;
  actionUrl?: string;
  featured?: boolean;
  metadata?: Record<string, string>;
}

export const UPDATE_TYPE_LABELS: Record<
  UpdateType,
  string
> = {
  feature: "New feature",
  improvement: "Improvement",
  maintenance: "Maintenance",
  announcement: "Announcement",
  security: "Security",
  education: "Learning update",
  fix: "Bug fix",
};

export const UPDATE_STATUS_LABELS: Record<
  UpdateStatus,
  string
> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

function createId(
  prefix = "update",
): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function now(): string {
  return new Date().toISOString();
}

export function createUpdate(
  input: AppUpdateInput,
): AppUpdate {
  const timestamp = now();

  const message =
    cleanString(input.message) ||
    cleanString(input.description);

  return {
    id: createId(),
    title: cleanString(input.title),
    message,
    description: message,
    type: input.type,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: undefined,
    authorId: cleanString(input.authorId),
    featured: input.featured ?? false,
    version:
      cleanString(input.version) ||
      undefined,
    actionUrl:
      cleanString(input.actionUrl) ||
      undefined,
    metadata: input.metadata,
    date: timestamp,
    isNew: true,
  };
}

export function normalizeUpdate(
  update: AppUpdate,
): AppUpdate {
  const timestamp = now();

  const message =
    cleanString(update.message) ||
    cleanString(update.description);

  return {
    ...update,

    id:
      cleanString(update.id) ||
      createId(),

    title: cleanString(update.title),

    message,

    description: message,

    authorId:
      cleanString(update.authorId),

    createdAt:
      cleanString(update.createdAt) ||
      timestamp,

    updatedAt:
      cleanString(update.updatedAt) ||
      timestamp,

    publishedAt:
      cleanString(update.publishedAt) ||
      undefined,

    featured:
      Boolean(update.featured),

    version:
      cleanString(update.version) ||
      undefined,

    actionUrl:
      cleanString(update.actionUrl) ||
      undefined,

    date:
      cleanString(update.date) ||
      cleanString(update.createdAt) ||
      timestamp,

    isNew:
      update.isNew ?? false,
  };
}

export function publishUpdate(
  update: AppUpdate,
): AppUpdate {
  const timestamp = now();

  return {
    ...update,
    status: "published",
    publishedAt: timestamp,
    updatedAt: timestamp,
    date: timestamp,
    isNew: true,
  };
}

export function archiveUpdate(
  update: AppUpdate,
): AppUpdate {
  return {
    ...update,
    status: "archived",
    updatedAt: now(),
  };
}

export function restoreUpdate(
  update: AppUpdate,
): AppUpdate {
  return {
    ...update,
    status: "draft",
    publishedAt: undefined,
    updatedAt: now(),
  };
}

export function setUpdateFeatured(
  update: AppUpdate,
  featured: boolean,
): AppUpdate {
  return {
    ...update,
    featured,
    updatedAt: now(),
  };
}

export function updateUpdateContent(
  update: AppUpdate,
  changes: Partial<
    Pick<
      AppUpdate,
      | "title"
      | "message"
      | "description"
      | "type"
      | "version"
      | "actionUrl"
    >
  >,
): AppUpdate {
  const nextMessage =
    changes.message !== undefined
      ? cleanString(changes.message)
      : changes.description !== undefined
        ? cleanString(changes.description)
        : update.message ??
          update.description ??
          "";

  return {
    ...update,

    title:
      changes.title !== undefined
        ? cleanString(changes.title)
        : update.title,

    message: nextMessage,

    description: nextMessage,

    type:
      changes.type ??
      update.type,

    version:
      changes.version !== undefined
        ? cleanString(
            changes.version,
          ) || undefined
        : update.version,

    actionUrl:
      changes.actionUrl !== undefined
        ? cleanString(
            changes.actionUrl,
          ) || undefined
        : update.actionUrl,

    updatedAt: now(),
  };
}

export function getPublishedUpdates(
  updates: AppUpdate[],
): AppUpdate[] {
  return updates
    .filter(
      (update) =>
        update.status === "published",
    )
    .sort(
      (a, b) =>
        new Date(
          b.publishedAt ??
            b.updatedAt,
        ).getTime() -
        new Date(
          a.publishedAt ??
            a.updatedAt,
        ).getTime(),
    );
}

export function getDraftUpdates(
  updates: AppUpdate[],
): AppUpdate[] {
  return updates
    .filter(
      (update) =>
        update.status === "draft",
    )
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt,
        ).getTime() -
        new Date(
          a.updatedAt,
        ).getTime(),
    );
}

export function getArchivedUpdates(
  updates: AppUpdate[],
): AppUpdate[] {
  return updates
    .filter(
      (update) =>
        update.status === "archived",
    )
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt,
        ).getTime() -
        new Date(
          a.updatedAt,
        ).getTime(),
    );
}

export function getFeaturedUpdates(
  updates: AppUpdate[],
): AppUpdate[] {
  return getPublishedUpdates(
    updates,
  ).filter(
    (update) =>
      update.featured,
  );
}

export function getUpdatesByType(
  updates: AppUpdate[],
  type: UpdateType,
): AppUpdate[] {
  return getPublishedUpdates(
    updates,
  ).filter(
    (update) =>
      update.type === type,
  );
}

export function getUpdatesByAuthor(
  updates: AppUpdate[],
  authorId: string,
): AppUpdate[] {
  return updates
    .filter(
      (update) =>
        update.authorId ===
        authorId,
    )
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt,
        ).getTime() -
        new Date(
          a.updatedAt,
        ).getTime(),
    );
}

export function searchUpdates(
  updates: AppUpdate[],
  query: string,
): AppUpdate[] {
  const normalizedQuery =
    cleanString(query).toLowerCase();

  if (!normalizedQuery) {
    return getPublishedUpdates(
      updates,
    );
  }

  return getPublishedUpdates(
    updates,
  ).filter(
    (update) =>
      update.title
        .toLowerCase()
        .includes(
          normalizedQuery,
        ) ||
      (
        update.message ??
        update.description ??
        ""
      )
        .toLowerCase()
        .includes(
          normalizedQuery,
        ),
  );
}

export function canManageUpdates(
  account: Account,
): boolean {
  return (
    account.status === "active" &&
    (
      account.role === "owner" ||
      account.role === "admin"
    ) &&
    account.permissions
      .publishUpdates
  );
}

export function validateUpdateInput(
  input: AppUpdateInput,
): string[] {
  const errors: string[] = [];

  if (!cleanString(input.title)) {
    errors.push(
      "Update title is required.",
    );
  }

  if (
    !cleanString(
      input.message ??
        input.description,
    )
  ) {
    errors.push(
      "Update message is required.",
    );
  }

  if (!cleanString(input.authorId)) {
    errors.push(
      "Author ID is required.",
    );
  }

  if (
    cleanString(input.title)
      .length > 150
  ) {
    errors.push(
      "Update title cannot exceed 150 characters.",
    );
  }

  if (
    cleanString(
      input.message ??
        input.description,
    ).length > 5000
  ) {
    errors.push(
      "Update message cannot exceed 5000 characters.",
    );
  }

  return errors;
}


      
  

  