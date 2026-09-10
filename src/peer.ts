import Peer, {
  type DataConnection,
  type MediaConnection,
} from "peerjs";

export interface PeerRoomMember {
  peerId: string;
  userId?: string;
  name: string;

  connection?: MediaConnection;
  dataConnection?: DataConnection;

  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenShareEnabled: boolean;
}

export interface PeerRoomState {
  peer: Peer | null;

  localStream: MediaStream | null;
  screenStream: MediaStream | null;

  members: Map<string, PeerRoomMember>;

  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenShareEnabled: boolean;
}

const roomState: PeerRoomState = {
  peer: null,

  localStream: null,
  screenStream: null,

  members: new Map(),

  cameraEnabled: true,
  microphoneEnabled: true,
  screenShareEnabled: true,
};

let currentRoomId = "";
let currentUserId = "";

let incomingCallsHandlerRegistered = false;
let incomingDataHandlerRegistered = false;

// ======================================================
// STATE
// ======================================================

export function getRoomState(): PeerRoomState {
  return roomState;
}

export function getCurrentRoomId(): string {
  return currentRoomId;
}

export function getCurrentUserId(): string {
  return currentUserId;
}

/**
 * Sets the local user's ID for the current room.
 */
export function setCurrentUserId(
  userId: string,
): void {
  currentUserId =
    userId.trim();
}

// ======================================================
// HELPERS
// ======================================================

function dispatch(
  eventName: string,
  detail?: unknown,
): void {
  window.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail,
      },
    ),
  );
}

function getMemberByPeerId(
  peerId: string,
): PeerRoomMember | undefined {
  return roomState.members.get(
    peerId,
  );
}

/**
 * In the current architecture the room ID is also
 * the Host's PeerJS ID.
 *
 * This is useful as a temporary client-side check.
 *
 * IMPORTANT:
 * PeerJS is not a real authorization boundary.
 * Final Host authorization must later be verified
 * by Firebase/backend.
 */
function isLikelyHostPeer(
  peerId: string,
): boolean {
  return (
    Boolean(currentRoomId) &&
    peerId === currentRoomId
  );
}

// ======================================================
// LOCAL MEDIA
// ======================================================

export async function requestLocalMedia(
  options: {
    video?: boolean;
    audio?: boolean;
  } = {},
): Promise<MediaStream> {
  const requestedVideo =
    options.video ?? true;

  const requestedAudio =
    options.audio ?? true;

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error(
      "Your browser does not support camera or microphone access.",
    );
  }

  const stream =
    await navigator.mediaDevices.getUserMedia({
      video:
        requestedVideo,

      audio:
        requestedAudio,
    });

  roomState.localStream =
    stream;

  enforceLocalMediaPermissions();

  return stream;
}

/**
 * Ensures a missing camera or microphone track can
 * be requested again after a permission is restored.
 */
export async function ensureLocalMediaForPermissions(
  options: {
    video?: boolean;
    audio?: boolean;
  } = {},
): Promise<MediaStream> {
  const needVideo =
    options.video === true &&
    roomState.cameraEnabled;

  const needAudio =
    options.audio === true &&
    roomState.microphoneEnabled;

  const existingStream =
    roomState.localStream;

  const hasVideo =
    Boolean(
      existingStream?.getVideoTracks()
        .length,
    );

  const hasAudio =
    Boolean(
      existingStream?.getAudioTracks()
        .length,
    );

  const needsVideo =
    needVideo &&
    !hasVideo;

  const needsAudio =
    needAudio &&
    !hasAudio;

  if (
    existingStream &&
    !needsVideo &&
    !needsAudio
  ) {
    enforceLocalMediaPermissions();

    return existingStream;
  }

  if (
    !needsVideo &&
    !needsAudio &&
    existingStream
  ) {
    enforceLocalMediaPermissions();

    return existingStream;
  }

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error(
      "Your browser does not support camera or microphone access.",
    );
  }

  const newStream =
    await navigator.mediaDevices.getUserMedia({
      video:
        needsVideo,

      audio:
        needsAudio,
    });

  if (!roomState.localStream) {
    roomState.localStream =
      newStream;
  } else {
    for (
      const track of newStream.getTracks()
    ) {
      roomState.localStream.addTrack(
        track,
      );
    }
  }

  enforceLocalMediaPermissions();

  if (
    roomState.cameraEnabled &&
    needsVideo
  ) {
    const cameraTrack =
      roomState.localStream
        ?.getVideoTracks()[0];

    if (
      cameraTrack &&
      !roomState.screenStream
    ) {
      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    }
  }

  return roomState.localStream;
}

// ======================================================
// ENFORCE LOCAL MEDIA PERMISSIONS
// ======================================================

