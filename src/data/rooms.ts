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
  };
}

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
  };
}

export function isRoomFull(
  room: Room,
): boolean {
  return (
    room.participantIds.length >=
    room.maxParticipants
  );
}

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

  return {
    ...room,

    participantIds:
      participants,

    status:
      participants.length > 0
        ? "active"
        : room.status,

    startedAt:
      room.startedAt ??
      new Date().toISOString(),
  };
}

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

  return {
    ...room,

    participantIds:
      participants,

    status:
      participants.length === 0
        ? "ended"
        : room.status,

    endedAt:
      participants.length === 0
        ? new Date().toISOString()
        : room.endedAt,
  };
}

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

  if (room.status === "ended") {
    return room;
  }

  return {
    ...room,

    status: "ended",

    endedAt:
      new Date().toISOString(),
  };
}

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

export function getRoomParticipantCount(
  room: Room,
): number {
  return room.participantIds.length;
}

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


    
  
        

