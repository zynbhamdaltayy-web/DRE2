import type {
  AppLanguage,
  AppSettings,
  LearningSettings,
  NotificationSettings,
  PrivacySettings,
  ThemeMode,
} from "../types";

export type {
  AppLanguage,
  AppSettings,
  LearningSettings,
  NotificationSettings,
  PrivacySettings,
  ThemeMode,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "ar",

  notifications: {
    pushNotifications: true,
    messageNotifications: true,
    followNotifications: true,
    learningNotifications: true,
    officialUpdates: true,
  },

  privacy: {
    profileVisible: true,
    showOnlineStatus: true,
    allowMessageRequests: true,
    allowRoomInvites: true,
  },

  learning: {
    dailyGoal: 20,
    defaultLevel: "A1",
    defaultLanguage: "English",
    autoplayAudio: true,
  },

  soundEffects: true,
  autoplayAudio: true,

  privateMessages: true,
  showOnlineStatus: true,

  preferredTheme: "system",
  preferredLanguage: "ar",

  defaultLanguage: "English",
};

export function createDefaultSettings(): AppSettings {
  return structuredClone(DEFAULT_SETTINGS);
}

export function updateTheme(
  settings: AppSettings,
  theme: ThemeMode,
): AppSettings {
  return {
    ...settings,
    theme,
    preferredTheme: theme,
  };
}

export function updateLanguage(
  settings: AppSettings,
  language: AppLanguage,
): AppSettings {
  return {
    ...settings,
    language,
    preferredLanguage: language,
  };
}

export function updateNotificationSetting(
  settings: AppSettings,
  key: keyof NotificationSettings,
  value: boolean,
): AppSettings {
  const notifications: NotificationSettings = {
    ...settings.notifications,
    [key]: value,
  };

  return {
    ...settings,
    notifications,
  };
}

export function updatePrivacySetting(
  settings: AppSettings,
  key: keyof PrivacySettings,
  value: boolean,
): AppSettings {
  const privacy: PrivacySettings = {
    ...settings.privacy,
    [key]: value,
  };

  return {
    ...settings,
    privacy,
  };
}

export function updateLearningSetting(
  settings: AppSettings,
  key: keyof LearningSettings,
  value: LearningSettings[keyof LearningSettings],
): AppSettings {
  const learning: LearningSettings = {
    ...settings.learning,
    [key]: value,
  };

  return {
    ...settings,
    learning,
  };
}

export function setSoundEffects(
  settings: AppSettings,
  enabled: boolean,
): AppSettings {
  return {
    ...settings,
    soundEffects: enabled,
  };
}

export function setAutoplayAudio(
  settings: AppSettings,
  enabled: boolean,
): AppSettings {
  return {
    ...settings,
    autoplayAudio: enabled,
    learning: {
      ...settings.learning,
      autoplayAudio: enabled,
    },
  };
}

export function setPrivateMessages(
  settings: AppSettings,
  enabled: boolean,
): AppSettings {
  return {
    ...settings,
    privateMessages: enabled,
  };
}

export function setShowOnlineStatus(
  settings: AppSettings,
  enabled: boolean,
): AppSettings {
  return {
    ...settings,
    showOnlineStatus: enabled,
    privacy: {
      ...settings.privacy,
      showOnlineStatus: enabled,
    },
  };
}

export function setDailyGoal(
  settings: AppSettings,
  dailyGoal: number,
): AppSettings {
  const safeGoal = Math.max(1, Math.round(dailyGoal));

  return {
    ...settings,
    learning: {
      ...settings.learning,
      dailyGoal: safeGoal,
    },
  };
}

export function setDefaultLevel(
  settings: AppSettings,
  level: AppSettings["learning"]["defaultLevel"],
): AppSettings {
  return {
    ...settings,
    learning: {
      ...settings.learning,
      defaultLevel: level,
    },
  };
}

export function setDefaultLanguage(
  settings: AppSettings,
  language: string,
): AppSettings {
  return {
    ...settings,
    defaultLanguage: language,
    learning: {
      ...settings.learning,
      defaultLanguage: language,
    },
  };
}