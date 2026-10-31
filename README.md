# Weekly Uni Overview

Static site showing this week's to-dos per course. Click an item to mark it done.

## Edit tasks
Everything lives in `data.js` (semester start, courses, recurring tasks, per-week `overrides`, NLO tutorial dates).

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
           && request.auth.token.email == "pabletegymgm@gmail.com"
           && request.auth.token.email_verified == true;
       }
     }
   }
   ```
   The email is also set as `ALLOWED_EMAIL` in `firebase-config.js` (the app signs out anyone else).
   Note: the page itself is public on GitHub Pages; the rules are what protect the data.

Until the config is filled in, checkmarks are kept in the browser's localStorage.

## Run locally
`python3 -m http.server` then open http://localhost:8000 (ES modules need a server, not `file://`).

## Deploy
Push to GitHub, then Settings > Pages > deploy from the `main` branch root.
