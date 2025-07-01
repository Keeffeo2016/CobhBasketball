// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_yru0Y7RUT7m2vfANGrvmKnJWqpRUNC4",
  authDomain: "cobhbasketball-5f0a1.firebaseapp.com",
  projectId: "cobhbasketball-5f0a1",
  storageBucket: "cobhbasketball-5f0a1.firebasestorage.app",
  messagingSenderId: "287225941775",
  appId: "1:287225941775:web:1d0a108b74ce5775dbb87a",
  measurementId: "G-PKBFTQLS31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);

export async function getBookings() {
  const querySnapshot = await getDocs(collection(db, "bookings"));
  return querySnapshot.docs.map(doc => doc.data());
}