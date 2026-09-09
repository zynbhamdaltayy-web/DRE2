import type {
  AppState,
  Level,
  ProgressStats,
} from "../types";

import {
  getLevelFromXp,
  getXpProgress,
  getXpToNextLevel,
  getNextLevel,
} from "./xp";

/* -------------------------------------------------------------------------- */
/* PROGRESS STATS                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Build a complete progress object from the application state.
 */
export function getProgressStats(
  state: AppState,
): ProgressStats {
  return {
    articlesRead:
      state.articlesRead,

    vocabularyLearned:
      state.vocabularyLearned,

    practiceCompleted:
      state.practiceCompleted,

    roomsJoined:
      state.roomsJoined,

    cardsCollected:
      state.cardsCollected,

    totalXp:
      state.totalXp,

    levelTestScore:
      state.levelTestScore,

    levelTestTotal:
      state.levelTestTotal,
  };
}

/* -------------------------------------------------------------------------- */
/* SAFE PROGRESS VALUES                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Make sure a progress number is valid.
 */
export function normalizeProgressNumber(
  value: number | undefined | null,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.floor(value);
}

/* -------------------------------------------------------------------------- */
/* LEVEL TEST PROGRESS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Calculate the Level Test percentage.
 */
export function getLevelTestPercentage(
  score: number,
  total: number,
): number {
  const safeScore =
    normalizeProgressNumber(score);

  const safeTotal =
    normalizeProgressNumber(total);

  if (safeTotal === 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (safeScore / safeTotal) * 100,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/* LEARNING ACTIVITY                                                         */
/* -------------------------------------------------------------------------- */

export interface LearningActivitySummary {
  articles: number;
  vocabulary: number;
  practice: number;
  rooms: number;
  cards: number;
  totalActivities: number;
}

/**
 * Return a summary of all completed learning activities.
 */
export function getLearningActivitySummary(
  state: AppState,
): LearningActivitySummary {
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

  return {
    articles,
    vocabulary,
    practice,
    rooms,
    cards,

    totalActivities:
      articles +
      vocabulary +
      practice +
      rooms +
      cards,
  };
}

/* -------------------------------------------------------------------------- */
/* XP PROGRESS                                                                */
/* -------------------------------------------------------------------------- */

export interface XpProgressSummary {
  totalXp: number;
  level: Level;
  nextLevel: Level | null;
  progressPercentage: number;
  xpToNextLevel: number;
}

/**
 * Get XP progress information for the Progress page.
 */
export function getXpProgressSummary(
  state: AppState,
): XpProgressSummary {
  const totalXp =
    normalizeProgressNumber(
      state.totalXp,
    );

  const level =
    getLevelFromXp(totalXp);

  return {
    totalXp,
    level,

    nextLevel:
      getNextLevel(level),

    progressPercentage:
      getXpProgress(totalXp),

    xpToNextLevel:
      getXpToNextLevel(totalXp),
  };
}

/* -------------------------------------------------------------------------- */
/* COMPLETION SCORE                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Calculate a simple activity completion score.
 *
 * This is a DRE2learn progress indicator,
 * not an official educational measurement.
 */
export function getActivityCompletionScore(
  state: AppState,
): number {
  const summary =
    getLearningActivitySummary(state);

  const total =
    summary.totalActivities;

  if (total === 0) {
    return 0;
  }

  /*
   * Each activity contributes equally.
   * The result is capped at 100.
   */
  return Math.min(
    100,
    total * 2,
  );
}

/* -------------------------------------------------------------------------- */
/* OVERALL PROGRESS                                                           */
/* -------------------------------------------------------------------------- */

export interface OverallProgress {
  level: Level;
  xp: number;
  xpPercentage: number;

  articlesRead: number;
  vocabularyLearned: number;
  practiceCompleted: number;
  roomsJoined: number;
  cardsCollected: number;

  levelTestPercentage: number;
  activityScore: number;
}

/**
 * Return the complete Progress page data.
 */
export function getOverallProgress(
  state: AppState,
): OverallProgress {
  return {
    level:
      getLevelFromXp(
        normalizeProgressNumber(
          state.totalXp,
        ),
      ),

    xp:
      normalizeProgressNumber(
        state.totalXp,
      ),

    xpPercentage:
      getXpProgress(
        normalizeProgressNumber(
          state.totalXp,
        ),
      ),

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

    levelTestPercentage:
      getLevelTestPercentage(
        state.levelTestScore,
        state.levelTestTotal,
      ),

    activityScore:
      getActivityCompletionScore(
        state,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* DAILY GOAL                                                                 */
/* -------------------------------------------------------------------------- */

export interface DailyGoal {
  target: number;
  completed: number;
  percentage: number;
  completedToday: boolean;
}

/**
 * DRE2learn standard daily learning target.
 */
export const DAILY_ACTIVITY_TARGET = 5;

/**
 * Calculate daily-goal progress.
 *
 * The current state does not yet store activity dates,
 * so this represents the general learning-goal calculation.
 */
export function getDailyGoal(
  completedActivities: number,
): DailyGoal {
  const completed =
    normalizeProgressNumber(
      completedActivities,
    );

  const percentage =
    Math.min(
      100,
      (completed /
        DAILY_ACTIVITY_TARGET) *
        100,
    );

  return {
    target:
      DAILY_ACTIVITY_TARGET,

    completed,

    percentage,

    completedToday:
      completed >=
      DAILY_ACTIVITY_TARGET,
  };
}

/* -------------------------------------------------------------------------- */
/* STATISTICS                                                                 */
/* -------------------------------------------------------------------------- */

export interface ProgressStatistics {
  totalActivities: number;
  totalXp: number;
  currentLevel: Level;

  articlesRead: number;
  vocabularyLearned: number;
  practiceCompleted: number;
  roomsJoined: number;
  cardsCollected: number;

  levelTestScore: number;
  levelTestTotal: number;
  levelTestPercentage: number;
}

/**
 * Return statistics suitable for the Progress screen.
 */
export function getProgressStatistics(
  state: AppState,
): ProgressStatistics {
  const activity =
    getLearningActivitySummary(state);

  const totalXp =
    normalizeProgressNumber(
      state.totalXp,
    );

  return {
    totalActivities:
      activity.totalActivities,

    totalXp,

    currentLevel:
      getLevelFromXp(totalXp),

    articlesRead:
      activity.articles,

    vocabularyLearned:
      activity.vocabulary,

    practiceCompleted:
      activity.practice,

    roomsJoined:
      activity.rooms,

    cardsCollected:
      activity.cards,

    levelTestScore:
      normalizeProgressNumber(
        state.levelTestScore,
      ),

    levelTestTotal:
      normalizeProgressNumber(
        state.levelTestTotal,
      ),

    levelTestPercentage:
      getLevelTestPercentage(
        state.levelTestScore,
        state.levelTestTotal,
      ),
  };
}