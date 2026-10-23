# sabaflz.github.io

My personal site. Plain HTML, CSS, and JavaScript, no build step.

## Where things live

| What you want to change | File |
|---|---|
| Any text, project, role, skill, link | `assets/js/content.js` |
| Resume | replace `assets/resume/Saba_Feilizadeh_Resume.pdf` |
| Profile photo | replace `assets/img/profile.jpg` (square works best) |
| Colors and fonts | tokens at the top of `assets/css/main.css` |
| Page layout and section order | `index.html` |
| Interactive behavior (detection box, demo, terminal) | `assets/js/main.js` |
| Degree requirement structure | `planner/data/degree.js` |
| A semester's course options | `planner/data/terms/<term>.js` |
| Course facts reused across terms | `planner/data/catalog.js` |
| My plans, check-offs, to-dos | `planner/data/state.json`, edited on the page in admin mode |

## Common edits

**Add a project:** open `content.js`, copy one project object, paste it in the list, edit. Save and commit.

**Update the resume:** in Overleaf, Download PDF. Rename it `Saba_Feilizadeh_Resume.pdf`. In this repo, open `assets/resume/`, choose Add file, Upload files, drop it in, commit. It replaces the old one.

**Plan a new semester:** copy `planner/data/terms/_template.js` to e.g. `fall-2027.js`, list what's offered (times, rooms; course facts come from `catalog.js`), and add its `<script>` tag in `planner/index.html` above `planner.js`. At the end of each term, move the courses you passed into `done` in `planner/data/degree.js`.

**Hide something without deleting it:** add `hidden: true` to that object in `content.js`.

## Preview locally

Opening `index.html` directly works for the home page. The resume viewer needs a local server:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Planner admin

Visitors only see the planner when it's set to "Everyone", and even then it's read-only.
To edit: open the planner, click **Admin** at the bottom, and enter your admin password.
First time only: you set the password and paste a fine-grained GitHub token (this repo only,
Contents: Read and write). The token is stored in `planner/data/admin.json`, encrypted with
your password. "Only me" encrypts `state.json` with the same password. If the token expires,
the login asks for a new one. The password can't be recovered, so keep it in a password manager.
