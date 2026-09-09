import type {
  Level,
  XpReward,
} from "../types";

/**
 * DRE2learn XP System
 *
 * XP is earned by completing learning activities.
 * The application is completely free.
 * XP is used for progress, levels, cards, and identity-card renewal.
 */

/* -------------------------------------------------------------------------- */
/* XP REWARDS                                                                 */
/* -------------------------------------------------------------------------- */

export const XP_REWARDS: Record<
  XpReward["action"],
  XpReward
> = {
  article: {
    action: "article",
    amount: 10,
    description: "Complete an article",
  },

  vocabulary: {
    action: "vocabulary",
    amount: 2,
    description: "Learn a new vocabulary word",
  },

  practice: {
    action: "practice",
    amount: 5,
    description: "Complete a practice activity",
  },

  room: {
    action: "room",
    amount: 5,
    description: "Join a learning room",
  },

  card: {
    action: "card",
    amount: 3,
    description: "Complete a card challenge",
  },

  levelTest: {
    action: "levelTest",
    amount: 50,
    description: "Complete the level test",
  },

  daily: {
    action: "daily",
    amount: 10,
    description: "Complete the daily learning goal",
  },
};

/* -------------------------------------------------------------------------- */
/* XP LEVELS                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * XP required to reach each CEFR level.
 *
 * These are DRE2learn progression thresholds,
 * not official CEFR requirements.
 */

export const XP_LEVEL_THRESHOLDS: Record<
  Level,
  number
> = {
  A1: 0,
  A2: 100,
  B1: 300,
  B2: 700,
  C1: 1400,
  C2: 2500,
};

/* -------------------------------------------------------------------------- */
/* IDENTITY CARD                                                              */
/* -------------------------------------------------------------------------- */

/**
 * XP required to renew an expired identity card.
 */
export const IDENTITY_CARD_RENEWAL_XP = 100;

/* -------------------------------------------------------------------------- */
/* XP HELPERS                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get the XP reward for a specific action.
 */
export function getXpReward(
  action: XpReward["action"],
): number {
  return XP_REWARDS[action].amount;
}

/**
 * Get the full reward information for an action.
 */
export function getXpRewardInfo(
  action: XpReward["action"],
): XpReward {
  return {
    ...XP_REWARDS[action],
  };
}

/**
 * Calculate total XP earned from an action count.
 */
export function calculateXp(
  action: XpReward["action"],
  count = 1,
): number {
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  return Math.floor(
    XP_REWARDS[action].amount * count,
  );
}

/**
 * Add XP to a current XP value.
 */
export function addXp(
  currentXp: number,
  amount: number,
): number {
  const safeCurrentXp =
    Number.isFinite(currentXp) && currentXp >= 0
      ? currentXp
      : 0;

  const safeAmount =
    Number.isFinite(amount) && amount > 0
      ? amount
      : 0;

  return safeCurrentXp + safeAmount;
}

/**
 * Make sure XP is always a valid non-negative number.
 */
export function normalizeXp(
  xp: number | undefined | null,
): number {
  if (
    typeof xp !== "number" ||
    !Number.isFinite(xp) ||
    xp < 0
  ) {
    return 0;
  }

  return Math.floor(xp);
}

/* -------------------------------------------------------------------------- */
/* CEFR PROGRESSION                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Get the DRE2learn progression level based on XP.
 *
 * This is separate from the user's official language
 * assessment result.
 */
export function getLevelFromXp(
  xp: number,
): Level {
  const safeXp = normalizeXp(xp);

  if (safeXp >= XP_LEVEL_THRESHOLDS.C2) {
    return "C2";
  }

  if (safeXp >= XP_LEVEL_THRESHOLDS.C1) {
    return "C1";
  }

  if (safeXp >= XP_LEVEL_THRESHOLDS.B2) {
    return "B2";
  }

  if (safeXp >= XP_LEVEL_THRESHOLDS.B1) {
    return "B1";
  }

  if (safeXp >= XP_LEVEL_THRESHOLDS.A2) {
    return "A2";
  }

  return "A1";
}

