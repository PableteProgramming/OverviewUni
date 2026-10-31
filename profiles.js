// Who may use the app, and which profile (courses) each Google account sees.
// Keys are lowercase Google account emails. The same emails must appear in the Firestore rules.
import pablo from "./profiles/pablo.js";
import tabea from "./profiles/tabea.js";

export const profiles = {
  "pabletegymgm@gmail.com": pablo, // admin
  "tslandau23@gmail.com": tabea,
};

// Used in local mode (no Firebase config), where nobody signs in.
export const LOCAL_PROFILE = pablo;
