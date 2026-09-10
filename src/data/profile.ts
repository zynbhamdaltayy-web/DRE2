import type {
  Avatar,
  Level,
} from "../types";

export interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  countryCode: string;
  level: Level;
  xp: number;
  avatar: Avatar | null;
  joinedAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  followers: number;
  following: number;
  articlesRead: number;
  vocabularyLearned: number;
  practiceCompleted: number;
  roomsJoined: number;
  achievementsUnlocked: number;
}

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export function createProfile(
  input: Omit<
    UserProfileData,
    "joinedAt" | "updatedAt"
  >,
): UserProfileData {
  const timestamp =
    new Date().toISOString();

  return {
    ...input,
    id: cleanString(input.id),
    username: cleanString(
      input.username,
    ),
    displayName: cleanString(
      input.displayName,
    ),
    bio: cleanString(input.bio),
    countryCode: cleanString(
      input.countryCode,
    ).toUpperCase(),
    xp: Math.max(0, input.xp),
    joinedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function normalizeProfile(
  profile: UserProfileData,
): UserProfileData {
  return {
    ...profile,
    id: cleanString(profile.id),
    username:
      cleanString(profile.username) ||
      "User",
    displayName:
      cleanString(
        profile.displayName,
      ) ||
      cleanString(profile.username) ||
      "User",
    bio: cleanString(profile.bio),
    countryCode: cleanString(
      profile.countryCode,
    ).toUpperCase(),
    xp: Math.max(0, profile.xp ?? 0),
    joinedAt:
      cleanString(profile.joinedAt) ||
      new Date().toISOString(),
    updatedAt:
      cleanString(profile.updatedAt) ||
      new Date().toISOString(),
  };
}

export function updateProfile(
  profile: UserProfileData,
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
): UserProfileData {
  return {
    ...profile,

    username:
      changes.username !== undefined
        ? cleanString(changes.username)
        : profile.username,

    displayName:
      changes.displayName !== undefined
        ? cleanString(
            changes.displayName,
          )
        : profile.displayName,

    bio:
      changes.bio !== undefined
        ? cleanString(changes.bio)
        : profile.bio,

    countryCode:
      changes.countryCode !== undefined
        ? cleanString(
            changes.countryCode,
          ).toUpperCase()
        : profile.countryCode,

    avatar:
      changes.avatar !== undefined
        ? changes.avatar
        : profile.avatar,

    updatedAt:
      new Date().toISOString(),
  };
}

export function getProfileInitials(
  profile: UserProfileData,
): string {
  const source =
    profile.displayName ||
    profile.username ||
    "U";

  const words = source
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }

  return source
    .slice(0, 2)
    .toUpperCase();
}

export function validateProfile(
  profile: UserProfileData,
): string[] {
  const errors: string[] = [];

  if (!profile.id.trim()) {
    errors.push("Profile ID is required.");
  }

  if (!profile.username.trim()) {
    errors.push("Username is required.");
  }

  if (
    profile.username.trim().length >
    30
  ) {
    errors.push(
      "Username cannot exceed 30 characters.",
    );
  }

  if (
    profile.bio.trim().length >
    300
  ) {
    errors.push(
      "Bio cannot exceed 300 characters.",
    );
  }

  if (
    profile.countryCode &&
    !/^[A-Z]{2}$/.test(
      profile.countryCode.toUpperCase(),
    )
  ) {
    errors.push(
      "Country code must use ISO 3166-1 alpha-2 format.",
    );
  }

  return errors;
}
  
    
    
    
      