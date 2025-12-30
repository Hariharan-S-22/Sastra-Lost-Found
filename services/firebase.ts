
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBChKW72ipQRNkBA0r6j7db6hVKy75q1Dw",
  authDomain: "sastra-lost-found-bc64b.firebaseapp.com",
  projectId: "sastra-lost-found-bc64b",
  storageBucket: "sastra-lost-found-bc64b.firebasestorage.app",
  messagingSenderId: "251772845522",
  appId: "1:251772845522:web:4741ceaa413c94f5df5c0b",
  measurementId: "G-FVM0GK8BCY"
};

// Initialize Firebase using the modular v10 pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
}).catch(err => {
  console.warn("Firebase Analytics not supported in this environment");
});

export { app, auth, googleProvider };
