import { profiles, LOCAL_PROFILE } from "./profiles.js";
import { firebaseConfig } from "./firebase-config.js";

const DAY = 86400000;
const parseDate = (s) => new Date(s + "T00:00:00");
const $ = (id) => document.getElementById(id);
function setStatus(msg) { $("status").textContent = msg; }

// UI texts per language. A profile picks one with `lang`; English is the default (also before login).
const STRINGS = {
  en: {
    locale: "en-GB", appTitle: "Weekly Uni Overview", week: "Week", thisWeek: "this week",
    due: "due next week", online: "online", weekend: "weekend", empty: "No courses set up yet.",
    signIn: "Sign in with Google", signOut: "Sign out",
    signInPrompt: "Sign in with Google to see and save your progress.",
    denied: (email) => `Access denied: ${email} is not an allowed account.`,
    signInFailed: "Sign-in failed: ", syncError: "Sync error: ",
    local: "Local mode: add your Firebase config in firebase-config.js to sync across devices.",
  },
  de: {
    locale: "de-DE", appTitle: "Wochenübersicht Uni", week: "Woche", thisWeek: "diese Woche",
    due: "Abgabe nächste Woche", online: "online", weekend: "Wochenende", empty: "Noch keine Kurse eingerichtet.",
    signIn: "Mit Google anmelden", signOut: "Abmelden",
    signInPrompt: "Melde dich mit Google an, um deinen Fortschritt zu sehen und zu speichern.",
    denied: (email) => `Zugriff verweigert: ${email} ist kein erlaubtes Konto.`,
    signInFailed: "Anmeldung fehlgeschlagen: ", syncError: "Synchronisierungsfehler: ",
    local: "Lokaler Modus: Firebase-Konfiguration in firebase-config.js eintragen, um geräteübergreifend zu synchronisieren.",
  },
};
let L = STRINGS.en;
const fmt = (d) => d.toLocaleDateString(L.locale, { day: "numeric", month: "short" });

// The profile (courses, semester dates) of whoever is signed in; null when nobody is.
let P = null;
let week = 1;
function setProfile(profile) {
  P = profile;
  L = STRINGS[P?.lang] ?? STRINGS.en;
  document.documentElement.lang = P?.lang ?? "en";
  document.title = L.appTitle;
}

const startDate = () => parseDate(P.semesterStart);
const weekStart = (w) => new Date(startDate().getTime() + (w - 1) * 7 * DAY);

function currentWeek() {
  const w = Math.floor((Date.now() - startDate().getTime()) / (7 * DAY)) + 1;
  return Math.min(Math.max(w, 1), P.lastWeek);
}

function tutorialDateIn(w) {
  const a = weekStart(w).getTime(), b = a + 7 * DAY;
  return P.tutorialDates.find((d) => { const t = parseDate(d).getTime(); return t >= a && t < b; });
}

function tasksFor(course, w) {
  const ov = P.overrides[w]?.[course.id] ?? {};
  let tasks = course.tasks.filter((t) => !(ov.remove ?? []).includes(t.key));
  tasks = tasks.filter((t) => !t.onlyOnTutorialWeek || tutorialDateIn(w));
  return tasks.concat(ov.add ?? []).map((t) => {
    if (t.onlyOnTutorialWeek) {
      const d = fmt(parseDate(tutorialDateIn(w)));
      return { ...t, label: `${t.label} - ${d}` };
    }
    return t;
  });
}

// ---- storage: Firestore if configured, else localStorage ----
const useFirebase = Boolean(firebaseConfig.apiKey);
let done = {};           // { taskId: true } for the shown week
let unsubscribe = null;
let store;

