import {
  createLearningCard,
  normalizeCollectedCard,
  normalizeLearningCard,
  type CollectedCard,
  type LearningCard,
} from "./cards";

import {
  collectCardWithXP,
  useCard,
  playCard,
  completeCardWithXP,
  type AppState,
} from "../storage";

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
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        cards: [],
        collected: [],
      };
    }

    const parsed: unknown = JSON.parse(raw);

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

      collected: Array.isArray(value.collected)
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
// APP STATE HELPERS
// ======================================================

function createCardAppState(
  collectedCards: CollectedCard[],
): AppState {
  return {
    page: "home",

    user: null,

    vocabulary: [],

    completedArticles: [],

    practiceScore: 0,

    practiceAnswered: 0,

    currentArticleId: null,

    selectedLibraryLevel: "A1",

    selectedTopic: "Daily Life",

    selectedPracticeLevel: "A1",

    isAuthenticated: false,

    totalXp: 0,

    articlesRead: 0,

    vocabularyLearned: 0,

    practiceCompleted: 0,

    roomsJoined: 0,

    cardsCollected: collectedCards.length,

    levelTestScore: 0,

    levelTestTotal: 0,

    collectedCards: collectedCards,
  };
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
// Collection is now connected to storage.ts.
// Cost: 1 XP.
// The XP deduction is handled by collectCardWithXP().
// ======================================================

export interface CollectStoredCardResult {
  success: boolean;
  state: AppState;
  xpCost: number;
}

export function collectStoredCard(
  cardId: string,
): CollectStoredCardResult {
  const data = readData();

  const card =
    data.cards.find(
      (item) =>
        item.id === cardId,
    );

  if (!card) {
    return {
      success: false,
      state: createCardAppState(
        data.collected,
      ),
      xpCost: 0,
    };
  }

  const alreadyCollected =
    data.collected.some(
      (item) =>
        item.cardId === cardId,
    );

  if (alreadyCollected) {
    return {
      success: false,
      state: createCardAppState(
        data.collected,
      ),
      xpCost: 0,
    };
  }

  const state =
    createCardAppState(
      data.collected,
    );

  const result =
    collectCardWithXP(
      state,
      card,
    );

  if (
    result === state ||
    !result.collectedCards
  ) {
    return {
      success: false,
      state,
      xpCost: 0,
    };
  }

  const collected =
    result.collectedCards;

  data.collected =
    collected;

  writeData(data);

  return {
    success: true,
    state: result,
    xpCost: card.xpCost ?? 1,
  };
}

// ======================================================
// USE CARD
// ======================================================
// Does NOT give XP.
// Only increases timesUsed.
// ======================================================

export function useStoredCard(
  cardId: string,
): boolean {
  const data = readData();

  const card =
    data.cards.find(
      (item) =>
        item.id === cardId,
    );

  if (!card) {
    return false;
  }

  const exists =
    data.collected.some(
      (item) =>
        item.cardId === cardId,
    );

  if (!exists) {
    return false;
  }

  const state =
    createCardAppState(
      data.collected,
    );

  const updatedState =
    useCard(
      state,
      card,
    );

  if (
    updatedState === state ||
    !updatedState.collectedCards
  ) {
    return false;
  }

  data.collected =
    updatedState.collectedCards;

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

  const card =
    data.cards.find(
      (item) =>
        item.id === cardId,
    );

  if (!card) {
    return false;
  }

  const exists =
    data.collected.some(
      (item) =>
        item.cardId === cardId,
    );

  if (!exists) {
    return false;
  }

  const state =
    createCardAppState(
      data.collected,
    );

  const updatedState =
    playCard(
      state,
      card,
    );

  if (
    updatedState === state ||
    !updatedState.collectedCards
  ) {
    return false;
  }

  data.collected =
    updatedState.collectedCards;

  writeData(data);

  return true;
}

// ======================================================
// COMPLETE CARD
// ======================================================
// Completion reward:
// +3 XP exactly once.
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
        item.cardId === cardId,
    );

  if (!collected) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  const state =
    createCardAppState(
      data.collected,
    );

  const result =
    completeCardWithXP(
      state,
      card,
    );

  if (
    result === state ||
    !result.collectedCards
  ) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
    };
  }

  data.collected =
    result.collectedCards;

  writeData(data);

  return {
    success: true,

    rewardGranted:
      result.xpReward > 0,

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
        
          
  
    

  




  
  
        