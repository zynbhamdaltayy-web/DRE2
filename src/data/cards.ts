import type {
  CardDifficulty,
  CollectedCard as TypeCollectedCard,
  LearningCard as TypeLearningCard,
  LearningCardType,
  Level,
} from "../types";

export type {
  CardDifficulty,
  LearningCardType,
};

export interface LearningCard
  extends Omit<
    TypeLearningCard,
    "id" | "createdAt"
  > {
  id: string;
  createdAt: string;
}

export interface CollectedCard
  extends TypeCollectedCard {
  timesUsed: number;
  timesPlayed: number;
  rewardClaimed: boolean;
}

function createId(): string {
  return `card-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

// ======================================================
// CREATE CARD
// ======================================================

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

// ======================================================
// NORMALIZE CARD
// ======================================================

export function normalizeLearningCard(
  card: LearningCard,
): LearningCard {
  return {
    ...card,

    id:
      card.id?.trim() ||
      createId(),

    title:
      card.title?.trim() ||
      "Learning Card",

    content:
      card.content?.trim() ||
      "",

    answer:
      card.answer?.trim() ||
      undefined,

    word:
      card.word?.trim() ||
      undefined,

    meaning:
      card.meaning?.trim() ||
      undefined,

    example:
      card.example?.trim() ||
      undefined,

    type:
      card.type ||
      "word",

    level:
      card.level ||
      "A1",

    topic:
      card.topic?.trim() ||
      "General",

    difficulty:
      card.difficulty ||
      "easy",

    xpCost:
      Math.max(
        0,
        card.xpCost ?? 1,
      ),

    xpReward:
      Math.max(
        0,
        card.xpReward ?? 3,
      ),

    createdAt:
      card.createdAt ||
      new Date().toISOString(),
  };
}

// ======================================================
// NORMALIZE COLLECTED CARD
// ======================================================

export function normalizeCollectedCard(
  card: CollectedCard,
): CollectedCard {
  return {
    cardId:
      card.cardId?.trim() ||
      "",

    collectedAt:
      card.collectedAt ||
      new Date().toISOString(),

    timesUsed:
      Math.max(
        0,
        card.timesUsed ?? 0,
      ),

    timesPlayed:
      Math.max(
        0,
        card.timesPlayed ?? 0,
      ),

    rewardClaimed:
      card.rewardClaimed === true,
  };
}

// ======================================================
// COLLECT
// ======================================================

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
      (card) =>
        card.cardId === cardId,
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

      timesPlayed: 0,

      rewardClaimed: false,
    },
  ];
}

// ======================================================
// USE CARD
// ======================================================

export function useCollectedCard(
  cards: CollectedCard[],
  cardId: string,
): CollectedCard[] {
  return cards.map((card) =>
    card.cardId === cardId
      ? {
          ...card,

          timesUsed:
            card.timesUsed + 1,
        }
      : card,
  );
}

// ======================================================
// PLAY CARD
// ======================================================

export function playCollectedCard(
  cards: CollectedCard[],
  cardId: string,
): CollectedCard[] {
  return cards.map((card) =>
    card.cardId === cardId
      ? {
          ...card,

          timesPlayed:
            card.timesPlayed + 1,
        }
      : card,
  );
}

// ======================================================
// COMPLETE CARD
// ======================================================

export interface CompleteCardResult {
  cards: CollectedCard[];

  rewardGranted: boolean;

  xpReward: number;
}

export function completeCollectedCard(
  cards: CollectedCard[],
  card: LearningCard,
): CompleteCardResult {
  const collected =
    cards.find(
      (item) =>
        item.cardId === card.id,
    );

  if (!collected) {
    return {
      cards,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  // Already rewarded.
  if (collected.rewardClaimed) {
    return {
      cards,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  const reward =
    Math.max(
      0,
      card.xpReward ?? 3,
    );

  const updatedCards =
    cards.map((item) =>
      item.cardId === card.id
        ? {
            ...item,

            timesUsed:
              item.timesUsed + 1,

            rewardClaimed: true,
          }
        : item,
    );

  return {
    cards: updatedCards,

    rewardGranted: reward > 0,

    xpReward: reward,
  };
}

// ======================================================
// FILTERS
// ======================================================

export function getCardsByType(
  cards: LearningCard[],
  type: LearningCardType,
): LearningCard[] {
  return cards.filter(
    (card) =>
      card.type === type,
  );
}

export function getCardsByDifficulty(
  cards: LearningCard[],
  difficulty: CardDifficulty,
): LearningCard[] {
  return cards.filter(
    (card) =>
      card.difficulty === difficulty,
  );
}

export function getCardsByLevel(
  cards: LearningCard[],
  level: Level,
): LearningCard[] {
  return cards.filter(
    (card) =>
      card.level === level,
  );
}

export function getCardsByTopic(
  cards: LearningCard[],
  topic: string,
): LearningCard[] {
  const normalized =
    topic
      .trim()
      .toLowerCase();

  return cards.filter(
    (card) =>
      card.topic
        .toLowerCase() ===
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
      card.topic
        .toLowerCase() ===
        topic
          .trim()
          .toLowerCase(),
  );
}

export function getMysteryCards(
  cards: LearningCard[],
): LearningCard[] {
  return cards.filter(
    (card) =>
      card.type === "mystery",
  );
}

// ======================================================
// COLLECTION STATS
// ======================================================

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
      (collected.length /
        totalCards) *
        100,
    ),
  );
}

export function getCardUsageCount(
  card: CollectedCard,
): number {
  return (
    card.timesUsed +
    card.timesPlayed
  );
}

// ======================================================
// VALIDATION
// ======================================================

export function validateLearningCard(
  card: LearningCard,
): string[] {
  const errors: string[] = [];

  if (
    !card.title?.trim()
  ) {
    errors.push(
      "Card title is required.",
    );
  }

  if (
    !card.content?.trim()
  ) {
    errors.push(
      "Card content is required.",
    );
  }

  if (!card.level) {
    errors.push(
      "Card level is required.",
    );
  }

  if (!card.topic.trim()) {
    errors.push(
      "Card topic is required.",
    );
  }

  if (!card.type) {
    errors.push(
      "Card type is required.",
    );
  }

  if (card.xpCost < 0) {
    errors.push(
      "Card XP cost cannot be negative.",
    );
  }

  if (
    card.xpReward !==
      undefined &&
    card.xpReward < 0
  ) {
    errors.push(
      "Card XP reward cannot be negative.",
    );
  }

  return errors;
}
  
