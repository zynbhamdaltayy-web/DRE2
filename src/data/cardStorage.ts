import {
  collectCard,
  createLearningCard,
  normalizeCollectedCard,
  normalizeLearningCard,
  useCollectedCard,
  playCollectedCard,
  completeCollectedCard,
  type CollectedCard,
  type LearningCard,
} from "./cards";

const STORAGE_KEY =
  "dre2learn-cards";

export interface CardStorageData {
  cards: LearningCard[];
  collected: CollectedCard[];
}

const DEFAULT_DATA: CardStorageData = {
  cards: [],
  collected: [],
};

// ======================================================
// READ / WRITE
// ======================================================

function readData(): CardStorageData {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      );

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
      typeof parsed !==
        "object"
    ) {
      return {
        cards: [],
        collected: [],
      };
    }

    const value =
      parsed as Partial<CardStorageData>;

    return {
      cards:
        Array.isArray(
          value.cards,
        )
          ? value.cards.map(
              (card) =>
                normalizeLearningCard(
                  card,
                ),
            )
          : [],

      collected:
        Array.isArray(
          value.collected,
        )
          ? value.collected.map(
              (card) =>
                normalizeCollectedCard(
                  card,
                ),
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
  writeData(data);
}

export function getAllLearningCards(): LearningCard[] {
  return readData().cards;
}

export function getCollectedCards(): CollectedCard[] {
  return readData().collected;
}

// ======================================================
// CREATE / SAVE CARD
// ======================================================

export function saveLearningCard(
  card: LearningCard,
): LearningCard {
  const data = readData();

  const normalized =
    normalizeLearningCard(
      card,
    );

  const index =
    data.cards.findIndex(
      (item) =>
        item.id ===
        normalized.id,
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
    createLearningCard(
      input,
    ),
  );
}

// ======================================================
// COLLECT
// ======================================================

export function collectStoredCard(
  cardId: string,
): boolean {
  const data = readData();

  const cardExists =
    data.cards.some(
      (card) =>
        card.id === cardId,
    );

  if (!cardExists) {
    return false;
  }

  if (
    data.collected.some(
      (card) =>
        card.cardId === cardId,
    )
  ) {
    return false;
  }

  data.collected =
    collectCard(
      data.collected,
      cardId,
    );

  writeData(data);

  return true;
}

// ======================================================
// USE CARD
// ======================================================

export function useStoredCard(
  cardId: string,
): boolean {
  const data = readData();

  const exists =
    data.collected.some(
      (card) =>
        card.cardId === cardId,
    );

  if (!exists) {
    return false;
  }

  data.collected =
    useCollectedCard(
      data.collected,
      cardId,
    );

  writeData(data);

  return true;
}

// ======================================================
// PLAY CARD
// ======================================================

export function playStoredCard(
  cardId: string,
): boolean {
  const data = readData();

  const exists =
    data.collected.some(
      (card) =>
        card.cardId === cardId,
    );

  if (!exists) {
    return false;
  }

  data.collected =
    playCollectedCard(
      data.collected,
      cardId,
    );

  writeData(data);

  return true;
}

// ======================================================
// COMPLETE CARD
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

  const card =
    data.cards.find(
      (item) =>
        item.id === cardId,
    );

  if (!card) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  const collected =
    data.collected.some(
      (item) =>
        item.cardId ===
        cardId,
    );

  if (!collected) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  const result =
    completeCollectedCard(
      data.collected,
      card,
    );

  data.collected =
    result.cards;

  writeData(data);

  return {
    success: true,
    rewardGranted:
      result.rewardGranted,

    xpReward:
      result.xpReward,
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
    writeData(
      DEFAULT_DATA,
    );
  }
}