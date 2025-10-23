// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCr5k9CBhaFl77d8xPeFQWGJUiIL0jaPBk",
  authDomain: "drugstoreflorencia-3139c.firebaseapp.com",
  projectId: "drugstoreflorencia-3139c",
  storageBucket: "drugstoreflorencia-3139c.firebasestorage.app",
  messagingSenderId: "435168704456",
  appId: "1:435168704456:web:5b7b0217f21f482db472fd",
  measurementId: "G-7NWPT844MF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
