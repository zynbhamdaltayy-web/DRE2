import type { AppState } from "../types";

const STORAGE_KEY = "dre2learn_state";

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
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

    return JSON.parse(stored) as AppState;
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