import Peer, {
  type MediaConnection,
} from "peerjs";

export interface PeerRoomMember {
  peerId: string;
  userId?: string;
  name: string;
  connection?: MediaConnection;

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
 *
 * This is used when the room sends control messages
 * to identify which participant must be affected.
 */
export function setCurrentUserId(
  userId: string,
): void {
  currentUserId =
    userId.trim();
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
        requestedVideo &&
        roomState.cameraEnabled,

      audio:
        requestedAudio &&
        roomState.microphoneEnabled,
    });

  roomState.localStream =
    stream;

  return stream;
}

// ======================================================
// OUTGOING STREAM
// ======================================================

function getOutgoingStream(): MediaStream | null {
  const stream =
    new MediaStream();

  const localStream =
    roomState.localStream;

  const screenStream =
    roomState.screenStream;

  if (localStream) {
    const audioTracks =
      localStream.getAudioTracks();

    for (const track of audioTracks) {
      if (
        roomState.microphoneEnabled
      ) {
        stream.addTrack(track);
      }
    }
  }

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

    for (const track of screenAudioTracks) {
      stream.addTrack(track);
    }

    return stream;
  }

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

  const peer = peerId
    ? new Peer(peerId)
    : new Peer();

  roomState.peer = peer;

  return new Promise(
    (resolve, reject) => {
      peer.on(
        "open",
        (id) => {
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

          reject(error);
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

  return roomId;
}

// ======================================================
// JOIN ROOM
// ======================================================

export async function joinRoom(
  roomId: string,
  localName: string,
): Promise<void> {
  if (!roomId.trim()) {
    throw new Error(
      "Please enter a room ID.",
    );
  }

  await startPeer();

  currentRoomId =
    roomId.trim();

  if (!roomState.peer) {
    throw new Error(
      "Unable to initialize the room connection.",
    );
  }

  if (!roomState.localStream) {
    await requestLocalMedia({
      video:
        roomState.cameraEnabled,

      audio:
        roomState.microphoneEnabled,
    });
  }

  const outgoingStream =
    getOutgoingStream();

  if (!outgoingStream) {
    throw new Error(
      "Unable to create the outgoing media stream.",
    );
  }

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

  incomingCallsHandlerRegistered =
    true;

  roomState.peer.on(
    "call",
    async (call) => {
      try {
        if (
          !roomState.localStream
        ) {
          await requestLocalMedia({
            video:
              roomState.cameraEnabled,

            audio:
              roomState.microphoneEnabled,
          });
        }

        const outgoingStream =
          getOutgoingStream();

        call.answer(
          outgoingStream ??
            roomState.localStream ??
            undefined,
        );

        registerMediaConnection(
          call,
          call.peer,
          typeof call.metadata
            ?.name ===
            "string"
            ? call.metadata.name
            : "Learner",
          typeof call.metadata
            ?.userId ===
            "string"
            ? call.metadata.userId
            : undefined,
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
  const member: PeerRoomMember = {
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

  connection.on(
    "stream",
    (remoteStream) => {
      window.dispatchEvent(
        new CustomEvent(
          "dre2learn:remote-stream",
          {
            detail: {
              peerId,
              userId,
              stream:
                remoteStream,
              name,
            },
          },
        ),
      );
    },
  );

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
      roomState.members.delete(
        peerId,
      );

      window.dispatchEvent(
        new CustomEvent(
          "dre2learn:member-left",
          {
            detail: {
              peerId,
              userId,
            },
          },
        ),
      );
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
// CONTROL MESSAGE TYPE
// ======================================================

type RoomControlMessage =
  | {
      type:
        | "camera";
      enabled: boolean;
    }
  | {
      type:
        | "microphone";
      enabled: boolean;
    }
  | {
      type:
        | "screen-share";
      enabled: boolean;
    }
  | {
      type:
        | "room-camera";
      enabled: boolean;
    }
  | {
      type:
        | "room-microphone";
      enabled: boolean;
    }
  | {
      type:
        | "room-screen-share";
      enabled: boolean;
    }
  | {
      type:
        "force-stop-screen-share";
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

  const message =
    data as Partial<RoomControlMessage>;

  switch (
    message.type
  ) {
    case "camera":
    case "room-camera": {
      const enabled =
        message.enabled !==
        false;

      applyRemoteCameraPermission(
        peerId,
        enabled,
      );

      break;
    }

    case "microphone":
    case "room-microphone": {
      const enabled =
        message.enabled !==
        false;

      applyRemoteMicrophonePermission(
        peerId,
        enabled,
      );

      break;
    }

    case "screen-share":
    case "room-screen-share": {
      const enabled =
        message.enabled !==
        false;

      applyRemoteScreenSharePermission(
        peerId,
        enabled,
      );

      break;
    }

    case "force-stop-screen-share": {
      if (
        roomState.screenStream
      ) {
        stopScreenShare();
      }

      break;
    }
  }
}

// ======================================================
// OWNER CONTROL — LOCAL CAMERA
// ======================================================

export function setLocalCameraPermission(
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
    if (
      roomState.screenStream
    ) {
      replaceOutgoingVideoTrack(
        getCameraReplacementTrack(),
      );
    } else {
      removeOutgoingVideoTrack();
    }
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

  broadcastControlMessage({
    type: "camera",
    enabled,
  });
}

// ======================================================
// OWNER CONTROL — LOCAL MICROPHONE
// ======================================================

export function setLocalMicrophonePermission(
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

  broadcastControlMessage({
    type: "microphone",
    enabled,
  });
}

// ======================================================
// OWNER CONTROL — LOCAL SCREEN SHARE
// ======================================================

export function setLocalScreenSharePermission(
  enabled: boolean,
): void {
  roomState.screenShareEnabled =
    enabled;

  if (!enabled) {
    if (
      roomState.screenStream
    ) {
      stopScreenShare();
    }
  }

  broadcastControlMessage({
    type:
      "screen-share",
    enabled,
  });
}

// ======================================================
// APPLY CAMERA PERMISSION
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

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:participant-camera-permission",
      {
        detail: {
          peerId,
          userId:
            member.userId,
          enabled,
        },
      },
    ),
  );
}

// ======================================================
// APPLY MICROPHONE PERMISSION
// ======================================================

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

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:participant-microphone-permission",
      {
        detail: {
          peerId,
          userId:
            member.userId,
          enabled,
        },
      },
    ),
  );
}

// ======================================================
// APPLY SCREEN SHARE PERMISSION
// ======================================================

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

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:participant-screen-share-permission",
      {
        detail: {
          peerId,
          userId:
            member.userId,
          enabled,
        },
      },
    ),
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
}

export function sendRoomScreenSharePermission(
  enabled: boolean,
): void {
  roomState.screenShareEnabled =
    enabled;

  if (!enabled) {
    if (
      roomState.screenStream
    ) {
      stopScreenShare();
    }
  }

  broadcastControlMessage({
    type:
      "room-screen-share",
    enabled,
  });
}

// ======================================================
// SEND CONTROL MESSAGE
// ======================================================

function sendControlMessage(
  peerId: string,
  message: RoomControlMessage,
): boolean {
  const member =
    roomState.members.get(
      peerId,
    );

  if (
    !member?.connection
  ) {
    return false;
  }

  try {
    member.connection.send(
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
    try {
      member.connection?.send(
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

  roomState.screenStream =
    screenStream;

  const videoTrack =
    screenStream.getVideoTracks()[0];

  if (!videoTrack) {
    screenStream
      .getTracks()
      .forEach(
        (track) =>
          track.stop(),
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

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:screen-share-started",
      {
        detail: {
          stream:
            screenStream,

          hasAudio:
            screenStream
              .getAudioTracks()
              .length > 0,

          roomId:
            currentRoomId,
        },
      },
    ),
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

    const senders =
      peerConnection.getSenders();

    const videoSender =
      senders.find(
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
// CAMERA REPLACEMENT
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

  // Restore camera if camera permission
  // is still enabled.
  if (
    roomState.cameraEnabled
  ) {
    const cameraTrack =
      roomState.localStream
        ?.getVideoTracks()[0];

    if (cameraTrack) {
      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    } else {
      removeOutgoingVideoTrack();
    }
  } else {
    removeOutgoingVideoTrack();
  }

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:screen-share-ended",
      {
        detail: {
          roomId:
            currentRoomId,
        },
      },
    ),
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
}

// ======================================================
// CAMERA
// ======================================================

export function toggleCamera(
  enabled: boolean,
): void {
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
}

// ======================================================
// LEAVE ROOM
// ======================================================

export function leaveRoom(): void {
  for (
    const member of roomState.members.values()
  ) {
    member.connection?.close();
  }

  roomState.members.clear();

  stopScreenShare();

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

  if (roomState.peer) {
    roomState.peer.destroy();

    roomState.peer =
      null;
  }

  currentRoomId =
    "";

  currentUserId =
    "";

  incomingCallsHandlerRegistered =
    false;

  roomState.cameraEnabled =
    true;

  roomState.microphoneEnabled =
    true;

  roomState.screenShareEnabled =
    true;

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:room-left",
    ),
  );
}
    
    
            




      

  