/**
 * Applies the current local permission state.
 *
 * Camera:
 * - disables local camera tracks when denied
 * - removes outgoing video when denied
 * - restores camera when permission returns
 *
 * Microphone:
 * - enables/disables local audio tracks
 *
 * Screen share:
 * - stops the display capture when denied
 */
export function enforceLocalMediaPermissions(): void {
  const localStream =
    roomState.localStream;

  if (localStream) {
    const cameraTracks =
      localStream.getVideoTracks();

    for (
      const track of cameraTracks
    ) {
      track.enabled =
        roomState.cameraEnabled;
    }

    const microphoneTracks =
      localStream.getAudioTracks();

    for (
      const track of microphoneTracks
    ) {
      track.enabled =
        roomState.microphoneEnabled;
    }
  }

  if (
    !roomState.cameraEnabled
  ) {
    removeOutgoingVideoTrack();
  } else if (
    !roomState.screenStream
  ) {
    const cameraTrack =
      roomState.localStream
        ?.getVideoTracks()[0];

    if (cameraTrack) {
      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    }
  }

  if (
    !roomState.screenShareEnabled &&
    roomState.screenStream
  ) {
    stopScreenShare();
  }
}

// ======================================================
// OUTGOING MEDIA STREAM
// ======================================================

function getOutgoingStream(): MediaStream {
  const stream =
    new MediaStream();

  const localStream =
    roomState.localStream;

  const screenStream =
    roomState.screenStream;

  // ----------------------------------------------------
  // MICROPHONE
  // ----------------------------------------------------

  if (localStream) {
    const audioTracks =
      localStream.getAudioTracks();

    for (
      const track of audioTracks
    ) {
      if (
        roomState.microphoneEnabled
      ) {
        stream.addTrack(
          track,
        );
      }
    }
  }

  // ----------------------------------------------------
  // SCREEN SHARE
  // ----------------------------------------------------

  if (
    screenStream &&
    roomState.screenShareEnabled
  ) {
    const screenVideoTrack =
      screenStream.getVideoTracks()[0];

    if (screenVideoTrack) {
      stream.addTrack(
        screenVideoTrack,
      );
    }

    const screenAudioTracks =
      screenStream.getAudioTracks();

    for (
      const track of screenAudioTracks
    ) {
      stream.addTrack(
        track,
      );
    }

    return stream;
  }

  // ----------------------------------------------------
  // CAMERA
  // ----------------------------------------------------

  if (
    localStream &&
    roomState.cameraEnabled
  ) {
    const cameraTrack =
      localStream.getVideoTracks()[0];

    if (cameraTrack) {
      stream.addTrack(
        cameraTrack,
      );
    }
  }

  return stream;
}

// ======================================================
// PEER
// ======================================================

export async function startPeer(
  peerId?: string,
): Promise<string> {
  if (roomState.peer) {
    return roomState.peer.id;
  }

  const peer =
    peerId
      ? new Peer(peerId)
      : new Peer();

  roomState.peer =
    peer;

  registerIncomingDataHandler(
    peer,
  );

  return new Promise(
    (resolve, reject) => {
      let settled = false;

      peer.on(
        "open",
        (id) => {
          if (settled) {
            return;
          }

          settled = true;

          resolve(id);
        },
      );

      peer.on(
        "error",
        (error) => {
          console.error(
            "PeerJS error:",
            error,
          );

          if (!settled) {
            settled = true;

            reject(error);
          }
        },
      );
    },
  );
}

// ======================================================
// CREATE ROOM
// ======================================================

export async function createRoom(
  roomName: string,
): Promise<string> {
  const normalized =
    roomName
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-]/g,
        "-",
      )
      .replace(
        /-+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      );

  const suffix =
    Math.random()
      .toString(36)
      .slice(2, 7);

  const roomId =
    `${
      normalized || "room"
    }-${suffix}`;

  await startPeer(
    roomId,
  );

  currentRoomId =
    roomId;

  registerIncomingCallsHandler(
    "",
  );

  return roomId;
}

// ======================================================
// JOIN ROOM
// ======================================================

