import Peer, {
  type MediaConnection,
} from "peerjs";

export interface PeerRoomMember {
  peerId: string;
  name: string;
  connection?: MediaConnection;
}

export interface PeerRoomState {
  peer: Peer | null;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  members: Map<string, PeerRoomMember>;
}

const roomState: PeerRoomState = {
  peer: null,
  localStream: null,
  screenStream: null,
  members: new Map(),
};

let currentRoomId = "";

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

// ======================================================
// LOCAL MEDIA
// ======================================================

export async function requestLocalMedia(
  options: {
    video?: boolean;
    audio?: boolean;
  } = {},
): Promise<MediaStream> {
  const video = options.video ?? true;
  const audio = options.audio ?? true;

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
      video,
      audio,
    });

  roomState.localStream = stream;

  return stream;
}

// ======================================================
// OUTGOING STREAM
// ======================================================
// Creates the stream that should be sent to a participant.
//
// Normal:
//   microphone + camera
//
// While screen sharing:
//   microphone + screen audio (if available)
//   + screen video
//
// The camera track is intentionally replaced by the
// screen video track while screen sharing.
// ======================================================

function getOutgoingStream(): MediaStream | null {
  const stream = new MediaStream();

  const localStream =
    roomState.localStream;

  const screenStream =
    roomState.screenStream;

  if (localStream) {
    const audioTracks =
      localStream.getAudioTracks();

    for (const track of audioTracks) {
      stream.addTrack(track);
    }
  }

  if (screenStream) {
    const screenVideoTrack =
      screenStream.getVideoTracks()[0];

    if (screenVideoTrack) {
      stream.addTrack(screenVideoTrack);
    }

    const screenAudioTracks =
      screenStream.getAudioTracks();

    for (const track of screenAudioTracks) {
      stream.addTrack(track);
    }

    return stream;
  }

  if (localStream) {
    const cameraTrack =
      localStream.getVideoTracks()[0];

    if (cameraTrack) {
      stream.addTrack(cameraTrack);
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
      peer.on("open", (id) => {
        resolve(id);
      });

      peer.on("error", (error) => {
        console.error(
          "PeerJS error:",
          error,
        );

        reject(error);
      });
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
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const suffix =
    Math.random()
      .toString(36)
      .slice(2, 7);

  const roomId =
    `${normalized || "room"}-${suffix}`;

  await startPeer(roomId);

  currentRoomId = roomId;

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
      video: true,
      audio: true,
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
          name: localName,
          screenSharing:
            roomState.screenStream !== null,
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
        if (!roomState.localStream) {
          await requestLocalMedia({
            video: true,
            audio: true,
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
            ?.name === "string"
            ? call.metadata.name
            : "Learner",
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
): void {
  const member: PeerRoomMember = {
    peerId,
    name,
    connection,
  };

  roomState.members.set(
    peerId,
    member,
  );

  connection.on(
    "stream",
    (remoteStream) => {
      const event =
        new CustomEvent(
          "dre2learn:remote-stream",
          {
            detail: {
              peerId,
              stream: remoteStream,
              name,
            },
          },
        );

      window.dispatchEvent(event);
    },
  );

  connection.on("close", () => {
    roomState.members.delete(
      peerId,
    );

    window.dispatchEvent(
      new CustomEvent(
        "dre2learn:member-left",
        {
          detail: {
            peerId,
          },
        },
      ),
    );
  });

  connection.on("error", (error) => {
    console.error(
      "Media connection error:",
      error,
    );
  });

  // ----------------------------------------------------
  // IMPORTANT:
  // If screen sharing is already active when this
  // participant joins, send the current screen stream
  // to this new connection as well.
  // ----------------------------------------------------

  if (roomState.screenStream) {
    sendCurrentScreenToConnection(
      connection,
    );
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

  if (!screenStream) {
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
  if (roomState.screenStream) {
    return roomState.screenStream;
  }

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getDisplayMedia
  ) {
    throw new Error(
      "Screen sharing is not supported by this browser.",
    );
  }

  const screenStream =
    await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

  roomState.screenStream =
    screenStream;

  const videoTrack =
    screenStream.getVideoTracks()[0];

  if (!videoTrack) {
    screenStream
      .getTracks()
      .forEach((track) =>
        track.stop(),
      );

    roomState.screenStream = null;

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

  // ----------------------------------------------------
  // Replace camera video with screen video.
  // ----------------------------------------------------

  replaceOutgoingVideoTrack(
    videoTrack,
  );

  // ----------------------------------------------------
  // Add screen audio when the browser provides it.
  // ----------------------------------------------------

  addScreenAudioTracksToAllConnections();

  // ----------------------------------------------------
  // Tell the UI that screen sharing has started.
  // ----------------------------------------------------

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:screen-share-started",
      {
        detail: {
          stream: screenStream,
          hasAudio:
            screenStream.getAudioTracks()
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
  for (const member of roomState.members.values()) {
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
    screenAudioTracks.length === 0
  ) {
    return;
  }

  const existingSenders =
    peerConnection.getSenders();

  for (const track of screenAudioTracks) {
    const alreadySending =
      existingSenders.some(
        (sender) =>
          sender.track === track,
      );

    if (alreadySending) {
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
  for (const member of roomState.members.values()) {
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
      .replaceTrack(newTrack)
      .catch((error) => {
        console.error(
          "Unable to replace outgoing video track:",
          error,
        );
      });
  }
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

  // ----------------------------------------------------
  // Remove screen audio from every connection.
  // ----------------------------------------------------

  removeScreenAudioTracksFromAllConnections(
    screenAudioTracks,
  );

  // ----------------------------------------------------
  // Stop all screen tracks.
  // ----------------------------------------------------

  for (const track of stream.getTracks()) {
    track.removeEventListener(
      "ended",
      handleScreenShareEnded,
    );

    track.stop();
  }

  roomState.screenStream = null;

  // ----------------------------------------------------
  // Restore camera automatically.
  // ----------------------------------------------------

  restoreCameraTrack();

  // ----------------------------------------------------
  // Notify the UI.
  // ----------------------------------------------------

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
  if (!roomState.screenStream) {
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
  for (const member of roomState.members.values()) {
    const peerConnection =
      member.connection
        ?.peerConnection;

    if (!peerConnection) {
      continue;
    }

    const senders =
      peerConnection.getSenders();

    for (const sender of senders) {
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
// RESTORE CAMERA
// ======================================================

function restoreCameraTrack(): void {
  const cameraTrack =
    roomState.localStream
      ?.getVideoTracks()[0];

  if (!cameraTrack) {
    return;
  }

  replaceOutgoingVideoTrack(
    cameraTrack,
  );
}

// ======================================================
// MICROPHONE
// ======================================================

export function toggleMicrophone(
  enabled: boolean,
): void {
  const tracks =
    roomState.localStream
      ?.getAudioTracks() ??
    [];

  for (const track of tracks) {
    track.enabled = enabled;
  }
}

// ======================================================
// CAMERA
// ======================================================

export function toggleCamera(
  enabled: boolean,
): void {
  const tracks =
    roomState.localStream
      ?.getVideoTracks() ??
    [];

  for (const track of tracks) {
    track.enabled = enabled;
  }
}

// ======================================================
// LEAVE ROOM
// ======================================================

export function leaveRoom(): void {
  for (const member of roomState.members.values()) {
    member.connection?.close();
  }

  roomState.members.clear();

  stopScreenShare();

  if (roomState.localStream) {
    for (const track of roomState.localStream.getTracks()) {
      track.stop();
    }

    roomState.localStream = null;
  }

  if (roomState.peer) {
    roomState.peer.destroy();
    roomState.peer = null;
  }

  currentRoomId = "";

  incomingCallsHandlerRegistered =
    false;

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:room-left",
    ),
  );
}

  
  
  

  
  
    
    