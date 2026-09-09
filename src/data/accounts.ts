import type { Avatar, Level } from "../types";

export type AccountRole =
  | "owner"
  | "admin"
  | "writer"
  | "user";

export type AccountStatus =
  | "active"
  | "suspended"
  | "blocked";

export interface AccountPermissions {
  manageUsers: boolean;
  manageWriters: boolean;
  manageArticles: boolean;
  manageLibrary: boolean;
  manageRooms: boolean;
  manageCards: boolean;
  publishUpdates: boolean;
  manageMessages: boolean;
  manageReports: boolean;
  manageSettings: boolean;
  manageAdmins: boolean;
  manageOfficialAccount: boolean;
}

export interface Account {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  official: boolean;
  verified: boolean;
  avatar: Avatar | null;
  level: Level;
  xp: number;
  countryCode: string;
  bio: string;
  permissions: AccountPermissions;
  createdAt: string;
  updatedAt: string;
}

export const DRE2LEARN_OWNER_ID =
  "dre2learn-owner";

export const DRE2LEARN_USERNAME =
  "DRE2learn";

export const DRE2LEARN_DISPLAY_NAME =
  "DRE2learn";

export const OWNER_PERMISSIONS: AccountPermissions = {
  manageUsers: true,
  manageWriters: true,
  manageArticles: true,
  manageLibrary: true,
  manageRooms: true,
  manageCards: true,
  publishUpdates: true,
  manageMessages: true,
  manageReports: true,
  manageSettings: true,
  manageAdmins: true,
  manageOfficialAccount: true,
};

export const ADMIN_PERMISSIONS: AccountPermissions = {
  manageUsers: true,
  manageWriters: true,
  manageArticles: true,
  manageLibrary: true,
  manageRooms: true,
  manageCards: true,
  publishUpdates: true,
  manageMessages: true,
  manageReports: true,
  manageSettings: false,
  manageAdmins: false,
  manageOfficialAccount: false,
};

export const WRITER_PERMISSIONS: AccountPermissions = {
  manageUsers: false,
  manageWriters: false,
  manageArticles: true,
  manageLibrary: false,
  manageRooms: false,
  manageCards: false,
  publishUpdates: false,
  manageMessages: false,
  manageReports: false,
  manageSettings: false,
  manageAdmins: false,
  manageOfficialAccount: false,
};

export const USER_PERMISSIONS: AccountPermissions = {
  manageUsers: false,
  manageWriters: false,
  manageArticles: false,
  manageLibrary: false,
  manageRooms: false,
  manageCards: false,
  publishUpdates: false,
  manageMessages: false,
  manageReports: false,
  manageSettings: false,
  manageAdmins: false,
  manageOfficialAccount: false,
};

function nowIso(): string {
  return new Date().toISOString();
}

export function getPermissionsForRole(
  role: AccountRole,
): AccountPermissions {
  switch (role) {
    case "owner":
      return { ...OWNER_PERMISSIONS };

    case "admin":
      return { ...ADMIN_PERMISSIONS };

    case "writer":
      return { ...WRITER_PERMISSIONS };

    case "user":
    default:
      return { ...USER_PERMISSIONS };
  }
}

