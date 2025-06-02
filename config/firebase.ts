// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCslr1MGmMh2ggoHBRDMWmUFcekwigIILc",
  authDomain: "apt-tech-faaa6.firebaseapp.com",
  projectId: "apt-tech-faaa6",
  storageBucket: "apt-tech-faaa6.firebasestorage.app",
  messagingSenderId: "935417442764",
  appId: "1:935417442764:web:2394134810e6c7b53e6d69",
  measurementId: "G-1JBYWNB8HZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db, firebaseConfig};

export default app;