export async function joinRoom(
  roomId: string,
  localName: string,
): Promise<void> {
  const normalizedRoomId =
    roomId.trim();

  if (!normalizedRoomId) {
    throw new Error(
      "Please enter a room ID.",
    );
  }

  await startPeer();

  currentRoomId =
    normalizedRoomId;

  if (!roomState.peer) {
    throw new Error(
      "Unable to initialize the room connection.",
    );
  }

  // ----------------------------------------------------
  // LOCAL MEDIA
  // ----------------------------------------------------

  await ensureLocalMediaForPermissions({
    video:
      roomState.cameraEnabled,

    audio:
      roomState.microphoneEnabled,
  });

  enforceLocalMediaPermissions();

  // ----------------------------------------------------
  // DATA CONNECTION
  // ----------------------------------------------------

  const dataConnection =
    roomState.peer.connect(
      currentRoomId,
      {
        metadata: {
          name:
            localName,

          userId:
            currentUserId,
        },

        reliable: true,
      },
    );

  registerDataConnection(
    dataConnection,
    currentRoomId,
    localName,
    currentUserId ||
      undefined,
  );

  // ----------------------------------------------------
  // MEDIA CONNECTION
  // ----------------------------------------------------

  const outgoingStream =
    getOutgoingStream();

  const connection =
    roomState.peer.call(
      currentRoomId,
      outgoingStream,
      {
        metadata: {
          name:
            localName,

          userId:
            currentUserId,

          screenSharing:
            roomState.screenStream !==
            null,
        },
      },
    );

  if (connection) {
    registerMediaConnection(
      connection,
      currentRoomId,
      localName,
      currentUserId ||
        undefined,
    );
  }
}

// ======================================================
// INCOMING DATA CONNECTIONS
// ======================================================

function registerIncomingDataHandler(
  peer: Peer,
): void {
  if (
    incomingDataHandlerRegistered
  ) {
    return;
  }

  incomingDataHandlerRegistered =
    true;

  peer.on(
    "connection",
    (connection) => {
      const metadata =
        connection.metadata;

      const name =
        typeof metadata
          ?.name === "string"
          ? metadata.name
          : "Learner";

      const userId =
        typeof metadata
          ?.userId === "string"
          ? metadata.userId
          : undefined;

      registerDataConnection(
        connection,
        connection.peer,
        name,
        userId,
      );
    },
  );
}

// ======================================================
// DATA CONNECTION
// ======================================================

function registerDataConnection(
  connection: DataConnection,
  peerId: string,
  name: string,
  userId?: string,
): void {
  let member =
    roomState.members.get(
      peerId,
    );

  if (!member) {
    member = {
      peerId,
      userId,
      name,

      dataConnection:
        connection,

      cameraEnabled:
        true,

      microphoneEnabled:
        true,

      screenShareEnabled:
        true,
    };

    roomState.members.set(
      peerId,
      member,
    );
  } else {
    member.dataConnection =
      connection;

    if (userId) {
      member.userId =
        userId;
    }

    if (name) {
      member.name =
        name;
    }
  }

  connection.on(
    "data",
    (data) => {
      handleControlMessage(
        peerId,
        data,
      );
    },
  );

  connection.on(
    "close",
    () => {
      const current =
        roomState.members.get(
          peerId,
        );

      if (
        current?.dataConnection ===
        connection
      ) {
        current.dataConnection =
          undefined;
      }
    },
  );

  connection.on(
    "error",
    (error) => {
      console.error(
        "Data connection error:",
        error,
      );
    },
  );

  const sendInitialState =
    () => {
      if (
        !connection.open
      ) {
        return;
      }

      try {
        connection.send({
          type:
            "initial-permissions",

          cameraEnabled:
            roomState.cameraEnabled,

          microphoneEnabled:
            roomState.microphoneEnabled,

          screenShareEnabled:
            roomState.screenShareEnabled,
        });
      } catch (error) {
        console.error(
          "Unable to send initial room permissions:",
          error,
        );
      }
    };

  if (connection.open) {
    sendInitialState();
  } else {
    connection.on(
      "open",
      sendInitialState,
    );
  }
}

// ======================================================
// ANSWER INCOMING CALLS
// ======================================================

export function answerIncomingCalls(
  localName: string,
): void {
  if (
    !roomState.peer ||
    incomingCallsHandlerRegistered
  ) {
    return;
  }

  registerIncomingCallsHandler(
    localName,
  );
}

function registerIncomingCallsHandler(
  localName: string,
): void {
  if (
    !roomState.peer ||
    incomingCallsHandlerRegistered
  ) {
    return;
  }

  incomingCallsHandlerRegistered =
    true;

  roomState.peer.on(
    "call",
    async (call) => {
      try {
        const metadata =
          call.metadata;

        const remoteName =
          typeof metadata
            ?.name === "string"
            ? metadata.name
            : localName ||
              "Learner";

        const remoteUserId =
          typeof metadata
            ?.userId === "string"
            ? metadata.userId
            : undefined;

        await ensureLocalMediaForPermissions({
          video:
            roomState.cameraEnabled,

          audio:
            roomState.microphoneEnabled,
        });

        enforceLocalMediaPermissions();

        const outgoingStream =
          getOutgoingStream();

        call.answer(
          outgoingStream,
        );

        registerMediaConnection(
          call,
          call.peer,
          remoteName,
          remoteUserId,
        );
      } catch (error) {
        console.error(
          "Unable to answer media call:",
          error,
        );
      }
    },
  );
}

