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
 * The DRE2learn Identity Card ("الموحدة") is GLOBAL.
 *
 * The card automatically uses the user's country:
 *
 * - Country name
 * - Country code
 * - Country flag
 * - Country map
 *
 * The card also contains:
 *
 * - User name
 * - XP
 * - Language level
 * - Issue date
 * - Expiry date
 *
 * The visual identity uses the DRE2learn orange
 * inspired by Apple's Cosmic Orange.
 */

/* -------------------------------------------------------------------------- */
/* BRAND                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Apple does not publish an official HEX value for
 * Cosmic Orange.
 *
 * Therefore this is a DRE2learn visual reference,
 * not an Apple-certified HEX value.
 *
 * The final visual color can be adjusted during
 * the final UI design pass.
 */
export const DRE2LEARN_ORANGE =
  "#E86F24";

/**
 * Main Identity Card background.
 */
export const IDENTITY_CARD_BACKGROUND =
  "#FFF8F3";

/**
 * Global Identity Card theme.
 */
export const IDENTITY_CARD_THEME = {
  primary: DRE2LEARN_ORANGE,
  background:
    IDENTITY_CARD_BACKGROUND,
} as const;

/* -------------------------------------------------------------------------- */
/* COUNTRY                                                                    */
/* -------------------------------------------------------------------------- */

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  mapCode: string;
}

/**
 * Global country information.
 *
 * The list contains commonly used countries and can
 * be extended without changing the Identity Card logic.
 */
export const COUNTRIES: Record<
  string,
  CountryInfo
> = {
  IQ: {
    code: "IQ",
    name: "Iraq",
    flag: "🇮🇶",
    mapCode: "iq",
  },

  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    mapCode: "us",
  },

  GB: {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    mapCode: "gb",
  },

  CA: {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    mapCode: "ca",
  },

  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    mapCode: "au",
  },

  NZ: {
    code: "NZ",
    name: "New Zealand",
    flag: "🇳🇿",
    mapCode: "nz",
  },

  DE: {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    mapCode: "de",
  },

  FR: {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    mapCode: "fr",
  },

  IT: {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    mapCode: "it",
  },

  ES: {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    mapCode: "es",
  },

  PT: {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    mapCode: "pt",
  },

  NL: {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    mapCode: "nl",
  },

  BE: {
    code: "BE",
    name: "Belgium",
    flag: "🇧🇪",
    mapCode: "be",
  },

  CH: {
    code: "CH",
    name: "Switzerland",
    flag: "🇨🇭",
    mapCode: "ch",
  },

  AT: {
    code: "AT",
    name: "Austria",
    flag: "🇦🇹",
    mapCode: "at",
  },

  SE: {
    code: "SE",
    name: "Sweden",
    flag: "🇸🇪",
    mapCode: "se",
  },

  NO: {
    code: "NO",
    name: "Norway",
    flag: "🇳🇴",
    mapCode: "no",
  },

  DK: {
    code: "DK",
    name: "Denmark",
    flag: "🇩🇰",
    mapCode: "dk",
  },

  FI: {
    code: "FI",
    name: "Finland",
    flag: "🇫🇮",
    mapCode: "fi",
  },

  IE: {
    code: "IE",
    name: "Ireland",
    flag: "🇮🇪",
    mapCode: "ie",
  },

  PL: {
    code: "PL",
    name: "Poland",
    flag: "🇵🇱",
    mapCode: "pl",
  },

  CZ: {
    code: "CZ",
    name: "Czechia",
    flag: "🇨🇿",
    mapCode: "cz",
  },

  GR: {
    code: "GR",
    name: "Greece",
    flag: "🇬🇷",
    mapCode: "gr",
  },

  TR: {
    code: "TR",
    name: "Türkiye",
    flag: "🇹🇷",
    mapCode: "tr",
  },

  SA: {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    mapCode: "sa",
  },

  AE: {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    mapCode: "ae",
  },

  QA: {
    code: "QA",
    name: "Qatar",
    flag: "🇶🇦",
    mapCode: "qa",
  },

  KW: {
    code: "KW",
    name: "Kuwait",
    flag: "🇰🇼",
    mapCode: "kw",
  },

  JO: {
    code: "JO",
    name: "Jordan",
    flag: "🇯🇴",
    mapCode: "jo",
  },

  EG: {
    code: "EG",
    name: "Egypt",
    flag: "🇪🇬",
    mapCode: "eg",
  },

  MA: {
    code: "MA",
    name: "Morocco",
    flag: "🇲🇦",
    mapCode: "ma",
  },

  TN: {
    code: "TN",
    name: "Tunisia",
    flag: "🇹🇳",
    mapCode: "tn",
  },

  DZ: {
    code: "DZ",
    name: "Algeria",
    flag: "🇩🇿",
    mapCode: "dz",
  },

  IN: {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    mapCode: "in",
  },

  PK: {
    code: "PK",
    name: "Pakistan",
    flag: "🇵🇰",
    mapCode: "pk",
  },

  BD: {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    mapCode: "bd",
  },

  CN: {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    mapCode: "cn",
  },

  JP: {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    mapCode: "jp",
  },

  KR: {
    code: "KR",
    name: "South Korea",
    flag: "🇰🇷",
    mapCode: "kr",
  },

  ID: {
    code: "ID",
    name: "Indonesia",
    flag: "🇮🇩",
    mapCode: "id",
  },

  MY: {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    mapCode: "my",
  },

  SG: {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    mapCode: "sg",
  },

  TH: {
    code: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    mapCode: "th",
  },

  VN: {
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    mapCode: "vn",
  },

  PH: {
    code: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    mapCode: "ph",
  },

  BR: {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    mapCode: "br",
  },

  AR: {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    mapCode: "ar",
  },

  MX: {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    mapCode: "mx",
  },

  ZA: {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    mapCode: "za",
  },

  NG: {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    mapCode: "ng",
  },

  KE: {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    mapCode: "ke",
  },

  RU: {
    code: "RU",
    name: "Russia",
    flag: "🇷🇺",
    mapCode: "ru",
  },
};

