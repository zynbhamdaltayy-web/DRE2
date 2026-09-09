import {
  DRE2LEARN_OWNER_ID,
} from "./accounts";

export type UpdateStatus =
  | "draft"
  | "published"
  | "archived";

export type UpdateCategory =
  | "announcement"
  | "feature"
  | "maintenance"
  | "community"
  | "official";

export interface AppUpdate {
  id: string;
  title: string;
  content: string;
  category: UpdateCategory;
  status: UpdateStatus;
  authorId: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  pinned: boolean;
}

export interface CreateUpdateInput {
  title: string;
  content: string;
  category?: UpdateCategory;
  authorId?: string;
}

export const UPDATE_CATEGORY_LABELS: Record<
  UpdateCategory,
  string
> = {
  announcement: "Announcement",
  feature: "New feature",
  maintenance: "Maintenance",
  community: "Community",
  official: "Official",
};

export const UPDATE_STATUS_LABELS: Record<
  UpdateStatus,
  string
> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

function createId(): string {
  return `update-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createUpdate(
  input: CreateUpdateInput,
): AppUpdate {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: input.title.trim(),
    content: input.content.trim(),
    category: input.category ?? "official",
    status: "draft",
    authorId:
      input.authorId?.trim() || DRE2LEARN_OWNER_ID,
    createdAt: now,
    updatedAt: now,
    pinned: false,
  };
}

export function validateUpdate(
  update: Partial<AppUpdate>,
): string[] {
  const errors: string[] = [];

  if (!update.title?.trim()) {
    errors.push("Title is required.");
  }

  if (!update.content?.trim()) {
    errors.push("Content is required.");
  }

  if (!update.authorId?.trim()) {
    errors.push("Author is required.");
  }

  return errors;
}

export function updateDraft(
  update: AppUpdate,
  changes: Partial<
    Pick<AppUpdate, "title" | "content" | "category">
  >,
): AppUpdate {
  return {
    ...update,
    title:
      changes.title?.trim() ?? update.title,
    content:
      changes.content?.trim() ?? update.content,
    category:
      changes.category ?? update.category,
    updatedAt: new Date().toISOString(),
  };
}

export function publishUpdate(
  update: AppUpdate,
): AppUpdate {
  const now = new Date().toISOString();

  return {
    ...update,
    status: "published",
    publishedAt: now,
    updatedAt: now,
  };
}

export function archiveUpdate(
  update: AppUpdate,
): AppUpdate {
  return {
    ...update,
    status: "archived",
    updatedAt: new Date().toISOString(),
  };
}

export function pinUpdate(
  update: AppUpdate,
): AppUpdate {
  return {
    ...update,
    pinned: true,
    updatedAt: new Date().toISOString(),
  };
}

export function unpinUpdate(
  update: AppUpdate,
): AppUpdate {
  return {
    ...update,
    pinned: false,
    updatedAt: new Date().toISOString(),
  };
}

export function getPublishedUpdates(
  updates: AppUpdate[],
): AppUpdate[] {
  return updates
    .filter((update) => update.status === "published")
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      return (
        new Date(
          b.publishedAt ?? b.createdAt,
        ).getTime() -
        new Date(
          a.publishedAt ?? a.createdAt,
        ).getTime()
      );
    });
}

export function getDraftUpdates(
  updates: AppUpdate[],
): AppUpdate[] {
  return updates.filter(
    (update) => update.status === "draft",
  );
}

export function getUpdateById(
  updates: AppUpdate[],
  id: string,
): AppUpdate | null {
  return (
    updates.find((update) => update.id === id) ??
    null
  );
}

export function searchUpdates(
  updates: AppUpdate[],
  query: string,
): AppUpdate[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return getPublishedUpdates(updates);
  }

  return getPublishedUpdates(updates).filter(
    (update) =>
      update.title.toLowerCase().includes(normalized) ||
      update.content.toLowerCase().includes(normalized),
  );
}