// ======================================================
// MEDIA CONNECTION
// ======================================================

function registerMediaConnection(
  connection: MediaConnection,
  peerId: string,
  name: string,
  userId?: string,
): void {
  let member =
    roomState.members.get(
      peerId,
    );

  if (!member) {
    member = {
      peerId,
      userId,
      name,

      connection,

      cameraEnabled:
        true,

      microphoneEnabled:
        true,

      screenShareEnabled:
        true,
    };

    roomState.members.set(
      peerId,
      member,
    );
  } else {
    member.connection =
      connection;

    if (userId) {
      member.userId =
        userId;
    }

    if (name) {
      member.name =
        name;
    }
  }

  connection.on(
    "stream",
    (remoteStream) => {
      dispatch(
        "dre2learn:remote-stream",
        {
          peerId,
          userId:
            member?.userId,
          stream:
            remoteStream,
          name:
            member?.name ??
            name,
        },
      );
    },
  );

  connection.on(
    "close",
    () => {
      const current =
        roomState.members.get(
          peerId,
        );

      if (
        current?.connection ===
        connection
      ) {
        current.connection =
          undefined;
      }

      const currentMember =
        roomState.members.get(
          peerId,
        );

      if (
        !currentMember?.connection &&
        !currentMember?.dataConnection
      ) {
        roomState.members.delete(
          peerId,
        );

        dispatch(
          "dre2learn:member-left",
          {
            peerId,
            userId,
          },
        );
      }
    },
  );

  connection.on(
    "error",
    (error) => {
      console.error(
        "Media connection error:",
        error,
      );
    },
  );

  if (
    roomState.screenStream
  ) {
    sendCurrentScreenToConnection(
      connection,
    );
  }
}

// ======================================================
// CONTROL MESSAGE TYPES
// ======================================================

type RoomControlMessage =
  | {
      type:
        | "camera"
        | "room-camera";

      enabled: boolean;
    }
  | {
      type:
        | "microphone"
        | "room-microphone";

      enabled: boolean;
    }
  | {
      type:
        | "screen-share"
        | "room-screen-share";

      enabled: boolean;
    }
  | {
      type:
        "force-stop-screen-share";
    }
  | {
      type:
        "initial-permissions";

      cameraEnabled: boolean;
      microphoneEnabled: boolean;
      screenShareEnabled: boolean;
    };

// ======================================================
// CONTROL MESSAGE HANDLER
// ======================================================

function handleControlMessage(
  peerId: string,
  data: unknown,
): void {
  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return;
  }

  /**
   * Temporary client-side Host check.
   *
   * The room ID is currently also the Host's
   * PeerJS ID.
   *
   * This prevents an arbitrary participant from
   * sending normal permission commands and having
   * them automatically accepted.
   */
  const trustedHost =
    isLikelyHostPeer(
      peerId,
    );

  const message =
    data as Partial<RoomControlMessage>;

  switch (
    message.type
  ) {
    // --------------------------------------------------
    // INITIAL PERMISSIONS
    // --------------------------------------------------

    case "initial-permissions": {
      if (!trustedHost) {
        return;
      }

      const cameraEnabled =
        message.cameraEnabled !==
        false;

      const microphoneEnabled =
        message.microphoneEnabled !==
        false;

      const screenShareEnabled =
        message.screenShareEnabled !==
        false;

      applyLocalCameraPermission(
        cameraEnabled,
      );

      applyLocalMicrophonePermission(
        microphoneEnabled,
      );

      applyLocalScreenSharePermission(
        screenShareEnabled,
      );

      break;
    }

    // --------------------------------------------------
    // INDIVIDUAL CAMERA
    // --------------------------------------------------

    case "camera": {
      if (!trustedHost) {
        return;
      }

      const enabled =
        message.enabled !==
        false;

      applyLocalCameraPermission(
        enabled,
      );

      break;
    }

    // --------------------------------------------------
    // ROOM CAMERA
    // --------------------------------------------------

    case "room-camera": {
      if (!trustedHost) {
        return;
      }

      const enabled =
        message.enabled !==
        false;

      applyLocalCameraPermission(
        enabled,
      );

      break;
    }

    // --------------------------------------------------
    // INDIVIDUAL MICROPHONE
    // --------------------------------------------------

    case "microphone": {
      if (!trustedHost) {
        return;
      }

      const enabled =
        message.enabled !==
        false;

      applyLocalMicrophonePermission(
        enabled,
      );

      break;
    }

    // --------------------------------------------------
    // ROOM MICROPHONE
    // --------------------------------------------------

    case "room-microphone": {
      if (!trustedHost) {
        return;
      }

      const enabled =
        message.enabled !==
        false;

      applyLocalMicrophonePermission(
        enabled,
      );

      break;
    }

    // --------------------------------------------------
    // INDIVIDUAL SCREEN SHARE
    // --------------------------------------------------

    case "screen-share": {
      if (!trustedHost) {
        return;
      }

      const enabled =
        message.enabled !==
        false;

      applyLocalScreenSharePermission(
        enabled,
      );

      break;
    }

    // --------------------------------------------------
    // ROOM SCREEN SHARE
    // --------------------------------------------------

    case "room-screen-share": {
      if (!trustedHost) {
        return;
      }

      const enabled =
        message.enabled !==
        false;

      applyLocalScreenSharePermission(
        enabled,
      );

      break;
    }

    // --------------------------------------------------
    // FORCE STOP SCREEN SHARE
    // --------------------------------------------------

    case "force-stop-screen-share": {
      if (!trustedHost) {
        return;
      }

      if (
        roomState.screenStream
      ) {
        stopScreenShare();
      }

      break;
    }

    default:
      break;
  }
}

