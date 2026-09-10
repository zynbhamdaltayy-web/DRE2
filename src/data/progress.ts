import type {
  AppState,
  Level,
  ProgressStats,
} from "../types";

/* =========================================================
   LEVEL SYSTEM
========================================================= */

export const LEVEL_ORDER: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export const LEVEL_PERCENTAGES: Record<Level, number> = {
  A1: 0,
  A2: 20,
  B1: 40,
  B2: 60,
  C1: 80,
  C2: 100,
};

export const LEVEL_THRESHOLDS: Record<Level, number> = {
  A1: 0,
  A2: 100,
  B1: 300,
  B2: 700,
  C1: 1400,
  C2: 2500,
};

export const DAILY_GOAL_DEFAULT = 20;

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

function normalizeProgressNumber(
  value: unknown,
): number {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, numberValue);
}

function normalizeDate(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/*
 * IMPORTANT:
 * Use the user's LOCAL calendar date.
 *
 * Do NOT use toISOString() here because
 * toISOString() converts the date to UTC.
 *
 * This prevents incorrect streak / daily XP
 * calculations around midnight.
 */
export function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateDifferenceInDays(
  fromDate: string,
  toDate: string,
): number {
  if (!fromDate || !toDate) {
    return Infinity;
  }

  /*
   * Parse YYYY-MM-DD as local calendar dates.
   * This keeps the calculation independent of UTC.
   */
  const [fromYear, fromMonth, fromDay] =
    fromDate.split("-").map(Number);

  const [toYear, toMonth, toDay] =
    toDate.split("-").map(Number);

  if (
    !Number.isFinite(fromYear) ||
    !Number.isFinite(fromMonth) ||
    !Number.isFinite(fromDay) ||
    !Number.isFinite(toYear) ||
    !Number.isFinite(toMonth) ||
    !Number.isFinite(toDay)
  ) {
    return Infinity;
  }

  const from = new Date(
    fromYear,
    fromMonth - 1,
    fromDay,
  );

  const to = new Date(
    toYear,
    toMonth - 1,
    toDay,
  );

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime())
  ) {
    return Infinity;
  }

  const difference =
    to.getTime() - from.getTime();

  return Math.round(
    difference /
      (1000 * 60 * 60 * 24),
  );
}

/* =========================================================
   LEVEL HELPERS
========================================================= */

export function getLevelFromXp(
  totalXp: number,
): Level {
  const xp =
    normalizeProgressNumber(totalXp);

  let currentLevel: Level = "A1";

  for (const level of LEVEL_ORDER) {
    if (
      xp >= LEVEL_THRESHOLDS[level]
    ) {
      currentLevel = level;
    } else {
      break;
    }
  }

  return currentLevel;
}

export function getNextLevel(
  level: Level,
): Level | null {
  const index =
    LEVEL_ORDER.indexOf(level);

  if (
    index === -1 ||
    index >= LEVEL_ORDER.length - 1
  ) {
    return null;
  }

  return LEVEL_ORDER[index + 1];
}

export function getXpToNextLevel(
  totalXp: number,
): number {
  const xp =
    normalizeProgressNumber(totalXp);

  const currentLevel =
    getLevelFromXp(xp);

  const nextLevel =
    getNextLevel(currentLevel);

  if (!nextLevel) {
    return 0;
  }

  return Math.max(
    0,
    LEVEL_THRESHOLDS[nextLevel] - xp,
  );
}

export function getLevelProgress(
  totalXp: number,
): number {
  const xp =
    normalizeProgressNumber(totalXp);

  const currentLevel =
    getLevelFromXp(xp);

  const nextLevel =
    getNextLevel(currentLevel);

  if (!nextLevel) {
    return 100;
  }

  const currentThreshold =
    LEVEL_THRESHOLDS[currentLevel];

  const nextThreshold =
    LEVEL_THRESHOLDS[nextLevel];

  const range =
    nextThreshold -
    currentThreshold;

  if (range <= 0) {
    return 100;
  }

  const progress =
    ((xp - currentThreshold) /
      range) *
    100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(progress),
    ),
  );
}

/* =========================================================
   LEVEL TEST
========================================================= */