/* -------------------------------------------------------------------------- */
/* COUNTRY HELPERS                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Return country information using an ISO 3166-1
 * alpha-2 country code.
 *
 * Unknown countries receive a safe fallback.
 */
export function getCountryInfo(
  countryCode: string,
): CountryInfo {
  const normalized =
    countryCode
      .trim()
      .toUpperCase();

  return (
    COUNTRIES[normalized] ?? {
      code: normalized || "UN",
      name: "International",
      flag: "🌍",
      mapCode:
        normalized.toLowerCase() ||
        "world",
    }
  );
}

/**
 * Get the flag for a country.
 */
export function getCountryFlag(
  countryCode: string,
): string {
  return getCountryInfo(
    countryCode,
  ).flag;
}

/**
 * Get the country name.
 */
export function getCountryName(
  countryCode: string,
): string {
  return getCountryInfo(
    countryCode,
  ).name;
}

/**
 * Get the map identifier used by the UI.
 */
export function getCountryMapCode(
  countryCode: string,
): string {
  return getCountryInfo(
    countryCode,
  ).mapCode;
}

/* -------------------------------------------------------------------------- */
/* DATE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Add days to a date.
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
 * Convert a Date to ISO format.
 */
export function toIsoDate(
  date: Date,
): string {
  return date.toISOString();
}

/**
 * Create a new Identity Card validity period.
 */
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

/* -------------------------------------------------------------------------- */
/* CARD CONSTANTS                                                             */
/* -------------------------------------------------------------------------- */

export const IDENTITY_CARD_VALIDITY_DAYS =
  365;

export const IDENTITY_CARD_RENEWAL_COST =
  IDENTITY_CARD_RENEWAL_XP;

/* -------------------------------------------------------------------------- */
/* CARD ISSUANCE                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A card can be issued only after the Level Test
 * has been completed.
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
 * Issue a new Identity Card.
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
 * Check whether the user has an Identity Card.
 */
export function hasIdentityCard(
  user: UserProfile | null,
): boolean {
  return Boolean(
    user?.identityCard,
  );
}

/* -------------------------------------------------------------------------- */
/* CARD STATUS                                                                */
/* -------------------------------------------------------------------------- */

export type IdentityCardStatus =
  | "not-issued"
  | "active"
  | "expired";

/**
 * Get the current status of the card.
 */
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

/**
 * Check whether the card is active.
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
 * Check whether the card is expired.
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
/* REMAINING VALIDITY                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Calculate remaining days.
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
 * Get remaining days for the user's card.
 */
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

/* -------------------------------------------------------------------------- */
/* RENEWAL                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the user has enough XP
 * for renewal.
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
 * Check whether an expired card can be renewed.
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

/**
 * Prepare all data required by the final Identity Card UI.
 */
export function getIdentityCardDisplayData(
  user: UserProfile,
  countryCode: string,
  now = new Date(),
): IdentityCardDisplayData | null {
  if (!user.identityCard) {
    return null;
  }

  const country =
    getCountryInfo(
      countryCode,
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

/* -------------------------------------------------------------------------- */
/* DATE DISPLAY                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Format an Identity Card date.
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
/* FINAL CARD FIELDS                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Exact information displayed on the global Identity Card.
 */
export const IDENTITY_CARD_FIELDS = [
  "name",
  "xp",
  "level",
  "countryFlag",
  "countryMap",
  "issuedAt",
  "expiresAt",
] as const;

/**
 * Visual elements used by the final UI.
 */
export const IDENTITY_CARD_VISUALS = {
  logo: "DRE2learn",

  brandColor:
    DRE2LEARN_ORANGE,

  countryFlag: true,

  countryMap: true,

  transparentCountryMap:
    true,
} as const;