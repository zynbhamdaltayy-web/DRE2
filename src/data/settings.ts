import type {
  AppLanguage,
  AppSettings,
  Level,
} from "../types";

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
  defaultLevel: Level;
  defaultLanguage: string;
  autoplayAudio: boolean;
}

export type ThemeMode = "light" | "system" | "dark";

export const DEFAULT_SETTINGS: AppSettings & {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  learning: LearningSettings;
} = {
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
  defaultLanguage: "en",
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

function cleanLevel(
  value: unknown,
  fallback: Level,
): Level {
  const supported: Level[] = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
  ];

  return supported.includes(
    value as Level,
  )
    ? (value as Level)
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

    defaultLanguage:
      DEFAULT_SETTINGS.defaultLanguage,
  };
}

export function normalizeSettings(
  settings: Partial<AppSettings>,
): AppSettings {
  const defaults = createDefaultSettings();

  const incoming = settings as Partial<
    AppSettings & {
      notifications: Partial<NotificationSettings>;
      privacy: Partial<PrivacySettings>;
      learning: Partial<LearningSettings>;
    }
  >;

  const rawDailyGoal =
    Number(
      incoming.learning?.dailyGoal ??
        defaults.learning?.dailyGoal ??
        20,
    );

  const dailyGoal =
    Number.isFinite(rawDailyGoal)
      ? Math.max(
          1,
          Math.floor(rawDailyGoal),
        )
      : 20;

  const defaultLevel =
    cleanLevel(
      incoming.learning?.defaultLevel,
      defaults.learning?.defaultLevel ??
        "A1",
    );

  const defaultLanguage =
    cleanString(
      incoming.learning?.defaultLanguage,
    ) ||
    defaults.learning?.defaultLanguage ||
    "en";

  return {
    theme: cleanTheme(
      incoming.theme,
      defaults.theme,
    ),

    language: cleanLanguage(
      incoming.language,
      defaults.language,
    ),

    notifications: {
      pushNotifications:
        cleanBoolean(
          incoming.notifications
            ?.pushNotifications,
          defaults.notifications
            ?.pushNotifications ??
            true,
        ),

      messageNotifications:
        cleanBoolean(
          incoming.notifications
            ?.messageNotifications,
          defaults.notifications
            ?.messageNotifications ??
            true,
        ),

      followNotifications:
        cleanBoolean(
          incoming.notifications
            ?.followNotifications,
          defaults.notifications
            ?.followNotifications ??
            true,
        ),

      learningNotifications:
        cleanBoolean(
          incoming.notifications
            ?.learningNotifications,
          defaults.notifications
            ?.learningNotifications ??
            true,
        ),

      officialUpdates:
        cleanBoolean(
          incoming.notifications
            ?.officialUpdates,
          defaults.notifications
            ?.officialUpdates ??
            true,
        ),
    },

    privacy: {
      profileVisible:
        cleanBoolean(
          incoming.privacy?.profileVisible,
          defaults.privacy?.profileVisible ??
            true,
        ),

      showOnlineStatus:
        cleanBoolean(
          incoming.privacy?.showOnlineStatus,
          defaults.privacy?.showOnlineStatus ??
            true,
        ),

      allowMessageRequests:
        cleanBoolean(
          incoming.privacy
            ?.allowMessageRequests,
          defaults.privacy
            ?.allowMessageRequests ??
            true,
        ),

      allowRoomInvites:
        cleanBoolean(
          incoming.privacy?.allowRoomInvites,
          defaults.privacy?.allowRoomInvites ??
            true,
        ),
    },

    learning: {
      dailyGoal,

      defaultLevel,

      defaultLanguage,

      autoplayAudio:
        cleanBoolean(
          incoming.learning?.autoplayAudio,
          defaults.learning
            ?.autoplayAudio ??
            true,
        ),
    },

    soundEffects:
      cleanBoolean(
        incoming.soundEffects,
        defaults.soundEffects,
      ),

    autoplayAudio:
      cleanBoolean(
        incoming.autoplayAudio,
        defaults.autoplayAudio,
      ),

    privateMessages:
      cleanBoolean(
        incoming.privateMessages,
        defaults.privateMessages,
      ),

    showOnlineStatus:
      cleanBoolean(
        incoming.showOnlineStatus,
        defaults.showOnlineStatus,
      ),

    preferredTheme:
      cleanTheme(
        incoming.preferredTheme,
        defaults.preferredTheme,
      ),

    preferredLanguage:
      cleanLanguage(
        incoming.preferredLanguage,
        defaults.preferredLanguage,
      ),

    defaultLanguage,
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
      ...(settings.notifications ?? {}),
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
      ...(settings.privacy ?? {}),
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
      ...(settings.learning ?? {}),
      ...changes,
    },
  });
}

export function resetSettings(): AppSettings {
  return createDefaultSettings();
}