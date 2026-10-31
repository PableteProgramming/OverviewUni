import { SEMESTER_START, LAST_WEEK, NLO_TUTORIAL_DATES, courses, overrides } from "./data.js";
import { firebaseConfig, ALLOWED_EMAIL } from "./firebase-config.js";

const DAY = 86400000;
const parseDate = (s) => new Date(s + "T00:00:00");
const start = parseDate(SEMESTER_START);
const weekStart = (w) => new Date(start.getTime() + (w - 1) * 7 * DAY);
const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function currentWeek() {
  const w = Math.floor((Date.now() - start.getTime()) / (7 * DAY)) + 1;
  return Math.min(Math.max(w, 1), LAST_WEEK);
}

function tutorialDateIn(week) {
  const a = weekStart(week).getTime(), b = a + 7 * DAY;
  return NLO_TUTORIAL_DATES.find((d) => { const t = parseDate(d).getTime(); return t >= a && t < b; });
}

function tasksFor(course, week) {
  const ov = overrides[week]?.[course.id] ?? {};
  let tasks = course.tasks.filter((t) => !(ov.remove ?? []).includes(t.key));
  tasks = tasks.filter((t) => !t.onlyOnTutorialWeek || tutorialDateIn(week));
  return tasks.concat(ov.add ?? []).map((t) => {
    if (t.onlyOnTutorialWeek) {
      const d = fmt(parseDate(tutorialDateIn(week)));
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
      subscribe(week, cb) {
        const read = () => cb(JSON.parse(localStorage.getItem("week-" + week) || "{}"));
        read(); return () => {};
      },
      async set(week, id, value) {
        const cur = JSON.parse(localStorage.getItem("week-" + week) || "{}");
        if (value) cur[id] = true; else delete cur[id];
        localStorage.setItem("week-" + week, JSON.stringify(cur));
      },
    };
    setStatus("Local mode: add your Firebase config in firebase-config.js to sync across devices.");
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
  const weekDoc = (week) => doc(db, "users", uid, "progress", "week-" + week);
  store = {
    subscribe(week, cb) {
      if (!uid) { cb({}); setStatus("Sign in with Google to see and save your progress."); return () => {}; }
      return onSnapshot(weekDoc(week),
        (snap) => { cb(snap.data() ?? {}); setStatus(""); },
        (err) => setStatus("Sync error: " + err.message));
    },
    async set(week, id, value) {
      if (!uid) return;
      if (value) await setDoc(weekDoc(week), { [id]: true }, { merge: true });
      else await updateDoc(weekDoc(week), { [id]: deleteField() }).catch(() => {});
    },
  };
  const btn = $("auth-btn");
  btn.hidden = false;
  btn.onclick = () => (uid ? signOut(auth) : signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => setStatus("Sign-in failed: " + e.message)));
  onAuthStateChanged(auth, (user) => {
    if (user && user.email?.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      signOut(auth).then(() => setStatus(`Access denied: ${user.email} is not the owner account.`));
      return;
    }
    uid = user?.uid ?? null;
    btn.textContent = user ? `Sign out (${user.displayName ?? user.email})` : "Sign in with Google";
    showWeek(week);
  });
}

// ---- rendering ----
let week = currentWeek();
const $ = (id) => document.getElementById(id);
function setStatus(msg) { $("status").textContent = msg; }

function render() {
  $("week-title").textContent = `Week ${week}` + (week === currentWeek() ? " (this week)" : "");
  const s = weekStart(week), e = new Date(s.getTime() + 6 * DAY);
  $("week-range").textContent = `${fmt(s)} – ${fmt(e)}`;
  $("prev").disabled = week <= 1;
  $("next").disabled = week >= LAST_WEEK;

  const main = $("courses");
  main.innerHTML = "";
  for (const course of courses) {
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
      if (t.kind === "due") li.insertAdjacentHTML("beforeend", `<span class="tag">due next week</span>`);
      if (t.kind === "online") li.insertAdjacentHTML("beforeend", `<span class="tag">online</span>`);
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
  unsubscribe = store.subscribe(week, (data) => { done = data; render(); });
}

$("prev").onclick = () => showWeek(week - 1);
$("next").onclick = () => showWeek(week + 1);

await initStore();
if (!useFirebase) showWeek(week); // with Firebase, the auth state callback triggers the first render
