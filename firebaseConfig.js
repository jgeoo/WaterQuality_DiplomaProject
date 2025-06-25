// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAwkKx6E_E_UIE3Q15lFxHNyAwT-TRuyI",
  authDomain: "waterquality-d8c51.firebaseapp.com",
  databaseURL: "https://waterquality-d8c51-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "waterquality-d8c51",
  storageBucket: "waterquality-d8c51.firebasestorage.app",
  messagingSenderId: "52286899044",
  appId: "1:52286899044:web:1cc0a0cea598836d2c3071",
  measurementId: "G-76DK6S93VV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);