export function getLevelTestPercentage(
  score: number,
  total: number,
): number {
  const normalizedScore =
    normalizeProgressNumber(score);

  const normalizedTotal =
    normalizeProgressNumber(total);

  if (normalizedTotal <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (normalizedScore /
          normalizedTotal) *
          100,
      ),
    ),
  );
}

export function isLevelTestCompleted(
  state: AppState,
): boolean {
  return (
    normalizeProgressNumber(
      state.levelTestTotal,
    ) > 0
  );
}

/* =========================================================
   ACTIVITY PROGRESS
========================================================= */

export interface ActivityProgress {
  articles: number;
  vocabulary: number;
  practice: number;
  rooms: number;
  cards: number;
  total: number;
}

const ACTIVITY_TARGETS = {
  articles: 10,
  vocabulary: 50,
  practice: 10,
  rooms: 5,
  cards: 20,
} as const;

function getActivityPercentage(
  current: number,
  target: number,
): number {
  if (target <= 0) {
    return 100;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (current / target) * 100,
      ),
    ),
  );
}

export function getActivityProgress(
  state: AppState,
): ActivityProgress {
  const articles =
    normalizeProgressNumber(
      state.articlesRead,
    );

  const vocabulary =
    normalizeProgressNumber(
      state.vocabularyLearned,
    );

  const practice =
    normalizeProgressNumber(
      state.practiceCompleted,
    );

  const rooms =
    normalizeProgressNumber(
      state.roomsJoined,
    );

  const cards =
    normalizeProgressNumber(
      state.cardsCollected,
    );

  const percentages = [
    getActivityPercentage(
      articles,
      ACTIVITY_TARGETS.articles,
    ),

    getActivityPercentage(
      vocabulary,
      ACTIVITY_TARGETS.vocabulary,
    ),

    getActivityPercentage(
      practice,
      ACTIVITY_TARGETS.practice,
    ),

    getActivityPercentage(
      rooms,
      ACTIVITY_TARGETS.rooms,
    ),

    getActivityPercentage(
      cards,
      ACTIVITY_TARGETS.cards,
    ),
  ];

  const total =
    Math.round(
      percentages.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) /
        percentages.length,
    );

  return {
    articles,
    vocabulary,
    practice,
    rooms,
    cards,
    total,
  };
}

/* =========================================================
   XP PROGRESS
========================================================= */

export interface XpProgress {
  currentXp: number;
  currentLevel: Level;
  nextLevel: Level | null;
  xpToNextLevel: number;
  levelProgress: number;
}

export function getXpProgress(
  totalXp: number,
): XpProgress {
  const currentXp =
    normalizeProgressNumber(
      totalXp,
    );

  const currentLevel =
    getLevelFromXp(currentXp);

  const nextLevel =
    getNextLevel(currentLevel);

  const xpToNextLevel =
    getXpToNextLevel(currentXp);

  const levelProgress =
    getLevelProgress(currentXp);

  return {
    currentXp,
    currentLevel,
    nextLevel,
    xpToNextLevel,
    levelProgress,
  };
}

/* =========================================================
   STREAK
========================================================= */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export function getStoredStreakData(
  state: AppState,
): StreakData {
  return {
    currentStreak:
      normalizeProgressNumber(
        state.progress?.currentStreak,
      ),

    longestStreak:
      normalizeProgressNumber(
        state.progress?.longestStreak,
      ),

    lastActiveDate:
      normalizeDate(
        state.progress?.lastActiveDate,
      ),
  };
}

export function calculateCurrentStreak(
  previousStreak: StreakData,
  today: string = getTodayDate(),
): number {
  const currentStreak =
    normalizeProgressNumber(
      previousStreak.currentStreak,
    );

  const lastActiveDate =
    normalizeDate(
      previousStreak.lastActiveDate,
    );

  if (!lastActiveDate) {
    return 1;
  }

  const difference =
    getDateDifferenceInDays(
      lastActiveDate,
      today,
    );

  /*
   * Same calendar day:
   * do not increase the streak twice.
   */
  if (difference === 0) {
    return Math.max(
      1,
      currentStreak,
    );
  }

  /*
   * Exactly one calendar day later:
   * continue the streak.
   */
  if (difference === 1) {
    return currentStreak + 1;
  }

  /*
   * More than one day later,
   * or an invalid/future date:
   * start a new streak.
   */
  return 1;
}

