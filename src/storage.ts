import type { AppState } from "./types";
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
            ? state.user.xp
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
        ? state.totalXp
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
        ? state.collectedCards
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
 * - never counts the same activity twice through this helper
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

  /*
    If the previous activity was not today,
    today's Daily XP starts from zero.
  */
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
    state.user?.xp ?? 0;

  const newTotalXp =
    state.totalXp + amount;

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
   CARDS
====================================================== */

export function addCollectedCard(
  state: AppState,
): AppState {
  const updatedState: AppState = {
    ...state,

    cardsCollected:
      state.cardsCollected + 1,
  };

  return addXP(
    updatedState,
    3,
  );
}