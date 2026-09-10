import type {
  AppState,
  LearningCard,
} from "./types";

import { updateStreak } from "./data/progress";

const STORAGE_KEY = "dre2learn_state";
const STORAGE_VERSION = 5;

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

        isVip:
          state.user.isVip === true,

        vipSince:
          typeof state.user.vipSince === "string"
            ? state.user.vipSince
            : undefined,

        vipUntil:
          typeof state.user.vipUntil === "string"
            ? state.user.vipUntil
            : undefined,
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
                      Math.floor(
                        card.timesUsed,
                      ),
                    )
                  : 0,

              timesPlayed:
                typeof card.timesPlayed === "number"
                  ? Math.max(
                      0,
                      Math.floor(
                        card.timesPlayed,
                      ),
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
      notifications: true,

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

  return registerLearningActivity(
    updatedState,
    amount,
  );
}

/* ======================================================
   REMOVE XP
====================================================== */

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
 * - Card cannot already be collected.
 * - User must have enough XP.
 * - 1 XP is deducted.
 * - Completion reward is NOT given here.
 */
export function collectCardWithXP(
  state: AppState,
  card: LearningCard,
): AppState {
  const collectedCards =
    state.collectedCards ?? [];

  const alreadyCollected =
    collectedCards.some(
      (item) =>
        item.cardId === card.id,
    );

  if (alreadyCollected) {
    return state;
  }

  const cost =
    Math.max(
      0,
      card.xpCost ?? 1,
    );

  if (
    state.totalXp < cost ||
    (state.user &&
      state.user.xp < cost)
  ) {
    return state;
  }

  const stateAfterCost =
    removeXP(
      state,
      cost,
    );

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
   CARDS — USE
====================================================== */

/**
 * Records one normal use of a collected card.
 *
 * IMPORTANT:
 * This function does NOT grant XP.
 *
 * The same card can be used unlimited times.
 */
export function useCard(
  state: AppState,
  card: LearningCard,
): AppState {
  const collectedCards =
    state.collectedCards ?? [];

  const index =
    collectedCards.findIndex(
      (item) =>
        item.cardId === card.id,
    );

  /*
    The card must be collected first.
  */
  if (index === -1) {
    return state;
  }

  const updatedCollectedCards =
    collectedCards.map(
      (item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,

              timesUsed:
                (item.timesUsed ?? 0) +
                1,
            }
          : item,
    );

  return {
    ...state,

    collectedCards:
      updatedCollectedCards,
  };
}

/* ======================================================
   CARDS — PLAY
====================================================== */

/**
 * Records one time playing a collected card.
 *
 * IMPORTANT:
 * This function does NOT grant XP.
 *
 * The same card can be played unlimited times.
 */
export function playCard(
  state: AppState,
  card: LearningCard,
): AppState {
  const collectedCards =
    state.collectedCards ?? [];

  const index =
    collectedCards.findIndex(
      (item) =>
        item.cardId === card.id,
    );

  /*
    The card must be collected first.
  */
  if (index === -1) {
    return state;
  }

  const updatedCollectedCards =
    collectedCards.map(
      (item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,

              timesPlayed:
                (item.timesPlayed ?? 0) +
                1,
            }
          : item,
    );

  return {
    ...state,

    collectedCards:
      updatedCollectedCards,
  };
}

/* ======================================================
   CARDS — COMPLETE
====================================================== */

/**
 * Completes a collected card.
 *
 * Rules:
 * - Card must be collected.
 * - timesUsed increases by 1.
 * - Completion reward is normally 3 XP.
 * - Reward can only be claimed ONCE.
 * - rewardClaimed is saved in AppState.
 *
 * Example:
 *
 * First completion:
 *   timesUsed: 1
 *   rewardClaimed: true
 *   +3 XP
 *
 * Second completion:
 *   timesUsed: 2
 *   rewardClaimed: true
 *   +0 XP
 *
 * Third completion:
 *   timesUsed: 3
 *   rewardClaimed: true
 *   +0 XP
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
        item.cardId === card.id,
    );

  /*
    The card must be collected first.
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
    Every completion/use is counted.
    Even when the XP reward was already claimed.
  */
  const updatedCollectedCards =
    collectedCards.map(
      (item, itemIndex) =>
        itemIndex === collectedIndex
          ? {
              ...item,

              timesUsed:
                (item.timesUsed ?? 0) +
                1,
            }
          : item,
    );

  /*
    If the reward has already been claimed,
    save the new usage count but DO NOT
    grant XP again.
  */
  if (
    collected.rewardClaimed === true
  ) {
    return {
      ...state,

      collectedCards:
        updatedCollectedCards,
    };
  }

  /*
    Default completion reward = 3 XP.
  */
  const reward =
    Math.max(
      0,
      card.xpReward ?? 3,
    );

  /*
    Mark the reward as claimed BEFORE
    adding XP to the state.
  */
  const stateWithCompletedCard: AppState = {
    ...state,

    collectedCards:
      updatedCollectedCards.map(
        (item, itemIndex) =>
          itemIndex === collectedIndex
            ? {
                ...item,

                rewardClaimed:
                  true,
              }
            : item,
      ),
  };

  /*
    Grant the reward exactly once.
  */
  return addXP(
    stateWithCompletedCard,
    reward,
  );
}

