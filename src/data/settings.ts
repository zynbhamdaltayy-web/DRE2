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
    defaultLanguage: "en",
    autoplayAudio: true,
  },

  soundEffects: true,
  autoplayAudio: true,
  privateMessages: true,
  showOnlineStatus: true,
  preferredTheme: "system",
  preferredLanguage: "ar",
};

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanBoolean(
  value: unknown,
  fallback: boolean,
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function cleanTheme(
  value: unknown,
  fallback: ThemeMode,
): ThemeMode {
  return value === "light" ||
    value === "dark" ||
    value === "system"
    ? value
    : fallback;
}

function cleanLanguage(
  value: unknown,
  fallback: AppLanguage,
): AppLanguage {
  const supported: AppLanguage[] = [
    "ar",
    "en",
    "zh-CN",
    "ru",
    "ku",
    "tr",
    "fr",
    "de",
    "es",
    "it",
    "ja",
    "ko",
  ];

  return supported.includes(
    value as AppLanguage,
  )
    ? (value as AppLanguage)
    : fallback;
}

export function createDefaultSettings(): AppSettings {
  return {
    theme: DEFAULT_SETTINGS.theme,
    language: DEFAULT_SETTINGS.language,

    notifications: {
      ...DEFAULT_SETTINGS.notifications,
    },

    privacy: {
      ...DEFAULT_SETTINGS.privacy,
    },

    learning: {
      ...DEFAULT_SETTINGS.learning,
    },

    soundEffects:
      DEFAULT_SETTINGS.soundEffects,

    autoplayAudio:
      DEFAULT_SETTINGS.autoplayAudio,

    privateMessages:
      DEFAULT_SETTINGS.privateMessages,

    showOnlineStatus:
      DEFAULT_SETTINGS.showOnlineStatus,

    preferredTheme:
      DEFAULT_SETTINGS.preferredTheme,

    preferredLanguage:
      DEFAULT_SETTINGS.preferredLanguage,
  };
}

export function normalizeSettings(
  settings: Partial<AppSettings>,
): AppSettings {
  const defaults = createDefaultSettings();

  const normalizedDailyGoal = Math.max(
    1,
    Number(
      settings.learning?.dailyGoal ??
        defaults.learning.dailyGoal,
    ),
  );

  return {
    theme: cleanTheme(
      settings.theme,
      defaults.theme,
    ),

    language: cleanLanguage(
      settings.language,
      defaults.language,
    ),

    notifications: {
      pushNotifications:
        cleanBoolean(
          settings.notifications
            ?.pushNotifications,
          defaults.notifications
            .pushNotifications,
        ),

      messageNotifications:
        cleanBoolean(
          settings.notifications
            ?.messageNotifications,
          defaults.notifications
            .messageNotifications,
        ),

      followNotifications:
        cleanBoolean(
          settings.notifications
            ?.followNotifications,
          defaults.notifications
            .followNotifications,
        ),

      learningNotifications:
        cleanBoolean(
          settings.notifications
            ?.learningNotifications,
          defaults.notifications
            .learningNotifications,
        ),

      officialUpdates:
        cleanBoolean(
          settings.notifications
            ?.officialUpdates,
          defaults.notifications
            .officialUpdates,
        ),
    },

    privacy: {
      profileVisible:
        cleanBoolean(
          settings.privacy?.profileVisible,
          defaults.privacy.profileVisible,
        ),

      showOnlineStatus:
        cleanBoolean(
          settings.privacy?.showOnlineStatus,
          defaults.privacy.showOnlineStatus,
        ),

      allowMessageRequests:
        cleanBoolean(
          settings.privacy
            ?.allowMessageRequests,
          defaults.privacy
            .allowMessageRequests,
        ),

      allowRoomInvites:
        cleanBoolean(
          settings.privacy?.allowRoomInvites,
          defaults.privacy.allowRoomInvites,
        ),
    },

    learning: {
      dailyGoal: Number.isFinite(
        normalizedDailyGoal,
      )
        ? normalizedDailyGoal
        : defaults.learning.dailyGoal,

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

      autoplayAudio:
        cleanBoolean(
          settings.learning?.autoplayAudio,
          defaults.learning.autoplayAudio,
        ),
    },

    soundEffects:
      cleanBoolean(
        settings.soundEffects,
        defaults.soundEffects ?? true,
      ),

    autoplayAudio:
      cleanBoolean(
        settings.autoplayAudio,
        defaults.autoplayAudio ?? true,
      ),

    privateMessages:
      cleanBoolean(
        settings.privateMessages,
        defaults.privateMessages ?? true,
      ),

    showOnlineStatus:
      cleanBoolean(
        settings.showOnlineStatus,
        defaults.showOnlineStatus ?? true,
      ),

    preferredTheme:
      cleanTheme(
        settings.preferredTheme,
        defaults.preferredTheme ?? "system",
      ),

    preferredLanguage:
      cleanLanguage(
        settings.preferredLanguage,
        defaults.preferredLanguage ?? "ar",
      ),
  };
}

export function updateTheme(
  settings: AppSettings,
  theme: ThemeMode,
): AppSettings {
  return normalizeSettings({
    ...settings,
    theme,
    preferredTheme: theme,
  });
}

export function updateAppLanguage(
  settings: AppSettings,
  language: AppLanguage,
): AppSettings {
  return normalizeSettings({
    ...settings,
    language,
    preferredLanguage: language,
  });
}

export function updateNotificationSetting(
  settings: AppSettings,
  key: keyof NotificationSettings,
  value: boolean,
): AppSettings {
  return normalizeSettings({
    ...settings,
    notifications: {
      ...settings.notifications,
      [key]: value,
    },
  });
}

export function updatePrivacySetting(
  settings: AppSettings,
  key: keyof PrivacySettings,
  value: boolean,
): AppSettings {
  return normalizeSettings({
    ...settings,
    privacy: {
      ...settings.privacy,
      [key]: value,
    },
  });
}

export function updateLearningSetting(
  settings: AppSettings,
  changes: Partial<LearningSettings>,
): AppSettings {
  return normalizeSettings({
    ...settings,
    learning: {
      ...settings.learning,
      ...changes,
    },
  });
}

export function resetSettings(): AppSettings {
  return createDefaultSettings();
}