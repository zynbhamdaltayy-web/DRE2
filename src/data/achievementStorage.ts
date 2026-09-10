import {
  createDefaultAchievements,
  updateAchievements,
  type Achievement,
} from "./achievements";

const STORAGE_KEY = "dre2learn-achievements";

export interface AchievementStorageData {
  achievements: Achievement[];
}

const DEFAULT_DATA: AchievementStorageData = {
  achievements: createDefaultAchievements(),
};

function readData(): AchievementStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        achievements:
          createDefaultAchievements(),
      };
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("achievements" in parsed)
    ) {
      return {
        achievements:
          createDefaultAchievements(),
      };
    }

    const value = (
      parsed as {
        achievements?: unknown;
      }
    ).achievements;

    if (!Array.isArray(value)) {
      return {
        achievements:
          createDefaultAchievements(),
      };
    }

    return {
      achievements: value as Achievement[],
    };
  } catch {
    return {
      achievements:
        createDefaultAchievements(),
    };
  }
}

function writeData(
  data: AchievementStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getAchievementStorage(): AchievementStorageData {
  return readData();
}

export function saveAchievementStorage(
  data: AchievementStorageData,
): void {
  writeData(data);
}

export function getAllAchievements(): Achievement[] {
  return readData().achievements;
}

export function updateStoredAchievements(
  stats: {
    articlesRead: number;
    vocabularyLearned: number;
    practiceCompleted: number;
    roomsJoined: number;
    currentStreak: number;
    levelTestCompleted: boolean;
    identityCardIssued: boolean;
    totalXp: number;
  },
): Achievement[] {
  const data = readData();

  data.achievements =
    updateAchievements(
      data.achievements,
      stats,
    );

  writeData(data);

  return data.achievements;
}

export function getUnlockedAchievementCount(): number {
  return getAllAchievements().filter(
    (achievement) =>
      achievement.unlocked,
  ).length;
}

export function clearAchievementStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeAchievementStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData(DEFAULT_DATA);
  }
}