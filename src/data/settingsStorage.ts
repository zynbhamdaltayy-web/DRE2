import {
  createDefaultSettings,
  normalizeSettings,
  type AppSettings,
} from "./settings";

const STORAGE_KEY = "dre2learn-settings";

const STORAGE_VERSION = 2;

export interface SettingsStorageData {
  version: number;
  settings: AppSettings;
}

function createDefaultData(): SettingsStorageData {
  return {
    version: STORAGE_VERSION,
    settings: createDefaultSettings(),
  };
}

function readData(): SettingsStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultData();
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return createDefaultData();
    }

    const value = parsed as {
      version?: unknown;
      settings?: unknown;
    };

    if (
      !value.settings ||
      typeof value.settings !== "object"
    ) {
      return createDefaultData();
    }

    return {
      version:
        typeof value.version === "number"
          ? value.version
          : 1,

      settings: normalizeSettings(
        value.settings as Partial<AppSettings>,
      ),
    };
  } catch {
    return createDefaultData();
  }
}

function writeData(
  data: SettingsStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getSettings(): AppSettings {
  return readData().settings;
}

export function saveSettings(
  settings: AppSettings,
): AppSettings {
  const normalized =
    normalizeSettings(settings);

  writeData({
    version: STORAGE_VERSION,
    settings: normalized,
  });

  return normalized;
}

export function updateSettings(
  changes: Partial<AppSettings>,
): AppSettings {
  const current = getSettings();

  const merged: AppSettings = {
    ...current,

    ...changes,

    notifications: {
      ...(current.notifications ?? {}),
      ...(changes.notifications ?? {}),
    },

    privacy: {
      ...(current.privacy ?? {}),
      ...(changes.privacy ?? {}),
    },

    learning: {
      ...(current.learning ?? {}),
      ...(changes.learning ?? {}),
    },
  };

  return saveSettings(merged);
}

export function resetStoredSettings(): AppSettings {
  const settings =
    createDefaultSettings();

  writeData({
    version: STORAGE_VERSION,
    settings,
  });

  return settings;
}

export function clearSettingsStorage(): void {
  try {
    localStorage.removeItem(
      STORAGE_KEY,
    );
  } catch {
    // Ignore storage errors.
  }
}

export function initializeSettingsStorage(): void {
  try {
    if (
      !localStorage.getItem(
        STORAGE_KEY,
      )
    ) {
      writeData(
        createDefaultData(),
      );
    }
  } catch {
    // Ignore storage errors.
  }
}