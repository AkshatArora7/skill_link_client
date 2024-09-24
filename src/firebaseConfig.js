import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDkkCrcScWWHxkdPzSMosw6B6PA2Pu3gss",
    authDomain: "skilllinkwebapp.firebaseapp.com",
    projectId: "skilllinkwebapp",
    storageBucket: "skilllinkwebapp.appspot.com",
    messagingSenderId: "80797477010",
    appId: "1:80797477010:web:a1dcdc64275965b9015e4b"
  };
  

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

export { db, auth };