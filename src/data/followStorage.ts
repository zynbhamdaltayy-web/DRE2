import {
  addFollow,
  createFollow,
  normalizeFollow,
  removeFollow,
  type Follow,
  type FollowInput,
} from "./follows";

const STORAGE_KEY = "dre2learn-follows";

export interface FollowStorageData {
  follows: Follow[];
}

const DEFAULT_DATA: FollowStorageData = {
  follows: [],
};

function readData(): FollowStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...DEFAULT_DATA };
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("follows" in parsed)
    ) {
      return { ...DEFAULT_DATA };
    }

    const value = (
      parsed as { follows?: unknown }
    ).follows;

    if (!Array.isArray(value)) {
      return { ...DEFAULT_DATA };
    }

    return {
      follows: value.map((item) =>
        normalizeFollow(item as Follow),
      ),
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeData(
  data: FollowStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getFollowStorage(): FollowStorageData {
  return readData();
}

export function saveFollowStorage(
  data: FollowStorageData,
): void {
  writeData(data);
}

export function getAllFollows(): Follow[] {
  return readData().follows;
}

export function saveFollow(
  follow: Follow,
): Follow {
  const data = readData();

  data.follows = addFollow(
    data.follows,
    follow,
  );

  writeData(data);

  return normalizeFollow(follow);
}

export function createAndSaveFollow(
  input: FollowInput,
): Follow {
  return saveFollow(createFollow(input));
}

export function deleteFollow(
  followerId: string,
  followingId: string,
): boolean {
  const data = readData();

  const before = data.follows.length;

  data.follows = removeFollow(
    data.follows,
    followerId,
    followingId,
  );

  if (data.follows.length === before) {
    return false;
  }

  writeData(data);

  return true;
}

export function clearFollowStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeFollowStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData(DEFAULT_DATA);
  }
}