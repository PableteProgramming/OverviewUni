// Semester setup. Week 1 starts on this Monday.
export const SEMESTER_START = "2026-10-12";
export const LAST_WEEK = 17;

// Group 3 tutorial dates for Non-linear optimization (10:15-11:45).
// Sheet 1 (Oct 21) was cancelled.
export const NLO_TUTORIAL_DATES = [
  "2026-11-11", "2026-11-25", "2026-12-09",
  "2026-12-23", "2027-01-20", "2027-02-03",
];

// kind: "attend" (in person), "online" (can watch later), "due" (due next week)
export const courses = [
  {
    id: "cis",
    name: "Cloud Information Systems",
    tasks: [
      { key: "tutorial", label: "Attend tutorial", kind: "attend" },
      { key: "lecture", label: "Attend lecture", kind: "attend" },
    ],
  },
  {
    id: "hpqp",
    name: "High Performance Query Processing",
    tasks: [
      { key: "tutorial", label: "Attend tutorial", kind: "attend" },
      { key: "lecture", label: "Attend lecture", kind: "attend" },
      { key: "exercise", label: "Programming exercise", kind: "due" },
    ],
  },
  {
    id: "idl",
    name: "Introduction to Deep Learning",
    tasks: [
      { key: "lecture", label: "Lecture (TUM-live)", kind: "online" },
      { key: "session", label: "Exercise session (online)", kind: "online" },
      { key: "exercise", label: "Programming exercise", kind: "due" },
    ],
  },
  {
    id: "netsec",
    name: "Network Security",
    tasks: [
      { key: "lecture1", label: "Lecture 1 (TUM-live)", kind: "online" },
      { key: "lecture2", label: "Lecture 2 (TUM-live)", kind: "online" },
      { key: "sheet", label: "Exercise sheet", kind: "due" },
      { key: "hacking", label: "Hacking exercises", kind: "due" },
    ],
  },
  {
    id: "nlo",
    name: "Non-linear Optimization",
    tasks: [
      { key: "class", label: "Attend class", kind: "attend" },
      { key: "homework", label: "Homework sheet", kind: "due" },
      // Only shown in weeks containing a group 3 tutorial date.
      { key: "tutorial", label: "Attend tutorial (group 3, 10:15-11:45)", kind: "attend", onlyOnTutorialWeek: true },
    ],
  },
];

// One-off changes per week: { [week]: { [courseId]: { add: [...], remove: ["taskKey"] } } }
export const overrides = {};
