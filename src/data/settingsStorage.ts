import {
  createDefaultSettings,
  normalizeSettings,
  type AppSettings,
} from "./settings";

const STORAGE_KEY =
  "dre2learn-settings";

export interface SettingsStorageData {
  settings: AppSettings;
}

const DEFAULT_DATA: SettingsStorageData = {
  settings: createDefaultSettings(),
};

function readData(): SettingsStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        settings:
          createDefaultSettings(),
      };
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {
        settings:
          createDefaultSettings(),
      };
    }

    const value = parsed as {
      settings?: unknown;
    };

    if (
      !value.settings ||
      typeof value.settings !==
        "object"
    ) {
      return {
        settings:
          createDefaultSettings(),
      };
    }

    return {
      settings: normalizeSettings(
        value.settings as Partial<AppSettings>,
      ),
    };
  } catch {
    return {
      settings:
        createDefaultSettings(),
    };
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
    settings: normalized,
  });

  return normalized;
}

export function updateSettings(
  changes: Partial<AppSettings>,
): AppSettings {
  const current = getSettings();

  return saveSettings(
    normalizeSettings({
      ...current,
      ...changes,
      notifications: {
        ...current.notifications,
        ...(changes.notifications ?? {}),
      },
      privacy: {
        ...current.privacy,
        ...(changes.privacy ?? {}),
      },
      learning: {
        ...current.learning,
        ...(changes.learning ?? {}),
      },
    }),
  );
}

export function resetStoredSettings(): AppSettings {
  const settings =
    createDefaultSettings();

  writeData({
    settings,
  });

  return settings;
}

export function clearSettingsStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeSettingsStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData(DEFAULT_DATA);
  }
}