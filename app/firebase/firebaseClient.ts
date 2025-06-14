// app/firebase/client.ts
import { initializeApp, getApps, getApp } from "firebase/app"; // Import getApps and getApp
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;

// Check if a Firebase app has already been initialized
if (getApps().length === 0) {
  // If no Firebase apps are currently initialized, create the default app
  app = initializeApp(firebaseConfig);
} else {
  // If an app is already initialized, retrieve the default app instance
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db };