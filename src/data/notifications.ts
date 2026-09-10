import type { Account } from "./accounts";

export type NotificationType =
  | "follow"
  | "message-request"
  | "message-accepted"
  | "message"
  | "article-submitted"
  | "article-approved"
  | "article-published"
  | "writer-approved"
  | "writer-rejected"
  | "official-update"
  | "system"
  | "report-update";

export type NotificationPriority = "low" | "normal" | "high";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: NotificationPriority;
  actorId?: string;
  relatedId?: string;
  actionUrl?: string;
  metadata?: Record<string, string>;
}

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actorId?: string;
  relatedId?: string;
  actionUrl?: string;
  metadata?: Record<string, string>;
}

export const NOTIFICATION_TYPE_LABELS: Record<
  NotificationType,
  string
> = {
  follow: "New follower",
  "message-request": "Message request",
  "message-accepted": "Message request accepted",
  message: "New message",
  "article-submitted": "Article submitted",
  "article-approved": "Article approved",
  "article-published": "Article published",
  "writer-approved": "Writer application approved",
  "writer-rejected": "Writer application rejected",
  "official-update": "DRE2learn update",
  system: "System notification",
  "report-update": "Report update",
};

function createId(prefix = "notification"): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function createNotification(
  input: NotificationInput,
): Notification {
  return {
    id: createId(),
    userId: cleanString(input.userId),
    type: input.type,
    title: cleanString(input.title),
    message: cleanString(input.message),
    createdAt: new Date().toISOString(),
    read: false,
    priority: input.priority ?? "normal",
    actorId: cleanString(input.actorId) || undefined,
    relatedId: cleanString(input.relatedId) || undefined,
    actionUrl: cleanString(input.actionUrl) || undefined,
    metadata: input.metadata,
  };
}

export function normalizeNotification(
  notification: Notification,
): Notification {
  return {
    ...notification,
    id: cleanString(notification.id) || createId(),
    userId: cleanString(notification.userId),
    title: cleanString(notification.title),
    message: cleanString(notification.message),
    createdAt:
      cleanString(notification.createdAt) ||
      new Date().toISOString(),
    read: Boolean(notification.read),
    priority: notification.priority ?? "normal",
  };
}

export function markNotificationRead(
  notification: Notification,
): Notification {
  return {
    ...notification,
    read: true,
  };
}

export function markNotificationUnread(
  notification: Notification,
): Notification {
  return {
    ...notification,
    read: false,
  };
}

export function getUnreadNotifications(
  notifications: Notification[],
  userId: string,
): Notification[] {
  return notifications
    .filter(
      (notification) =>
        notification.userId === userId &&
        !notification.read,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}

export function getUserNotifications(
  notifications: Notification[],
  userId: string,
): Notification[] {
  return notifications
    .filter(
      (notification) => notification.userId === userId,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}

export function getUnreadNotificationCount(
  notifications: Notification[],
  userId: string,
): number {
  return getUnreadNotifications(notifications, userId).length;
}

export function markAllNotificationsRead(
  notifications: Notification[],
  userId: string,
): Notification[] {
  return notifications.map((notification) =>
    notification.userId === userId
      ? markNotificationRead(notification)
      : notification,
  );
}

export function deleteUserNotifications(
  notifications: Notification[],
  userId: string,
): Notification[] {
  return notifications.filter(
    (notification) => notification.userId !== userId,
  );
}

export function createFollowNotification(
  userId: string,
  actor: Account,
): Notification {
  return createNotification({
    userId,
    type: "follow",
    title: "New follower",
    message: `${actor.displayName} started following you.`,
    actorId: actor.id,
    priority: "normal",
  });
}

export function createMessageRequestNotification(
  userId: string,
  actor: Account,
  requestId: string,
): Notification {
  return createNotification({
    userId,
    type: "message-request",
    title: "New message request",
    message: `${actor.displayName} wants to message you.`,
    actorId: actor.id,
    relatedId: requestId,
    priority: "normal",
  });
}

export function createOfficialUpdateNotification(
  userId: string,
  updateId: string,
  title: string,
): Notification {
  return createNotification({
    userId,
    type: "official-update",
    title: "DRE2learn",
    message: title,
    relatedId: updateId,
    priority: "normal",
  });
}

export function createArticlePublishedNotification(
  userId: string,
  articleId: string,
  articleTitle: string,
): Notification {
  return createNotification({
    userId,
    type: "article-published",
    title: "Article published",
    message: `Your article "${articleTitle}" has been published.`,
    relatedId: articleId,
    priority: "normal",
  });
}

export function createWriterApprovedNotification(
  userId: string,
): Notification {
  return createNotification({
    userId,
    type: "writer-approved",
    title: "Writer application approved",
    message:
      "Congratulations! You are now an approved DRE2learn writer.",
    priority: "high",
  });
}

export function createWriterRejectedNotification(
  userId: string,
): Notification {
  return createNotification({
    userId,
    type: "writer-rejected",
    title: "Writer application update",
    message:
      "Your writer application was not approved at this time.",
    priority: "normal",
  });
}

  
    


  
  
    

    