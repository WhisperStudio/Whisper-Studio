// client/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  collectionGroup,
  arrayUnion,
  arrayRemove,
  deleteField
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);

export {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  db,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteField
};