/**
 * Get the XP needed to enter the next progression level.
 */
export function getNextLevelXp(
  xp: number,
): number | null {
  const currentLevel = getLevelFromXp(xp);

  const nextLevels: Record<
    Level,
    Level | null
  > = {
    A1: "A2",
    A2: "B1",
    B1: "B2",
    B2: "C1",
    C1: "C2",
    C2: null,
  };

  const nextLevel =
    nextLevels[currentLevel];

  if (!nextLevel) {
    return null;
  }

  return XP_LEVEL_THRESHOLDS[nextLevel];
}

/**
 * Get how much XP remains before the next level.
 */
export function getXpToNextLevel(
  xp: number,
): number {
  const safeXp = normalizeXp(xp);
  const nextLevelXp = getNextLevelXp(safeXp);

  if (nextLevelXp === null) {
    return 0;
  }

  return Math.max(
    0,
    nextLevelXp - safeXp,
  );
}

/**
 * Get progress percentage toward the next XP level.
 */
export function getXpProgress(
  xp: number,
): number {
  const safeXp = normalizeXp(xp);
  const currentLevel =
    getLevelFromXp(safeXp);

  const nextLevelXp =
    getNextLevelXp(safeXp);

  if (nextLevelXp === null) {
    return 100;
  }

  const currentLevelXp =
    XP_LEVEL_THRESHOLDS[currentLevel];

  const range =
    nextLevelXp - currentLevelXp;

  if (range <= 0) {
    return 100;
  }

  const progress =
    ((safeXp - currentLevelXp) / range) *
    100;

  return Math.min(
    100,
    Math.max(0, progress),
  );
}

/* -------------------------------------------------------------------------- */
/* LEVEL INFORMATION                                                          */
/* -------------------------------------------------------------------------- */

export interface XpLevelInfo {
  level: Level;
  currentXp: number;
  requiredXp: number;
  nextLevel: Level | null;
  nextLevelXp: number | null;
  xpToNextLevel: number;
  progressPercentage: number;
}

/**
 * Get complete XP progression information.
 */
export function getXpLevelInfo(
  xp: number,
): XpLevelInfo {
  const safeXp = normalizeXp(xp);
  const level = getLevelFromXp(safeXp);
  const nextLevelXp =
    getNextLevelXp(safeXp);

  const nextLevel: Level | null =
    nextLevelXp === null
      ? null
      : getNextLevel(level);

  return {
    level,
    currentXp: safeXp,
    requiredXp:
      XP_LEVEL_THRESHOLDS[level],
    nextLevel,
    nextLevelXp,
    xpToNextLevel:
      getXpToNextLevel(safeXp),
    progressPercentage:
      getXpProgress(safeXp),
  };
}

/**
 * Get the next CEFR progression level.
 */
export function getNextLevel(
  level: Level,
): Level | null {
  const levels: Level[] = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
  ];

  const index = levels.indexOf(level);

  if (index === -1) {
    return null;
  }

  return levels[index + 1] ?? null;
}

/* -------------------------------------------------------------------------- */
/* XP VALIDATION                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the user has enough XP.
 */
export function hasEnoughXp(
  currentXp: number,
  requiredXp: number,
): boolean {
  return (
    normalizeXp(currentXp) >=
    Math.max(0, Math.floor(requiredXp))
  );
}

/**
 * Check whether the user can afford an XP purchase.
 */
export function canSpendXp(
  currentXp: number,
  cost: number,
): boolean {
  if (
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    return false;
  }

  return normalizeXp(currentXp) >=
    Math.floor(cost);
}

/**
 * Spend XP safely.
 */
export function spendXp(
  currentXp: number,
  cost: number,
): number | null {
  if (!canSpendXp(currentXp, cost)) {
    return null;
  }

  return normalizeXp(currentXp) -
    Math.floor(cost);
}

