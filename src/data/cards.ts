import type { Level } from "../types";

export type LearningCardType =
  | "word"
  | "phrase"
  | "question"
  | "challenge"
  | "roleplay";

export interface LearningCard {
  id: string;
  title: string;
  content: string;
  answer?: string;
  type: LearningCardType;
  level: Level;
  topic: string;
  xpCost: number;
  createdAt: string;
}

export interface CollectedCard {
  cardId: string;
  collectedAt: string;
  timesUsed: number;
}

function createId(): string {
  return `card-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createLearningCard(
  input: Omit<
    LearningCard,
    "id" | "createdAt"
  >,
): LearningCard {
  return {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  };
}

export function normalizeLearningCard(
  card: LearningCard,
): LearningCard {
  return {
    ...card,
    id: card.id?.trim() || createId(),
    title: card.title?.trim() || "Learning Card",
    content: card.content?.trim() || "",
    answer: card.answer?.trim() || undefined,
    topic: card.topic?.trim() || "General",
    xpCost: Math.max(0, card.xpCost ?? 0),
    createdAt:
      card.createdAt ||
      new Date().toISOString(),
  };
}

export function normalizeCollectedCard(
  card: CollectedCard,
): CollectedCard {
  return {
    cardId: card.cardId?.trim() || "",
    collectedAt:
      card.collectedAt ||
      new Date().toISOString(),
    timesUsed: Math.max(
      0,
      card.timesUsed ?? 0,
    ),
  };
}

export function canCollectCard(
  card: LearningCard,
  currentXp: number,
): boolean {
  return currentXp >= card.xpCost;
}

export function collectCard(
  cards: CollectedCard[],
  cardId: string,
): CollectedCard[] {
  if (
    cards.some(
      (card) => card.cardId === cardId,
    )
  ) {
    return cards;
  }

  return [
    ...cards,
    {
      cardId,
      collectedAt:
        new Date().toISOString(),
      timesUsed: 0,
    },
  ];
}

export function useCollectedCard(
  cards: CollectedCard[],
  cardId: string,
): CollectedCard[] {
  return cards.map((card) =>
    card.cardId === cardId
      ? {
          ...card,
          timesUsed: card.timesUsed + 1,
        }
      : card,
  );
}

export function getCardsByLevel(
  cards: LearningCard[],
  level: Level,
): LearningCard[] {
  return cards.filter(
    (card) => card.level === level,
  );
}

export function getCardsByTopic(
  cards: LearningCard[],
  topic: string,
): LearningCard[] {
  const normalized =
    topic.trim().toLowerCase();

  return cards.filter(
    (card) =>
      card.topic.toLowerCase() ===
      normalized,
  );
}

export function getCardsForLevelAndTopic(
  cards: LearningCard[],
  level: Level,
  topic: string,
): LearningCard[] {
  return cards.filter(
    (card) =>
      card.level === level &&
      card.topic.toLowerCase() ===
        topic.trim().toLowerCase(),
  );
}

export function getCollectedCardCount(
  cards: CollectedCard[],
): number {
  return cards.length;
}

export function getCardCollectionProgress(
  collected: CollectedCard[],
  totalCards: number,
): number {
  if (totalCards <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (collected.length / totalCards) *
        100,
    ),
  );
}

export function validateLearningCard(
  card: LearningCard,
): string[] {
  const errors: string[] = [];

  if (!card.title.trim()) {
    errors.push("Card title is required.");
  }

  if (!card.content.trim()) {
    errors.push("Card content is required.");
  }

  if (!card.level) {
    errors.push("Card level is required.");
  }

  if (!card.topic.trim()) {
    errors.push("Card topic is required.");
  }

  if (card.xpCost < 0) {
    errors.push(
      "Card XP cost cannot be negative.",
    );
  }

  return errors;
}