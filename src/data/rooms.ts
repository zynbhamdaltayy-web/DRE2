import type {
  AvatarGender,
  Level,
} from "../types";

export type RoomType =
  | "audio"
  | "video";

export type RoomStatus =
  | "waiting"
  | "active"
  | "ended";

export type RoomGender =
  | "girls"
  | "boys"
  | "mixed";

/**
 * Controls that the room host can manage.
 *
 * Global controls affect everyone.
 *
 * Individual controls can disable access
 * for a specific participant.
 */
export interface RoomControls {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenShareEnabled: boolean;

  disabledCameraUserIds: string[];
  disabledMicrophoneUserIds: string[];
  disabledScreenShareUserIds: string[];
}

export interface Room {
  id: string;
  title: string;
  language: string;
  level: Level;
  topic: string;
  type: RoomType;
  gender: RoomGender;

  /**
   * Current room host.
   *
   * If the host leaves while other participants
   * remain, ownership is transferred automatically.
   */
  hostId: string;

  participantIds: string[];

  /**
   * Maximum number of participants.
   * DRE2learn currently allows up to 8.
   */
  maxParticipants: number;

  status: RoomStatus;

  createdAt: string;
  startedAt?: string;
  endedAt?: string;

  controls: RoomControls;
}

export interface RoomInput {
  title: string;
  language: string;
  level: Level;
  topic: string;
  type: RoomType;
  gender: RoomGender;
  hostId: string;
  maxParticipants?: number;
}

export interface RoomJoinUser {
  userId: string;
  gender: AvatarGender;
}

/**
 * Current media permissions for one user.
 *
 * These values are intended to be consumed by the
 * room/media layer and then enforced by peer.ts.
 */
export interface RoomMediaPermissions {
  camera: boolean;
  microphone: boolean;
  screenShare: boolean;
}

const MAX_ROOM_PARTICIPANTS = 8;
const MIN_ROOM_PARTICIPANTS = 2;

// ======================================================
// STATUS TRANSITIONS
// ======================================================

const ROOM_STATUS_TRANSITIONS: Record<
  RoomStatus,
  RoomStatus[]
> = {
  waiting: [
    "waiting",
    "active",
    "ended",
  ],

  active: [
    "active",
    "ended",
  ],

  ended: [
    "ended",
  ],
};

export function canTransitionRoomStatus(
  from: RoomStatus,
  to: RoomStatus,
): boolean {
  return ROOM_STATUS_TRANSITIONS[
    from
  ].includes(to);
}

export function setRoomStatus(
  room: Room,
  nextStatus: RoomStatus,
): Room {
  if (
    !canTransitionRoomStatus(
      room.status,
      nextStatus,
    )
  ) {
    return room;
  }

  if (room.status === nextStatus) {
    return room;
  }

  const now =
    new Date().toISOString();

  return {
    ...room,

    status: nextStatus,

    startedAt:
      nextStatus === "active"
        ? room.startedAt ?? now
        : room.startedAt,

    endedAt:
      nextStatus === "ended"
        ? room.endedAt ?? now
        : room.endedAt,
  };
}

// ======================================================
// HELPERS
// ======================================================

