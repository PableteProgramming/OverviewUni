# Weekly Uni Overview

Static site showing this week's to-dos per course. Click an item to mark it done.

## Edit tasks
Each person has a profile file: `profiles/pablo.js`, `profiles/tabea.js` (semester start, courses, recurring tasks, per-week `overrides`, tutorial dates).
`profiles.js` maps each allowed Google email to a profile. To add someone: create a profile file, add their email to `profiles.js`, and add it to the Firestore rules below.

## Firebase sync (cross-device)
1. Create a project at https://console.firebase.google.com and add a **Web app**.
2. Enable **Firestore Database**.
3. Enable **Authentication > Sign-in method > Google**.
4. Authentication > Settings > **Authorized domains**: add `<your-github-username>.github.io` (`localhost` is there by default).
5. Paste the web app config into `firebase-config.js`.
6. Firestore > Rules (only the owner's verified Google account can read or write, and only their own data):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /users/{uid}/progress/{week} {
         allow read, write: if request.auth != null
           && request.auth.uid == uid
           && request.auth.token.email in ["pabletegymgm@gmail.com", "tslandau23@gmail.com"]
           && request.auth.token.email_verified == true;
       }
     }
   }
   ```
   The same emails are listed in `profiles.js` (the app signs out anyone else).
   Note: the page itself is public on GitHub Pages; the rules are what protect the data.

Until the config is filled in, checkmarks are kept in the browser's localStorage.

## Run locally
`python3 -m http.server` then open http://localhost:8000 (ES modules need a server, not `file://`).

## Deploy
Push to GitHub, then Settings > Pages > deploy from the `main` branch root.
