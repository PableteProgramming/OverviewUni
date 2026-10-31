// Firebase web app config (public by design; access is protected by Google login + Firestore rules).
// Only this Google account may use the app (also enforced server-side in the Firestore rules).
export const ALLOWED_EMAIL = "pabletegymgm@gmail.com";

export const firebaseConfig = {
  apiKey: "AIzaSyCoFVwDnTLpLMrHaHcY7AD7nmDY7VYC6lA",
  authDomain: "overviewuni.firebaseapp.com",
  projectId: "overviewuni",
  appId: "1:160913241960:web:7b2fb7d8d453910eed08dd",
};
