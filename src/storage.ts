import type {
  AppState,
  LearningCard,
} from "./types";

import { updateStreak } from "./data/progress";

const STORAGE_KEY = "dre2learn_state";
const STORAGE_VERSION = 4;

interface StoredData {
  version: number;
  state: AppState;
}

interface ProgressStorageData {
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  dailyXp?: number;
  dailyGoal?: number;
}

/* ======================================================
   DATE
====================================================== */

function getTodayDate(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

/* ======================================================
   SAFE STATE
====================================================== */

function createSafeState(
  state: Partial<AppState>,
): AppState {
  const user = state.user
    ? {
        ...state.user,

        countryCode:
          typeof state.user.countryCode === "string" &&
          state.user.countryCode.trim().length > 0
            ? state.user.countryCode
                .trim()
                .toUpperCase()
            : "UN",

        xp:
          typeof state.user.xp === "number"
            ? Math.max(0, state.user.xp)
            : 0,

        identityCard:
          state.user.identityCard ?? null,

        levelTestCompleted:
          state.user.levelTestCompleted ?? false,

        levelTestResult:
          state.user.levelTestResult ?? null,
      }
    : null;

  const savedProgress =
    state.progress as
      | ProgressStorageData
      | undefined;

  return {
    page:
      state.page ?? "welcome",

    user,

    vocabulary:
      Array.isArray(state.vocabulary)
        ? state.vocabulary
        : [],

    completedArticles:
      Array.isArray(state.completedArticles)
        ? state.completedArticles
        : [],

    practiceScore:
      typeof state.practiceScore === "number"
        ? state.practiceScore
        : 0,

    practiceAnswered:
      typeof state.practiceAnswered === "number"
        ? state.practiceAnswered
        : 0,

    currentArticleId:
      typeof state.currentArticleId === "string"
        ? state.currentArticleId
        : null,

    selectedLibraryLevel:
      state.selectedLibraryLevel ?? "A1",

    selectedTopic:
      state.selectedTopic ?? "Daily Life",

    selectedPracticeLevel:
      state.selectedPracticeLevel ?? "A1",

    isAuthenticated:
      state.isAuthenticated ?? false,

    // ==================================================
    // XP
    // ==================================================

    totalXp:
      typeof state.totalXp === "number"
        ? Math.max(0, state.totalXp)
        : user?.xp ?? 0,

    // ==================================================
    // PROGRESS
    // ==================================================

    articlesRead:
      typeof state.articlesRead === "number"
        ? state.articlesRead
        : state.completedArticles?.length ?? 0,

    vocabularyLearned:
      typeof state.vocabularyLearned === "number"
        ? state.vocabularyLearned
        : state.vocabulary?.length ?? 0,

    practiceCompleted:
      typeof state.practiceCompleted === "number"
        ? state.practiceCompleted
        : 0,

    roomsJoined:
      typeof state.roomsJoined === "number"
        ? state.roomsJoined
        : 0,

    cardsCollected:
      typeof state.cardsCollected === "number"
        ? state.cardsCollected
        : 0,

    // ==================================================
    // LEVEL TEST
    // ==================================================

    levelTestScore:
      typeof state.levelTestScore === "number"
        ? state.levelTestScore
        : 0,

    levelTestTotal:
      typeof state.levelTestTotal === "number"
        ? state.levelTestTotal
        : 0,

    levelTestAnswers:
      Array.isArray(state.levelTestAnswers)
        ? state.levelTestAnswers
        : [],

    levelTestResult:
      state.levelTestResult ?? null,

    // ==================================================
    // CARDS
    // ==================================================

    collectedCards:
      Array.isArray(state.collectedCards)
        ? state.collectedCards.map(
            (card) => ({
              ...card,

              timesUsed:
                typeof card.timesUsed === "number"
                  ? Math.max(
                      0,
                      card.timesUsed,
                    )
                  : 0,

              timesPlayed:
                typeof card.timesPlayed === "number"
                  ? Math.max(
                      0,
                      card.timesPlayed,
                    )
                  : 0,

              rewardClaimed:
                card.rewardClaimed === true,
            }),
          )
        : [],

    // ==================================================
    // ROOMS
    // ==================================================

    joinedRoomId:
      typeof state.joinedRoomId === "string"
        ? state.joinedRoomId
        : null,

    // ==================================================
    // SETTINGS
    // ==================================================

    settings: state.settings ?? {
      theme: "system",

      language: "en",

      notifications: {
        pushNotifications: true,
        messageNotifications: true,
        followNotifications: true,
        learningNotifications: true,
        officialUpdates: true,
      },

      privacy: {
        profileVisible: true,
        showOnlineStatus: true,
        allowMessageRequests: true,
        allowRoomInvites: true,
      },

      learning: {
        dailyGoal: 20,
        defaultLevel: "A1",
        defaultLanguage: "en",
        autoplayAudio: true,
      },

      soundEffects: true,

      autoplayAudio: true,

      privateMessages: true,

      showOnlineStatus: true,

      preferredTheme: "system",

      preferredLanguage: "en",
    },

    // ==================================================
    // UPDATES
    // ==================================================

    seenUpdates:
      Array.isArray(state.seenUpdates)
        ? state.seenUpdates
        : [],

    // ==================================================
    // STREAK / DAILY PROGRESS
    // ==================================================

    progress: {
      currentStreak:
        typeof savedProgress?.currentStreak === "number"
          ? Math.max(
              0,
              Math.floor(
                savedProgress.currentStreak,
              ),
            )
          : 0,

      longestStreak:
        typeof savedProgress?.longestStreak === "number"
          ? Math.max(
              0,
              Math.floor(
                savedProgress.longestStreak,
              ),
            )
          : 0,

      lastActiveDate:
        typeof savedProgress?.lastActiveDate === "string"
          ? savedProgress.lastActiveDate
              .slice(0, 10)
          : "",

      dailyXp:
        typeof savedProgress?.dailyXp === "number"
          ? Math.max(
              0,
              Math.floor(
                savedProgress.dailyXp,
              ),
            )
          : 0,

      dailyGoal:
        typeof savedProgress?.dailyGoal === "number"
          ? Math.max(
              1,
              Math.floor(
                savedProgress.dailyGoal,
              ),
            )
          : 20,
    },
  };
}

/* ======================================================
   STREAK + DAILY XP
====================================================== */

/**
 * Registers learning activity for today.
 *
 * This function:
 * - updates current streak
 * - updates longest streak
 * - saves today's date
 * - adds XP to today's daily progress
 */
function registerLearningActivity(
  state: AppState,
  xpAmount: number,
): AppState {
  const today = getTodayDate();

  const currentProgress =
    (state.progress ?? {}) as
      | ProgressStorageData;

  const streak =
    updateStreak(
      state,
      today,
    );

  const previousDate =
    typeof currentProgress.lastActiveDate ===
    "string"
      ? currentProgress.lastActiveDate
          .slice(0, 10)
      : "";

  const previousDailyXp =
    previousDate === today
      ? typeof currentProgress.dailyXp ===
        "number"
        ? Math.max(
            0,
            currentProgress.dailyXp,
          )
        : 0
      : 0;

  const newDailyXp =
    previousDailyXp +
    Math.max(0, xpAmount);

  return {
    ...state,

    progress: {
      ...currentProgress,

      currentStreak:
        streak.currentStreak,

      longestStreak:
        streak.longestStreak,

      lastActiveDate:
        streak.lastActiveDate,

      dailyXp:
        newDailyXp,

      dailyGoal:
        typeof currentProgress.dailyGoal ===
        "number"
          ? currentProgress.dailyGoal
          : 20,
    },
  };
}

/* ======================================================
   SAVE
====================================================== */

export function saveState(
  state: AppState,
): void {
  try {
    const safeState =
      createSafeState(state);

    const data: StoredData = {
      version: STORAGE_VERSION,
      state: safeState,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data),
    );
  } catch (error) {
    console.error(
      "DRE2learn: unable to save application state.",
      error,
    );
  }
}

