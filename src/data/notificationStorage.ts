import {
  createNotification,
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

    const parsed = JSON.parse(raw);

    return {
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : [],
    };
  } catch {
    return {
      ...DEFAULT_DATA,
      notifications: [],
    };
  }
}

function writeData(data: NotificationStorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

  data.notifications.push(notification);

  writeData(data);

  return notification;
}

export function createAndSaveNotification(
  input: NotificationInput,
): Notification {
  return saveNotification(createNotification(input));
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