/* ======================================================
   CARDS — CHECK REWARD
====================================================== */

/**
 * Returns true when the card's completion
 * reward has already been claimed.
 */
export function hasClaimedCardReward(
  state: AppState,
  cardId: string,
): boolean {
  const collectedCards =
    state.collectedCards ?? [];

  const card =
    collectedCards.find(
      (item) =>
        item.cardId === cardId,
    );

  return (
    card?.rewardClaimed === true
  );
}

/* ======================================================
   CARDS — GET USAGE
====================================================== */

/**
 * Returns how many times a card has been used.
 */
export function getCardTimesUsed(
  state: AppState,
  cardId: string,
): number {
  const card =
    (state.collectedCards ?? [])
      .find(
        (item) =>
          item.cardId === cardId,
      );

  return card?.timesUsed ?? 0;
}

/**
 * Returns how many times a card has been played.
 */
export function getCardTimesPlayed(
  state: AppState,
  cardId: string,
): number {
  const card =
    (state.collectedCards ?? [])
      .find(
        (item) =>
          item.cardId === cardId,
      );

  return card?.timesPlayed ?? 0;
}

/**
 * Returns the complete usage information
 * for one collected card.
 */
export function getCardUsage(
  state: AppState,
  cardId: string,
): {
  timesUsed: number;
  timesPlayed: number;
  rewardClaimed: boolean;
} | null {
  const card =
    (state.collectedCards ?? [])
      .find(
        (item) =>
          item.cardId === cardId,
      );

  if (!card) {
    return null;
  }

  return {
    timesUsed:
      card.timesUsed ?? 0,

    timesPlayed:
      card.timesPlayed ?? 0,

    rewardClaimed:
      card.rewardClaimed === true,
  };
}

/* ======================================================
   CARDS — TOTAL USAGE
====================================================== */

/**
 * Returns the total number of card uses
 * across all collected cards.
 */
export function getTotalCardUses(
  state: AppState,
): number {
  return (
    state.collectedCards ?? []
  ).reduce(
    (total, card) =>
      total +
      (card.timesUsed ?? 0),
    0,
  );
}

/**
 * Returns the total number of card plays
 * across all collected cards.
 */
export function getTotalCardPlays(
  state: AppState,
): number {
  return (
    state.collectedCards ?? []
  ).reduce(
    (total, card) =>
      total +
      (card.timesPlayed ?? 0),
    0,
  );
}

/* ======================================================
   LEGACY CARD FUNCTION
====================================================== */

/**
 * Kept for compatibility with older code.
 *
 * This function does NOT grant XP.
 * New collection logic should use:
 *
 * collectCardWithXP()
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
  
      
    

    
  
    
      
    
    
      
    
    