import {
  createProfile,
  normalizeProfile,
  updateProfile,
  type UserProfileData,
} from "./profile";

const STORAGE_KEY =
  "dre2learn-profile";

export interface ProfileStorageData {
  profile: UserProfileData | null;

  stats: {
    followers: number;
    following: number;
    articlesRead: number;
    vocabularyLearned: number;
    practiceCompleted: number;
    roomsJoined: number;
    achievementsUnlocked: number;
  };
}

const DEFAULT_DATA: ProfileStorageData = {
  profile: null,

  stats: {
    followers: 0,
    following: 0,
    articlesRead: 0,
    vocabularyLearned: 0,
    practiceCompleted: 0,
    roomsJoined: 0,
    achievementsUnlocked: 0,
  },
};

function readData(): ProfileStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        ...DEFAULT_DATA,

        stats: {
          ...DEFAULT_DATA.stats,
        },
      };
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {
        ...DEFAULT_DATA,

        stats: {
          ...DEFAULT_DATA.stats,
        },
      };
    }

    const value =
      parsed as Partial<ProfileStorageData>;

    return {
      profile:
        value.profile
          ? normalizeProfile(
              value.profile,
            )
          : null,

      stats: {
        ...DEFAULT_DATA.stats,
        ...(value.stats ?? {}),
      },
    };
  } catch {
    return {
      ...DEFAULT_DATA,

      stats: {
        ...DEFAULT_DATA.stats,
      },
    };
  }
}

function writeData(
  data: ProfileStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getProfileStorage(): ProfileStorageData {
  return readData();
}

export function getStoredProfile():
  | UserProfileData
  | null {
  return readData().profile;
}

export function saveProfile(
  profile: UserProfileData,
): UserProfileData {
  const data = readData();

  const normalized =
    normalizeProfile(profile);

  data.profile = normalized;

  writeData(data);

  return normalized;
}

export function createAndSaveProfile(
  input: Omit<
    UserProfileData,
    | "joinedAt"
    | "updatedAt"
    | "isVip"
    | "vipSince"
    | "vipUntil"
  > & {
    isVip?: boolean;
    vipSince?: string;
    vipUntil?: string;
  },
): UserProfileData {
  return saveProfile(
    createProfile(input),
  );
}

export function updateStoredProfile(
  changes: Partial<
    Pick<
      UserProfileData,
      | "username"
      | "displayName"
      | "bio"
      | "countryCode"
      | "avatar"
    >
  >,
): UserProfileData | null {
  const data = readData();

  if (!data.profile) {
    return null;
  }

  const updated =
    updateProfile(
      data.profile,
      changes,
    );

  data.profile = updated;

  writeData(data);

  return updated;
}

export function saveProfileStats(
  stats: Partial<
    ProfileStorageData["stats"]
  >,
): ProfileStorageData["stats"] {
  const data = readData();

  data.stats = {
    ...data.stats,
    ...stats,
  };

  writeData(data);

  return data.stats;
}

export function getProfileStats():
  ProfileStorageData["stats"] {
  return readData().stats;
}

export function clearProfileStorage(): void {
  localStorage.removeItem(
    STORAGE_KEY,
  );
}

export function initializeProfileStorage(): void {
  if (
    !localStorage.getItem(
      STORAGE_KEY,
    )
  ) {
    writeData(DEFAULT_DATA);
  }
}