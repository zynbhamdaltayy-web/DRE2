import type { LearningCard } from "./cards";

const STORAGE_KEY = "dre2learn-card-completions";

export interface CardCompletion {
  userId: string;
  cardId: string;
  completedAt: string;
  rewardClaimed: boolean;
}

type CompletionStorage = Record<string, CardCompletion[]>;

function readCompletions(): CompletionStorage {
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

    return parsed as CompletionStorage;
  } catch {
    return {};
  }
}

function saveCompletions(
  data: CompletionStorage,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

function getUserCompletions(
  userId: string,
): CardCompletion[] {
  const data = readCompletions();

  return Array.isArray(data[userId])
    ? data[userId]
    : [];
}

function hasCompletedCard(
  userId: string,
  cardId: string,
): boolean {
  const completions = getUserCompletions(userId);

  return completions.some(
    (completion) =>
      completion.cardId === cardId &&
      completion.rewardClaimed === true,
  );
}

/**
 * Attempts to complete a card for a user.
 *
 * The completion reward can only be claimed once
 * for the same user + card combination.
 */
export function completeCardOnce(
  userId: string,
  card: LearningCard,
): {
  success: boolean;
  rewardGranted: boolean;
  xpReward: number;
  completion: CardCompletion | null;
  message: string;
} {
  if (!userId.trim()) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
      completion: null,
      message: "A valid user ID is required.",
    };
  }

  if (!card.id) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
      completion: null,
      message: "A valid card ID is required.",
    };
  }

  // --------------------------------------------------
  // IMPORTANT:
  // Check the saved completion BEFORE granting XP.
  // --------------------------------------------------

  if (hasCompletedCard(userId, card.id)) {
    return {
      success: false,
      rewardGranted: false,
      xpReward: 0,
      completion:
        getUserCompletions(userId).find(
          (completion) =>
            completion.cardId === card.id,
        ) ?? null,
      message:
        "This card has already granted its completion reward.",
    };
  }

  const reward = Math.max(
    0,
    card.xpReward ?? 3,
  );

  const completion: CardCompletion = {
    userId,
    cardId: card.id,
    completedAt: new Date().toISOString(),
    rewardClaimed: true,
  };

  const data = readCompletions();

  if (!Array.isArray(data[userId])) {
    data[userId] = [];
  }

  data[userId].push(completion);

  saveCompletions(data);

  return {
    success: true,
    rewardGranted: reward > 0,
    xpReward: reward,
    completion,
    message:
      reward > 0
        ? `Card completed. ${reward} XP reward granted.`
        : "Card completed.",
  };
}

/**
 * Checks whether the user has already completed
 * this card and claimed its reward.
 */
export function isCardCompleted(
  userId: string,
  cardId: string,
): boolean {
  return hasCompletedCard(
    userId,
    cardId,
  );
}

/**
 * Returns all completed cards for one user.
 */
export function getUserCardCompletions(
  userId: string,
): CardCompletion[] {
  return [...getUserCompletions(userId)];
}

/**
 * Returns the number of cards completed
 * by one user.
 */
export function getCompletedCardCount(
  userId: string,
): number {
  return getUserCompletions(userId).length;
}

/**
 * Removes the saved completion data for one user.
 * Useful for account deletion/reset.
 */
export function clearUserCardCompletions(
  userId: string,
): void {
  const data = readCompletions();

  delete data[userId];

  saveCompletions(data);
}