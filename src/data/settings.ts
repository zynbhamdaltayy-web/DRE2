export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type AppLanguage =
  | "ar"
  | "en"
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

export interface NotificationSettings {
  pushNotifications: boolean;
  messageNotifications: boolean;
  followNotifications: boolean;
  learningNotifications: boolean;
  officialUpdates: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowMessageRequests: boolean;
  allowRoomInvites: boolean;
}

export interface LearningSettings {
  dailyGoal: number;
  defaultLevel: string;
  defaultLanguage: string;
  autoplayAudio: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  learning: LearningSettings;
}

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
};

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export function createDefaultSettings(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
    },
    privacy: {
      ...DEFAULT_SETTINGS.privacy,
    },
    learning: {
      ...DEFAULT_SETTINGS.learning,
    },
  };
}

export function normalizeSettings(
  settings: Partial<AppSettings>,
): AppSettings {
  const defaults =
    createDefaultSettings();

  return {
    theme:
      settings.theme === "light" ||
      settings.theme === "dark" ||
      settings.theme === "system"
        ? settings.theme
        : defaults.theme,

    language:
      settings.language ??
      defaults.language,

    notifications: {
      ...defaults.notifications,
      ...(settings.notifications ?? {}),
    },

    privacy: {
      ...defaults.privacy,
      ...(settings.privacy ?? {}),
    },

    learning: {
      ...defaults.learning,
      ...(settings.learning ?? {}),
      dailyGoal: Math.max(
        1,
        Number(
          settings.learning?.dailyGoal ??
            defaults.learning.dailyGoal,
        ),
      ),
      defaultLevel:
        cleanString(
          settings.learning?.defaultLevel,
        ) ||
        defaults.learning.defaultLevel,
      defaultLanguage:
        cleanString(
          settings.learning?.defaultLanguage,
        ) ||
        defaults.learning.defaultLanguage,
    },
  };
}

export function updateTheme(
  settings: AppSettings,
  theme: ThemeMode,
): AppSettings {
  return {
    ...settings,
    theme,
  };
}

export function updateAppLanguage(
  settings: AppSettings,
  language: AppLanguage,
): AppSettings {
  return {
    ...settings,
    language,
  };
}

export function updateNotificationSetting(
  settings: AppSettings,
  key: keyof NotificationSettings,
  value: boolean,
): AppSettings {
  return {
    ...settings,
    notifications: {
      ...settings.notifications,
      [key]: value,
    },
  };
}

export function updatePrivacySetting(
  settings: AppSettings,
  key: keyof PrivacySettings,
  value: boolean,
): AppSettings {
  return {
    ...settings,
    privacy: {
      ...settings.privacy,
      [key]: value,
    },
  };
}

export function updateLearningSetting(
  settings: AppSettings,
  changes: Partial<LearningSettings>,
): AppSettings {
  return {
    ...settings,
    learning: {
      ...settings.learning,
      ...changes,
      dailyGoal: Math.max(
        1,
        Number(
          changes.dailyGoal ??
            settings.learning.dailyGoal,
        ),
      ),
    },
  };
}

export function resetSettings(): AppSettings {
  return createDefaultSettings();
}
  

        
  
  
  
    
    
  