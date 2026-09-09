import type {
  AppState,
  Level,
  ProgressStats,
} from "../types";

const LEVEL_ORDER: Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

const LEVEL_PERCENTAGES: Record<Level, number> = {
  A1: 0,
  A2: 20,
  B1: 40,
  B2: 60,
  C1: 80,
  C2: 100,
};

const LEVEL_THRESHOLDS: Record<Level, number> = {
  A1: 0,
  A2: 100,
  B1: 300,
  B2: 700,
  C1: 1400,
  C2: 2500,
};

const DAILY_GOAL_DEFAULT = 20;

/* -------------------------------------------------------
   Basic helpers
------------------------------------------------------- */

export function normalizeProgressNumber(
  value: number | undefined | null,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function normalizeDate(
  value: string | undefined | null,
): string {
  if (
    typeof value !== "string" ||
    !value
  ) {
    return "";
  }

  return value.slice(0, 10);
}

function getTodayDate(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function getDateDifferenceInDays(
  olderDate: string,
  newerDate: string,
): number {
  const older = new Date(
    `${olderDate}T00:00:00`,
  );

  const newer = new Date(
    `${newerDate}T00:00:00`,
  );

  if (
    Number.isNaN(older.getTime()) ||
    Number.isNaN(newer.getTime())
  ) {
    return Infinity;
  }

  const difference =
    newer.getTime() -
    older.getTime();

  return Math.round(
    difference /
      (1000 * 60 * 60 * 24),
  );
}

/* -------------------------------------------------------
   Level Test
------------------------------------------------------- */

export function getLevelTestPercentage(
  score: number,
  total: number,
): number {
  const safeScore =
    normalizeProgressNumber(score);

  const safeTotal =
    normalizeProgressNumber(total);

  if (safeTotal <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (safeScore / safeTotal) * 100,
    ),
  );
}

/* -------------------------------------------------------
   Learning activities
------------------------------------------------------- */

export function getLearningActivitySummary(
  state: AppState,
) {
  const articlesRead =
    normalizeProgressNumber(
      state.articlesRead,
    );

  const vocabularyLearned =
    normalizeProgressNumber(
      state.vocabularyLearned,
    );

  const practiceCompleted =
    normalizeProgressNumber(
      state.practiceCompleted,
    );

  const roomsJoined =
    normalizeProgressNumber(
      state.roomsJoined,
    );

  const cardsCollected =
    normalizeProgressNumber(
      state.cardsCollected,
    );

  return {
    articlesRead,
    vocabularyLearned,
    practiceCompleted,
    roomsJoined,
    cardsCollected,
  };
}

/* -------------------------------------------------------
   XP progress
------------------------------------------------------- */

export function getLevelThreshold(
  level: Level,
): number {
  return LEVEL_THRESHOLDS[level];
}

export function getXpProgressSummary(
  state: AppState,
) {
  const xp =
    normalizeProgressNumber(
      state.totalXp,
    );

  const level =
    state.user?.level ?? "A1";

  const currentIndex =
    LEVEL_ORDER.indexOf(level);

  const currentLevel =
    currentIndex >= 0
      ? LEVEL_ORDER[currentIndex]
      : "A1";

  const nextLevel =
    currentIndex >= 0 &&
    currentIndex <
      LEVEL_ORDER.length - 1
      ? LEVEL_ORDER[
          currentIndex + 1
        ]
      : null;

  const currentThreshold =
    getLevelThreshold(
      currentLevel,
    );

  const nextThreshold =
    nextLevel !== null
      ? getLevelThreshold(
          nextLevel,
        )
      : currentThreshold;

  const range =
    nextThreshold -
    currentThreshold;

  const progress =
    nextLevel === null
      ? 100
      : range <= 0
        ? 0
        : Math.min(
            100,
            Math.max(
              0,
              Math.round(
                ((xp -
                  currentThreshold) /
                  range) *
                  100,
              ),
            ),
          );

  return {
    xp,
    level: currentLevel,
    currentThreshold,
    nextLevel,
    nextThreshold,
    progress,

    xpToNextLevel:
      nextLevel === null
        ? 0
        : Math.max(
            0,
            nextThreshold - xp,
          ),
  };
}

/* -------------------------------------------------------
   Activity completion
------------------------------------------------------- */

export function getActivityCompletionScore(
  state: AppState,
): number {
  const activity =
    getLearningActivitySummary(
      state,
    );

  const targets = {
    articles: 10,
    vocabulary: 50,
    practice: 10,
    rooms: 5,
    cards: 20,
  };

  const articleScore =
    Math.min(
      100,
      (activity.articlesRead /
        targets.articles) *
        100,
    );

  const vocabularyScore =
    Math.min(
      100,
      (activity.vocabularyLearned /
        targets.vocabulary) *
        100,
    );

  const practiceScore =
    Math.min(
      100,
      (activity.practiceCompleted /
        targets.practice) *
        100,
    );

  const roomScore =
    Math.min(
      100,
      (activity.roomsJoined /
        targets.rooms) *
        100,
    );

  const cardScore =
    Math.min(
      100,
      (activity.cardsCollected /
        targets.cards) *
        100,
    );

  return Math.round(
    (
      articleScore +
      vocabularyScore +
      practiceScore +
      roomScore +
      cardScore
    ) / 5,
  );
}

/* -------------------------------------------------------
   LEVEL progress
------------------------------------------------------- */

export function getLevelProgressPercentage(
  level: Level,
): number {
  return LEVEL_PERCENTAGES[level];
}

/* -------------------------------------------------------
   STREAK SYSTEM
------------------------------------------------------- */

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

/*
  Reads streak information safely.

  The current AppState may have been created before
  streak support was added, so we intentionally use
  backward-compatible defaults.
*/
function getStoredStreakData(
  state: AppState,
): StreakData {
  const progress =
    state.progress as
      | Record<string, unknown>
      | undefined;

  const currentStreak =
    normalizeProgressNumber(
      progress?.currentStreak as
        | number
        | undefined,
    );

  const longestStreak =
    normalizeProgressNumber(
      progress?.longestStreak as
        | number
        | undefined,
    );

  const lastActiveDate =
    normalizeDate(
      progress?.lastActiveDate as
        | string
        | undefined,
    );

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
  };
}

