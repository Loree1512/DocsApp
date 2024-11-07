import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAMPa9eDDBkKaBTIwVnaMFYe_N3XV_6Ujk",
    authDomain: "docugest-6ff65.firebaseapp.com",
    projectId: "docugest-6ff65",
    storageBucket: "docugest-6ff65.firebasestorage.app",
    messagingSenderId: "643507809507",
    appId: "1:643507809507:web:c38fad5a8b9773713769d6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore y Storage
export const firestore = getFirestore(app);
export const storage = getStorage(app);