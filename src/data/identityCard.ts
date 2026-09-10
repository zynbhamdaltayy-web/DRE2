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

// ======================================================
// DRE2LEARN IDENTITY CARD / الموحدة
// ======================================================

/**
 * DRE2learn brand orange.
 *
 * This is a DRE2learn visual reference inspired by
 * Apple's Cosmic Orange.
 *
 * Apple does not publish an official HEX value for
 * Cosmic Orange, so this is NOT an Apple-certified HEX.
 */
export const DRE2LEARN_ORANGE = "#E86F24";

export const IDENTITY_CARD_BACKGROUND = "#FFF8F3";

export const IDENTITY_CARD_THEME = {
  primary: DRE2LEARN_ORANGE,
  background: IDENTITY_CARD_BACKGROUND,
} as const;

// ======================================================
// CARD CONSTANTS
// ======================================================

/*
 * Identity Card validity:
 * 30 days from the issue date.
 */
export const IDENTITY_CARD_VALIDITY_DAYS = 30;

export const IDENTITY_CARD_RENEWAL_COST =
  IDENTITY_CARD_RENEWAL_XP;

// ======================================================
// COUNTRY
// ======================================================

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  mapCode: string;
}

/**
 * Convert an ISO alpha-2 country code into its flag emoji.
 *
 * This means we do not need to maintain a huge
 * hardcoded list of flags.
 */
export function getCountryFlag(
  countryCode: string,
): string {
  const normalized =
    countryCode
      .trim()
      .toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return "🌍";
  }

  return normalized
    .split("")
    .map(
      (letter) =>
        String.fromCodePoint(
          127397 +
            letter.charCodeAt(0),
        ),
    )
    .join("");
}

// ======================================================
// COUNTRY NAME
// ======================================================

/**
 * Get the localized English country name using
 * the browser's built-in Intl API.
 *
 * This supports ISO country codes without requiring
 * a hardcoded country-name database.
 */
export function getCountryName(
  countryCode: string,
  locale = "en",
): string {
  const normalized =
    countryCode
      .trim()
      .toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return "International";
  }

  try {
    const DisplayNames =
      Intl.DisplayNames;

    const displayNames =
      new DisplayNames(
        [locale],
        {
          type: "region",
        },
      );

    return (
      displayNames.of(normalized) ??
      "International"
    );
  } catch {
    return "International";
  }
}

// ======================================================
// COUNTRY INFO
// ======================================================

/**
 * Return all country information required by
 * the Identity Card.
 *
 * mapCode is intentionally the ISO alpha-2 code.
 * The actual transparent country-map asset will be
 * connected by the final UI/assets layer.
 */
export function getCountryInfo(
  countryCode: string,
): CountryInfo {
  const normalized =
    countryCode
      .trim()
      .toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return {
      code: "UN",
      name: "International",
      flag: "🌍",
      mapCode: "world",
    };
  }

  return {
    code: normalized,

    name:
      getCountryName(
        normalized,
      ),

    flag:
      getCountryFlag(
        normalized,
      ),

    mapCode:
      normalized.toLowerCase(),
  };
}

// ======================================================
// COUNTRY HELPERS
// ======================================================

export function getCountryMapCode(
  countryCode: string,
): string {
  return getCountryInfo(
    countryCode,
  ).mapCode;
}

// ======================================================
// DATE HELPERS
// ======================================================

export function addDays(
  date: Date,
  days: number,
): Date {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}

export function toIsoDate(
  date: Date,
): string {
  return date.toISOString();
}

// ======================================================
// CREATE CARD DATES
// ======================================================

export function createIdentityCardDates(
  issueDate = new Date(),
): IdentityCard {
  const expiresAt =
    addDays(
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

// ======================================================
// CARD ISSUANCE
// ======================================================

/**
 * A DRE2learn Identity Card can only be issued
 * after the user completes the Level Test.
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

// ======================================================
// ISSUE CARD
// ======================================================

export function issueIdentityCard(
  user: UserProfile,
  issueDate = new Date(),
): UserProfile | null {
  if (
    !canIssueIdentityCard(
      user,
    )
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

// ======================================================
// CARD EXISTENCE
// ======================================================

export function hasIdentityCard(
  user: UserProfile | null,
): boolean {
  return Boolean(
    user?.identityCard,
  );
}

// ======================================================
// CARD STATUS
// ======================================================

export type IdentityCardStatus =
  | "not-issued"
  | "active"
  | "expired";

export function getIdentityCardStatus(
  user: UserProfile | null,
  now = new Date(),
): IdentityCardStatus {
  if (!user?.identityCard) {
    return "not-issued";
  }

  const expiresAt =
    new Date(
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

// ======================================================
// ACTIVE / EXPIRED
// ======================================================

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

// ======================================================
// REMAINING DAYS
// ======================================================

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

export function getIdentityCardRemainingDays(
  user: UserProfile | null,
  now = new Date(),
): number {
  if (!user?.identityCard) {
    return 0;
  }

  const expiresAt =
    new Date(
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

// ======================================================
// RENEWAL
// ======================================================

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

// ======================================================
// RENEW CARD
// ======================================================

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

  if (
    remainingXp === null
  ) {
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

// ======================================================
// DISPLAY DATA
// ======================================================

export interface IdentityCardDisplayData {
  name: string;

  xp: number;

  level: Level;

  countryCode: string;

  countryName: string;

  countryFlag: string;

  countryMapCode: string;

  issuedAt: string;

  expiresAt: string;

  status: IdentityCardStatus;

  remainingDays: number;

  renewalXpCost: number;

  canRenew: boolean;

  brandColor: string;

  backgroundColor: string;
}

// ======================================================
// GET DISPLAY DATA
// ======================================================

export function getIdentityCardDisplayData(
  user: UserProfile,
  now = new Date(),
): IdentityCardDisplayData | null {
  if (!user.identityCard) {
    return null;
  }

  const country =
    getCountryInfo(
      user.countryCode,
    );

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

    countryCode:
      country.code,

    countryName:
      country.name,

    countryFlag:
      country.flag,

    countryMapCode:
      country.mapCode,

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

    brandColor:
      DRE2LEARN_ORANGE,

    backgroundColor:
      IDENTITY_CARD_BACKGROUND,
  };
}

// ======================================================
// DATE DISPLAY
// ======================================================

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

// ======================================================
// STATUS LABEL
// ======================================================

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

// ======================================================
// EXACT CARD FIELDS
// ======================================================

export const IDENTITY_CARD_FIELDS = [
  "name",
  "xp",
  "level",
  "countryFlag",
  "countryMap",
  "issuedAt",
  "expiresAt",
] as const;

// ======================================================
// CARD VISUALS
// ======================================================

export const IDENTITY_CARD_VISUALS = {
  logo: "DRE2learn",

  brandColor:
    DRE2LEARN_ORANGE,

  countryFlag: true,

  countryMap: true,

  transparentCountryMap:
    true,
} as const;


  

  
    
  
  

