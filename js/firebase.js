// /js/firebase.js
const firebaseConfig = {
    apiKey: "AIzaSyAgocCLc3Vbf1tv6ISCQRglUzNTPi84-bA",
    authDomain: "boostifyx-102dc.firebaseapp.com",
    databaseURL: "https://boostifyx-102dc-default-rtdb.firebaseio.com",
    projectId: "boostifyx-102dc",
    storageBucket: "boostifyx-102dc.firebasestorage.app",
    messagingSenderId: "579411145482",
    appId: "1:579411145482:web:7b810fd0fe1f898bdb00f3"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;
