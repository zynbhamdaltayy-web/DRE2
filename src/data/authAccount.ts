import type { User } from "firebase/auth";

import {
  createOrRestoreGoogleAccount,
  getCurrentAccount,
  setCurrentAccount,
} from "./accountStorage";

export interface AuthAccountResult {
  firebaseUser: User;
  account: ReturnType<
    typeof createOrRestoreGoogleAccount
  >;
}

export function createAccountFromFirebaseUser(
  firebaseUser: User,
): AuthAccountResult {
  const account =
    createOrRestoreGoogleAccount({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
    });

  setCurrentAccount(account);

  return {
    firebaseUser,
    account,
  };
}

export function getStoredAccount() {
  return getCurrentAccount();
}