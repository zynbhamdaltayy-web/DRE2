import type { AppState } from "../types";

const STORAGE_KEY = "dre2learn_state";
const STORAGE_VERSION = 2;

interface StoredData {
  version: number;
  state: AppState;
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
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    /*
     * Support old saved data.
     * If the previous version was stored directly as AppState,
     * return it so the application can continue working.
     */
    if (
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed
    ) {
      return parsed.state as AppState;
    }

    return parsed as AppState;
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

/* =========================
   XP
========================= */

export function addXP(
  state: AppState,
  amount: number,
): AppState {
  if (amount <= 0) {
    return state;
  }

  const newTotalXp = state.totalXp + amount;

  return {
    ...state,

    totalXp: newTotalXp,

    user: state.user
      ? {
          ...state.user,
          xp: state.user.xp + amount,
        }
      : null,
  };
}

/* =========================
   PROGRESS
========================= */

export function markArticleCompleted(
  state: AppState,
  articleId: string,
): AppState {
  if (state.completedArticles.includes(articleId)) {
    return state;
  }

  const updatedState: AppState = {
    ...state,

    completedArticles: [
      ...state.completedArticles,
      articleId,
    ],

    articlesRead: state.articlesRead + 1,
  };

  return addXP(updatedState, 10);
}

export function addVocabularyWord(
  state: AppState,
): AppState {
  return {
    ...state,
    vocabularyLearned: state.vocabularyLearned + 1,
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

  return addXP(updatedState, 5);
}

export function markRoomJoined(
  state: AppState,
): AppState {
  return {
    ...state,
    roomsJoined: state.roomsJoined + 1,
  };
}

export function addCollectedCard(
  state: AppState,
): AppState {
  return {
    ...state,
    cardsCollected: state.cardsCollected + 1,
  };
}