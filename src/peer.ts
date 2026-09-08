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
  members: Map<
    string,
    PeerRoomMember
  >;
}

const roomState: PeerRoomState = {
  peer: null,
  localStream: null,
  screenStream: null,
  members: new Map(),
};

let currentRoomId = "";

export function getRoomState(): PeerRoomState {
  return roomState;
}

export function getCurrentRoomId(): string {
  return currentRoomId;
}

export async function requestLocalMedia(
  options: {
    video?: boolean;
    audio?: boolean;
  } = {},
): Promise<MediaStream> {
  const video =
    options.video ?? true;

  const audio =
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
      video,
      audio,
    });

  roomState.localStream = stream;

  return stream;
}

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

  currentRoomId = roomId.trim();

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

  const connection =
    roomState.peer.call(
      currentRoomId,
      roomState.localStream,
      {
        metadata: {
          name: localName,
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

export function answerIncomingCalls(
  localName: string,
): void {
  if (!roomState.peer) {
    return;
  }

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

        call.answer(
          roomState.localStream ?? undefined,
        );

        registerMediaConnection(
          call,
          call.peer,
          localName,
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
}

export async function startScreenShare(): Promise<MediaStream> {
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

  if (videoTrack) {
    videoTrack.addEventListener(
      "ended",
      () => {
        roomState.screenStream = null;

        window.dispatchEvent(
          new CustomEvent(
            "dre2learn:screen-share-ended",
          ),
        );
      },
    );
  }

  replaceOutgoingVideoTrack(
    videoTrack,
  );

  return screenStream;
}

function replaceOutgoingVideoTrack(
  newTrack: MediaStreamTrack,
): void {
  for (const member of roomState.members.values()) {
    const senders =
      member.connection
        ?.peerConnection
        ?.getSenders();

    if (!senders) {
      continue;
    }

    const videoSender =
      senders.find(
        (sender) =>
          sender.track?.kind ===
          "video",
      );

    if (videoSender) {
      videoSender.replaceTrack(
        newTrack,
      );
    }
  }
}

export function stopScreenShare(): void {
  const stream =
    roomState.screenStream;

  if (!stream) {
    return;
  }

  for (const track of stream.getTracks()) {
    track.stop();
  }

  roomState.screenStream = null;

  if (roomState.localStream) {
    const cameraTrack =
      roomState.localStream.getVideoTracks()[0];

    if (cameraTrack) {
      replaceOutgoingVideoTrack(
        cameraTrack,
      );
    }
  }
}

export function toggleMicrophone(
  enabled: boolean,
): void {
  const tracks =
    roomState.localStream?.getAudioTracks() ??
    [];

  for (const track of tracks) {
    track.enabled = enabled;
  }
}

export function toggleCamera(
  enabled: boolean,
): void {
  const tracks =
    roomState.localStream?.getVideoTracks() ??
    [];

  for (const track of tracks) {
    track.enabled = enabled;
  }
}

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

  window.dispatchEvent(
    new CustomEvent(
      "dre2learn:room-left",
    ),
  );
}