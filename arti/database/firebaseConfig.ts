import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrNDnRe5xyR5ZkZZDZE29z7Zv5Vd-sBc8",
  authDomain: "articuleran.firebaseapp.com",
  projectId: "articuleran",
  storageBucket: "articuleran.firebasestorage.app",
  messagingSenderId: "325158602824",
  appId: "1:325158602824:ios:9954401da83ab852eab07d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export named modules
export { app, auth, db };
