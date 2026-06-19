import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Firebase config is loaded from the project-level JSON config file.
// This file is managed by the deployment environment and should NOT be
// duplicated in TypeScript source code.
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  appId: firebaseAppletConfig.appId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
};

const app = initializeApp(firebaseConfig);

// Use the custom Firestore database ID from the applet config if present,
// otherwise fall back to the default database.
const firestoreDatabaseId = firebaseAppletConfig.firestoreDatabaseId || '(default)';

export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