// ======================================================
// LOCAL CAMERA PERMISSION
// ======================================================

export function applyLocalCameraPermission(
  enabled: boolean,
): void {
  roomState.cameraEnabled =
    enabled;

  const cameraTracks =
    roomState.localStream
      ?.getVideoTracks() ??
    [];

  for (
    const track of cameraTracks
  ) {
    track.enabled =
      enabled;
  }

  if (!enabled) {
    removeOutgoingVideoTrack();
  } else if (
    !roomState.screenStream
  ) {
    const cameraTrack =
      roomState.localStream
        ?.getVideoTracks()[0];

    if (cameraTrack) {
      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    }
  }

  dispatch(
    "dre2learn:local-camera-permission",
    {
      enabled,
      roomId:
        currentRoomId,
    },
  );
}

// ======================================================
// LOCAL MICROPHONE PERMISSION
// ======================================================

export function applyLocalMicrophonePermission(
  enabled: boolean,
): void {
  roomState.microphoneEnabled =
    enabled;

  const microphoneTracks =
    roomState.localStream
      ?.getAudioTracks() ??
    [];

  for (
    const track of microphoneTracks
  ) {
    track.enabled =
      enabled;
  }

  dispatch(
    "dre2learn:local-microphone-permission",
    {
      enabled,
      roomId:
        currentRoomId,
    },
  );
}

// ======================================================
// LOCAL SCREEN SHARE PERMISSION
// ======================================================

export function applyLocalScreenSharePermission(
  enabled: boolean,
): void {
  roomState.screenShareEnabled =
    enabled;

  if (
    !enabled &&
    roomState.screenStream
  ) {
    stopScreenShare();
  }

  dispatch(
    "dre2learn:local-screen-share-permission",
    {
      enabled,
      roomId:
        currentRoomId,
    },
  );
}

// ======================================================
// LOCAL OWNER CONTROL
// ======================================================

export function setLocalCameraPermission(
  enabled: boolean,
): void {
  applyLocalCameraPermission(
    enabled,
  );

  broadcastControlMessage({
    type:
      "camera",

    enabled,
  });
}

export function setLocalMicrophonePermission(
  enabled: boolean,
): void {
  applyLocalMicrophonePermission(
    enabled,
  );

  broadcastControlMessage({
    type:
      "microphone",

    enabled,
  });
}

export function setLocalScreenSharePermission(
  enabled: boolean,
): void {
  applyLocalScreenSharePermission(
    enabled,
  );

  broadcastControlMessage({
    type:
      "screen-share",

    enabled,
  });
}

// ======================================================
// REMOTE MEMBER PERMISSION STATE
// ======================================================

function applyRemoteCameraPermission(
  peerId: string,
  enabled: boolean,
): void {
  const member =
    roomState.members.get(
      peerId,
    );

  if (!member) {
    return;
  }

  member.cameraEnabled =
    enabled;

  dispatch(
    "dre2learn:participant-camera-permission",
    {
      peerId,

      userId:
        member.userId,

      enabled,
    },
  );
}

function applyRemoteMicrophonePermission(
  peerId: string,
  enabled: boolean,
): void {
  const member =
    roomState.members.get(
      peerId,
    );

  if (!member) {
    return;
  }

  member.microphoneEnabled =
    enabled;

  dispatch(
    "dre2learn:participant-microphone-permission",
    {
      peerId,

      userId:
        member.userId,

      enabled,
    },
  );
}

