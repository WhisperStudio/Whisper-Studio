// client/firebase.js
import { initializeApp, getApps } from "firebase/app";

import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCoVOEuVEfxEe46T3wiUAovNxKzn8A5QGA",
  authDomain: "vintrastudio-92cff.firebaseapp.com",
  projectId: "vintrastudio-92cff",
  storageBucket: "vintrastudio-92cff.firebasestorage.app",
  messagingSenderId: "882697625589",
  appId: "1:882697625589:web:674daf44e76e767bffcabc",
  measurementId: "G-GN2BYPYC15"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  db,
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc
};
