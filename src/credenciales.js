// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCfIG-J8EF__qmlt00PpKTzrXmwZSpv2w",
  authDomain: "integracion-4d123.firebaseapp.com",
  projectId: "integracion-4d123",
  storageBucket: "integracion-4d123.firebasestorage.app",
  messagingSenderId: "1032739037773",
  appId: "1:1032739037773:web:f1b17f747e63558ddc3204"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
export default appFirebase;