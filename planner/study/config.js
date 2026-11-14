/* Tells ../sync.js to run the Study tab: its own data file and visibility,
   same admin password and GitHub token as the course planner. */
window.PLANNER_CONFIG = {
  label: "Study plan",
  app: "StudyApp",
  statePath: "planner/data/study.json",
  stateUrl: "../data/study.json",
  adminUrl: "../data/admin.json",
  backupType: "sf-study-backup",
  isBackup: function (d) { return !!d.terms; },
  empty: { v: 1, active: null, terms: {}, done: {}, light: {} },
  publicWarning: "Make the study plan visible to everyone? Your schedule, class times, events and check-offs will be readable by anyone with the link. They still can't change anything."
};
