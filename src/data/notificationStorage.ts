import {
  createNotification,
  normalizeNotification,
  type Notification,
  type NotificationInput,
  getUserNotifications,
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications";

const STORAGE_KEY = "dre2learn-notifications";

export interface NotificationStorageData {
  notifications: Notification[];
}

const DEFAULT_DATA: NotificationStorageData = {
  notifications: [],
};

function readData(): NotificationStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        notifications: [],
      };
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("notifications" in parsed)
    ) {
      return {
        notifications: [],
      };
    }

    const notificationsValue = (
      parsed as {
        notifications?: unknown;
      }
    ).notifications;

    if (!Array.isArray(notificationsValue)) {
      return {
        notifications: [],
      };
    }

    return {
      notifications: notificationsValue.map((item) =>
        normalizeNotification(item as Notification),
      ),
    };
  } catch {
    return {
      ...DEFAULT_DATA,
    };
  }
}

function writeData(data: NotificationStorageData): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getNotificationStorage(): NotificationStorageData {
  return readData();
}

export function saveNotificationStorage(
  data: NotificationStorageData,
): void {
  writeData(data);
}

export function getAllNotifications(): Notification[] {
  return readData().notifications;
}

export function getNotificationsForUser(
  userId: string,
): Notification[] {
  return getUserNotifications(
    readData().notifications,
    userId,
  );
}

export function getUnreadNotificationsForUser(
  userId: string,
): Notification[] {
  return getUnreadNotifications(
    readData().notifications,
    userId,
  );
}

export function getUnreadNotificationCountForUser(
  userId: string,
): number {
  return getUnreadNotificationsForUser(userId).length;
}

export function saveNotification(
  notification: Notification,
): Notification {
  const data = readData();

  const normalized = normalizeNotification(notification);

  const existingIndex = data.notifications.findIndex(
    (item) => item.id === normalized.id,
  );

  if (existingIndex >= 0) {
    data.notifications[existingIndex] = normalized;
  } else {
    data.notifications.push(normalized);
  }

  writeData(data);

  return normalized;
}

export function createAndSaveNotification(
  input: NotificationInput,
): Notification {
  const notification = createNotification(input);

  return saveNotification(notification);
}

export function markNotificationAsRead(
  notificationId: string,
): boolean {
  const data = readData();

  const notification = data.notifications.find(
    (item) => item.id === notificationId,
  );

  if (!notification) {
    return false;
  }

  const updated = markNotificationRead(notification);

  data.notifications = data.notifications.map((item) =>
    item.id === notificationId ? updated : item,
  );

  writeData(data);

  return true;
}

export function markAllUserNotificationsAsRead(
  userId: string,
): void {
  const data = readData();

  data.notifications = markAllNotificationsRead(
    data.notifications,
    userId,
  );

  writeData(data);
}

export function deleteNotification(
  notificationId: string,
): boolean {
  const data = readData();

  const originalLength = data.notifications.length;

  data.notifications = data.notifications.filter(
    (item) => item.id !== notificationId,
  );

  if (data.notifications.length === originalLength) {
    return false;
  }

  writeData(data);

  return true;
}

export function deleteAllUserNotifications(
  userId: string,
): void {
  const data = readData();

  data.notifications = data.notifications.filter(
    (item) => item.userId !== userId,
  );

  writeData(data);
}

export function clearNotificationStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeNotificationStorage(): void {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (!existing) {
    writeData(DEFAULT_DATA);
  }
}
    


  
  

  