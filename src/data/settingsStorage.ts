import type { AppSettings } from "./settings";
import { createDefaultSettings } from "./settings";

const SETTINGS_STORAGE_KEY = "dre2learn_settings";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergeSettings(
  stored: Partial<AppSettings>,
): AppSettings {
  const defaults = createDefaultSettings();

  return {
    ...defaults,
    ...stored,

    notifications: {
      ...defaults.notifications,
      ...(isObject(stored.notifications)
        ? stored.notifications
        : {}),
    },

    privacy: {
      ...defaults.privacy,
      ...(isObject(stored.privacy)
        ? stored.privacy
        : {}),
    },

    learning: {
      ...defaults.learning,
      ...(isObject(stored.learning)
        ? stored.learning
        : {}),
    },
  };
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!raw) {
      return createDefaultSettings();
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isObject(parsed)) {
      return createDefaultSettings();
    }

    return mergeSettings(parsed as Partial<AppSettings>);
  } catch {
    return createDefaultSettings();
  }
}

export function saveStoredSettings(
  settings: AppSettings,
): AppSettings {
  const normalized = mergeSettings(settings);

  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    // Ignore localStorage errors.
  }

  return normalized;
}

export function updateStoredSettings(
  updates: Partial<AppSettings>,
): AppSettings {
  const current = getStoredSettings();

  const updated = mergeSettings({
    ...current,
    ...updates,

    notifications: {
      ...current.notifications,
      ...(updates.notifications ?? {}),
    },

    privacy: {
      ...current.privacy,
      ...(updates.privacy ?? {}),
    },

    learning: {
      ...current.learning,
      ...(updates.learning ?? {}),
    },
  });

  return saveStoredSettings(updated);
}

export function resetStoredSettings(): AppSettings {
  const defaults = createDefaultSettings();

  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(defaults),
    );
  } catch {
    // Ignore localStorage errors.
  }

  return defaults;
}

export function clearStoredSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {
    // Ignore localStorage errors.
  }
}