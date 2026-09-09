import type { AppState } from "../types";

const STORAGE_KEY = "dre2learn_state";
const STORAGE_VERSION = 2;

interface StoredData {
  version: number;
  state: AppState;
}

function createSafeState(state: Partial<AppState>): AppState {
  const user = state.user
    ? {
        ...state.user,
        xp:
          typeof state.user.xp === "number"
            ? state.user.xp
            : 0,
        identityCard:
          state.user.identityCard ?? null,
        levelTestCompleted:
          state.user.levelTestCompleted ?? false,
      }
    : null;

  return {
    page: state.page ?? "welcome",
    user,

    vocabulary: Array.isArray(state.vocabulary)
      ? state.vocabulary
      : [],

    completedArticles: Array.isArray(
      state.completedArticles,
    )
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

    totalXp:
      typeof state.totalXp === "number"
        ? state.totalXp
        : user?.xp ?? 0,

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

    levelTestScore:
      typeof state.levelTestScore === "number"
        ? state.levelTestScore
        : 0,

    levelTestTotal:
      typeof state.levelTestTotal === "number"
        ? state.levelTestTotal
        : 0,
  };
}

export function saveState(state: AppState): void {
  try {
    const data: StoredData = {
      version: STORAGE_VERSION,
      state,
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

export function loadStoredState(): AppState | null {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed
    ) {
      return createSafeState(
        parsed.state as Partial<AppState>,
      );
    }

    return createSafeState(
      parsed as Partial<AppState>,
    );
  } catch (error) {
    console.error(
      "DRE2learn: unable to load application state.",
      error,
    );

    return null;
  }
}

export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "DRE2learn: unable to clear application state.",
      error,
    );
  }
}

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

  return {
    ...state,

    totalXp: newTotalXp,

    user: state.user
      ? {
          ...state.user,
          xp: currentUserXp + amount,
        }
      : null,
  };
}

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

export function addVocabularyWord(
  state: AppState,
): AppState {
  return {
    ...state,

    vocabularyLearned:
      state.vocabularyLearned + 1,
  };
}

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

export function markRoomJoined(
  state: AppState,
): AppState {
  return {
    ...state,

    roomsJoined:
      state.roomsJoined + 1,
  };
}

export function addCollectedCard(
  state: AppState,
): AppState {
  return {
    ...state,

    cardsCollected:
      state.cardsCollected + 1,
  };
}