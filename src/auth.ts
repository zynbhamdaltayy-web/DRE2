import {
  GoogleAuthProvider,
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
  DRE2LEARN_DISPLAY_NAME,
  type Account,
} from "./data/accounts";

export const DRE2LEARN_OWNER_EMAIL = "zynbhamdaltayy@gmail.com";

export function isDRE2learnOwnerEmail(email: string | null | undefined): boolean {
  return (
    typeof email === "string" &&
    email.trim().toLowerCase() === DRE2LEARN_OWNER_EMAIL
  );
}

export async function signInWithGoogle(): Promise<{
  firebaseUser: User;
  account: Account;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  const email = firebaseUser.email?.trim().toLowerCase() ?? "";

  if (isDRE2learnOwnerEmail(email)) {
    const owner = createOwnerAccount({
      id: DRE2LEARN_OWNER_ID,
      username: DRE2LEARN_USERNAME,
      displayName: DRE2LEARN_DISPLAY_NAME,
      email,
      avatar: null,
      level: "A1",
      xp: 0,
      countryCode: "",
      bio: "Official DRE2learn account.",
    });

    return {
      firebaseUser,
      account: owner,
    };
  }

  const user = createUserAccount({
    id: firebaseUser.uid,
    username:
      firebaseUser.displayName?.trim() ||
      email.split("@")[0] ||
      "User",
    displayName:
      firebaseUser.displayName?.trim() ||
      email.split("@")[0] ||
      "User",
    email,
    avatar: null,
    level: "A1",
    xp: 0,
    countryCode: "",
    bio: "",
  });

  return {
    firebaseUser,
    account: user,
  };
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}

export function isCurrentUserOwner(): boolean {
  return isDRE2learnOwnerEmail(auth.currentUser?.email);
}

export function getGoogleProvider(): GoogleAuthProvider {
  return googleProvider;
}
