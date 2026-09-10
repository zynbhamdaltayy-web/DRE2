import type { Account } from "./accounts";

export type MessageRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export interface MessageRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: MessageRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
  lastMessageId?: string;
}

function createId(
  prefix: string,
): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export function createMessageRequest(
  senderId: string,
  receiverId: string,
): MessageRequest {
  const timestamp =
    new Date().toISOString();

  return {
    id: createId("message-request"),
    senderId: cleanString(senderId),
    receiverId: cleanString(receiverId),
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createConversation(
  participantIds: string[],
): Conversation {
  const uniqueParticipants = [
    ...new Set(
      participantIds
        .map(cleanString)
        .filter(Boolean),
    ),
  ];

  const timestamp =
    new Date().toISOString();

  return {
    id: createId("conversation"),
    participantIds: uniqueParticipants,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string,
): Message {
  return {
    id: createId("message"),
    conversationId: cleanString(
      conversationId,
    ),
    senderId: cleanString(senderId),
    receiverId: cleanString(receiverId),
    text: cleanString(text),
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function canSendMessageRequest(
  sender: Account,
  receiver: Account,
): boolean {
  if (sender.id === receiver.id) {
    return false;
  }

  if (sender.status !== "active") {
    return false;
  }

  if (receiver.status !== "active") {
    return false;
  }

  return true;
}

export function canSendMessage(
  senderId: string,
  receiverId: string,
  requests: MessageRequest[],
): boolean {
  if (senderId === receiverId) {
    return false;
  }

  return requests.some(
    (request) =>
      request.status === "accepted" &&
      (
        request.senderId === senderId &&
        request.receiverId === receiverId
      ) ||
      (
        request.senderId === receiverId &&
        request.receiverId === senderId
      ),
  );
}

export function acceptMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
    status: "accepted",
    updatedAt: new Date().toISOString(),
  };
}

export function rejectMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
    status: "rejected",
    updatedAt: new Date().toISOString(),
  };
}

export function cancelMessageRequest(
  request: MessageRequest,
): MessageRequest {
  return {
    ...request,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
}

export function getPendingMessageRequestsForUser(
  requests: MessageRequest[],
  userId: string,
): MessageRequest[] {
  return requests.filter(
    (request) =>
      request.receiverId === userId &&
      request.status === "pending",
  );
}

export function getSentMessageRequestsForUser(
  requests: MessageRequest[],
  userId: string,
): MessageRequest[] {
  return requests.filter(
    (request) =>
      request.senderId === userId,
  );
}

export function hasAcceptedConversation(
  requests: MessageRequest[],
  userA: string,
  userB: string,
): boolean {
  return requests.some(
    (request) =>
      request.status === "accepted" &&
      (
        request.senderId === userA &&
        request.receiverId === userB
      ) ||
      (
        request.senderId === userB &&
        request.receiverId === userA
      ),
  );
}