export function createOwnerAccount(
  email = "",
  countryCode = "",
  avatar: Avatar | null = null,
): Account {
  const timestamp = nowIso();

  return {
    id: DRE2LEARN_OWNER_ID,
    username: DRE2LEARN_USERNAME,
    displayName: DRE2LEARN_DISPLAY_NAME,
    email,
    role: "owner",
    status: "active",
    official: true,
    verified: true,
    avatar,
    level: "C2",
    xp: 0,
    countryCode: countryCode
      .trim()
      .toUpperCase(),
    bio:
      "Official DRE2learn account.",
    permissions: {
      ...OWNER_PERMISSIONS,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createUserAccount(
  id: string,
  username: string,
  email = "",
  countryCode = "",
  avatar: Avatar | null = null,
): Account {
  const timestamp = nowIso();

  return {
    id,
    username: username.trim(),
    displayName: username.trim(),
    email,
    role: "user",
    status: "active",
    official: false,
    verified: false,
    avatar,
    level: "A1",
    xp: 0,
    countryCode: countryCode
      .trim()
      .toUpperCase(),
    bio: "",
    permissions: {
      ...USER_PERMISSIONS,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createAdminAccount(
  id: string,
  username: string,
  email = "",
  countryCode = "",
  avatar: Avatar | null = null,
): Account {
  const timestamp = nowIso();

  return {
    id,
    username: username.trim(),
    displayName: username.trim(),
    email,
    role: "admin",
    status: "active",
    official: false,
    verified: true,
    avatar,
    level: "C2",
    xp: 0,
    countryCode: countryCode
      .trim()
      .toUpperCase(),
    bio: "",
    permissions: {
      ...ADMIN_PERMISSIONS,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createWriterAccount(
  id: string,
  username: string,
  email = "",
  countryCode = "",
  avatar: Avatar | null = null,
): Account {
  const timestamp = nowIso();

  return {
    id,
    username: username.trim(),
    displayName: username.trim(),
    email,
    role: "writer",
    status: "active",
    official: false,
    verified: true,
    avatar,
    level: "B2",
    xp: 0,
    countryCode: countryCode
      .trim()
      .toUpperCase(),
    bio: "",
    permissions: {
      ...WRITER_PERMISSIONS,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function isOwner(
  account: Account | null,
): boolean {
  return (
    account !== null &&
    account.id === DRE2LEARN_OWNER_ID &&
    account.role === "owner" &&
    account.official === true
  );
}

export function isOfficialAccount(
  account: Account | null,
): boolean {
  return (
    account !== null &&
    account.official === true &&
    account.id === DRE2LEARN_OWNER_ID
  );
}

export function hasPermission(
  account: Account | null,
  permission: keyof AccountPermissions,
): boolean {
  if (!account || account.status !== "active") {
    return false;
  }

  if (isOwner(account)) {
    return true;
  }

  return account.permissions[permission] === true;
}

export function canManageUsers(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageUsers");
}

export function canManageWriters(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageWriters");
}

export function canManageArticles(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageArticles");
}

export function canManageLibrary(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageLibrary");
}

export function canManageRooms(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageRooms");
}

export function canManageCards(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageCards");
}

export function canPublishUpdates(
  account: Account | null,
): boolean {
  return hasPermission(account, "publishUpdates");
}

export function canManageMessages(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageMessages");
}

export function canManageReports(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageReports");
}

export function canManageSettings(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageSettings");
}

export function canManageAdmins(
  account: Account | null,
): boolean {
  return hasPermission(account, "manageAdmins");
}

export function canManageOfficialAccount(
  account: Account | null,
): boolean {
  return hasPermission(
    account,
    "manageOfficialAccount",
  );
}

export function canSendOfficialMessage(
  account: Account | null,
): boolean {
  return (
    isOfficialAccount(account) &&
    account.status === "active"
  );
}

export function canChangeRole(
  account: Account | null,
  targetRole: AccountRole,
): boolean {
  if (!isOwner(account)) {
    return false;
  }

  return targetRole !== "owner";
}

export function canSuspendAccount(
  account: Account | null,
  target: Account,
): boolean {
  if (!isOwner(account) && !canManageUsers(account)) {
    return false;
  }

  if (isOwner(target)) {
    return false;
  }

  return target.status === "active";
}

export function canBlockAccount(
  account: Account | null,
  target: Account,
): boolean {
  if (!account || account.id === target.id) {
    return false;
  }

  if (isOwner(target)) {
    return false;
  }

  return true;
}

export function updateAccountRole(
  target: Account,
  role: AccountRole,
): Account {
  return {
    ...target,
    role,
    permissions: getPermissionsForRole(role),
    verified:
      role === "owner" ||
      role === "admin" ||
      role === "writer",
    official: role === "owner",
    updatedAt: nowIso(),
  };
}

export function updateAccountStatus(
  target: Account,
  status: AccountStatus,
): Account {
  if (isOwner(target)) {
    return target;
  }

  return {
    ...target,
    status,
    updatedAt: nowIso(),
  };
}

export function normalizeAccount(
  account: Account,
): Account {
  const role: AccountRole = [
    "owner",
    "admin",
    "writer",
    "user",
  ].includes(account.role)
    ? account.role
    : "user";

  const official =
    account.id === DRE2LEARN_OWNER_ID &&
    role === "owner";

  return {
    ...account,
    username: account.username.trim(),
    displayName: official
      ? DRE2LEARN_DISPLAY_NAME
      : account.displayName.trim(),
    role,
    official,
    verified:
      official ||
      role === "admin" ||
      role === "writer",
    permissions: official
      ? { ...OWNER_PERMISSIONS }
      : getPermissionsForRole(role),
    countryCode: account.countryCode
      .trim()
      .toUpperCase(),
  };
}

export function getAccountDisplayName(
  account: Account,
): string {
  return isOfficialAccount(account)
    ? DRE2LEARN_DISPLAY_NAME
    : account.displayName;
}

export function getAccountRoleLabel(
  role: AccountRole,
): string {
  switch (role) {
    case "owner":
      return "Owner";

    case "admin":
      return "Admin";

    case "writer":
      return "Writer";

    case "user":
    default:
      return "User";
  }
}