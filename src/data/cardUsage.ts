import type { LearningCard } from "./cards";

const STORAGE_KEY = "dre2learn-card-usage";

export interface UserCardUsage {
  userId: string;
  cardId: string;

  timesUsed: number;
  timesPlayed: number;

  rewardClaimed: boolean;
  firstUsedAt: string;
  lastUsedAt: string;
}

type CardUsageStorage = Record<string, UserCardUsage[]>;

function readUsage(): CardUsageStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as CardUsageStorage;
  } catch {
    return {};
  }
}

function saveUsage(
  data: CardUsageStorage,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

function getUserUsage(
  userId: string,
): UserCardUsage[] {
  const data = readUsage();

  return Array.isArray(data[userId])
    ? data[userId]
    : [];
}

function findCardUsage(
  userId: string,
  cardId: string,
): UserCardUsage | undefined {
  return getUserUsage(userId).find(
    (item) => item.cardId === cardId,
  );
}

/**
 * Records a normal card use.
 *
 * timesUsed increases every time the card is used.
 * XP is NOT granted here.
 */
export function recordCardUse(
  userId: string,
  card: LearningCard,
): UserCardUsage {
  if (!userId.trim()) {
    throw new Error("A valid user ID is required.");
  }

  if (!card.id) {
    throw new Error("A valid card ID is required.");
  }

  const data = readUsage();

  if (!Array.isArray(data[userId])) {
    data[userId] = [];
  }

  const now = new Date().toISOString();

  const existing = data[userId].find(
    (item) => item.cardId === card.id,
  );

  if (existing) {
    existing.timesUsed += 1;
    existing.lastUsedAt = now;

    saveUsage(data);

    return { ...existing };
  }

  const newUsage: UserCardUsage = {
    userId,
    cardId: card.id,
    timesUsed: 1,
    timesPlayed: 0,
    rewardClaimed: false,
    firstUsedAt: now,
    lastUsedAt: now,
  };

  data[userId].push(newUsage);

  saveUsage(data);

  return { ...newUsage };
}

/**
 * Records a card being played.
 *
 * timesPlayed increases every time the card is played.
 * XP is NOT granted here.
 */
export function recordCardPlay(
  userId: string,
  card: LearningCard,
): UserCardUsage {
  if (!userId.trim()) {
    throw new Error("A valid user ID is required.");
  }

  if (!card.id) {
    throw new Error("A valid card ID is required.");
  }

  const data = readUsage();

  if (!Array.isArray(data[userId])) {
    data[userId] = [];
  }

  const now = new Date().toISOString();

  const existing = data[userId].find(
    (item) => item.cardId === card.id,
  );

  if (existing) {
    existing.timesPlayed += 1;
    existing.lastUsedAt = now;

    saveUsage(data);

    return { ...existing };
  }

  const newUsage: UserCardUsage = {
    userId,
    cardId: card.id,
    timesUsed: 0,
    timesPlayed: 1,
    rewardClaimed: false,
    firstUsedAt: now,
    lastUsedAt: now,
  };

  data[userId].push(newUsage);

  saveUsage(data);

  return { ...newUsage };
}

/**
 * Completes a card and grants XP only once.
 *
 * Repeating this function for the same user + card
 * will never grant the XP reward again.
 */
export function completeCard(
  userId: string,
  card: LearningCard,
): {
  usage: UserCardUsage;
  rewardGranted: boolean;
  xpReward: number;
} {
  if (!userId.trim()) {
    throw new Error("A valid user ID is required.");
  }

  if (!card.id) {
    throw new Error("A valid card ID is required.");
  }

  const data = readUsage();

  if (!Array.isArray(data[userId])) {
    data[userId] = [];
  }

  const now = new Date().toISOString();

  let usage = data[userId].find(
    (item) => item.cardId === card.id,
  );

  // ---------------------------------------------
  // Create usage record if this is the first time.
  // ---------------------------------------------

  if (!usage) {
    usage = {
      userId,
      cardId: card.id,
      timesUsed: 1,
      timesPlayed: 0,
      rewardClaimed: false,
      firstUsedAt: now,
      lastUsedAt: now,
    };

    data[userId].push(usage);
  } else {
    // Completing the card is also a use.
    usage.timesUsed += 1;
    usage.lastUsedAt = now;
  }

  // ---------------------------------------------
  // IMPORTANT:
  // XP reward can only be claimed once.
  // ---------------------------------------------

  if (usage.rewardClaimed) {
    saveUsage(data);

    return {
      usage: { ...usage },
      rewardGranted: false,
      xpReward: 0,
    };
  }

  const reward = Math.max(
    0,
    card.xpReward ?? 3,
  );

  usage.rewardClaimed = true;

  saveUsage(data);

  return {
    usage: { ...usage },
    rewardGranted: reward > 0,
    xpReward: reward,
  };
}

/**
 * Returns the usage information for one card.
 */
export function getCardUsage(
  userId: string,
  cardId: string,
): UserCardUsage | null {
  return (
    findCardUsage(userId, cardId) ?? null
  );
}

/**
 * Checks whether the XP reward has already
 * been claimed for this card.
 */
export function hasClaimedCardReward(
  userId: string,
  cardId: string,
): boolean {
  const usage = findCardUsage(
    userId,
    cardId,
  );

  return usage?.rewardClaimed === true;
}

/**
 * Returns all card usage records for a user.
 */
export function getAllUserCardUsage(
  userId: string,
): UserCardUsage[] {
  return [...getUserUsage(userId)];
}

/**
 * Returns the total number of card uses
 * for a user.
 */
export function getTotalCardUses(
  userId: string,
): number {
  return getUserUsage(userId).reduce(
    (total, item) =>
      total + item.timesUsed,
    0,
  );
}

/**
 * Returns the total number of card plays
 * for a user.
 */
export function getTotalCardPlays(
  userId: string,
): number {
  return getUserUsage(userId).reduce(
    (total, item) =>
      total + item.timesPlayed,
    0,
  );
}

/**
 * Deletes all card usage data for a user.
 */
export function clearUserCardUsage(
  userId: string,
): void {
  const data = readUsage();

  delete data[userId];

  saveUsage(data);
}