/*
  Calculates what the streak should be today.

  Rules:
  - No previous activity -> 1
  - Activity today -> unchanged
  - Activity yesterday -> +1
  - More than one day gap -> reset to 1
*/
export function calculateCurrentStreak(
  state: AppState,
  today: string = getTodayDate(),
): number {
  const streak =
    getStoredStreakData(state);

  if (!streak.lastActiveDate) {
    return 1;
  }

  const difference =
    getDateDifferenceInDays(
      streak.lastActiveDate,
      today,
    );

  if (difference === 0) {
    return Math.max(
      1,
      streak.currentStreak,
    );
  }

  if (difference === 1) {
    return (
      Math.max(
        1,
        streak.currentStreak,
      ) + 1
    );
  }

  return 1;
}

/*
  Returns the complete streak status
  without mutating AppState.

  This keeps progress.ts as a calculation layer.
  Storage/state updates can use this result later.
*/
export function getStreakSummary(
  state: AppState,
  today: string = getTodayDate(),
): StreakData {
  const stored =
    getStoredStreakData(state);

  const calculated =
    calculateCurrentStreak(
      state,
      today,
    );

  const isActiveToday =
    stored.lastActiveDate ===
    today;

  const currentStreak =
    isActiveToday
      ? Math.max(
          1,
          stored.currentStreak,
        )
      : calculated;

  const longestStreak =
    Math.max(
      stored.longestStreak,
      currentStreak,
    );

  return {
    currentStreak,
    longestStreak,
    lastActiveDate:
      stored.lastActiveDate,
  };
}

/*
  Returns the streak that should be saved
  after the user performs learning activity today.
*/
export function updateStreak(
  state: AppState,
  today: string = getTodayDate(),
): StreakData {
  const stored =
    getStoredStreakData(state);

  /*
    If the user has already been active today,
    do not increase the streak again.
  */
  if (
    stored.lastActiveDate ===
    today
  ) {
    return {
      currentStreak:
        Math.max(
          1,
          stored.currentStreak,
        ),

      longestStreak:
        Math.max(
          stored.longestStreak,
          stored.currentStreak,
        ),

      lastActiveDate: today,
    };
  }

  const difference =
    stored.lastActiveDate
      ? getDateDifferenceInDays(
          stored.lastActiveDate,
          today,
        )
      : Infinity;

  const newCurrentStreak =
    difference === 1
      ? Math.max(
          1,
          stored.currentStreak,
        ) + 1
      : 1;

  const newLongestStreak =
    Math.max(
      stored.longestStreak,
      newCurrentStreak,
    );

  return {
    currentStreak:
      newCurrentStreak,

    longestStreak:
      newLongestStreak,

    lastActiveDate: today,
  };
}

