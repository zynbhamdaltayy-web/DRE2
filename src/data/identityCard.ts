import type {
  IdentityCard,
  Level,
  UserProfile,
} from "../types";

import {
  IDENTITY_CARD_RENEWAL_XP,
  canRenewIdentityCard,
  spendXp,
} from "./xp";

/* -------------------------------------------------------------------------- */
/* DRE2LEARN IDENTITY CARD                                                    */
/* -------------------------------------------------------------------------- */

/*
 * The DRE2learn Identity Card ("الموحدة") contains:
 *
 * - User name
 * - XP
 * - Language level
 * - Small Iraq flag
 * - Transparent Iraq map background
 * - Issue date
 * - Expiry date
 *
 * The card is issued after completing the Level Test.
 * Renewal requires XP.
 */

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The identity card is valid for one year.
 */
export const IDENTITY_CARD_VALIDITY_DAYS = 365;

/**
 * XP required to renew the identity card.
 */
export const IDENTITY_CARD_RENEWAL_COST =
  IDENTITY_CARD_RENEWAL_XP;

/**
 * Official DRE2learn identity-card theme.
 *
 * The visual implementation in style.css will use
 * the official peach identity.
 */
export const IDENTITY_CARD_THEME = {
  primary: "#F6A27A",
  background: "#FFF7F2",
};

/**
 * Iraq flag used on the identity card.
 */
export const IDENTITY_CARD_COUNTRY = "Iraq";

export const IDENTITY_CARD_COUNTRY_CODE = "IQ";

/* -------------------------------------------------------------------------- */
/* DATE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Add a number of days to a date.
 */
export function addDays(
  date: Date,
  days: number,
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}

/**
 * Convert a Date to an ISO string.
 */
export function toIsoDate(
  date: Date,
): string {
  return date.toISOString();
}

/**
 * Create the issue and expiry dates for a new card.
 */
export function createIdentityCardDates(
  issueDate = new Date(),
): IdentityCard {
  const expiresAt = addDays(
    issueDate,
    IDENTITY_CARD_VALIDITY_DAYS,
  );

  return {
    issuedAt:
      toIsoDate(issueDate),

    expiresAt:
      toIsoDate(expiresAt),

    renewalXpCost:
      IDENTITY_CARD_RENEWAL_COST,
  };
}

/* -------------------------------------------------------------------------- */
/* CARD ISSUANCE                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the user is eligible to receive
 * the DRE2learn Identity Card.
 *
 * The card is issued after the Level Test.
 */
export function canIssueIdentityCard(
  user: UserProfile | null,
): boolean {
  if (!user) {
    return false;
  }

  return (
    user.levelTestCompleted === true
  );
}

/**
 * Issue the Identity Card.
 *
 * The user must have completed the Level Test.
 */
export function issueIdentityCard(
  user: UserProfile,
  issueDate = new Date(),
): UserProfile | null {
  if (
    !canIssueIdentityCard(user)
  ) {
    return null;
  }

  return {
    ...user,

    identityCard:
      createIdentityCardDates(
        issueDate,
      ),
  };
}

/**
 * Check whether a user already has a card.
 */
export function hasIdentityCard(
  user: UserProfile | null,
): boolean {
  return Boolean(
    user?.identityCard,
  );
}

/* -------------------------------------------------------------------------- */
/* CARD VALIDITY                                                              */
/* -------------------------------------------------------------------------- */

export type IdentityCardStatus =
  | "not-issued"
  | "active"
  | "expired";

/**
 * Get the current card status.
 */
export function getIdentityCardStatus(
  user: UserProfile | null,
  now = new Date(),
): IdentityCardStatus {
  if (!user?.identityCard) {
    return "not-issued";
  }

  const expiresAt = new Date(
    user.identityCard.expiresAt,
  );

  if (
    Number.isNaN(
      expiresAt.getTime(),
    )
  ) {
    return "expired";
  }

  if (
    now.getTime() >=
    expiresAt.getTime()
  ) {
    return "expired";
  }

  return "active";
}

/**
 * Check whether the card is currently active.
 */
export function isIdentityCardActive(
  user: UserProfile | null,
  now = new Date(),
): boolean {
  return (
    getIdentityCardStatus(
      user,
      now,
    ) === "active"
  );
}

/**
 * Check whether the card has expired.
 */
export function isIdentityCardExpired(
  user: UserProfile | null,
  now = new Date(),
): boolean {
  return (
    getIdentityCardStatus(
      user,
      now,
    ) === "expired"
  );
}

/* -------------------------------------------------------------------------- */
/* REMAINING DAYS                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Calculate the number of days remaining before expiry.
 */
export function getRemainingDays(
  expiresAt: Date,
  now = new Date(),
): number {
  const difference =
    expiresAt.getTime() -
    now.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24),
  );
}