/* ======================================================
   LOAD
====================================================== */

export function loadStoredState(): AppState | null {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!stored) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed
    ) {
      const storedData =
        parsed as {
          version?: number;
          state?: Partial<AppState>;
        };

      if (
        storedData.state &&
        typeof storedData.state === "object"
      ) {
        return createSafeState(
          storedData.state,
        );
      }

      return null;
    }

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return createSafeState(
        parsed as Partial<AppState>,
      );
    }

    return null;
  } catch (error) {
    console.error(
      "DRE2learn: unable to load application state.",
      error,
    );

    return null;
  }
}

/* ======================================================
   CLEAR
====================================================== */

export function clearStoredState(): void {
  try {
    localStorage.removeItem(
      STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "DRE2learn: unable to clear application state.",
      error,
    );
  }
}

/* ======================================================
   XP
====================================================== */

export function addXP(
  state: AppState,
  amount: number,
): AppState {
  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return state;
  }

  const currentUserXp =
    Math.max(
      0,
      state.user?.xp ?? 0,
    );

  const currentTotalXp =
    Math.max(
      0,
      state.totalXp,
    );

  const newTotalXp =
    currentTotalXp +
    amount;

  const updatedState: AppState = {
    ...state,

    totalXp:
      newTotalXp,

    user:
      state.user
        ? {
            ...state.user,

            xp:
              currentUserXp +
              amount,
          }
        : null,
  };

  /*
    Every XP-earning learning action
    counts as activity for the streak.
  */
  return registerLearningActivity(
    updatedState,
    amount,
  );
}

