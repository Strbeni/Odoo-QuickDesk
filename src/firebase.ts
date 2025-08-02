import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAA32yRITEOY4-mS9F5aygzhfJHRS8lk84",
  authDomain: "quickdesk-d9235.firebaseapp.com",
  projectId: "quickdesk-d9235",
  storageBucket: "quickdesk-d9235.firebasestorage.app",
  messagingSenderId: "477109797264",
  appId: "1:477109797264:web:f2c453714715d79013b315"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
