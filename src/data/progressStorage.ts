import {
  getProgressStats,
  updateStreak,
  type StreakData,
} from "./progress";

import type { AppState } from "../types";

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
        value.currentStreak ?? 0,
      ),

      longestStreak: Math.max(
        0,
        value.longestStreak ?? 0,
      ),

      lastActiveDate:
        value.lastActiveDate ?? null,

      dailyXp: Math.max(
        0,
        value.dailyXp ?? 0,
      ),

      dailyGoal: Math.max(
        1,
        value.dailyGoal ?? 20,
      ),

      totalActivities: Math.max(
        0,
        value.totalActivities ?? 0,
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
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
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

      dailyXp: data.dailyXp,
      dailyGoal: data.dailyGoal,
    },
  };

  const updatedStreak =
    updateStreak(streakState);

  const today = todayKey();

  const sameDay =
    data.lastActiveDate === today;

  data.currentStreak =
    updatedStreak.currentStreak;

  data.longestStreak =
    updatedStreak.longestStreak;

  data.lastActiveDate =
    updatedStreak.lastActiveDate;

  data.dailyXp = sameDay
    ? data.dailyXp +
      Math.max(0, xpEarned)
    : Math.max(0, xpEarned);

  data.totalActivities += 1;

  writeData(data);

  return data;
}

export function addDailyXP(
  xp: number,
): ProgressStorageData {
  const data = readData();

  data.dailyXp += Math.max(0, xp);

  writeData(data);

  return data;
}

export function setDailyGoal(
  goal: number,
): ProgressStorageData {
  const data = readData();

  data.dailyGoal = Math.max(
    1,
    Math.floor(goal),
  );

  writeData(data);

  return data;
}

export function resetDailyProgress(): ProgressStorageData {
  const data = readData();

  data.dailyXp = 0;

  writeData(data);

  return data;
}

export function getStoredProgressSummary() {
  const data = readData();

  const state: AppState = {
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

    totalXp: data.dailyXp,

    articlesRead: 0,
    vocabularyLearned: 0,
    practiceCompleted: 0,
    roomsJoined: 0,
    cardsCollected: 0,

    levelTestScore: 0,
    levelTestTotal: 0,

    progress: {
      currentStreak:
        data.currentStreak,

      longestStreak:
        data.longestStreak,

      lastActiveDate:
        data.lastActiveDate ?? "",

      dailyXp:
        data.dailyXp,

      dailyGoal:
        data.dailyGoal,
    },
  };

  return getProgressStats(state);
}

export function clearProgressStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeProgressStorage(): void {
  if (
    !localStorage.getItem(STORAGE_KEY)
  ) {
    writeData(DEFAULT_DATA);
  }
}
    
      
  

  
  