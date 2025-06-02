// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCslr1MGmMh2ggoHBRDMWmUFcekwigIILc",
  authDomain: "apt-tech-faaa6.firebaseapp.com",
  projectId: "apt-tech-faaa6",
  storageBucket: "apt-tech-faaa6.firebasestorage.app",
  messagingSenderId: "935417442764",
  appId: "1:935417442764:web:2394134810e6c7b53e6d69",
  measurementId: "G-1JBYWNB8HZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {db}

export default app;

