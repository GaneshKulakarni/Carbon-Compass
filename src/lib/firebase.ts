import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXoF8s8u4T4hJkez-u0M5RuFPK4bj6Jt8",
  authDomain: "gentle-forcaster-hskkt.firebaseapp.com",
  projectId: "gentle-forcaster-hskkt",
  appId: "1:121566148421:web:59af0ca9468b90827b302c",
  storageBucket: "gentle-forcaster-hskkt.firebasestorage.app",
  messagingSenderId: "121566148421"
};

const app = initializeApp(firebaseConfig);

// Connect with custom firestore databaseId from configuration
export const db = getFirestore(app, "ai-studio-4beed89e-ccef-4f48-a3f1-ab83115fcb5b");
export const auth = getAuth(app);