export function getStreakSummary(
  state: AppState,
): StreakData & {
  active: boolean;
} {
  const streak =
    getStoredStreakData(state);

  return {
    ...streak,
    active:
      isStreakActive(state),
  };
}

export function updateStreak(
  state: AppState,
  activityDate: string = getTodayDate(),
): StreakData {
  const previous =
    getStoredStreakData(state);

  const today =
    normalizeDate(activityDate) ||
    getTodayDate();

  const currentStreak =
    calculateCurrentStreak(
      previous,
      today,
    );

  const longestStreak =
    Math.max(
      previous.longestStreak,
      currentStreak,
    );

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: today,
  };
}

export function isStreakActive(
  state: AppState,
): boolean {
  const streak =
    getStoredStreakData(state);

  if (!streak.lastActiveDate) {
    return false;
  }

  const today =
    getTodayDate();

  const difference =
    getDateDifferenceInDays(
      streak.lastActiveDate,
      today,
    );

  /*
   * A streak is considered active today
   * or still recoverable from yesterday.
   */
  return (
    difference === 0 ||
    difference === 1
  );
}

/* =========================================================
   DAILY GOAL
========================================================= */

export function getDailyGoal(
  state: AppState,
): number {
  const configuredGoal =
    normalizeProgressNumber(
      state.progress?.dailyGoal,
    );

  if (configuredGoal > 0) {
    return configuredGoal;
  }

  const settingsGoal =
    state.settings?.learning?.dailyGoal;

  if (
    typeof settingsGoal === "number" &&
    settingsGoal > 0
  ) {
    return normalizeProgressNumber(
      settingsGoal,
    );
  }

  return DAILY_GOAL_DEFAULT;
}

export interface DailyGoalProgress {
  current: number;
  goal: number;
  percentage: number;
  completed: boolean;
}

export function getDailyGoalProgress(
  state: AppState,
): DailyGoalProgress {
  const current =
    normalizeProgressNumber(
      state.progress?.dailyXp,
    );

  const goal =
    getDailyGoal(state);

  const percentage =
    goal <= 0
      ? 100
      : Math.min(
          100,
          Math.round(
            (current / goal) * 100,
          ),
        );

  return {
    current,
    goal,
    percentage,
    completed:
      current >= goal,
  };
}

/* =========================================================
   OVERALL PROGRESS
========================================================= */

export function getOverallProgress(
  state: AppState,
): number {
  const activityProgress =
    getActivityProgress(state);

  const levelProgress =
    getLevelProgress(
      state.totalXp,
    );

  const levelTestProgress =
    isLevelTestCompleted(state)
      ? getLevelTestPercentage(
          state.levelTestScore,
          state.levelTestTotal,
        )
      : 0;

  /*
   * Before completing the Level Test,
   * activity progress and XP progress
   * determine the overall progress.
   */
  if (
    !isLevelTestCompleted(state)
  ) {
    return Math.round(
      (activityProgress.total +
        levelProgress) /
        2,
    );
  }

  /*
   * After completing the Level Test,
   * all three components contribute.
   */
  return Math.round(
    (activityProgress.total +
      levelProgress +
      levelTestProgress) /
      3,
  );
}

/* =========================================================
   PROGRESS STATS
========================================================= */

export function getProgressStats(
  state: AppState,
): ProgressStats {
  const totalXp =
    normalizeProgressNumber(
      state.totalXp,
    );

  const level =
    getLevelFromXp(totalXp);

  const levelTestCompleted =
    isLevelTestCompleted(state);

  const levelTestScore =
    normalizeProgressNumber(
      state.levelTestScore,
    );

  const levelTestTotal =
    normalizeProgressNumber(
      state.levelTestTotal,
    );

  const levelTestPercentage =
    getLevelTestPercentage(
      levelTestScore,
      levelTestTotal,
    );

  const dailyGoal =
    getDailyGoal(state);

  const dailyXp =
    normalizeProgressNumber(
      state.progress?.dailyXp,
    );

  const dailyGoalProgress =
    dailyGoal <= 0
      ? 100
      : Math.min(
          100,
          Math.round(
            (dailyXp / dailyGoal) *
              100,
          ),
        );

  const streak =
    getStoredStreakData(state);

  return {
    articlesRead:
      normalizeProgressNumber(
        state.articlesRead,
      ),

    vocabularyLearned:
      normalizeProgressNumber(
        state.vocabularyLearned,
      ),

    practiceCompleted:
      normalizeProgressNumber(
        state.practiceCompleted,
      ),

    roomsJoined:
      normalizeProgressNumber(
        state.roomsJoined,
      ),

    cardsCollected:
      normalizeProgressNumber(
        state.cardsCollected,
      ),

    totalXp,

    level,

    levelTestCompleted,

    levelTestScore,

    levelTestTotal,

    levelTestPercentage,

    overallProgress:
      getOverallProgress(state),

    dailyGoal,

    dailyGoalProgress,

    dailyGoalCompleted:
      dailyXp >= dailyGoal,

    currentStreak:
      streak.currentStreak,

    longestStreak:
      streak.longestStreak,

    lastActiveDate:
      streak.lastActiveDate,
  };
}

