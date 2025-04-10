import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXzeXw3plSLQIBqI82qSjPttEX07VaOKU",
  authDomain: "c4mpusys.firebaseapp.com",
  projectId: "c4mpusys",
  storageBucket: "c4mpusys.firebasestorage.app",
  messagingSenderId: "585880260904",
  appId: "1:585880260904:web:67326e7fa2c9cef8f2001d",
  measurementId: "G-8JB01VZNKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
