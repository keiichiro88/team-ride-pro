import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyArN_n7oWwYf5TSdmpkw_-VKr9-",
  authDomain: "little-brave-schedule.firebaseapp.com",
  databaseURL: "https://little-brave-schedule-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "little-brave-schedule",
  storageBucket: "little-brave-schedule.firebasestorage.app",
  messagingSenderId: "103451004550",
  appId: "1:103451004550:web:6847ae0869de0940bba807"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);
