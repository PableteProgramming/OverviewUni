// Tabeas Semester-Setup (Oberfläche auf Deutsch). Gleiches Format wie profiles/pablo.js.
// kind: "attend" (Präsenz), "online" (später ansehbar), "due" (Abgabe nächste Woche),
//       "weekend" (am Wochenende erledigen), "todo" (einfach zu erledigen, ohne Hinweis)
export default {
  name: "Tabea",
  lang: "de",
  semesterStart: "2026-10-12", // TODO: Montag der Woche 1 bestätigen
  lastWeek: 17,                // TODO: bestätigen
  tutorialDates: [],           // nur nötig für Aufgaben mit onlyOnTutorialWeek: true

  courses: [
    {
      id: "physik",
      name: "Physik",
      tasks: [
        { key: "vorlesung", label: "Vorlesung", kind: "attend" },
        { key: "tutorium", label: "Tutorium", kind: "attend" },
        { key: "blatt", label: "Übungsblatt bearbeiten", kind: "todo" },
        { key: "skript", label: "Vorlesungsskript lesen und verstehen", kind: "weekend" },
        { key: "mentimeter", label: "Mentimeter-Aufgaben", kind: "weekend" },
        { key: "marimo", label: "Marimo-Python-Simulationen durchgehen", kind: "weekend" },
        { key: "praesenz", label: "Präsenzaufgabe und Übungsblatt der Vorwoche durchgehen", kind: "weekend" },
      ],
    },
    {
      id: "mathe",
      name: "Mathe",
      tasks: [
        { key: "vorlesung", label: "Vorlesung", kind: "attend" },
        { key: "tutorium", label: "Tutorium", kind: "attend" },
        { key: "zentraluebung", label: "Zentralübung", kind: "attend" },
        { key: "blatt", label: "Übungsblatt bearbeiten", kind: "todo" },
      ],
    },
    {
      id: "mathedidaktik",
      name: "Mathe-Didaktik",
      tasks: [
        { key: "vorlesung", label: "Vorlesung", kind: "attend" },
        { key: "tutorium", label: "Tutorium", kind: "attend" },
      ],
    },
    {
      id: "schulpaedagogik",
      name: "Schulpädagogik",
      tasks: [
        { key: "seminar", label: "Seminar", kind: "attend" },
      ],
    },
    {
      id: "allgpaedagogik",
      name: "Allgemeine Pädagogik",
      tasks: [
        { key: "vorlesung", label: "Vorlesung", kind: "attend" },
      ],
    },
  ],

  overrides: {},
};
