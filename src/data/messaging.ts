import {
  DRE2LEARN_OWNER_ID,
} from "./accounts";

export type MessageRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked";

export type ConversationStatus =
  | "active"
  | "blocked"
  | "archived";

export interface MessageRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: MessageRequestStatus;
  createdAt: string;
  respondedAt: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
  deleted: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function cleanMessageText(text: string): string {
  return text.trim();
}

export function areParticipants(
  conversation: Conversation,
  firstUserId: string,
  secondUserId: string,
): boolean {
  return (
    conversation.participantIds.includes(firstUserId) &&
    conversation.participantIds.includes(secondUserId)
  );
}

export function canSendMessage(
  senderId: string,
  receiverId: string,
  requests: MessageRequest[],
): boolean {
  if (!senderId || !receiverId) {
    return false;
  }

  if (senderId === receiverId) {
    return false;
  }

  if (senderId === DRE2LEARN_OWNER_ID) {
    return true;
  }

  return requests.some(
    (request) =>
      request.status === "accepted" &&
      (
        (
          request.senderId === senderId &&
          request.receiverId === receiverId
        ) ||
        (
          request.senderId === receiverId &&
          request.receiverId === senderId
        )
      ),
  );
}

export function createMessageRequest(
  senderId: string,
  receiverId: string,
): MessageRequest {
  if (
    !senderId ||
    !receiverId ||
    senderId === receiverId
  ) {
    throw new Error(
      "Invalid message request participants.",
    );
  }

  const timestamp = nowIso();

  return {
    id: createId("message-request"),
    senderId,
    receiverId,
    status: "pending",
    createdAt: timestamp,
    respondedAt: null,
  };
}

export function acceptMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
    status: "accepted",
    respondedAt: nowIso(),
  };
}

export function declineMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
    status: "declined",
    respondedAt: nowIso(),
  };
}

export function blockMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
    status: "blocked",
    respondedAt: nowIso(),
  };
}

export function hasAcceptedMessaging(
  requests: MessageRequest[],
  firstUserId: string,
  secondUserId: string,
): boolean {
  return requests.some(
    (request) =>
      request.status === "accepted" &&
      (
        (
          request.senderId === firstUserId &&
          request.receiverId === secondUserId
        ) ||
        (
          request.senderId === secondUserId &&
          request.receiverId === firstUserId
        )
      ),
  );
}

export function hasPendingMessageRequest(
  requests: MessageRequest[],
  senderId: string,
  receiverId: string,
): boolean {
  return requests.some(
    (request) =>
      request.status === "pending" &&
      request.senderId === senderId &&
      request.receiverId === receiverId,
  );
}

export function getPendingReceivedRequests(
  requests: MessageRequest[],
  userId: string,
): MessageRequest[] {
  return requests.filter(
    (request) =>
      request.receiverId === userId &&
      request.status === "pending",
  );
}

export function getPendingSentRequests(
  requests: MessageRequest[],
  userId: string,
): MessageRequest[] {
  return requests.filter(
    (request) =>
      request.senderId === userId &&
      request.status === "pending",
  );
}

export function createConversation(
  firstUserId: string,
  secondUserId: string,
): Conversation {
  if (
    !firstUserId ||
    !secondUserId ||
    firstUserId === secondUserId
  ) {
    throw new Error(
      "Invalid conversation participants.",
    );
  }

  const timestamp = nowIso();

  return {
    id: createId("conversation"),
    participantIds: [
      firstUserId,
      secondUserId,
    ],
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    lastMessageAt: null,
  };
}

export function createMessage(
  conversation: Conversation,
  senderId: string,
  text: string,
  requests: MessageRequest[],
): Message {
  const cleanText = cleanMessageText(text);

  if (!cleanText) {
    throw new Error("Message cannot be empty.");
  }

  const receiverId =
    conversation.participantIds.find(
      (id) => id !== senderId,
    );

  if (!receiverId) {
    throw new Error(
      "Conversation receiver not found.",
    );
  }

  if (
    !canSendMessage(
      senderId,
      receiverId,
      requests,
    )
  ) {
    throw new Error(
      "Messaging requires mutual approval.",
    );
  }

  return {
    id: createId("message"),
    conversationId: conversation.id,
    senderId,
    receiverId,
    text: cleanText,
    createdAt: nowIso(),
    readAt: null,
    deleted: false,
  };
}

export function markMessageAsRead(
  message: Message,
): Message {
  return {
    ...message,
    readAt: message.readAt ?? nowIso(),
  };
}

export function deleteMessage(
  message: Message,
  requesterId: string,
): Message {
  if (message.senderId !== requesterId) {
    return message;
  }

  return {
    ...message,
    deleted: true,
    text: "",
  };
}

export function archiveConversation(
  conversation: Conversation,
): Conversation {
  return {
    ...conversation,
    status: "archived",
    updatedAt: nowIso(),
  };
}

export function blockConversation(
  conversation: Conversation,
): Conversation {
  return {
    ...conversation,
    status: "blocked",
    updatedAt: nowIso(),
  };
}

export function activateConversation(
  conversation: Conversation,
): Conversation {
  return {
    ...conversation,
    status: "active",
    updatedAt: nowIso(),
  };
}

export function updateConversationAfterMessage(
  conversation: Conversation,
  message: Message,
): Conversation {
  return {
    ...conversation,
    status: "active",
    updatedAt: message.createdAt,
    lastMessageAt: message.createdAt,
  };
}

export function getConversationMessages(
  messages: Message[],
  conversationId: string,
): Message[] {
  return messages
    .filter(
      (message) =>
        message.conversationId === conversationId,
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
}

export function getUserConversations(
  conversations: Conversation[],
  userId: string,
): Conversation[] {
  return conversations
    .filter((conversation) =>
      conversation.participantIds.includes(userId),
    )
    .sort(
      (a, b) =>
        new Date(
          b.lastMessageAt ?? b.updatedAt,
        ).getTime() -
        new Date(
          a.lastMessageAt ?? a.updatedAt,
        ).getTime(),
    );
}

export function getConversationWithUser(
  conversations: Conversation[],
  firstUserId: string,
  secondUserId: string,
): Conversation | null {
  return (
    conversations.find(
      (conversation) =>
        areParticipants(
          conversation,
          firstUserId,
          secondUserId,
        ),
    ) ?? null
  );
}

export function getUnreadMessageCount(
  messages: Message[],
  userId: string,
): number {
  return messages.filter(
    (message) =>
      message.receiverId === userId &&
      message.readAt === null &&
      !message.deleted,
  ).length;
}

export function getUnreadConversationCount(
  messages: Message[],
  conversations: Conversation[],
  userId: string,
): number {
  const conversationIds = new Set(
    conversations
      .filter((conversation) =>
        conversation.participantIds.includes(userId),
      )
      .map((conversation) => conversation.id),
  );

  return new Set(
    messages
      .filter(
        (message) =>
          conversationIds.has(
            message.conversationId,
          ) &&
          message.receiverId === userId &&
          message.readAt === null &&
          !message.deleted,
      )
      .map(
        (message) => message.conversationId,
      ),
  ).size;
}

export function normalizeMessage(
  message: Message,
): Message {
  return {
    ...message,
    text: message.deleted
      ? ""
      : cleanMessageText(message.text),
  };
}

export function normalizeConversation(
  conversation: Conversation,
): Conversation {
  return {
    ...conversation,
    participantIds: [
      ...new Set(conversation.participantIds),
    ],
  };
}

export function normalizeMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
  };
}