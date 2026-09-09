import {
  acceptMessageRequest,
  activateConversation,
  archiveConversation,
  blockConversation,
  createConversation,
  createMessage,
  createMessageRequest,
  deleteMessage,
  getConversationWithUser,
  markMessageAsRead,
  normalizeConversation,
  normalizeMessage,
  normalizeMessageRequest,
  type Conversation,
  type Message,
  type MessageRequest,
} from "./messaging";

import {
  DRE2LEARN_OWNER_ID,
} from "./accounts";

const MESSAGING_STORAGE_KEY =
  "dre2learn-messaging-data";

const MESSAGING_STORAGE_VERSION = 1;

export interface MessagingStorageData {
  version: number;
  requests: MessageRequest[];
  conversations: Conversation[];
  messages: Message[];
}

function createDefaultData(): MessagingStorageData {
  return {
    version: MESSAGING_STORAGE_VERSION,
    requests: [],
    conversations: [],
    messages: [],
  };
}

function readStorage(): MessagingStorageData {
  if (typeof window === "undefined") {
    return createDefaultData();
  }

  try {
    const raw = localStorage.getItem(
      MESSAGING_STORAGE_KEY,
    );

    if (!raw) {
      return createDefaultData();
    }

    const parsed =
      JSON.parse(raw) as Partial<MessagingStorageData>;

    if (
      !Array.isArray(parsed.requests) ||
      !Array.isArray(parsed.conversations) ||
      !Array.isArray(parsed.messages)
    ) {
      return createDefaultData();
    }

    return {
      version: MESSAGING_STORAGE_VERSION,
      requests: parsed.requests.map(
        normalizeMessageRequest,
      ),
      conversations: parsed.conversations.map(
        normalizeConversation,
      ),
      messages: parsed.messages.map(
        normalizeMessage,
      ),
    };
  } catch {
    return createDefaultData();
  }
}

