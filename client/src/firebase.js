// client/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,      // <— add this
  query,           // <— optional, if you want to do queries
  where,           // <— optional
  orderBy,         // <— optional
  Timestamp        // <— optional, if you need to construct timestamps
} from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoVOEuVEfxEe46T3wiUAovNxKzn8A5QGA",
  authDomain: "vintrastudio-92cff.firebaseapp.com",
  projectId: "vintrastudio-92cff",
  storageBucket: "vintrastudio-92cff.firebasestorage.app",
  messagingSenderId: "882697625589",
  appId: "1:882697625589:web:674daf44e76e767bffcabc",
  measurementId: "G-GN2BYPYC15"
};

// 🔥 Init Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth + Google
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🧠 Firestore DB
const db = getFirestore(app);

export {
  auth,
  provider,
  signInWithPopup,
  db,
  collection,
  getDocs,
   // Firestore exports
  onSnapshot,   // <— now exported
  query,        // <— if you need it
  where,        // <— if you need it
  orderBy,      // <— if you need it
  Timestamp 
};
