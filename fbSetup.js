// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAV1V307onaIc89VbqWwyLjeOhaBB7c_uY",
    authDomain: "just-move-34bca.firebaseapp.com",
    projectId: "just-move-34bca",
    storageBucket: "just-move-34bca.appspot.com",
    messagingSenderId: "819104523329",
    appId: "1:819104523329:web:50680cb9a30286975e92c0"

};

// Initialize Firebase
export const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth(app);