function writeStorage(
  data: MessagingStorageData,
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    MESSAGING_STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getMessagingStorage(): MessagingStorageData {
  return readStorage();
}

export function saveMessagingStorage(
  data: MessagingStorageData,
): void {
  writeStorage({
    version: MESSAGING_STORAGE_VERSION,
    requests: data.requests.map(
      normalizeMessageRequest,
    ),
    conversations: data.conversations.map(
      normalizeConversation,
    ),
    messages: data.messages.map(normalizeMessage),
  });
}

export function getAllMessageRequests(): MessageRequest[] {
  return readStorage().requests;
}

export function getAllConversations(): Conversation[] {
  return readStorage().conversations;
}

export function getAllMessages(): Message[] {
  return readStorage().messages;
}

export function sendMessageRequest(
  senderId: string,
  receiverId: string,
): MessageRequest {
  const data = readStorage();

  if (senderId === receiverId) {
    throw new Error(
      "You cannot message yourself.",
    );
  }

  const existing = data.requests.find(
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

  if (existing) {
    throw new Error(
      "Messaging is already approved.",
    );
  }

  const pending = data.requests.find(
    (request) =>
      request.status === "pending" &&
      request.senderId === senderId &&
      request.receiverId === receiverId,
  );

  if (pending) {
    return pending;
  }

  const request = createMessageRequest(
    senderId,
    receiverId,
  );

  data.requests.push(request);

  writeStorage(data);

  return request;
}

export function acceptRequest(
  requestId: string,
): {
  request: MessageRequest;
  conversation: Conversation;
} | null {
  const data = readStorage();

  const request = data.requests.find(
    (item) => item.id === requestId,
  );

  if (!request) {
    return null;
  }

  const accepted = acceptMessageRequest(request);

  data.requests = data.requests.map((item) =>
    item.id === requestId ? accepted : item,
  );

  let conversation =
    getConversationWithUser(
      data.conversations,
      request.senderId,
      request.receiverId,
    );

  if (!conversation) {
    conversation = createConversation(
      request.senderId,
      request.receiverId,
    );

    data.conversations.push(conversation);
  } else {
    conversation =
      activateConversation(conversation);

    data.conversations =
      data.conversations.map((item) =>
        item.id === conversation!.id
          ? conversation!
          : item,
      );
  }

  writeStorage(data);

  return {
    request: accepted,
    conversation,
  };
}

export function declineRequest(
  requestId: string,
): MessageRequest | null {
  const data = readStorage();

  const request = data.requests.find(
    (item) => item.id === requestId,
  );

  if (!request) {
    return null;
  }

  const declined: MessageRequest = {
    ...request,
    status: "declined",
    respondedAt: new Date().toISOString(),
  };

  data.requests = data.requests.map((item) =>
    item.id === requestId ? declined : item,
  );

  writeStorage(data);

  return declined;
}

export function blockRequest(
  requestId: string,
): MessageRequest | null {
  const data = readStorage();

  const request = data.requests.find(
    (item) => item.id === requestId,
  );

  if (!request) {
    return null;
  }

  const blocked: MessageRequest = {
    ...request,
    status: "blocked",
    respondedAt: new Date().toISOString(),
  };

  data.requests = data.requests.map((item) =>
    item.id === requestId ? blocked : item,
  );

  writeStorage(data);

  return blocked;
}

export function getUserMessageRequests(
  userId: string,
): MessageRequest[] {
  return readStorage().requests.filter(
    (request) =>
      request.senderId === userId ||
      request.receiverId === userId,
  );
}

export function getReceivedMessageRequests(
  userId: string,
): MessageRequest[] {
  return readStorage().requests.filter(
    (request) =>
      request.receiverId === userId &&
      request.status === "pending",
  );
}

export function getSentMessageRequests(
  userId: string,
): MessageRequest[] {
  return readStorage().requests.filter(
    (request) =>
      request.senderId === userId &&
      request.status === "pending",
  );
}

export function getConversation(
  conversationId: string,
): Conversation | null {
  return (
    readStorage().conversations.find(
      (conversation) =>
        conversation.id === conversationId,
    ) ?? null
  );
}

export function getUserConversations(
  userId: string,
): Conversation[] {
  return readStorage()
    .conversations.filter((conversation) =>
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

export function getConversationMessages(
  conversationId: string,
): Message[] {
  return readStorage()
    .messages.filter(
      (message) =>
        message.conversationId === conversationId,
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
): Message {
  const data = readStorage();

  const conversation = data.conversations.find(
    (item) => item.id === conversationId,
  );

  if (!conversation) {
    throw new Error(
      "Conversation not found.",
    );
  }

  const request = data.requests.find(
    (item) =>
      item.status === "accepted" &&
      (
        (
          item.senderId ===
            conversation.participantIds[0] &&
          item.receiverId ===
            conversation.participantIds[1]
        ) ||
        (
          item.senderId ===
            conversation.participantIds[1] &&
          item.receiverId ===
            conversation.participantIds[0]
        )
      ),
  );

  const requests = request
    ? [request]
    : [];

  const message = createMessage(
    conversation,
    senderId,
    text,
    requests,
  );

  data.messages.push(message);

  const updatedConversation = {
    ...conversation,
    updatedAt: message.createdAt,
    lastMessageAt: message.createdAt,
    status: "active" as const,
  };

  data.conversations =
    data.conversations.map((item) =>
      item.id === conversation.id
        ? updatedConversation
        : item,
    );

  writeStorage(data);

  return message;
}

export function sendOfficialMessage(
  conversationId: string,
  text: string,
): Message {
  const data = readStorage();

  const conversation = data.conversations.find(
    (item) => item.id === conversationId,
  );

  if (!conversation) {
    throw new Error(
      "Conversation not found.",
    );
  }

  const message = createMessage(
    conversation,
    DRE2LEARN_OWNER_ID,
    text,
    [],
  );

  data.messages.push(message);

  data.conversations =
    data.conversations.map((item) =>
      item.id === conversation.id
        ? {
            ...item,
            status: "active",
            updatedAt: message.createdAt,
            lastMessageAt: message.createdAt,
          }
        : item,
    );

  writeStorage(data);

  return message;
}

export function markMessageRead(
  messageId: string,
  userId: string,
): Message | null {
  const data = readStorage();

  const message = data.messages.find(
    (item) => item.id === messageId,
  );

  if (!message) {
    return null;
  }

  if (message.receiverId !== userId) {
    return message;
  }

  const updated = markMessageAsRead(message);

  data.messages = data.messages.map((item) =>
    item.id === messageId ? updated : item,
  );

  writeStorage(data);

  return updated;
}

export function deleteUserMessage(
  messageId: string,
  userId: string,
): Message | null {
  const data = readStorage();

  const message = data.messages.find(
    (item) => item.id === messageId,
  );

  if (!message) {
    return null;
  }

  const deleted = deleteMessage(
    message,
    userId,
  );

  data.messages = data.messages.map((item) =>
    item.id === messageId ? deleted : item,
  );

  writeStorage(data);

  return deleted;
}

export function archiveUserConversation(
  conversationId: string,
  userId: string,
): Conversation | null {
  const data = readStorage();

  const conversation = data.conversations.find(
    (item) => item.id === conversationId,
  );

  if (!conversation) {
    return null;
  }

  if (
    !conversation.participantIds.includes(
      userId,
    )
  ) {
    return null;
  }

  const archived =
    archiveConversation(conversation);

  data.conversations =
    data.conversations.map((item) =>
      item.id === conversationId
        ? archived
        : item,
    );

  writeStorage(data);

  return archived;
}

export function blockUserConversation(
  conversationId: string,
  userId: string,
): Conversation | null {
  const data = readStorage();

  const conversation = data.conversations.find(
    (item) => item.id === conversationId,
  );

  if (!conversation) {
    return null;
  }

  if (
    !conversation.participantIds.includes(
      userId,
    )
  ) {
    return null;
  }

  const otherUser =
    conversation.participantIds.find(
      (id) => id !== userId,
    );

  if (otherUser === DRE2LEARN_OWNER_ID) {
    return null;
  }

  const blocked =
    blockConversation(conversation);

  data.conversations =
    data.conversations.map((item) =>
      item.id === conversationId
        ? blocked
        : item,
    );

  writeStorage(data);

  return blocked;
}

export function getUnreadMessages(
  userId: string,
): Message[] {
  return readStorage().messages.filter(
    (message) =>
      message.receiverId === userId &&
      message.readAt === null &&
      !message.deleted,
  );
}

export function getUnreadMessageCount(
  userId: string,
): number {
  return getUnreadMessages(userId).length;
}

export function initializeMessagingStorage(): void {
  const data = readStorage();

  writeStorage({
    version: MESSAGING_STORAGE_VERSION,
    requests: data.requests,
    conversations: data.conversations,
    messages: data.messages,
  });
}

export function clearMessagingStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    MESSAGING_STORAGE_KEY,
  );
}