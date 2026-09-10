import {
  createRoom,
  endRoom,
  joinRoom,
  leaveRoom,
  normalizeRoom,
  type Room,
  type RoomInput,
} from "./rooms";

const STORAGE_KEY = "dre2learn-rooms";

export interface RoomStorageData {
  rooms: Room[];
}

const DEFAULT_DATA: RoomStorageData = {
  rooms: [],
};

function readData(): RoomStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...DEFAULT_DATA };
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return { ...DEFAULT_DATA };
    }

    const value =
      parsed as Partial<RoomStorageData>;

    return {
      rooms: Array.isArray(value.rooms)
        ? value.rooms.map(
            (room) =>
              normalizeRoom(room),
          )
        : [],
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeData(
  data: RoomStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getRoomStorage(): RoomStorageData {
  return readData();
}

export function saveRoomStorage(
  data: RoomStorageData,
): void {
  writeData(data);
}

export function getAllRooms(): Room[] {
  return readData().rooms;
}

export function saveRoom(
  room: Room,
): Room {
  const data = readData();
  const normalized =
    normalizeRoom(room);

  const index = data.rooms.findIndex(
    (item) => item.id === normalized.id,
  );

  if (index >= 0) {
    data.rooms[index] = normalized;
  } else {
    data.rooms.push(normalized);
  }

  writeData(data);

  return normalized;
}

export function createAndSaveRoom(
  input: RoomInput,
): Room {
  return saveRoom(createRoom(input));
}

export function joinStoredRoom(
  roomId: string,
  userId: string,
): Room | null {
  const data = readData();

  const room = data.rooms.find(
    (item) => item.id === roomId,
  );

  if (!room) {
    return null;
  }

  const updated = joinRoom(
    room,
    userId,
  );

  data.rooms = data.rooms.map(
    (item) =>
      item.id === roomId
        ? updated
        : item,
  );

  writeData(data);

  return updated;
}

export function leaveStoredRoom(
  roomId: string,
  userId: string,
): Room | null {
  const data = readData();

  const room = data.rooms.find(
    (item) => item.id === roomId,
  );

  if (!room) {
    return null;
  }

  const updated = leaveRoom(
    room,
    userId,
  );

  data.rooms = data.rooms.map(
    (item) =>
      item.id === roomId
        ? updated
        : item,
  );

  writeData(data);

  return updated;
}

export function endStoredRoom(
  roomId: string,
): Room | null {
  const data = readData();

  const room = data.rooms.find(
    (item) => item.id === roomId,
  );

  if (!room) {
    return null;
  }

  const updated = endRoom(room);

  data.rooms = data.rooms.map(
    (item) =>
      item.id === roomId
        ? updated
        : item,
  );

  writeData(data);

  return updated;
}

export function deleteRoom(
  roomId: string,
): boolean {
  const data = readData();

  const before = data.rooms.length;

  data.rooms = data.rooms.filter(
    (room) => room.id !== roomId,
  );

  if (before === data.rooms.length) {
    return false;
  }

  writeData(data);

  return true;
}

export function clearRoomStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeRoomStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData(DEFAULT_DATA);
  }
}