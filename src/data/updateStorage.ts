import {
  createUpdate,
  normalizeUpdate,
  publishUpdate,
  archiveUpdate,
  restoreUpdate,
  setUpdateFeatured,
  updateUpdateContent,
  type AppUpdate,
  type AppUpdateInput,
} from "./updates";

const STORAGE_KEY = "dre2learn-updates";

export interface UpdateStorageData {
  updates: AppUpdate[];
}

const DEFAULT_DATA: UpdateStorageData = {
  updates: [],
};

function readData(): UpdateStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...DEFAULT_DATA };
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("updates" in parsed)
    ) {
      return { ...DEFAULT_DATA };
    }

    const value = (
      parsed as { updates?: unknown }
    ).updates;

    if (!Array.isArray(value)) {
      return { ...DEFAULT_DATA };
    }

    return {
      updates: value.map((item) =>
        normalizeUpdate(item as AppUpdate),
      ),
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeData(data: UpdateStorageData): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getUpdateStorage(): UpdateStorageData {
  return readData();
}

export function saveUpdateStorage(
  data: UpdateStorageData,
): void {
  writeData(data);
}

export function getAllUpdates(): AppUpdate[] {
  return readData().updates;
}

export function saveUpdate(
  update: AppUpdate,
): AppUpdate {
  const data = readData();
  const normalized = normalizeUpdate(update);

  const index = data.updates.findIndex(
    (item) => item.id === normalized.id,
  );

  if (index >= 0) {
    data.updates[index] = normalized;
  } else {
    data.updates.push(normalized);
  }

  writeData(data);

  return normalized;
}

export function createAndSaveUpdate(
  input: AppUpdateInput,
): AppUpdate {
  return saveUpdate(createUpdate(input));
}

export function publishStoredUpdate(
  updateId: string,
): AppUpdate | null {
  const data = readData();

  const update = data.updates.find(
    (item) => item.id === updateId,
  );

  if (!update) {
    return null;
  }

  const updated = publishUpdate(update);

  data.updates = data.updates.map((item) =>
    item.id === updateId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function archiveStoredUpdate(
  updateId: string,
): AppUpdate | null {
  const data = readData();

  const update = data.updates.find(
    (item) => item.id === updateId,
  );

  if (!update) {
    return null;
  }

  const updated = archiveUpdate(update);

  data.updates = data.updates.map((item) =>
    item.id === updateId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function restoreStoredUpdate(
  updateId: string,
): AppUpdate | null {
  const data = readData();

  const update = data.updates.find(
    (item) => item.id === updateId,
  );

  if (!update) {
    return null;
  }

  const updated = restoreUpdate(update);

  data.updates = data.updates.map((item) =>
    item.id === updateId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function featureStoredUpdate(
  updateId: string,
  featured: boolean,
): AppUpdate | null {
  const data = readData();

  const update = data.updates.find(
    (item) => item.id === updateId,
  );

  if (!update) {
    return null;
  }

  const updated = setUpdateFeatured(
    update,
    featured,
  );

  data.updates = data.updates.map((item) =>
    item.id === updateId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function editStoredUpdate(
  updateId: string,
  changes: Parameters<
    typeof updateUpdateContent
  >[1],
): AppUpdate | null {
  const data = readData();

  const update = data.updates.find(
    (item) => item.id === updateId,
  );

  if (!update) {
    return null;
  }

  const updated = updateUpdateContent(
    update,
    changes,
  );

  data.updates = data.updates.map((item) =>
    item.id === updateId ? updated : item,
  );

  writeData(data);

  return updated;
}

export function deleteUpdate(
  updateId: string,
): boolean {
  const data = readData();

  const originalLength = data.updates.length;

  data.updates = data.updates.filter(
    (item) => item.id !== updateId,
  );

  if (data.updates.length === originalLength) {
    return false;
  }

  writeData(data);

  return true;
}

export function clearUpdateStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeUpdateStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData(DEFAULT_DATA);
  }
}