/* ======================================================
   REMOVE XP
====================================================== */

/**
 * Removes XP from the user's balance.
 *
 * Used when collecting a learning card.
 *
 * Card collection costs 1 XP.
 */
export function removeXP(
  state: AppState,
  amount: number,
): AppState {
  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return state;
  }

  const currentTotalXp =
    Math.max(
      0,
      state.totalXp,
    );

  const currentUserXp =
    Math.max(
      0,
      state.user?.xp ?? 0,
    );

  /*
    Never allow XP to become negative.
  */
  const actualAmount =
    Math.min(
      amount,
      currentTotalXp,
      currentUserXp,
    );

  if (actualAmount <= 0) {
    return state;
  }

  return {
    ...state,

    totalXp:
      currentTotalXp -
      actualAmount,

    user:
      state.user
        ? {
            ...state.user,

            xp:
              currentUserXp -
              actualAmount,
          }
        : null,
  };
}

/* ======================================================
   ARTICLES
====================================================== */

export function markArticleCompleted(
  state: AppState,
  articleId: string,
): AppState {
  if (
    state.completedArticles.includes(
      articleId,
    )
  ) {
    return state;
  }

  const updatedState: AppState = {
    ...state,

    completedArticles: [
      ...state.completedArticles,
      articleId,
    ],

    articlesRead:
      state.articlesRead + 1,
  };

  return addXP(
    updatedState,
    10,
  );
}

/* ======================================================
   VOCABULARY
====================================================== */

export function addVocabularyWord(
  state: AppState,
): AppState {
  const updatedState: AppState = {
    ...state,

    vocabularyLearned:
      state.vocabularyLearned + 1,
  };

  return addXP(
    updatedState,
    2,
  );
}

/* ======================================================
   PRACTICE
====================================================== */

export function markPracticeCompleted(
  state: AppState,
): AppState {
  const updatedState: AppState = {
    ...state,

    practiceCompleted:
      state.practiceCompleted + 1,
  };

  return addXP(
    updatedState,
    5,
  );
}

/* ======================================================
   ROOMS
====================================================== */

export function markRoomJoined(
  state: AppState,
): AppState {
  const updatedState: AppState = {
    ...state,

    roomsJoined:
      state.roomsJoined + 1,
  };

  return addXP(
    updatedState,
    5,
  );
}