function createId(): string {
  return `room-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function clean(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeMaxParticipants(
  value: number | undefined,
): number {
  return Math.min(
    MAX_ROOM_PARTICIPANTS,
    Math.max(
      MIN_ROOM_PARTICIPANTS,
      value ?? MAX_ROOM_PARTICIPANTS,
    ),
  );
}

function uniqueUserIds(
  values: unknown,
): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map(clean)
        .filter(Boolean),
    ),
  ];
}

function createDefaultRoomControls(): RoomControls {
  return {
    cameraEnabled: true,
    microphoneEnabled: true,
    screenShareEnabled: true,

    disabledCameraUserIds: [],
    disabledMicrophoneUserIds: [],
    disabledScreenShareUserIds: [],
  };
}

function normalizeRoomControls(
  controls?: Partial<RoomControls>,
): RoomControls {
  return {
    cameraEnabled:
      controls?.cameraEnabled !== false,

    microphoneEnabled:
      controls?.microphoneEnabled !== false,

    screenShareEnabled:
      controls?.screenShareEnabled !== false,

    disabledCameraUserIds:
      uniqueUserIds(
        controls?.disabledCameraUserIds,
      ),

    disabledMicrophoneUserIds:
      uniqueUserIds(
        controls?.disabledMicrophoneUserIds,
      ),

    disabledScreenShareUserIds:
      uniqueUserIds(
        controls?.disabledScreenShareUserIds,
      ),
  };
}

function isGenderAllowed(
  roomGender: RoomGender,
  userGender?: AvatarGender,
): boolean {
  if (roomGender === "mixed") {
    return true;
  }

  if (!userGender) {
    return false;
  }

  if (roomGender === "girls") {
    return userGender === "girl";
  }

  if (roomGender === "boys") {
    return userGender === "boy";
  }

  return false;
}

/**
 * Removes a participant from every individual
 * permission-denial list.
 *
 * This prevents stale permissions from remaining
 * after a user leaves and later joins another room
 * or is transferred into a different role.
 */
function removeParticipantFromDisabledLists(
  controls: RoomControls,
  userId: string,
): RoomControls {
  const normalizedUserId =
    clean(userId);

  return {
    ...controls,

    disabledCameraUserIds:
      controls.disabledCameraUserIds.filter(
        (id) =>
          id !== normalizedUserId,
      ),

    disabledMicrophoneUserIds:
      controls.disabledMicrophoneUserIds.filter(
        (id) =>
          id !== normalizedUserId,
      ),

    disabledScreenShareUserIds:
      controls.disabledScreenShareUserIds.filter(
        (id) =>
          id !== normalizedUserId,
      ),
  };
}

/**
 * Ensures the current host is not individually
 * blocked by a stale participant-specific rule.
 *
 * Global room restrictions are intentionally preserved.
 */
function normalizeHostControls(
  controls: RoomControls,
  hostId: string,
): RoomControls {
  return removeParticipantFromDisabledLists(
    controls,
    hostId,
  );
}

// ======================================================
// ROOM CREATION
// ======================================================

export function createRoom(
  input: RoomInput,
): Room {
  const timestamp =
    new Date().toISOString();

  const hostId =
    clean(input.hostId);

  return {
    id: createId(),

    title: clean(input.title),

    language: clean(input.language),

    level: input.level,

    topic: clean(input.topic),

    type: input.type,

    gender: input.gender,

    hostId,

    participantIds:
      hostId
        ? [hostId]
        : [],

    maxParticipants:
      normalizeMaxParticipants(
        input.maxParticipants,
      ),

    status: "waiting",

    createdAt: timestamp,

    controls:
      createDefaultRoomControls(),
  };
}

// ======================================================
// ROOM NORMALIZATION
// ======================================================

export function normalizeRoom(
  room: Room,
): Room {
  const participants =
    uniqueUserIds(
      room.participantIds,
    );

  let hostId =
    clean(room.hostId);

  /**
   * A room must never have a host who is not
   * currently a participant.
   *
   * If possible, use the first participant
   * as the safe fallback host.
   */
  if (
    !hostId ||
    !participants.includes(hostId)
  ) {
    hostId =
      participants[0] ?? "";
  }

  const controls =
    normalizeRoomControls(
      room.controls,
    );

  return {
    ...room,

    id:
      clean(room.id) ||
      createId(),

    title:
      clean(room.title),

    language:
      clean(room.language),

    topic:
      clean(room.topic),

    hostId,

    participantIds:
      participants,

    maxParticipants:
      normalizeMaxParticipants(
        room.maxParticipants,
      ),

    controls:
      normalizeHostControls(
        controls,
        hostId,
      ),
  };
}

// ======================================================
// ROOM CAPACITY
// ======================================================

export function isRoomFull(
  room: Room,
): boolean {
  return (
    room.participantIds.length >=
    room.maxParticipants
  );
}

// ======================================================
// JOIN PERMISSION
// ======================================================

export function canJoinRoom(
  room: Room,
  userId: string,
  userGender?: AvatarGender,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (!normalizedUserId) {
    return false;
  }

  if (room.status === "ended") {
    return false;
  }

  if (
    room.participantIds.includes(
      normalizedUserId,
    )
  ) {
    return true;
  }

  if (
    !isGenderAllowed(
      room.gender,
      userGender,
    )
  ) {
    return false;
  }

  return !isRoomFull(room);
}

// ======================================================
// JOIN ROOM
// ======================================================

export function joinRoom(
  room: Room,
  userId: string,
  userGender?: AvatarGender,
): Room {
  const normalizedId =
    clean(userId);

  if (
    !canJoinRoom(
      room,
      normalizedId,
      userGender,
    )
  ) {
    return room;
  }

  if (
    room.participantIds.includes(
      normalizedId,
    )
  ) {
    return room;
  }

  const participants = [
    ...room.participantIds,
    normalizedId,
  ];

  const roomWithParticipant: Room = {
    ...room,

    participantIds:
      participants,
  };

  if (
    room.status === "waiting"
  ) {
    return setRoomStatus(
      roomWithParticipant,
      "active",
    );
  }

  return roomWithParticipant;
}

// ======================================================
// LEAVE ROOM
// ======================================================

export function leaveRoom(
  room: Room,
  userId: string,
): Room {
  const normalizedId =
    clean(userId);

  if (!normalizedId) {
    return room;
  }

  if (
    !room.participantIds.includes(
      normalizedId,
    )
  ) {
    return room;
  }

  const participants =
    room.participantIds.filter(
      (id) =>
        id !== normalizedId,
    );

  const cleanedControls =
    removeParticipantFromDisabledLists(
      normalizeRoomControls(
        room.controls,
      ),
      normalizedId,
    );

  /**
   * Nobody remains.
   *
   * The room is permanently ended.
   */
  if (participants.length === 0) {
    const updatedRoom: Room = {
      ...room,

      participantIds: [],

      hostId: "",

      controls:
        cleanedControls,
    };

    return setRoomStatus(
      updatedRoom,
      "ended",
    );
  }

  /**
   * SECURITY / OWNERSHIP RULE:
   *
   * If the current host leaves while other
   * participants remain, ownership is transferred
   * immediately to the first remaining participant.
   *
   * This guarantees that an active room never
   * remains without a host.
   */
  const hostLeft =
    normalizedId === room.hostId;

  const nextHostId =
    hostLeft
      ? participants[0]
      : room.hostId;

  const updatedRoom: Room = {
    ...room,

    participantIds:
      participants,

    hostId:
      nextHostId,

    controls:
      normalizeHostControls(
        cleanedControls,
        nextHostId,
      ),
  };

  return updatedRoom;
}

// ======================================================
// END ROOM
// ======================================================

export function endRoom(
  room: Room,
  requesterId: string,
): Room {
  const normalizedRequesterId =
    clean(requesterId);

  if (
    !normalizedRequesterId ||
    normalizedRequesterId !==
      room.hostId
  ) {
    return room;
  }

  return setRoomStatus(
    room,
    "ended",
  );
}

// ======================================================
// OWNER / HOST CHECK
// ======================================================

export function isRoomHost(
  room: Room,
  requesterId: string,
): boolean {
  const normalizedRequesterId =
    clean(requesterId);

  return (
    normalizedRequesterId.length > 0 &&
    normalizedRequesterId ===
      room.hostId &&
    room.participantIds.includes(
      normalizedRequesterId,
    )
  );
}

// ======================================================
// GLOBAL CAMERA CONTROL
// ======================================================

export function setRoomCameraEnabled(
  room: Room,
  requesterId: string,
  enabled: boolean,
): Room {
  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return room;
  }

  return {
    ...room,

    controls: {
      ...normalizeRoomControls(
        room.controls,
      ),

      cameraEnabled:
        enabled,
    },
  };
}

// ======================================================
// GLOBAL MICROPHONE CONTROL
// ======================================================

export function setRoomMicrophoneEnabled(
  room: Room,
  requesterId: string,
  enabled: boolean,
): Room {
  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return room;
  }

  return {
    ...room,

    controls: {
      ...normalizeRoomControls(
        room.controls,
      ),

      microphoneEnabled:
        enabled,
    },
  };
}

// ======================================================
// GLOBAL SCREEN SHARE CONTROL
// ======================================================

export function setRoomScreenShareEnabled(
  room: Room,
  requesterId: string,
  enabled: boolean,
): Room {
  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return room;
  }

  return {
    ...room,

    controls: {
      ...normalizeRoomControls(
        room.controls,
      ),

      screenShareEnabled:
        enabled,
    },
  };
}

// ======================================================
// INDIVIDUAL CAMERA CONTROL
// ======================================================

export function setParticipantCameraEnabled(
  room: Room,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room {
  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return room;
  }

  const normalizedParticipantId =
    clean(participantId);

  if (
    !normalizedParticipantId ||
    !room.participantIds.includes(
      normalizedParticipantId,
    )
  ) {
    return room;
  }

  const controls =
    normalizeRoomControls(
      room.controls,
    );

  const disabled =
    new Set(
      controls.disabledCameraUserIds,
    );

  if (enabled) {
    disabled.delete(
      normalizedParticipantId,
    );
  } else {
    disabled.add(
      normalizedParticipantId,
    );
  }

  return {
    ...room,

    controls: {
      ...controls,

      disabledCameraUserIds:
        [...disabled],
    },
  };
}

// ======================================================
// INDIVIDUAL MICROPHONE CONTROL
// ======================================================

export function setParticipantMicrophoneEnabled(
  room: Room,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room {
  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return room;
  }

  const normalizedParticipantId =
    clean(participantId);

  if (
    !normalizedParticipantId ||
    !room.participantIds.includes(
      normalizedParticipantId,
    )
  ) {
    return room;
  }

  const controls =
    normalizeRoomControls(
      room.controls,
    );

  const disabled =
    new Set(
      controls.disabledMicrophoneUserIds,
    );

  if (enabled) {
    disabled.delete(
      normalizedParticipantId,
    );
  } else {
    disabled.add(
      normalizedParticipantId,
    );
  }

  return {
    ...room,

    controls: {
      ...controls,

      disabledMicrophoneUserIds:
        [...disabled],
    },
  };
}

// ======================================================
// INDIVIDUAL SCREEN SHARE CONTROL
// ======================================================

export function setParticipantScreenShareEnabled(
  room: Room,
  requesterId: string,
  participantId: string,
  enabled: boolean,
): Room {
  if (
    !isRoomHost(
      room,
      requesterId,
    )
  ) {
    return room;
  }

  const normalizedParticipantId =
    clean(participantId);

  if (
    !normalizedParticipantId ||
    !room.participantIds.includes(
      normalizedParticipantId,
    )
  ) {
    return room;
  }

  const controls =
    normalizeRoomControls(
      room.controls,
    );

  const disabled =
    new Set(
      controls.disabledScreenShareUserIds,
    );

  if (enabled) {
    disabled.delete(
      normalizedParticipantId,
    );
  } else {
    disabled.add(
      normalizedParticipantId,
    );
  }

  return {
    ...room,

    controls: {
      ...controls,

      disabledScreenShareUserIds:
        [...disabled],
    },
  };
}

// ======================================================
// INTERNAL PARTICIPANT CHECK
// ======================================================

function isRoomParticipant(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  return (
    normalizedUserId.length > 0 &&
    room.status !== "ended" &&
    room.participantIds.includes(
      normalizedUserId,
    )
  );
}

// ======================================================
// CHECK CAMERA ACCESS
// ======================================================

export function canUseRoomCamera(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (
    !isRoomParticipant(
      room,
      normalizedUserId,
    )
  ) {
    return false;
  }

  if (
    !room.controls.cameraEnabled
  ) {
    return false;
  }

  if (
    room.controls
      .disabledCameraUserIds
      .includes(
        normalizedUserId,
      )
  ) {
    return false;
  }

  return true;
}

// ======================================================
// CHECK MICROPHONE ACCESS
// ======================================================

export function canUseRoomMicrophone(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (
    !isRoomParticipant(
      room,
      normalizedUserId,
    )
  ) {
    return false;
  }

  if (
    !room.controls
      .microphoneEnabled
  ) {
    return false;
  }

  if (
    room.controls
      .disabledMicrophoneUserIds
      .includes(
        normalizedUserId,
      )
  ) {
    return false;
  }

  return true;
}

// ======================================================
// CHECK SCREEN SHARE ACCESS
// ======================================================

export function canUseRoomScreenShare(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (
    !isRoomParticipant(
      room,
      normalizedUserId,
    )
  ) {
    return false;
  }

  if (
    !room.controls
      .screenShareEnabled
  ) {
    return false;
  }

  if (
    room.controls
      .disabledScreenShareUserIds
      .includes(
        normalizedUserId,
      )
  ) {
    return false;
  }

  return true;
}

// ======================================================
// MEDIA PERMISSIONS
// ======================================================

/**
 * Returns all media permissions for a participant.
 *
 * This is the bridge between the room permission
 * model and the actual PeerJS media enforcement layer.
 *
 * peer.ts should use these values to call:
 *
 * applyLocalCameraPermission(...)
 * applyLocalMicrophonePermission(...)
 * applyLocalScreenSharePermission(...)
 */
export function getRoomMediaPermissions(
  room: Room,
  userId: string,
): RoomMediaPermissions {
  return {
    camera:
      canUseRoomCamera(
        room,
        userId,
      ),

    microphone:
      canUseRoomMicrophone(
        room,
        userId,
      ),

    screenShare:
      canUseRoomScreenShare(
        room,
        userId,
      ),
  };
}

// ======================================================
// GET ACTIVE ROOMS
// ======================================================

export function getActiveRooms(
  rooms: Room[],
): Room[] {
  return rooms
    .filter(
      (room) =>
        room.status !== "ended",
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}

// ======================================================
// GET ROOMS BY LEVEL
// ======================================================

export function getRoomsByLevel(
  rooms: Room[],
  level: Level,
): Room[] {
  return getActiveRooms(
    rooms,
  ).filter(
    (room) =>
      room.level === level,
  );
}

// ======================================================
// GET ROOMS BY LANGUAGE
// ======================================================

export function getRoomsByLanguage(
  rooms: Room[],
  language: string,
): Room[] {
  const normalized =
    clean(language).toLowerCase();

  return getActiveRooms(
    rooms,
  ).filter(
    (room) =>
      room.language
        .toLowerCase() ===
      normalized,
  );
}

// ======================================================
// GET ROOMS BY HOST
// ======================================================

export function getRoomsByHost(
  rooms: Room[],
  hostId: string,
): Room[] {
  const normalizedHostId =
    clean(hostId);

  return rooms.filter(
    (room) =>
      room.hostId ===
      normalizedHostId,
  );
}

// ======================================================
// PARTICIPANT COUNT
// ======================================================

export function getRoomParticipantCount(
  room: Room,
): number {
  return room.participantIds.length;
}

// ======================================================
// VALIDATE ROOM INPUT
// ======================================================

export function validateRoomInput(
  input: RoomInput,
): string[] {
  const errors: string[] = [];

  if (!clean(input.title)) {
    errors.push(
      "Room title is required.",
    );
  }

  if (!clean(input.language)) {
    errors.push(
      "Room language is required.",
    );
  }

  if (!clean(input.topic)) {
    errors.push(
      "Room topic is required.",
    );
  }

  if (!clean(input.hostId)) {
    errors.push(
      "Room host is required.",
    );
  }

  if (
    input.maxParticipants !==
      undefined &&
    (
      input.maxParticipants <
        MIN_ROOM_PARTICIPANTS ||
      input.maxParticipants >
        MAX_ROOM_PARTICIPANTS
    )
  ) {
    errors.push(
      `Room size must be between ${MIN_ROOM_PARTICIPANTS} and ${MAX_ROOM_PARTICIPANTS} participants.`,
    );
  }

  return errors;
}

// ======================================================
// SECURITY NOTE
// ======================================================

/**
 * IMPORTANT:
 *
 * This module runs on the client.
 *
 * localStorage and PeerJS control messages are NOT
 * a trusted security boundary.
 *
 * These checks protect the normal application flow,
 * but a malicious client could modify local state
 * or send forged PeerJS messages.
 *
 * Production security must later enforce:
 *
 * 1. Host authorization on a trusted backend/Firebase.
 * 2. Participant membership on the server.
 * 3. Room capacity on the server.
 * 4. Gender-room restrictions on trusted user data.
 * 5. Host/media-control authorization on the server.
 * 6. Server validation of room-control changes.
 *
 * peer.ts remains responsible for enforcing the actual
 * local media state after an authorized control arrives.
 */