async function initStore() {
  if (!useFirebase) {
    store = {
      subscribe(w, cb) { cb(JSON.parse(localStorage.getItem("week-" + w) || "{}")); return () => {}; },
      async set(w, id, value) {
        const cur = JSON.parse(localStorage.getItem("week-" + w) || "{}");
        if (value) cur[id] = true; else delete cur[id];
        localStorage.setItem("week-" + w, JSON.stringify(cur));
      },
    };
    setProfile(LOCAL_PROFILE);
    week = currentWeek();
    setStatus(L.local);
    return;
  }
  const base = "https://www.gstatic.com/firebasejs/10.12.2/";
  const { initializeApp } = await import(base + "firebase-app.js");
  const { getFirestore, doc, onSnapshot, setDoc, updateDoc, deleteField } = await import(base + "firebase-firestore.js");
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import(base + "firebase-auth.js");
  const fbApp = initializeApp(firebaseConfig);
  const db = getFirestore(fbApp);
  const auth = getAuth(fbApp);
  let uid = null;
  const weekDoc = (w) => doc(db, "users", uid, "progress", "week-" + w);
  store = {
    subscribe(w, cb) {
      if (!uid) { cb({}); setStatus(L.signInPrompt); return () => {}; }
      return onSnapshot(weekDoc(w),
        (snap) => { cb(snap.data() ?? {}); setStatus(""); },
        (err) => setStatus(L.syncError + err.message));
    },
    async set(w, id, value) {
      if (!uid) return;
      if (value) await setDoc(weekDoc(w), { [id]: true }, { merge: true });
      else await updateDoc(weekDoc(w), { [id]: deleteField() }).catch(() => {});
    },
  };
  const btn = $("auth-btn");
  btn.hidden = false;
  btn.onclick = () => (uid ? signOut(auth) : signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => setStatus(L.signInFailed + e.message)));
  onAuthStateChanged(auth, (user) => {
    const profile = user ? profiles[user.email?.toLowerCase()] : null;
    if (user && !profile) {
      setProfile(null);
      signOut(auth).then(() => setStatus(L.denied(user.email)));
      return;
    }
    uid = user?.uid ?? null;
    setProfile(profile ?? null);
    btn.textContent = user ? `${L.signOut} (${user.displayName ?? user.email})` : L.signIn;
    showWeek(P ? currentWeek() : 1);
  });
}

// ---- rendering ----
function render() {
  const main = $("courses");
  main.innerHTML = "";
  if (!P) {
    $("week-title").textContent = L.appTitle;
    $("week-range").textContent = "";
    $("prev").disabled = $("next").disabled = true;
    return;
  }
  $("week-title").textContent = `${L.week} ${week}` + (week === currentWeek() ? ` (${L.thisWeek})` : "");
  const s = weekStart(week), e = new Date(s.getTime() + 6 * DAY);
  $("week-range").textContent = `${fmt(s)} – ${fmt(e)}`;
  $("prev").disabled = week <= 1;
  $("next").disabled = week >= P.lastWeek;

  if (P.courses.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = L.empty;
    main.appendChild(p);
    return;
  }
  for (const course of P.courses) {
    const tasks = tasksFor(course, week);
    const card = document.createElement("section");
    card.className = "card";
    card.innerHTML = `<h2></h2><ul></ul>`;
    card.querySelector("h2").textContent = course.name;
    const ul = card.querySelector("ul");
    let allDone = tasks.length > 0;
    for (const t of tasks) {
      const id = `${course.id}-${t.key}-w${week}`;
      const isDone = Boolean(done[id]);
      if (!isDone) allDone = false;
      const li = document.createElement("li");
      li.className = isDone ? "done" : "";
      li.innerHTML = `<span class="box"></span><span class="label"></span>`;
      li.querySelector(".label").textContent = t.label;
      if (L[t.kind] && ["due", "online", "weekend"].includes(t.kind)) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = L[t.kind];
        li.appendChild(tag);
      }
      li.onclick = () => {
        const value = !done[id];
        if (value) done[id] = true; else delete done[id];
        render();
        store.set(week, id, value);
      };
      ul.appendChild(li);
    }
    if (allDone) card.classList.add("complete");
    main.appendChild(card);
  }
}

function showWeek(w) {
  week = w;
  unsubscribe?.();
  done = {};
  render();
  if (!P) return;
  unsubscribe = store.subscribe(week, (data) => { done = data; render(); });
}

$("prev").onclick = () => showWeek(week - 1);
$("next").onclick = () => showWeek(week + 1);

await initStore();
if (!useFirebase) showWeek(week); // with Firebase, the auth state callback triggers the first render