/* -------------------------------------------------------------------------- */
/* CARD XP                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Calculate the net XP after buying a learning card
 * and completing its challenge.
 */
export function calculateCardNetXp(
  cardCost: number,
  cardReward: number,
): number {
  const safeCost =
    Number.isFinite(cardCost) && cardCost >= 0
      ? Math.floor(cardCost)
      : 0;

  const safeReward =
    Number.isFinite(cardReward) &&
    cardReward >= 0
      ? Math.floor(cardReward)
      : 0;

  return safeReward - safeCost;
}

/* -------------------------------------------------------------------------- */
/* DAILY XP                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Maximum bonus XP that can be earned from the
 * standard daily goal.
 */
export const DAILY_XP_REWARD =
  XP_REWARDS.daily.amount;

/**
 * Check whether the daily reward can be claimed.
 */
export function canClaimDailyXp(
  claimedToday: boolean,
): boolean {
  return !claimedToday;
}

/* -------------------------------------------------------------------------- */
/* IDENTITY CARD XP                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the user can renew their identity card.
 */
export function canRenewIdentityCard(
  xp: number,
): boolean {
  return hasEnoughXp(
    xp,
    IDENTITY_CARD_RENEWAL_XP,
  );
}

/**
 * Calculate XP after identity-card renewal.
 */
export function renewIdentityCardXp(
  xp: number,
): number | null {
  return spendXp(
    xp,
    IDENTITY_CARD_RENEWAL_XP,
  );
}

/* -------------------------------------------------------------------------- */
/* XP MILESTONES                                                              */
/* -------------------------------------------------------------------------- */

export interface XpMilestone {
  xp: number;
  title: string;
  description: string;
}

export const XP_MILESTONES: XpMilestone[] = [
  {
    xp: 50,
    title: "First Steps",
    description:
      "You earned your first 50 XP.",
  },
  {
    xp: 100,
    title: "Getting Started",
    description:
      "You reached 100 XP.",
  },
  {
    xp: 300,
    title: "Language Explorer",
    description:
      "You reached 300 XP.",
  },
  {
    xp: 700,
    title: "Confident Learner",
    description:
      "You reached 700 XP.",
  },
  {
    xp: 1400,
    title: "Advanced Learner",
    description:
      "You reached 1,400 XP.",
  },
  {
    xp: 2500,
    title: "Language Master",
    description:
      "You reached 2,500 XP.",
  },
];

/**
 * Get the highest milestone reached.
 */
export function getReachedMilestone(
  xp: number,
): XpMilestone | null {
  const safeXp = normalizeXp(xp);

  let reached: XpMilestone | null = null;

  for (const milestone of XP_MILESTONES) {
    if (safeXp >= milestone.xp) {
      reached = milestone;
    }
  }

  return reached;
}

/**
 * Get all milestones reached by the user.
 */
export function getReachedMilestones(
  xp: number,
): XpMilestone[] {
  const safeXp = normalizeXp(xp);

  return XP_MILESTONES.filter(
    (milestone) =>
      safeXp >= milestone.xp,
  );
}

/* -------------------------------------------------------------------------- */
/* XP SUMMARY                                                                 */
/* -------------------------------------------------------------------------- */

export interface XpSummary {
  totalXp: number;
  level: Level;
  progressPercentage: number;
  xpToNextLevel: number;
  nextLevel: Level | null;
  milestone: XpMilestone | null;
}

/**
 * Get a compact XP summary for Home/Profile/Progress.
 */
export function getXpSummary(
  xp: number,
): XpSummary {
  const safeXp = normalizeXp(xp);
  const level = getLevelFromXp(safeXp);

  return {
    totalXp: safeXp,
    level,
    progressPercentage:
      getXpProgress(safeXp),
    xpToNextLevel:
      getXpToNextLevel(safeXp),
    nextLevel:
      getNextLevel(level),
    milestone:
      getReachedMilestone(safeXp),
  };
}