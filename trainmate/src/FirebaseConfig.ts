// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from  "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIBZB99FwGwnaxcB_q93NoMqTeB0fmh4I",
  authDomain: "trainmate-7ae2b.firebaseapp.com",
  projectId: "trainmate-7ae2b",
  storageBucket: "trainmate-7ae2b.appspot.com",
  messagingSenderId: "64842776503",
  appId: "1:64842776503:web:94ce0ce53673f2e6987232"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;