/* ======================================================
   CARDS — COLLECT
====================================================== */

/**
 * Collecting a card costs 1 XP.
 *
 * Rules:
 * - Card must not already be collected.
 * - User must have at least 1 XP.
 * - 1 XP is deducted immediately.
 * - No completion reward is given here.
 */
export function collectCardWithXP(
  state: AppState,
  card: LearningCard,
): AppState {
  const collectedCards =
    state.collectedCards ?? [];

  /*
    Prevent collecting the same card twice.
  */
  const alreadyCollected =
    collectedCards.some(
      (item) =>
        item.cardId ===
        card.id,
    );

  if (alreadyCollected) {
    return state;
  }

  /*
    Card collection costs 1 XP.
    The card's configured xpCost is used,
    with 1 as the required default.
  */
  const cost =
    Math.max(
      0,
      card.xpCost ?? 1,
    );

  /*
    Do not allow collection without
    enough XP.
  */
  if (
    state.totalXp < cost ||
    (state.user &&
      state.user.xp < cost)
  ) {
    return state;
  }

  /*
    Deduct XP.
  */
  const stateAfterCost =
    removeXP(
      state,
      cost,
    );

  /*
    Add card to collection.
    The completion reward starts as unclaimed.
  */
  const updatedCollectedCards = [
    ...(stateAfterCost.collectedCards ??
      []),

    {
      cardId: card.id,

      collectedAt:
        new Date().toISOString(),

      timesUsed: 0,

      timesPlayed: 0,

      rewardClaimed: false,
    },
  ];

  return {
    ...stateAfterCost,

    collectedCards:
      updatedCollectedCards,

    cardsCollected:
      stateAfterCost.cardsCollected +
      1,
  };
}

/* ======================================================
   CARDS — COMPLETE
====================================================== */

/**
 * Completing a collected card gives 3 XP.
 *
 * Rules:
 * - Card must already be collected.
 * - Reward can only be claimed once.
 * - Completing the same card again gives 0 XP.
 * - rewardClaimed is stored permanently in AppState.
 */
export function completeCardWithXP(
  state: AppState,
  card: LearningCard,
): AppState {
  const collectedCards =
    state.collectedCards ?? [];

  const collectedIndex =
    collectedCards.findIndex(
      (item) =>
        item.cardId ===
        card.id,
    );

  /*
    Card must be collected first.
  */
  if (
    collectedIndex === -1
  ) {
    return state;
  }

  const collected =
    collectedCards[
      collectedIndex
    ];

  /*
    The 3 XP reward has already
    been claimed.
  */
  if (
    collected.rewardClaimed === true
  ) {
    return state;
  }

  /*
    Card completion reward.
    Default = 3 XP.
  */
  const reward =
    Math.max(
      0,
      card.xpReward ?? 3,
    );

  /*
    Mark the reward as claimed
    BEFORE adding XP.
    This prevents duplicate rewards.
  */
  const updatedCollectedCards =
    collectedCards.map(
      (item) =>
        item.cardId ===
        card.id
          ? {
              ...item,

              timesUsed:
                (item.timesUsed ??
                  0) + 1,

              rewardClaimed:
                true,
            }
          : item,
    );

  const stateWithCompletedCard: AppState = {
    ...state,

    collectedCards:
      updatedCollectedCards,
  };

  /*
    Give the reward only once.
  */
  return addXP(
    stateWithCompletedCard,
    reward,
  );
}

/* ======================================================
   LEGACY CARD FUNCTION
====================================================== */

/**
 * Kept for compatibility with existing code.
 *
 * New card collection logic should use:
 * collectCardWithXP()
 *
 * This old function no longer gives 3 XP,
 * because collecting a card costs XP now.
 */
export function addCollectedCard(
  state: AppState,
): AppState {
  return {
    ...state,

    cardsCollected:
      state.cardsCollected + 1,
  };
}