/**
 * Get the remaining validity days of the user's card.
 */
export function getIdentityCardRemainingDays(
  user: UserProfile | null,
  now = new Date(),
): number {
  if (!user?.identityCard) {
    return 0;
  }

  const expiresAt = new Date(
    user.identityCard.expiresAt,
  );

  if (
    Number.isNaN(
      expiresAt.getTime(),
    )
  ) {
    return 0;
  }

  return getRemainingDays(
    expiresAt,
    now,
  );
}

/* -------------------------------------------------------------------------- */
/* RENEWAL                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the user has enough XP
 * to renew the Identity Card.
 */
export function canAffordIdentityCardRenewal(
  user: UserProfile | null,
): boolean {
  if (!user) {
    return false;
  }

  return canRenewIdentityCard(
    user.xp,
  );
}

/**
 * Check whether the expired card can be renewed.
 */
export function canRenewIdentityCardNow(
  user: UserProfile | null,
  now = new Date(),
): boolean {
  if (!user?.identityCard) {
    return false;
  }

  if (
    !isIdentityCardExpired(
      user,
      now,
    )
  ) {
    return false;
  }

  return canAffordIdentityCardRenewal(
    user,
  );
}

/**
 * Renew the Identity Card.
 *
 * Renewal:
 * - requires an expired card
 * - costs the required XP
 * - creates a new one-year validity period
 */
export function renewIdentityCard(
  user: UserProfile,
  renewalDate = new Date(),
): UserProfile | null {
  if (
    !canRenewIdentityCardNow(
      user,
      renewalDate,
    )
  ) {
    return null;
  }

  const remainingXp =
    spendXp(
      user.xp,
      IDENTITY_CARD_RENEWAL_COST,
    );

  if (remainingXp === null) {
    return null;
  }

  return {
    ...user,

    xp: remainingXp,

    identityCard:
      createIdentityCardDates(
        renewalDate,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* DISPLAY DATA                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Data required by the Identity Card UI.
 *
 * This intentionally contains only the agreed
 * DRE2learn Identity Card information.
 */
export interface IdentityCardDisplayData {
  name: string;

  xp: number;

  level: Level;

  country: string;

  countryCode: string;

  issuedAt: string;

  expiresAt: string;

  status: IdentityCardStatus;

  remainingDays: number;

  renewalXpCost: number;

  canRenew: boolean;

  theme: {
    primary: string;
    background: string;
  };
}

/**
 * Prepare Identity Card data for the UI.
 */
export function getIdentityCardDisplayData(
  user: UserProfile,
  now = new Date(),
): IdentityCardDisplayData | null {
  if (!user.identityCard) {
    return null;
  }

  const status =
    getIdentityCardStatus(
      user,
      now,
    );

  return {
    name:
      user.name,

    xp:
      user.xp,

    level:
      user.level,

    country:
      IDENTITY_CARD_COUNTRY,

    countryCode:
      IDENTITY_CARD_COUNTRY_CODE,

    issuedAt:
      user.identityCard.issuedAt,

    expiresAt:
      user.identityCard.expiresAt,

    status,

    remainingDays:
      getIdentityCardRemainingDays(
        user,
        now,
      ),

    renewalXpCost:
      user.identityCard
        .renewalXpCost ??
      IDENTITY_CARD_RENEWAL_COST,

    canRenew:
      canRenewIdentityCardNow(
        user,
        now,
      ),

    theme:
      IDENTITY_CARD_THEME,
  };
}

/* -------------------------------------------------------------------------- */
/* DATE DISPLAY                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Format a card date for display.
 */
export function formatIdentityCardDate(
  isoDate: string,
  locale = "en-US",
): string {
  const date =
    new Date(isoDate);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

/* -------------------------------------------------------------------------- */
/* STATUS LABEL                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Get a readable status label.
 */
export function getIdentityCardStatusLabel(
  status: IdentityCardStatus,
): string {
  switch (status) {
    case "active":
      return "Active";

    case "expired":
      return "Expired";

    case "not-issued":
      return "Not Issued";

    default:
      return "Not Issued";
  }
}

/* -------------------------------------------------------------------------- */
/* CARD CONTENT                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The exact fields shown on the Identity Card.
 *
 * These are kept in one place so the final UI
 * cannot accidentally add unrelated information.
 */
export const IDENTITY_CARD_FIELDS = [
  "name",
  "xp",
  "level",
  "iraqFlag",
  "iraqMap",
  "issuedAt",
  "expiresAt",
] as const;

/**
 * Visual assets expected by the final Identity Card UI.
 *
 * The actual image/SVG implementation will be handled
 * when the final main.ts and style.css are integrated.
 */
export const IDENTITY_CARD_VISUALS = {
  flag: "🇮🇶",

  map: "iraq-map",

  logo: "DRE2learn",

  theme: "peach",
} as const;