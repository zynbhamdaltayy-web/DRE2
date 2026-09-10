import { initializeAccountStorage } from "./accountStorage";
import { initializeAchievementStorage } from "./achievementStorage";
import { initializeCardStorage } from "./cardStorage";
import { initializeFollowStorage } from "./followStorage";
import { initializeMessageStorage } from "./messageStorage";
import { initializeNotificationStorage } from "./notificationStorage";
import { initializeProfileStorage } from "./profileStorage";
import { initializeProgressStorage } from "./progressStorage";
import { initializeReportStorage } from "./reportStorage";
import { initializeRoomStorage } from "./roomStorage";
import { initializeSettingsStorage } from "./settingsStorage";
import { initializeUpdateStorage } from "./updateStorage";
import { initializeWriterStorage } from "./writerStorage";

export function initializeAppStorage(): void {
  initializeAccountStorage();
  initializeAchievementStorage();
  initializeCardStorage();
  initializeFollowStorage();
  initializeMessageStorage();
  initializeNotificationStorage();
  initializeProfileStorage();
  initializeProgressStorage();
  initializeReportStorage();
  initializeRoomStorage();
  initializeSettingsStorage();
  initializeUpdateStorage();
  initializeWriterStorage();
}

export function clearAllAppStorage(): void {
  localStorage.removeItem(
    "dre2learn-account-data",
  );

  localStorage.removeItem(
    "dre2learn-achievements",
  );

  localStorage.removeItem(
    "dre2learn-cards",
  );

  localStorage.removeItem(
    "dre2learn-follows",
  );

  localStorage.removeItem(
    "dre2learn-messages",
  );

  localStorage.removeItem(
    "dre2learn-notifications",
  );

  localStorage.removeItem(
    "dre2learn-profile",
  );

  localStorage.removeItem(
    "dre2learn-progress",
  );

  localStorage.removeItem(
    "dre2learn-reports",
  );

  localStorage.removeItem(
    "dre2learn-rooms",
  );

  localStorage.removeItem(
    "dre2learn-settings",
  );

  localStorage.removeItem(
    "dre2learn-updates",
  );

  localStorage.removeItem(
    "dre2learn-writer-data",
  );
}