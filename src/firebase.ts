import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWMj9Yy6-N_ayRuFuOkn-7zhJL-l8nPnY",
  authDomain: "dre2learn.firebaseapp.com",
  projectId: "dre2learn",
  storageBucket: "dre2learn.firebasestorage.app",
  messagingSenderId: "816716529311",
  appId: "1:816716529311:web:44ae47f886390e484aacaa",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});