function applyRemoteScreenSharePermission(
  peerId: string,
  enabled: boolean,
): void {
  const member =
    roomState.members.get(
      peerId,
    );

  if (!member) {
    return;
  }

  member.screenShareEnabled =
    enabled;

  dispatch(
    "dre2learn:participant-screen-share-permission",
    {
      peerId,

      userId:
        member.userId,

      enabled,
    },
  );
}

// ======================================================
// OWNER CONTROL — SEND TO PARTICIPANT
// ======================================================

export function sendCameraPermission(
  peerId: string,
  enabled: boolean,
): boolean {
  return sendControlMessage(
    peerId,
    {
      type:
        "camera",

      enabled,
    },
  );
}

export function sendMicrophonePermission(
  peerId: string,
  enabled: boolean,
): boolean {
  return sendControlMessage(
    peerId,
    {
      type:
        "microphone",

      enabled,
    },
  );
}

export function sendScreenSharePermission(
  peerId: string,
  enabled: boolean,
): boolean {
  return sendControlMessage(
    peerId,
    {
      type:
        "screen-share",

      enabled,
    },
  );
}

export function forceStopParticipantScreenShare(
  peerId: string,
): boolean {
  return sendControlMessage(
    peerId,
    {
      type:
        "force-stop-screen-share",
    },
  );
}

// ======================================================
// OWNER CONTROL — WHOLE ROOM
// ======================================================

export function sendRoomCameraPermission(
  enabled: boolean,
): void {
  roomState.cameraEnabled =
    enabled;

  broadcastControlMessage({
    type:
      "room-camera",

    enabled,
  });

  applyLocalCameraPermission(
    enabled,
  );
}

export function sendRoomMicrophonePermission(
  enabled: boolean,
): void {
  roomState.microphoneEnabled =
    enabled;

  broadcastControlMessage({
    type:
      "room-microphone",

    enabled,
  });

  applyLocalMicrophonePermission(
    enabled,
  );
}

export function sendRoomScreenSharePermission(
  enabled: boolean,
): void {
  roomState.screenShareEnabled =
    enabled;

  broadcastControlMessage({
    type:
      "room-screen-share",

    enabled,
  });

  applyLocalScreenSharePermission(
    enabled,
  );
}

// ======================================================
// SEND DATA CONTROL MESSAGE
// ======================================================

function sendControlMessage(
  peerId: string,
  message: RoomControlMessage,
): boolean {
  const member =
    roomState.members.get(
      peerId,
    );

  const connection =
    member?.dataConnection;

  if (!connection) {
    return false;
  }

  try {
    if (!connection.open) {
      return false;
    }

    connection.send(
      message,
    );

    return true;
  } catch (error) {
    console.error(
      "Unable to send room control:",
      error,
    );

    return false;
  }
}

function broadcastControlMessage(
  message: RoomControlMessage,
): void {
  for (
    const member of roomState.members.values()
  ) {
    const connection =
      member.dataConnection;

    if (
      !connection ||
      !connection.open
    ) {
      continue;
    }

    try {
      connection.send(
        message,
      );
    } catch (error) {
      console.error(
        "Unable to broadcast room control:",
        error,
      );
    }
  }
}

// ======================================================
// SEND CURRENT SCREEN TO NEW PARTICIPANT
// ======================================================

function sendCurrentScreenToConnection(
  connection: MediaConnection,
): void {
  const peerConnection =
    connection.peerConnection;

  if (!peerConnection) {
    return;
  }

  const screenStream =
    roomState.screenStream;

  if (
    !screenStream ||
    !roomState.screenShareEnabled
  ) {
    return;
  }

  const screenVideoTrack =
    screenStream.getVideoTracks()[0];

  if (screenVideoTrack) {
    const videoSender =
      peerConnection
        .getSenders()
        .find(
          (sender) =>
            sender.track?.kind ===
              "video" &&
            sender.track !==
              screenVideoTrack,
        );

    if (videoSender) {
      void videoSender
        .replaceTrack(
          screenVideoTrack,
        )
        .catch((error) => {
          console.error(
            "Unable to send screen video to new participant:",
            error,
          );
        });
    }
  }

  addScreenAudioTracksToConnection(
    connection,
  );
}

// ======================================================
// SCREEN SHARE
// ======================================================

