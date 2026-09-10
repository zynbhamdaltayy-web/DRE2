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
  getRoomMediaPermissions,
  type Room,
  type RoomInput,
  type RoomMediaPermissions,
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
          ? value.rooms
              .map((room) =>
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

  const normalizedRoomId =
    roomId.trim();

  const normalizedUserId =
    userId.trim();

  if (
    !normalizedRoomId ||
    !normalizedUserId
  ) {
    return null;
  }

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  const updated =
    joinRoom(
      room,
      normalizedUserId,
      userGender,
    );

  /**
   * If the user was not allowed to join,
   * joinRoom returns the unchanged room.
   */
  const userAlreadyParticipating =
    room.participantIds.includes(
      normalizedUserId,
    );

  const successfullyJoined =
    userAlreadyParticipating ||
    (
      updated.participantIds.includes(
        normalizedUserId,
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
        item.id ===
        normalizedRoomId
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

  const normalizedRoomId =
    roomId.trim();

  const normalizedUserId =
    userId.trim();

  if (
    !normalizedRoomId ||
    !normalizedUserId
  ) {
    return null;
  }

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !room.participantIds.includes(
      normalizedUserId,
    )
  ) {
    return room;
  }

  /**
   * leaveRoom() handles:
   *
   * - normal participant leaving
   * - host leaving
   * - automatic host transfer
   * - cleaning individual permissions
   * - ending the room when nobody remains
   */
  const updated =
    leaveRoom(
      room,
      normalizedUserId,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// END ROOM
// ======================================================

export function endStoredRoom(
  roomId: string,
  requesterId: string,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  if (
    !normalizedRoomId ||
    !normalizedRequesterId
  ) {
    return null;
  }

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    endRoom(
      room,
      normalizedRequesterId,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — GLOBAL CAMERA
// ======================================================

export function setStoredRoomCameraEnabled(
  roomId: string,
  requesterId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    setRoomCameraEnabled(
      room,
      normalizedRequesterId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — GLOBAL MICROPHONE
// ======================================================

export function setStoredRoomMicrophoneEnabled(
  roomId: string,
  requesterId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    setRoomMicrophoneEnabled(
      room,
      normalizedRequesterId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — GLOBAL SCREEN SHARE
// ======================================================

export function setStoredRoomScreenShareEnabled(
  roomId: string,
  requesterId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    setRoomScreenShareEnabled(
      room,
      normalizedRequesterId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — INDIVIDUAL CAMERA
// ======================================================

export function setStoredParticipantCameraEnabled(
  roomId: string,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  const normalizedParticipantId =
    participantId.trim();

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    setParticipantCameraEnabled(
      room,
      normalizedRequesterId,
      normalizedParticipantId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — INDIVIDUAL MICROPHONE
// ======================================================

export function setStoredParticipantMicrophoneEnabled(
  roomId: string,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  const normalizedParticipantId =
    participantId.trim();

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    setParticipantMicrophoneEnabled(
      room,
      normalizedRequesterId,
      normalizedParticipantId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
          ? updated
          : item,
    );

  writeData(data);

  return updated;
}

// ======================================================
// OWNER — INDIVIDUAL SCREEN SHARE
// ======================================================

export function setStoredParticipantScreenShareEnabled(
  roomId: string,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room | null {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  const normalizedRequesterId =
    requesterId.trim();

  const normalizedParticipantId =
    participantId.trim();

  const room =
    data.rooms.find(
      (item) =>
        item.id ===
        normalizedRoomId,
    );

  if (!room) {
    return null;
  }

  if (
    !isRoomHost(
      room,
      normalizedRequesterId,
    )
  ) {
    return null;
  }

  const updated =
    setParticipantScreenShareEnabled(
      room,
      normalizedRequesterId,
      normalizedParticipantId,
      enabled,
    );

  data.rooms =
    data.rooms.map(
      (item) =>
        item.id ===
        normalizedRoomId
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
// ALL MEDIA PERMISSIONS
// ======================================================

/**
 * Returns the three current room permissions
 * for a user.
 *
 * This is the preferred storage-layer bridge
 * for the PeerJS media layer.
 */
export function getStoredUserMediaPermissions(
  roomId: string,
  userId: string,
): RoomMediaPermissions | null {
  const room =
    getRoomById(roomId);

  if (!room) {
    return null;
  }

  return getRoomMediaPermissions(
    room,
    userId,
  );
}

// ======================================================
// DELETE ROOM
// ======================================================

/**
 * Deletes a room from local storage.
 *
 * IMPORTANT:
 * This function is intentionally kept as a low-level
 * local-storage operation for compatibility.
 *
 * It must NOT be treated as the security mechanism
 * for deleting a real production room.
 */
export function deleteRoom(
  roomId: string,
): boolean {
  const data = readData();

  const normalizedRoomId =
    roomId.trim();

  if (!normalizedRoomId) {
    return false;
  }

  const before =
    data.rooms.length;

  data.rooms =
    data.rooms.filter(
      (room) =>
        room.id !==
        normalizedRoomId,
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

/**
 * Safer application-level deletion helper.
 *
 * Only the current host can delete/end-remove
 * the room through this helper.
 *
 * Real production authorization must still be
 * enforced by the backend/Firebase.
 */
export function deleteStoredRoomByHost(
  roomId: string,
  requesterId: string,
): boolean {
  const room =
    getRoomById(roomId);

  if (!room) {
    return false;
  }

  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return false;
  }

  return deleteRoom(roomId);
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