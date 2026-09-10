import {
  updateStreak,
  type StreakData,
} from "./progress";

const STORAGE_KEY =
  "dre2learn-progress";

export interface ProgressStorageData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  dailyXp: number;
  dailyGoal: number;
  totalActivities: number;
}

const DEFAULT_DATA: ProgressStorageData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  dailyXp: 0,
  dailyGoal: 20,
  totalActivities: 0,
};

function todayKey(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function readData(): ProgressStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        ...DEFAULT_DATA,
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
      };
    }

    const value =
      parsed as Partial<ProgressStorageData>;

    return {
      currentStreak: Math.max(
        0,
        Number(value.currentStreak ?? 0),
      ),

      longestStreak: Math.max(
        0,
        Number(value.longestStreak ?? 0),
      ),

      lastActiveDate:
        typeof value.lastActiveDate === "string"
          ? value.lastActiveDate
          : null,

      dailyXp: Math.max(
        0,
        Number(value.dailyXp ?? 0),
      ),

      dailyGoal: Math.max(
        1,
        Number(value.dailyGoal ?? 20),
      ),

      totalActivities: Math.max(
        0,
        Number(value.totalActivities ?? 0),
      ),
    };
  } catch {
    return {
      ...DEFAULT_DATA,
    };
  }
}

function writeData(
  data: ProgressStorageData,
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data),
    );
  } catch {
    // Ignore storage errors safely.
  }
}

export function getStoredProgress(): ProgressStorageData {
  return readData();
}

export function registerProgressActivity(
  xpEarned = 0,
): ProgressStorageData {
  const data = readData();

  const streakInput: StreakData = {
    currentStreak:
      data.currentStreak,

    longestStreak:
      data.longestStreak,

    lastActiveDate:
      data.lastActiveDate ?? "",
  };

  /*
   * updateStreak() works with AppState,
   * so we create a minimal compatible state.
   */
  const streakState = {
    page: "home" as const,
    user: null,

    vocabulary: [],
    completedArticles: [],

    practiceScore: 0,
    practiceAnswered: 0,

    currentArticleId: null,

    selectedLibraryLevel: "A1" as const,
    selectedTopic: "Daily Life",
    selectedPracticeLevel: "A1" as const,

    isAuthenticated: false,

    totalXp: 0,

    articlesRead: 0,
    vocabularyLearned: 0,
    practiceCompleted: 0,
    roomsJoined: 0,
    cardsCollected: 0,

    levelTestScore: 0,
    levelTestTotal: 0,

    progress: {
      currentStreak:
        streakInput.currentStreak,

      longestStreak:
        streakInput.longestStreak,

      lastActiveDate:
        streakInput.lastActiveDate,

      dailyXp:
        data.dailyXp,

      dailyGoal:
        data.dailyGoal,
    },
  };

  const updatedStreak =
    updateStreak(streakState);

  const today =
    todayKey();

  const sameDay =
    data.lastActiveDate ===
    today;

  data.currentStreak =
    updatedStreak.currentStreak;

  data.longestStreak =
    updatedStreak.longestStreak;

  data.lastActiveDate =
    updatedStreak.lastActiveDate;

  data.dailyXp =
    sameDay
      ? data.dailyXp +
        Math.max(
          0,
          Number(xpEarned),
        )
      : Math.max(
          0,
          Number(xpEarned),
        );

  data.totalActivities += 1;

  writeData(data);

  return data;
}

export function addDailyXP(
  xp: number,
): ProgressStorageData {
  const data =
    readData();

  data.dailyXp += Math.max(
    0,
    Number(xp),
  );

  writeData(data);

  return data;
}

export function setDailyGoal(
  goal: number,
): ProgressStorageData {
  const data =
    readData();

  data.dailyGoal =
    Math.max(
      1,
      Math.floor(
        Number(goal),
      ),
    );

  writeData(data);

  return data;
}

export function resetDailyProgress(): ProgressStorageData {
  const data =
    readData();

  data.dailyXp = 0;

  writeData(data);

  return data;
}

export function getStoredProgressSummary(): ProgressStorageData {
  return readData();
}

export function clearProgressStorage(): void {
  try {
    localStorage.removeItem(
      STORAGE_KEY,
    );
  } catch {
    // Ignore storage errors safely.
  }
}

export function initializeProgressStorage(): void {
  try {
    if (
      !localStorage.getItem(
        STORAGE_KEY,
      )
    ) {
      writeData({
        ...DEFAULT_DATA,
      });
    }
  } catch {
    // Ignore storage errors safely.
  }
}