export async function startScreenShare(): Promise<MediaStream> {
  if (
    !roomState.screenShareEnabled
  ) {
    throw new Error(
      "Screen sharing has been disabled by the room owner.",
    );
  }

  if (
    roomState.screenStream
  ) {
    return roomState.screenStream;
  }

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices
      .getDisplayMedia
  ) {
    throw new Error(
      "Screen sharing is not supported by this browser.",
    );
  }

  const screenStream =
    await navigator.mediaDevices.getDisplayMedia(
      {
        video: true,
        audio: true,
      },
    );

  // Permission may have changed while
  // the browser dialog was open.
  if (
    !roomState.screenShareEnabled
  ) {
    for (
      const track of screenStream.getTracks()
    ) {
      track.stop();
    }

    throw new Error(
      "Screen sharing has been disabled by the room owner.",
    );
  }

  roomState.screenStream =
    screenStream;

  const videoTrack =
    screenStream.getVideoTracks()[0];

  if (!videoTrack) {
    screenStream
      .getTracks()
      .forEach(
        (track) => {
          track.stop();
        },
      );

    roomState.screenStream =
      null;

    throw new Error(
      "No screen video track was provided.",
    );
  }

  videoTrack.addEventListener(
    "ended",
    handleScreenShareEnded,
    {
      once: true,
    },
  );

  replaceOutgoingVideoTrack(
    videoTrack,
  );

  addScreenAudioTracksToAllConnections();

  dispatch(
    "dre2learn:screen-share-started",
    {
      stream:
        screenStream,

      hasAudio:
        screenStream
          .getAudioTracks()
          .length > 0,

      roomId:
        currentRoomId,
    },
  );

  return screenStream;
}

// ======================================================
// ADD SCREEN AUDIO
// ======================================================

function addScreenAudioTracksToAllConnections(): void {
  for (
    const member of roomState.members.values()
  ) {
    addScreenAudioTracksToConnection(
      member.connection,
    );
  }
}

function addScreenAudioTracksToConnection(
  connection?: MediaConnection,
): void {
  if (!connection) {
    return;
  }

  const peerConnection =
    connection.peerConnection;

  const screenStream =
    roomState.screenStream;

  if (
    !peerConnection ||
    !screenStream
  ) {
    return;
  }

  const screenAudioTracks =
    screenStream.getAudioTracks();

  if (
    screenAudioTracks.length ===
    0
  ) {
    return;
  }

  const existingSenders =
    peerConnection.getSenders();

  for (
    const track of screenAudioTracks
  ) {
    const alreadySending =
      existingSenders.some(
        (sender) =>
          sender.track ===
          track,
      );

    if (
      alreadySending
    ) {
      continue;
    }

    try {
      peerConnection.addTrack(
        track,
        screenStream,
      );
    } catch (error) {
      console.error(
        "Unable to add screen audio track:",
        error,
      );
    }
  }
}

// ======================================================
// REPLACE OUTGOING VIDEO
// ======================================================

function replaceOutgoingVideoTrack(
  newTrack: MediaStreamTrack,
): void {
  for (
    const member of roomState.members.values()
  ) {
    const peerConnection =
      member.connection
        ?.peerConnection;

    if (!peerConnection) {
      continue;
    }

    const videoSender =
      peerConnection
        .getSenders()
        .find(
          (sender) =>
            sender.track?.kind ===
            "video",
        );

    if (!videoSender) {
      continue;
    }

    void videoSender
      .replaceTrack(
        newTrack,
      )
      .catch((error) => {
        console.error(
          "Unable to replace outgoing video track:",
          error,
        );
      });
  }
}

// ======================================================
// REMOVE OUTGOING VIDEO
// ======================================================

function removeOutgoingVideoTrack(): void {
  for (
    const member of roomState.members.values()
  ) {
    const peerConnection =
      member.connection
        ?.peerConnection;

    if (!peerConnection) {
      continue;
    }

    const videoSender =
      peerConnection
        .getSenders()
        .find(
          (sender) =>
            sender.track?.kind ===
            "video",
        );

    if (!videoSender) {
      continue;
    }

    void videoSender
      .replaceTrack(null)
      .catch((error) => {
        console.error(
          "Unable to disable outgoing video:",
          error,
        );
      });
  }
}

// ======================================================
// CAMERA TRACK
// ======================================================

function getCameraReplacementTrack():
  MediaStreamTrack {
  const cameraTrack =
    roomState.localStream
      ?.getVideoTracks()[0];

  if (!cameraTrack) {
    throw new Error(
      "Camera track is not available.",
    );
  }

  return cameraTrack;
}

// ======================================================
// STOP SCREEN SHARE
// ======================================================

export function stopScreenShare(): void {
  const stream =
    roomState.screenStream;

  if (!stream) {
    return;
  }

  const screenAudioTracks =
    stream.getAudioTracks();

  removeScreenAudioTracksFromAllConnections(
    screenAudioTracks,
  );

  for (
    const track of stream.getTracks()
  ) {
    track.removeEventListener(
      "ended",
      handleScreenShareEnded,
    );

    track.stop();
  }

  roomState.screenStream =
    null;

  // Restore camera only when the camera
  // permission is still active.
  if (
    roomState.cameraEnabled
  ) {
    const cameraTrack =
      roomState.localStream
        ?.getVideoTracks()[0];

    if (cameraTrack) {
      cameraTrack.enabled =
        true;

      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    } else {
      removeOutgoingVideoTrack();
    }
  } else {
    removeOutgoingVideoTrack();
  }

  dispatch(
    "dre2learn:screen-share-ended",
    {
      roomId:
        currentRoomId,
    },
  );
}