/*
  Convenience helper:
  tells the UI whether the user is currently
  maintaining an active streak.
*/
export function isStreakActive(
  state: AppState,
  today: string = getTodayDate(),
): boolean {
  const streak =
    getStoredStreakData(state);

  if (!streak.lastActiveDate) {
    return false;
  }

  const difference =
    getDateDifferenceInDays(
      streak.lastActiveDate,
      today,
    );

  return (
    difference === 0 ||
    difference === 1
  );
}

/* -------------------------------------------------------
   Daily Goal
------------------------------------------------------- */

export function getDailyGoal(
  state: AppState,
) {
  const today =
    getTodayDate();

  const progress =
    state.progress?.dailyXp ?? 0;

  const goal =
    state.progress?.dailyGoal ??
    DAILY_GOAL_DEFAULT;

  const lastActiveDate =
    normalizeDate(
      state.progress?.lastActiveDate,
    );

  const currentProgress =
    lastActiveDate === today
      ? normalizeProgressNumber(
          progress,
        )
      : 0;

  return {
    date: today,

    progress: Math.min(
      currentProgress,
      goal,
    ),

    goal,

    completed:
      currentProgress >= goal,

    percentage:
      goal <= 0
        ? 100
        : Math.min(
            100,
            Math.round(
              (currentProgress /
                goal) *
                100,
            ),
          ),
  };
}

/* -------------------------------------------------------
   Overall progress
------------------------------------------------------- */

export function getOverallProgress(
  state: AppState,
): number {
  const levelProgress =
    getLevelProgressPercentage(
      state.user?.level ?? "A1",
    );

  const levelTestProgress =
    state.user?.levelTestCompleted
      ? 100
      : getLevelTestPercentage(
          state.levelTestScore,
          state.levelTestTotal,
        );

  const activityProgress =
    getActivityCompletionScore(
      state,
    );

  const xpProgress =
    getXpProgressSummary(
      state,
    ).progress;

  return Math.round(
    (
      levelProgress +
      levelTestProgress +
      activityProgress +
      xpProgress
    ) / 4,
  );
}

/* -------------------------------------------------------
   Main Progress Stats
------------------------------------------------------- */

export function getProgressStats(
  state: AppState,
): ProgressStats {
  const activity =
    getLearningActivitySummary(
      state,
    );

  const xp =
    getXpProgressSummary(
      state,
    );

  const levelTestPercentage =
    getLevelTestPercentage(
      state.levelTestScore,
      state.levelTestTotal,
    );

  const overallProgress =
    getOverallProgress(
      state,
    );

  const dailyGoal =
    getDailyGoal(state);

  const streak =
    getStreakSummary(state);

  return {
    articlesRead:
      activity.articlesRead,

    vocabularyLearned:
      activity.vocabularyLearned,

    practiceCompleted:
      activity.practiceCompleted,

    roomsJoined:
      activity.roomsJoined,

    cardsCollected:
      activity.cardsCollected,

    totalXp:
      xp.xp,

    level:
      state.user?.level ?? "A1",

    levelTestCompleted:
      state.user
        ?.levelTestCompleted ??
      false,

    levelTestScore:
      normalizeProgressNumber(
        state.levelTestScore,
      ),

    levelTestTotal:
      normalizeProgressNumber(
        state.levelTestTotal,
      ),

    levelTestPercentage,

    overallProgress,

    dailyGoal:
      dailyGoal.goal,

    dailyGoalProgress:
      dailyGoal.progress,

    dailyGoalCompleted:
      dailyGoal.completed,

    /*
      Streak information.
      These extra fields are intentionally returned
      so the future UI can display them directly.
    */
    currentStreak:
      streak.currentStreak,

    longestStreak:
      streak.longestStreak,

    lastActiveDate:
      streak.lastActiveDate,
  };
}

/* -------------------------------------------------------
   Detailed Progress Statistics
------------------------------------------------------- */

export function getProgressStatistics(
  state: AppState,
) {
  const stats =
    getProgressStats(state);

  const xpSummary =
    getXpProgressSummary(
      state,
    );

  const streak =
    getStreakSummary(state);

  return {
    ...stats,

    xpProgress:
      xpSummary.progress,

    currentLevel:
      xpSummary.level,

    nextLevel:
      xpSummary.nextLevel,

    xpToNextLevel:
      xpSummary.xpToNextLevel,

    activityProgress:
      getActivityCompletionScore(
        state,
      ),

    levelProgress:
      getLevelProgressPercentage(
        state.user?.level ?? "A1",
      ),

    currentStreak:
      streak.currentStreak,

    longestStreak:
      streak.longestStreak,

    lastActiveDate:
      streak.lastActiveDate,

    streakActive:
      isStreakActive(state),
  };
}
    
 