/* =========================================================
   COMPLETE PROGRESS STATISTICS
========================================================= */

export interface ProgressStatistics
  extends ProgressStats {
  xpProgress: XpProgress;
  currentLevel: Level;
  nextLevel: Level | null;
  xpToNextLevel: number;
  activityProgress: ActivityProgress;
  levelProgress: number;
  streakActive: boolean;
}

export function getProgressStatistics(
  state: AppState,
): ProgressStatistics {
  const stats =
    getProgressStats(state);

  const xpProgress =
    getXpProgress(
      state.totalXp,
    );

  const activityProgress =
    getActivityProgress(state);

  return {
    ...stats,

    xpProgress,

    currentLevel:
      xpProgress.currentLevel,

    nextLevel:
      xpProgress.nextLevel,

    xpToNextLevel:
      xpProgress.xpToNextLevel,

    activityProgress,

    levelProgress:
      xpProgress.levelProgress,

    streakActive:
      isStreakActive(state),
  };
}

/* =========================================================
   XP / LEVEL SUMMARY
========================================================= */

export function getLevelSummary(
  totalXp: number,
): {
  level: Level;
  currentXp: number;
  currentThreshold: number;
  nextLevel: Level | null;
  nextThreshold: number | null;
  xpToNextLevel: number;
  progress: number;
} {
  const currentXp =
    normalizeProgressNumber(
      totalXp,
    );

  const level =
    getLevelFromXp(currentXp);

  const nextLevel =
    getNextLevel(level);

  const currentThreshold =
    LEVEL_THRESHOLDS[level];

  const nextThreshold =
    nextLevel !== null
      ? LEVEL_THRESHOLDS[nextLevel]
      : null;

  return {
    level,
    currentXp,
    currentThreshold,
    nextLevel,
    nextThreshold,
    xpToNextLevel:
      getXpToNextLevel(
        currentXp,
      ),
    progress:
      getLevelProgress(
        currentXp,
      ),
  };
}

/* =========================================================
   XP REWARDS
========================================================= */

export const XP_REWARDS = {
  article: 10,
  vocabulary: 2,
  practice: 5,
  room: 5,
  card: 3,
  levelTest: 50,
  daily: 10,
} as const;

export function getXpReward(
  activity: keyof typeof XP_REWARDS,
): number {
  return XP_REWARDS[activity];
}

/* =========================================================
   LEVEL INFORMATION
========================================================= */

export interface LevelInformation {
  level: Level;
  threshold: number;
  percentage: number;
}

export function getAllLevelInformation(): LevelInformation[] {
  return LEVEL_ORDER.map(
    (level) => ({
      level,
      threshold:
        LEVEL_THRESHOLDS[level],
      percentage:
        LEVEL_PERCENTAGES[level],
    }),
  );
}

/* =========================================================
   EMPTY PROGRESS
========================================================= */

export function createEmptyProgressStats(): ProgressStats {
  return {
    articlesRead: 0,
    vocabularyLearned: 0,
    practiceCompleted: 0,
    roomsJoined: 0,
    cardsCollected: 0,
    totalXp: 0,
    level: "A1",
    levelTestCompleted: false,
    levelTestScore: 0,
    levelTestTotal: 0,
    levelTestPercentage: 0,
    overallProgress: 0,
    dailyGoal:
      DAILY_GOAL_DEFAULT,
    dailyGoalProgress: 0,
    dailyGoalCompleted: false,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
  };
}