// ======================================================
// SCREEN SHARE ENDED BY BROWSER / OS
// ======================================================

function handleScreenShareEnded(): void {
  if (
    !roomState.screenStream
  ) {
    return;
  }

  stopScreenShare();
}

// ======================================================
// REMOVE SCREEN AUDIO
// ======================================================

function removeScreenAudioTracksFromAllConnections(
  screenAudioTracks: MediaStreamTrack[],
): void {
  for (
    const member of roomState.members.values()
  ) {
    const peerConnection =
      member.connection
        ?.peerConnection;

    if (!peerConnection) {
      continue;
    }

    const senders =
      peerConnection.getSenders();

    for (
      const sender of senders
    ) {
      if (
        sender.track &&
        screenAudioTracks.includes(
          sender.track,
        )
      ) {
        try {
          peerConnection.removeTrack(
            sender,
          );
        } catch (error) {
          console.error(
            "Unable to remove screen audio track:",
            error,
          );
        }
      }
    }
  }
}

// ======================================================
// MICROPHONE
// ======================================================

export function toggleMicrophone(
  enabled: boolean,
): void {
  /**
   * Permission is authoritative.
   */
  if (
    !roomState.microphoneEnabled
  ) {
    enabled = false;
  }

  const tracks =
    roomState.localStream
      ?.getAudioTracks() ??
    [];

  for (
    const track of tracks
  ) {
    track.enabled =
      enabled;
  }

  dispatch(
    "dre2learn:microphone-toggled",
    {
      enabled,
      roomId:
        currentRoomId,
    },
  );
}

// ======================================================
// CAMERA
// ======================================================

export function toggleCamera(
  enabled: boolean,
): void {
  /**
   * Permission is authoritative.
   */
  if (
    !roomState.cameraEnabled
  ) {
    enabled = false;
  }

  const tracks =
    roomState.localStream
      ?.getVideoTracks() ??
    [];

  for (
    const track of tracks
  ) {
    track.enabled =
      enabled;
  }

  if (!enabled) {
    removeOutgoingVideoTrack();
  } else if (
    !roomState.screenStream
  ) {
    const cameraTrack =
      roomState.localStream
        ?.getVideoTracks()[0];

    if (cameraTrack) {
      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    }
  }

  dispatch(
    "dre2learn:camera-toggled",
    {
      enabled,
      roomId:
        currentRoomId,
    },
  );
}

// ======================================================
// LEAVE ROOM
// ======================================================

export function leaveRoom(): void {
  // ----------------------------------------------------
  // CLOSE DATA CONNECTIONS
  // ----------------------------------------------------

  for (
    const member of roomState.members.values()
  ) {
    try {
      member.dataConnection?.close();
    } catch (error) {
      console.error(
        "Unable to close data connection:",
        error,
      );
    }
  }

  // ----------------------------------------------------
  // CLOSE MEDIA CONNECTIONS
  // ----------------------------------------------------

  for (
    const member of roomState.members.values()
  ) {
    try {
      member.connection?.close();
    } catch (error) {
      console.error(
        "Unable to close media connection:",
        error,
      );
    }
  }

  roomState.members.clear();

  // ----------------------------------------------------
  // STOP SCREEN SHARE
  // ----------------------------------------------------

  stopScreenShare();

  // ----------------------------------------------------
  // STOP LOCAL MEDIA
  // ----------------------------------------------------

  if (
    roomState.localStream
  ) {
    for (
      const track of roomState.localStream.getTracks()
    ) {
      track.stop();
    }

    roomState.localStream =
      null;
  }

  // ----------------------------------------------------
  // DESTROY PEER
  // ----------------------------------------------------

  if (roomState.peer) {
    try {
      roomState.peer.destroy();
    } catch (error) {
      console.error(
        "Unable to destroy PeerJS instance:",
        error,
      );
    }

    roomState.peer =
      null;
  }

  // ----------------------------------------------------
  // RESET STATE
  // ----------------------------------------------------

  currentRoomId =
    "";

  currentUserId =
    "";

  incomingCallsHandlerRegistered =
    false;

  incomingDataHandlerRegistered =
    false;

  roomState.cameraEnabled =
    true;

  roomState.microphoneEnabled =
    true;

  roomState.screenShareEnabled =
    true;

  dispatch(
    "dre2learn:room-left",
  );
}