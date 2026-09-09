import type { Account } from "./accounts";

import {
  createOwnerAccount,
  createUserAccount,
  DRE2LEARN_OWNER_ID,
  DRE2LEARN_USERNAME,
  DRE2LEARN_DISPLAY_NAME,
} from "./accounts";

const STORAGE_KEY = "dre2learn-account-data";

export interface AccountStorageData {
  currentAccount: Account | null;
  accounts: Account[];
}

function createEmptyStorage(): AccountStorageData {
  return {
    currentAccount: null,
    accounts: [],
  };
}

function readStorage(): AccountStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createEmptyStorage();
    }

    const parsed = JSON.parse(raw) as Partial<AccountStorageData>;

    return {
      currentAccount: parsed.currentAccount ?? null,
      accounts: Array.isArray(parsed.accounts)
        ? parsed.accounts
        : [],
    };
  } catch {
    return createEmptyStorage();
  }
}

function writeStorage(
  data: AccountStorageData,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

function saveAccountInternal(
  account: Account,
): Account {
  const data = readStorage();

  const existingIndex = data.accounts.findIndex(
    (item) => item.id === account.id,
  );

  if (existingIndex >= 0) {
    data.accounts[existingIndex] = account;
  } else {
    data.accounts.push(account);
  }

  data.currentAccount = account;

  writeStorage(data);

  return account;
}

export function getCurrentAccount(): Account | null {
  return readStorage().currentAccount;
}

export function getAccountById(
  accountId: string,
): Account | null {
  const data = readStorage();

  return (
    data.accounts.find(
      (account) => account.id === accountId,
    ) ?? null
  );
}

export function getAccountByEmail(
  email: string,
): Account | null {
  const normalizedEmail =
    email.trim().toLowerCase();

  const data = readStorage();

  return (
    data.accounts.find(
      (account) =>
        account.email.trim().toLowerCase() ===
        normalizedEmail,
    ) ?? null
  );
}

export function saveAccount(
  account: Account,
): Account {
  return saveAccountInternal(account);
}

export function setCurrentAccount(
  account: Account | null,
): void {
  const data = readStorage();

  data.currentAccount = account;

  if (account) {
    const existingIndex =
      data.accounts.findIndex(
        (item) => item.id === account.id,
      );

    if (existingIndex >= 0) {
      data.accounts[existingIndex] = account;
    } else {
      data.accounts.push(account);
    }
  }

  writeStorage(data);
}

export function createOrRestoreGoogleAccount(
  firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
  },
): Account {
  const email =
    firebaseUser.email
      ?.trim()
      .toLowerCase() ?? "";

  if (!email) {
    throw new Error(
      "A Google account email is required.",
    );
  }

  const existingAccount =
    getAccountByEmail(email);

  if (existingAccount) {
    setCurrentAccount(existingAccount);
    return existingAccount;
  }

  /*
   * Official DRE2learn Owner account.
   *
   * IMPORTANT:
   * The actual secure Owner authorization
   * will later be enforced server-side.
   */
  if (
    email ===
    "zynbhamdaltayy@gmail.com"
  ) {
    const owner = createOwnerAccount(
      "zynbhamdaltayy@gmail.com",
      "",
      null,
    );

    return saveAccountInternal(owner);
  }

  const username =
    firebaseUser.displayName?.trim() ||
    email.split("@")[0] ||
    "User";

  const user = createUserAccount(
    firebaseUser.uid,
    username,
    email,
    "",
    null,
  );

  return saveAccountInternal(user);
}

export function updateCurrentAccount(
  updates: Partial<Account>,
): Account | null {
  const current = getCurrentAccount();

  if (!current) {
    return null;
  }

  const updatedAccount: Account = {
    ...current,
    ...updates,
    id: current.id,
    email: current.email,
    updatedAt: new Date().toISOString(),
  };

  return saveAccountInternal(
    updatedAccount,
  );
}

export function clearCurrentAccount(): void {
  const data = readStorage();

  data.currentAccount = null;

  writeStorage(data);
}

export function clearAllAccountData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function initializeAccountStorage(): void {
  const data = readStorage();

  writeStorage(data);
}