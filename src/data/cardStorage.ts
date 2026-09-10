import {
  createLearningCard,
  normalizeCollectedCard,
  normalizeLearningCard,
  type CollectedCard,
  type LearningCard,
} from "./cards";

const STORAGE_KEY = "dre2learn-cards";

export interface CardStorageData {
  cards: LearningCard[];
  collected: CollectedCard[];
}

const DEFAULT_DATA: CardStorageData = {
  cards: [],
  collected: [],
};

// ======================================================
// INTERNAL STORAGE
// ======================================================

function readData(): CardStorageData {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        cards: [],
        collected: [],
      };
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {
        cards: [],
        collected: [],
      };
    }

    const value =
      parsed as Partial<CardStorageData>;

    return {
      cards: Array.isArray(value.cards)
        ? value.cards.map((card) =>
            normalizeLearningCard(card),
          )
        : [],

      collected: Array.isArray(
        value.collected,
      )
        ? value.collected.map((card) =>
            normalizeCollectedCard(card),
          )
        : [],
    };
  } catch {
    return {
      cards: [],
      collected: [],
    };
  }
}

function writeData(
  data: CardStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

// ======================================================
// GET
// ======================================================

export function getCardStorage(): CardStorageData {
  return readData();
}

export function saveCardStorage(
  data: CardStorageData,
): void {
  writeData({
    cards: data.cards.map(
      normalizeLearningCard,
    ),

    collected: data.collected.map(
      normalizeCollectedCard,
    ),
  });
}

export function getAllLearningCards(): LearningCard[] {
  return readData().cards;
}

export function getCollectedCards(): CollectedCard[] {
  return readData().collected;
}

export function getLearningCardById(
  cardId: string,
): LearningCard | null {
  const card =
    readData().cards.find(
      (item) =>
        item.id === cardId,
    );

  return card ?? null;
}

export function getCollectedCardById(
  cardId: string,
): CollectedCard | null {
  const collected =
    readData().collected.find(
      (item) =>
        item.cardId === cardId,
    );

  return collected ?? null;
}

// ======================================================
// CREATE / SAVE CARD
// ======================================================

export function saveLearningCard(
  card: LearningCard,
): LearningCard {
  const data = readData();

  const normalized =
    normalizeLearningCard(card);

  const index =
    data.cards.findIndex(
      (item) =>
        item.id === normalized.id,
    );

  if (index >= 0) {
    data.cards[index] =
      normalized;
  } else {
    data.cards.push(
      normalized,
    );
  }

  writeData(data);

  return normalized;
}

export function createAndSaveLearningCard(
  input: Omit<
    LearningCard,
    "id" | "createdAt"
  >,
): LearningCard {
  return saveLearningCard(
    createLearningCard(input),
  );
}

// ======================================================
// COLLECT CARD
// ======================================================
// IMPORTANT:
// Collecting a card costs 1 XP.
//
// The actual XP deduction is handled by
// storage.ts through the real AppState.
//
// This storage function only records that
// the card was collected.
// ======================================================

export interface CollectStoredCardResult {
  success: boolean;
  cardId: string | null;
}

export function collectStoredCard(
  cardId: string,
): CollectStoredCardResult {
  const data = readData();

  const cardExists =
    data.cards.some(
      (card) =>
        card.id === cardId,
    );

  if (!cardExists) {
    return {
      success: false,
      cardId: null,
    };
  }

  const alreadyCollected =
    data.collected.some(
      (card) =>
        card.cardId === cardId,
    );

  if (alreadyCollected) {
    return {
      success: false,
      cardId: null,
    };
  }

  data.collected.push({
    cardId,

    collectedAt:
      new Date().toISOString(),

    timesUsed: 0,

    timesPlayed: 0,

    rewardClaimed: false,
  });

  writeData(data);

  return {
    success: true,
    cardId,
  };
}

// ======================================================
// REMOVE COLLECTED CARD
// ======================================================

export function removeCollectedCard(
  cardId: string,
): boolean {
  const data = readData();

  const before =
    data.collected.length;

  data.collected =
    data.collected.filter(
      (card) =>
        card.cardId !== cardId,
    );

  if (
    before ===
    data.collected.length
  ) {
    return false;
  }

  writeData(data);

  return true;
}

// ======================================================
// USE CARD
// ======================================================
// Does NOT give XP.
// Only increases timesUsed.
//
// XP rewards are handled by storage.ts.
// ======================================================

export function useStoredCard(
  cardId: string,
): boolean {
  const data = readData();

  const index =
    data.collected.findIndex(
      (card) =>
        card.cardId === cardId,
    );

  if (index < 0) {
    return false;
  }

  const collected =
    data.collected[index];

  data.collected[index] = {
    ...collected,

    timesUsed:
      collected.timesUsed + 1,
  };

  writeData(data);

  return true;
}

// ======================================================
// PLAY CARD
// ======================================================
// Does NOT give XP.
// Only increases timesPlayed.
// ======================================================

export function playStoredCard(
  cardId: string,
): boolean {
  const data = readData();

  const index =
    data.collected.findIndex(
      (card) =>
        card.cardId === cardId,
    );

  if (index < 0) {
    return false;
  }

  const collected =
    data.collected[index];

  data.collected[index] = {
    ...collected,

    timesPlayed:
      collected.timesPlayed + 1,
  };

  writeData(data);

  return true;
}

// ======================================================
// COMPLETE CARD
// ======================================================
// Completing a card gives +3 XP.
//
// IMPORTANT:
// This function only marks the card reward
// as claimed.
//
// The actual +3 XP must be handled by
// storage.ts using the real AppState.
// ======================================================

export interface CompleteStoredCardResult {
  success: boolean;
  rewardGranted: boolean;
  xpReward: number;
}

export function completeStoredCard(
  cardId: string,
): CompleteStoredCardResult {
  const data = readData();

  const index =
    data.collected.findIndex(
      (card) =>
        card.cardId === cardId,
    );

  if (index < 0) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  const collected =
    data.collected[index];

  // Reward already claimed.
  if (collected.rewardClaimed) {
    data.collected[index] = {
      ...collected,

      timesUsed:
        collected.timesUsed + 1,
    };

    writeData(data);

    return {
      success: true,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  data.collected[index] = {
    ...collected,

    timesUsed:
      collected.timesUsed + 1,

    rewardClaimed: true,
  };

  writeData(data);

  return {
    success: true,
    rewardGranted: true,
    xpReward: 3,
  };
}

// ======================================================
// CARD REWARD STATUS
// ======================================================

export function hasStoredCardRewardClaimed(
  cardId: string,
): boolean {
  const collected =
    getCollectedCardById(cardId);

  return (
    collected?.rewardClaimed === true
  );
}

// ======================================================
// CARD USAGE
// ======================================================

export function getStoredCardTimesUsed(
  cardId: string,
): number {
  return (
    getCollectedCardById(
      cardId,
    )?.timesUsed ?? 0
  );
}

export function getStoredCardTimesPlayed(
  cardId: string,
): number {
  return (
    getCollectedCardById(
      cardId,
    )?.timesPlayed ?? 0
  );
}

export function getStoredCardUsage(
  cardId: string,
): {
  timesUsed: number;
  timesPlayed: number;
  total: number;
} {
  const collected =
    getCollectedCardById(cardId);

  if (!collected) {
    return {
      timesUsed: 0,
      timesPlayed: 0,
      total: 0,
    };
  }

  return {
    timesUsed:
      collected.timesUsed,

    timesPlayed:
      collected.timesPlayed,

    total:
      collected.timesUsed +
      collected.timesPlayed,
  };
}

// ======================================================
// DELETE
// ======================================================

export function deleteLearningCard(
  cardId: string,
): boolean {
  const data = readData();

  const before =
    data.cards.length;

  data.cards =
    data.cards.filter(
      (card) =>
        card.id !== cardId,
    );

  data.collected =
    data.collected.filter(
      (card) =>
        card.cardId !== cardId,
    );

  if (
    before ===
    data.cards.length
  ) {
    return false;
  }

  writeData(data);

  return true;
}

// ======================================================
// CLEAR
// ======================================================

export function clearCardStorage(): void {
  localStorage.removeItem(
    STORAGE_KEY,
  );
}

// ======================================================
// INITIALIZE
// ======================================================

export function initializeCardStorage(): void {
  if (
    !localStorage.getItem(
      STORAGE_KEY,
    )
  ) {
    writeData(DEFAULT_DATA);
  }
}