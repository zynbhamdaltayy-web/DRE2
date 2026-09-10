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
 * Controls that the room owner can manage.
 *
 * Global controls affect everyone in the room.
 *
 * Individual controls can override access
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
  hostId: string;
  participantIds: string[];
  maxParticipants: number;
  status: RoomStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;

  /**
   * Owner-controlled room permissions.
   */
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

const MAX_ROOM_PARTICIPANTS = 8;
const MIN_ROOM_PARTICIPANTS = 2;

/**
 * Valid room status transitions.
 *
 * waiting → active
 * waiting → ended
 * active  → ended
 *
 * The same status is also allowed.
 *
 * Invalid transitions:
 * active → waiting
 * ended → waiting
 * ended → active
 */
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

/**
 * Checks whether a room can move
 * from one status to another.
 */
export function canTransitionRoomStatus(
  from: RoomStatus,
  to: RoomStatus,
): boolean {
  return ROOM_STATUS_TRANSITIONS[
    from
  ].includes(to);
}

/**
 * Safely changes a room status.
 *
 * If the requested transition is invalid,
 * the original room is returned unchanged.
 */
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

// ======================================================
// ROOM CREATION
// ======================================================

export function createRoom(
  input: RoomInput,
): Room {
  const timestamp =
    new Date().toISOString();

  return {
    id: createId(),

    title: clean(input.title),

    language: clean(input.language),

    level: input.level,

    topic: clean(input.topic),

    type: input.type,

    gender: input.gender,

    hostId: clean(input.hostId),

    participantIds: [
      clean(input.hostId),
    ].filter(Boolean),

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
  const participants = [
    ...new Set(
      (room.participantIds ?? [])
        .map(clean)
        .filter(Boolean),
    ),
  ];

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

    hostId:
      clean(room.hostId),

    participantIds:
      participants,

    maxParticipants:
      normalizeMaxParticipants(
        room.maxParticipants,
      ),

    controls:
      normalizeRoomControls(
        room.controls,
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

/**
 * Checks whether a user can join a room.
 *
 * Gender-specific rooms require the user's
 * actual avatar gender to be supplied.
 */
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

  const participants =
    room.participantIds.includes(
      normalizedId,
    )
      ? room.participantIds
      : [
          ...room.participantIds,
          normalizedId,
        ];

  const roomWithParticipant = {
    ...room,

    participantIds:
      participants,
  };

  /**
   * A room starts when its first
   * participant joins.
   *
   * Normally the host is already present,
   * so joining a newly created room changes
   * waiting → active.
   */
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

  const participants =
    room.participantIds.filter(
      (id) =>
        id !== normalizedId,
    );

  const updatedRoom = {
    ...room,

    participantIds:
      participants,
  };

  /**
   * When nobody remains, the room ends.
   *
   * This is a valid:
   * active → ended
   * transition.
   */
  if (
    participants.length === 0 &&
    room.status !== "ended"
  ) {
    return setRoomStatus(
      updatedRoom,
      "ended",
    );
  }

  return updatedRoom;
}

// ======================================================
// END ROOM
// ======================================================

/**
 * Ends a room only when the requester
 * is the room host.
 */
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
// OWNER PERMISSION CHECK
// ======================================================

/**
 * Returns true only when the requester
 * is the owner/host of the room.
 */
export function isRoomHost(
  room: Room,
  requesterId: string,
): boolean {
  const normalizedRequesterId =
    clean(requesterId);

  return (
    normalizedRequesterId.length > 0 &&
    normalizedRequesterId ===
      room.hostId
  );
}

// ======================================================
// GLOBAL CAMERA CONTROL
// ======================================================

/**
 * Owner enables or disables camera
 * access for the whole room.
 */
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

/**
 * Owner enables or disables microphone
 * access for the whole room.
 */
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

/**
 * Owner enables or disables screen sharing
 * for the whole room.
 */
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

/**
 * Owner can disable or enable camera
 * for one specific participant.
 */
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

/**
 * Owner can disable or enable microphone
 * for one specific participant.
 */
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

/**
 * Owner can disable or enable screen sharing
 * for one specific participant.
 */
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
// CHECK CAMERA ACCESS
// ======================================================

/**
 * Checks whether a participant currently
 * has permission to use the camera.
 */
export function canUseRoomCamera(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (!normalizedUserId) {
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

/**
 * Checks whether a participant currently
 * has permission to use the microphone.
 */
export function canUseRoomMicrophone(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (!normalizedUserId) {
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

/**
 * Checks whether a participant currently
 * has permission to share their screen.
 */
export function canUseRoomScreenShare(
  room: Room,
  userId: string,
): boolean {
  const normalizedUserId =
    clean(userId);

  if (!normalizedUserId) {
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