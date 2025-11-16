
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCwzC4A0SwxF6s9VZDcduk_PxP80o70Jzo",
  authDomain: "inventory-f9e65.firebaseapp.com",
  databaseURL: "https://inventory-f9e65-default-rtdb.firebaseio.com",
  projectId: "inventory-f9e65",
  storageBucket: "inventory-f9e65.firebasestorage.app",
  messagingSenderId: "1043817511721",
  appId: "1:1043817511721:web:e60adfb3b65da3d6025538"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
