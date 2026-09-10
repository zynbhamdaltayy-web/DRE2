import type { AppState } from "../types";
import {
  updateStreak,
  type StreakData,
} from "./progress";

const STORAGE_KEY = "dre2learn-progress";

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

/* =========================================================
   HELPERS
========================================================= */

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, numberValue);
}

function todayKey(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

/* =========================================================
   READ / WRITE
========================================================= */

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
      currentStreak:
        normalizeNumber(
          value.currentStreak,
        ),

      longestStreak:
        normalizeNumber(
          value.longestStreak,
        ),

      lastActiveDate:
        typeof value.lastActiveDate ===
        "string"
          ? value.lastActiveDate
          : null,

      dailyXp:
        normalizeNumber(
          value.dailyXp,
        ),

      dailyGoal:
        Math.max(
          1,
          normalizeNumber(
            value.dailyGoal,
            20,
          ),
        ),

      totalActivities:
        normalizeNumber(
          value.totalActivities,
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

/* =========================================================
   PUBLIC STORAGE API
========================================================= */

export function getStoredProgress(): ProgressStorageData {
  return readData();
}

/* =========================================================
   REGISTER ACTIVITY
========================================================= */

export function registerProgressActivity(
  xpEarned = 0,
): ProgressStorageData {
  const data =
    readData();

  const streakInput: StreakData = {
    currentStreak:
      data.currentStreak,

    longestStreak:
      data.longestStreak,

    lastActiveDate:
      data.lastActiveDate ?? "",
  };

  /*
   * updateStreak() expects an AppState.
   * This creates a complete compatible
   * temporary AppState for streak calculation.
   */
  const streakState: AppState = {
    page: "home",

    user: null,

    vocabulary: [],

    completedArticles: [],

    practiceScore: 0,

    practiceAnswered: 0,

    currentArticleId: null,

    selectedLibraryLevel: "A1",

    selectedTopic: "Daily Life",

    selectedPracticeLevel: "A1",

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
    updateStreak(
      streakState,
    );

  const today =
    todayKey();

  const sameDay =
    data.lastActiveDate ===
    today;

  const earnedXp =
    normalizeNumber(
      xpEarned,
    );

  data.currentStreak =
    updatedStreak.currentStreak;

  data.longestStreak =
    updatedStreak.longestStreak;

  data.lastActiveDate =
    updatedStreak.lastActiveDate;

  data.dailyXp =
    sameDay
      ? data.dailyXp + earnedXp
      : earnedXp;

  data.totalActivities += 1;

  writeData(data);

  return data;
}

/* =========================================================
   DAILY XP
========================================================= */

export function addDailyXP(
  xp: number,
): ProgressStorageData {
  const data =
    readData();

  const amount =
    normalizeNumber(xp);

  data.dailyXp += amount;

  writeData(data);

  return data;
}

/* =========================================================
   DAILY GOAL
========================================================= */

export function setDailyGoal(
  goal: number,
): ProgressStorageData {
  const data =
    readData();

  const normalizedGoal =
    Math.floor(
      Number(goal),
    );

  data.dailyGoal =
    Number.isFinite(
      normalizedGoal,
    )
      ? Math.max(
          1,
          normalizedGoal,
        )
      : 20;

  writeData(data);

  return data;
}

/* =========================================================
   RESET DAILY PROGRESS
========================================================= */

export function resetDailyProgress(): ProgressStorageData {
  const data =
    readData();

  data.dailyXp = 0;

  writeData(data);

  return data;
}

/* =========================================================
   SUMMARY
========================================================= */

export function getStoredProgressSummary(): ProgressStorageData {
  return readData();
}

/* =========================================================
   CLEAR
========================================================= */

export function clearProgressStorage(): void {
  try {
    localStorage.removeItem(
      STORAGE_KEY,
    );
  } catch {
    // Ignore storage errors safely.
  }
}

/* =========================================================
   INITIALIZE
========================================================= */

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