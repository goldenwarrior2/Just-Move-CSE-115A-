// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASPIt4OyLZPIeHUqrggJSkYpJmI_MHcxE",
  authDomain: "just-move-ccd82.firebaseapp.com",
  projectId: "just-move-ccd82",
  storageBucket: "just-move-ccd82.appspot.com",
  messagingSenderId: "927419699529",
  appId: "1:927419699529:web:3ffe76a7b6ae16683c4a98",
  measurementId: "G-L7MVX9EH91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {
  firestore,
  auth
}
