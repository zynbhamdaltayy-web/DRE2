import {
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "./firebase";

import {
  createOwnerAccount,
  createUserAccount,
  DRE2LEARN_OWNER_ID,
  DRE2LEARN_USERNAME,
  type Account,
} from "./data/accounts";

import {
  createOrRestoreGoogleAccount,
  setCurrentAccount,
} from "./data/accountStorage";

export const DRE2LEARN_OWNER_EMAIL =
  "zynbhamdaltayy@gmail.com";

export function isDRE2learnOwnerEmail(
  email: string | null | undefined,
): boolean {
  return (
    typeof email === "string" &&
    email.trim().toLowerCase() ===
      DRE2LEARN_OWNER_EMAIL
  );
}

export async function signInWithGoogle(): Promise<{
  firebaseUser: User;
  account: Account;
}> {
  const result = await signInWithPopup(
    auth,
    googleProvider,
  );

  const firebaseUser = result.user;

  const email =
    firebaseUser.email
      ?.trim()
      .toLowerCase() ?? "";

  /*
   * The official DRE2learn Owner account.
   */
  if (isDRE2learnOwnerEmail(email)) {
    const owner = createOwnerAccount(
      DRE2LEARN_OWNER_EMAIL,
      "",
      null,
    );

    setCurrentAccount(owner);

    return {
      firebaseUser,
      account: owner,
    };
  }

  /*
   * Normal Google user.
   */
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

  setCurrentAccount(user);

  /*
   * Keep account storage synchronized
   * with the Google account.
   */
  const restored =
    createOrRestoreGoogleAccount(
      firebaseUser,
    );

  setCurrentAccount(restored);

  return {
    firebaseUser,
    account: restored,
  };
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}

export function isCurrentUserOwner(): boolean {
  return isDRE2learnOwnerEmail(
    auth.currentUser?.email,
  );
}

export function getGoogleProvider() {
  return googleProvider;
}

export {
  DRE2LEARN_OWNER_ID,
  DRE2LEARN_USERNAME,
};
  
    