import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "./firebase";

export function getFirebaseUser(): User | null {
  return auth.currentUser;
}

export function listenToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function isFirebaseAuthenticated(): boolean {
  return auth.currentUser !== null;
}
