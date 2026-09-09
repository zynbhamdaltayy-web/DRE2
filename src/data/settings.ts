export type MessagePrivacy =
  | "mutual-followers"
  | "accepted-requests"
  | "no-one";

export type ProfileVisibility =
  | "public"
  | "limited";

export interface UserSettings {
  userId: string;

  language: string;

  messagePrivacy: MessagePrivacy;

  profileVisibility: ProfileVisibility;

  notificationsEnabled: boolean;

  messageNotifications: boolean;

  followNotifications: boolean;

  writerNotifications: boolean;

  officialNotifications: boolean;

  soundEnabled: boolean;

  speechEnabled: boolean;

  showOnlineStatus: boolean;

  allowRoomInvites: boolean;

  blockedUserIds: string[];

  updatedAt: string;
}

export const DEFAULT_USER_SETTINGS = {
  language: "en",
  messagePrivacy: "accepted-requests" as MessagePrivacy,
  profileVisibility: "public" as ProfileVisibility,
  notificationsEnabled: true,
  messageNotifications: true,
  followNotifications: true,
  writerNotifications: true,
  officialNotifications: true,
  soundEnabled: true,
  speechEnabled: true,
  showOnlineStatus: true,
  allowRoomInvites: true,
};

export function createDefaultUserSettings(
  userId: string,
): UserSettings {
  return {
    userId,
    ...DEFAULT_USER_SETTINGS,
    blockedUserIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function updateUserSettings(
  settings: UserSettings,
  changes: Partial<
    Omit<
      UserSettings,
      "userId" | "updatedAt"
    >
  >,
): UserSettings {
  return {
    ...settings,
    ...changes,
    blockedUserIds: changes.blockedUserIds
      ? Array.from(
          new Set(changes.blockedUserIds),
        )
      : settings.blockedUserIds,
    updatedAt: new Date().toISOString(),
  };
}

export function setMessagePrivacy(
  settings: UserSettings,
  value: MessagePrivacy,
): UserSettings {
  return updateUserSettings(settings, {
    messagePrivacy: value,
  });
}

export function setProfileVisibility(
  settings: UserSettings,
  value: ProfileVisibility,
): UserSettings {
  return updateUserSettings(settings, {
    profileVisibility: value,
  });
}

export function setNotificationsEnabled(
  settings: UserSettings,
  enabled: boolean,
): UserSettings {
  return updateUserSettings(settings, {
    notificationsEnabled: enabled,
  });
}

export function setSoundEnabled(
  settings: UserSettings,
  enabled: boolean,
): UserSettings {
  return updateUserSettings(settings, {
    soundEnabled: enabled,
  });
}

export function setSpeechEnabled(
  settings: UserSettings,
  enabled: boolean,
): UserSettings {
  return updateUserSettings(settings, {
    speechEnabled: enabled,
  });
}

export function blockUser(
  settings: UserSettings,
  userId: string,
): UserSettings {
  if (!userId.trim()) {
    return settings;
  }

  return updateUserSettings(settings, {
    blockedUserIds: Array.from(
      new Set([
        ...settings.blockedUserIds,
        userId.trim(),
      ]),
    ),
  });
}

export function unblockUser(
  settings: UserSettings,
  userId: string,
): UserSettings {
  return updateUserSettings(settings, {
    blockedUserIds:
      settings.blockedUserIds.filter(
        (id) => id !== userId,
      ),
  });
}

export function isUserBlocked(
  settings: UserSettings,
  userId: string,
): boolean {
  return settings.blockedUserIds.includes(userId);
}

export function canReceiveMessageFrom(
  settings: UserSettings,
  senderId: string,
  mutualAccepted: boolean,
): boolean {
  if (isUserBlocked(settings, senderId)) {
    return false;
  }

  if (settings.messagePrivacy === "no-one") {
    return false;
  }

  if (
    settings.messagePrivacy ===
    "accepted-requests"
  ) {
    return mutualAccepted;
  }

  if (
    settings.messagePrivacy ===
    "mutual-followers"
  ) {
    return mutualAccepted;
  }

  return false;
}

export function shouldShowNotification(
  settings: UserSettings,
  type:
    | "message"
    | "follow"
    | "writer"
    | "official",
): boolean {
  if (!settings.notificationsEnabled) {
    return false;
  }

  switch (type) {
    case "message":
      return settings.messageNotifications;

    case "follow":
      return settings.followNotifications;

    case "writer":
      return settings.writerNotifications;

    case "official":
      return settings.officialNotifications;

    default:
      return true;
  }
}

export function canViewProfile(
  settings: UserSettings,
  viewerIsFollower: boolean,
): boolean {
  if (settings.profileVisibility === "public") {
    return true;
  }

  return viewerIsFollower;
}

export function normalizeUserSettings(
  settings: Partial<UserSettings>,
  userId: string,
): UserSettings {
  const defaults =
    createDefaultUserSettings(userId);

  return {
    ...defaults,
    ...settings,
    userId,
    blockedUserIds: Array.from(
      new Set(
        Array.isArray(settings.blockedUserIds)
          ? settings.blockedUserIds
          : [],
      ),
    ),
    updatedAt:
      settings.updatedAt ??
      defaults.updatedAt,
  };
}