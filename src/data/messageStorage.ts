import {
  acceptMessageRequest,
  cancelMessageRequest,
  createConversation,
  createMessage,
  createMessageRequest,
  rejectMessageRequest,
  type Conversation,
  type Message,
  type MessageRequest,
} from "./messages";

const STORAGE_KEY = "dre2learn-messages";

export interface MessageStorageData {
  requests: MessageRequest[];
  conversations: Conversation[];
  messages: Message[];
}

const DEFAULT_DATA: MessageStorageData = {
  requests: [],
  conversations: [],
  messages: [],
};

function readData(): MessageStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...DEFAULT_DATA };
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return { ...DEFAULT_DATA };
    }

    const value = parsed as Partial<
      MessageStorageData
    >;

    return {
      requests: Array.isArray(value.requests)
        ? value.requests
        : [],
      conversations: Array.isArray(
        value.conversations,
      )
        ? value.conversations
        : [],
      messages: Array.isArray(value.messages)
        ? value.messages
        : [],
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeData(
  data: MessageStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function getMessageStorage(): MessageStorageData {
  return readData();
}

export function saveMessageStorage(
  data: MessageStorageData,
): void {
  writeData(data);
}

export function getAllMessageRequests(): MessageRequest[] {
  return readData().requests;
}

export function getAllConversations(): Conversation[] {
  return readData().conversations;
}

export function getAllMessages(): Message[] {
  return readData().messages;
}

export function saveMessageRequest(
  request: MessageRequest,
): MessageRequest {
  const data = readData();

  const index = data.requests.findIndex(
    (item) => item.id === request.id,
  );

  if (index >= 0) {
    data.requests[index] = request;
  } else {
    data.requests.push(request);
  }

  writeData(data);

  return request;
}

export function createAndSaveMessageRequest(
  senderId: string,
  receiverId: string,
): MessageRequest {
  return saveMessageRequest(
    createMessageRequest(
      senderId,
      receiverId,
    ),
  );
}

export function acceptStoredMessageRequest(
  requestId: string,
): MessageRequest | null {
  const data = readData();

  const request = data.requests.find(
    (item) => item.id === requestId,
  );

  if (!request) {
    return null;
  }

  const updated =
    acceptMessageRequest(request);

  data.requests = data.requests.map(
    (item) =>
      item.id === requestId
        ? updated
        : item,
  );

  writeData(data);

  return updated;
}

export function rejectStoredMessageRequest(
  requestId: string,
): MessageRequest | null {
  const data = readData();

  const request = data.requests.find(
    (item) => item.id === requestId,
  );

  if (!request) {
    return null;
  }

  const updated =
    rejectMessageRequest(request);

  data.requests = data.requests.map(
    (item) =>
      item.id === requestId
        ? updated
        : item,
  );

  writeData(data);

  return updated;
}

export function cancelStoredMessageRequest(
  requestId: string,
): MessageRequest | null {
  const data = readData();

  const request = data.requests.find(
    (item) => item.id === requestId,
  );

  if (!request) {
    return null;
  }

  const updated =
    cancelMessageRequest(request);

  data.requests = data.requests.map(
    (item) =>
      item.id === requestId
        ? updated
        : item,
  );

  writeData(data);

  return updated;
}

export function saveConversation(
  conversation: Conversation,
): Conversation {
  const data = readData();

  const index =
    data.conversations.findIndex(
      (item) =>
        item.id === conversation.id,
    );

  if (index >= 0) {
    data.conversations[index] =
      conversation;
  } else {
    data.conversations.push(
      conversation,
    );
  }

  writeData(data);

  return conversation;
}

export function createAndSaveConversation(
  participantIds: string[],
): Conversation {
  return saveConversation(
    createConversation(participantIds),
  );
}

export function saveMessage(
  message: Message,
): Message {
  const data = readData();

  data.messages.push(message);

  const conversationIndex =
    data.conversations.findIndex(
      (item) =>
        item.id === message.conversationId,
    );

  if (conversationIndex >= 0) {
    data.conversations[
      conversationIndex
    ] = {
      ...data.conversations[
        conversationIndex
      ],
      updatedAt: message.createdAt,
      lastMessageId: message.id,
    };
  }

  writeData(data);

  return message;
}

export function createAndSaveMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string,
): Message {
  return saveMessage(
    createMessage(
      conversationId,
      senderId,
      receiverId,
      text,
    ),
  );
}

export function markMessageRead(
  messageId: string,
): boolean {
  const data = readData();

  const message = data.messages.find(
    (item) => item.id === messageId,
  );

  if (!message) {
    return false;
  }

  data.messages = data.messages.map(
    (item) =>
      item.id === messageId
        ? {
            ...item,
            read: true,
          }
        : item,
  );

  writeData(data);

  return true;
}

export function getMessagesForConversation(
  conversationId: string,
): Message[] {
  return readData()
    .messages.filter(
      (message) =>
        message.conversationId ===
        conversationId,
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
}

export function deleteMessage(
  messageId: string,
): boolean {
  const data = readData();

  const before = data.messages.length;

  data.messages = data.messages.filter(
    (message) =>
      message.id !== messageId,
  );

  if (before === data.messages.length) {
    return false;
  }

  writeData(data);

  return true;
}

export function clearMessageStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeMessageStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeData(DEFAULT_DATA);
  }
}