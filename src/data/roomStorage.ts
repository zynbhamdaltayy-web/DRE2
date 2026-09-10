import {
  createRoom,
  endRoom,
  joinRoom,
  leaveRoom,
  normalizeRoom,
  isRoomHost,
  setRoomCameraEnabled,
  setRoomMicrophoneEnabled,
  setRoomScreenShareEnabled,
  setParticipantCameraEnabled,
  setParticipantMicrophoneEnabled,
  setParticipantScreenShareEnabled,
  canUseRoomCamera,
  canUseRoomMicrophone,
  canUseRoomScreenShare,
  type Room,
  type RoomInput,
} from "./rooms";

import type { AvatarGender } from "../types";

const STORAGE_KEY =
  "dre2learn-rooms";

export interface RoomStorageData {
  rooms: Room[];
}

const DEFAULT_DATA: RoomStorageData = {
  rooms: [],
};

// ======================================================
// STORAGE
// ======================================================

function readData(): RoomStorageData {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return {
        ...DEFAULT_DATA,
      };
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {
        ...DEFAULT_DATA,
      };
    }

    const value =
      parsed as Partial<RoomStorageData>;

    return {
      rooms:
        Array.isArray(value.rooms)
          ? value.rooms.map(
              (room) =>
                normalizeRoom(
                  room,
                ),
            )
          : [],
    };
  } catch {
    return {
      ...DEFAULT_DATA,
    };
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

// ======================================================
// GET / SAVE
// ======================================================

export function getRoomStorage():
  RoomStorageData {
  return readData();
}

export function saveRoomStorage(
  data: RoomStorageData,
): void {
  writeData(data);
}

export function getAllRooms():
  Room[] {
  return readData().rooms;
}

export function getRoomById(
  roomId: string,
): Room | null {
  const normalizedRoomId =
    roomId.trim();

  if (!normalizedRoomId) {
    return null;
  }

  return (
    readData().rooms.find(
      (room) =>
        room.id ===
        normalizedRoomId,
    ) ?? null
  );
}

export function saveRoom(
  room: Room,
): Room {
  const data = readData();

  const normalized =
    normalizeRoom(room);

  const index =
    data.rooms.findIndex(
      (item) =>
        item.id ===
        normalized.id,
    );

  if (index >= 0) {
    data.rooms[index] =
      normalized;
  } else {
    data.rooms.push(
      normalized,
    );
  }

  writeData(data);

  return normalized;
}

// ======================================================
// CREATE ROOM
// ======================================================

export function createAndSaveRoom(
  input: RoomInput,
): Room {
  return saveRoom(
    createRoom(input),
  );
}

// ======================================================
// JOIN ROOM
// ======================================================

export function joinStoredRoom(
  roomId: string,
  userId: string,
  userGender?: AvatarGender,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  const updated =
    joinRoom(
      room,
      userId,
      userGender,
    );

  /**
   * If the user was not allowed to join,
   * joinRoom returns the unchanged room.
   */
  const userAlreadyParticipating =
    room.participantIds.includes(
      userId,
    );

  const successfullyJoined =
    userAlreadyParticipating ||
    (
      updated.participantIds.includes(
        userId,
      ) &&
      updated.participantIds.length >
        room.participantIds.length
    );

  if (!successfullyJoined) {
    return null;
  }

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// LEAVE ROOM
// ======================================================

export function leaveStoredRoom(
  roomId: string,
  userId: string,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !room.participantIds.includes(
      userId,
    )
  ) {
    return room;
  }

  const updated =
    leaveRoom(
      room,
      userId,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// END ROOM
// ======================================================

/**
 * Only the room host can end the room.
 */
export function endStoredRoom(
  roomId: string,
  requesterId: string,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    endRoom(
      room,
      requesterId,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — GLOBAL CAMERA
// ======================================================

/**
 * The room host enables or disables
 * camera access for everyone.
 */
export function setStoredRoomCameraEnabled(
  roomId: string,
  requesterId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    setRoomCameraEnabled(
      room,
      requesterId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — GLOBAL MICROPHONE
// ======================================================

/**
 * The room host enables or disables
 * microphone access for everyone.
 */
export function setStoredRoomMicrophoneEnabled(
  roomId: string,
  requesterId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    setRoomMicrophoneEnabled(
      room,
      requesterId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — GLOBAL SCREEN SHARE
// ======================================================

/**
 * The room host enables or disables
 * screen sharing for everyone.
 */
export function setStoredRoomScreenShareEnabled(
  roomId: string,
  requesterId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    setRoomScreenShareEnabled(
      room,
      requesterId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — INDIVIDUAL CAMERA
// ======================================================

/**
 * The room host can disable or enable
 * the camera of one participant.
 */
export function setStoredParticipantCameraEnabled(
  roomId: string,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    setParticipantCameraEnabled(
      room,
      requesterId,
      participantId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — INDIVIDUAL MICROPHONE
// ======================================================

/**
 * The room host can disable or enable
 * the microphone of one participant.
 */
export function setStoredParticipantMicrophoneEnabled(
  roomId: string,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    setParticipantMicrophoneEnabled(
      room,
      requesterId,
      participantId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — INDIVIDUAL SCREEN SHARE
// ======================================================

/**
 * The room host can disable or enable
 * screen sharing for one participant.
 */
export function setStoredParticipantScreenShareEnabled(
  roomId: string,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const room =
    data.rooms.find(
      (item) =>
        item.id === roomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return null;
  }

  const updated =
    setParticipantScreenShareEnabled(
      room,
      requesterId,
      participantId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id === roomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// PERMISSION CHECKS
// ======================================================

export function canStoredUserUseCamera(
  roomId: string,
  userId: string,
): boolean {
  const room =
    getRoomById(roomId);

  if (!room) {
    return false;
  }

  return canUseRoomCamera(
    room,
    userId,
  );
}

export function canStoredUserUseMicrophone(
  roomId: string,
  userId: string,
): boolean {
  const room =
    getRoomById(roomId);

  if (!room) {
    return false;
  }

  return canUseRoomMicrophone(
    room,
    userId,
  );
}

export function canStoredUserUseScreenShare(
  roomId: string,
  userId: string,
): boolean {
  const room =
    getRoomById(roomId);

  if (!room) {
    return false;
  }

  return canUseRoomScreenShare(
    room,
    userId,
  );
}

// ======================================================
// DELETE ROOM
// ======================================================

export function deleteRoom(
  roomId: string,
): boolean {
  const data = readData();

  const before =
    data.rooms.length;

  data.rooms =
    data.rooms.filter(
      (room) =>
        room.id !== roomId,
    );

  if (
    before ===
    data.rooms.length
  ) {
    return false;
  }

  writeData(data);

  return true;
}

// ======================================================
// CLEAR STORAGE
// ======================================================

export function clearRoomStorage(): void {
  localStorage.removeItem(
    STORAGE_KEY,
  );
}

// ======================================================
// INITIALIZE STORAGE
// ======================================================

export function initializeRoomStorage(): void {
  if (
    !localStorage.getItem(
      STORAGE_KEY,
    )
  ) {
    writeData(
      DEFAULT_DATA,
    );
  }
}
    
  

  

