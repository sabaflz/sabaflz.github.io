# sabaflz.github.io

My personal site. Plain HTML, CSS, and JavaScript, no build step.

## Public vs. private

Visitors see the portfolio: Home (Work, About), Research, Study Guides, and Resume.

Only you see Planner, Lab, and Blogs. Their content isn't on this site at all: it lives
in the private repo **sabaflz/site-private**, and the site reads it from GitHub with the
planner's GitHub token once you log in. To log in anywhere, add `#owner` to the address
(e.g. `sabaflz.github.io/#owner`) or open the Planner and choose Admin. A **Private** menu
then appears in the top bar. Logging out (in that menu) or closing the tab ends it.

| Private content | File in sabaflz/site-private |
|---|---|
| Lab page | `lab/index.html` (the page body, plain HTML) |
| Blog posts and source logs | `research/blogs/data.json` |
| Grad Plan tab in the planner | `planner/gradplan.json` |

The planner's GitHub token must include **both** repos (fine-grained token → Repository
access → sabaflz.github.io and sabaflz/site-private; Contents: Read and write).

## Where things live

| What you want to change | File |
|---|---|
| Any text, project, role, skill, link | `assets/js/content.js` |
| Resume | replace `assets/resume/Saba_Feilizadeh_Resume.pdf` |
| Profile photo | replace `assets/img/profile.jpg` (square works best) |
| Colors and fonts | tokens at the top of `assets/css/main.css` |
| Page layout and section order | `index.html` (Work, About, Contact) |
| Top menu (public pages and the owner-only Private menu) | `assets/js/nav.js` |
| Interactive behavior (detection box, demo, terminal) | `assets/js/main.js` |
| Degree requirement structure | `planner/data/degree.js` |
| A semester's course options | `planner/data/terms/<term>.js` |
| Course facts reused across terms | `planner/data/catalog.js` |
| My plans, check-offs, to-dos | `planner/data/state.json`, edited on the page in admin mode |
| Finals study plan (Planner → Study tab) | `planner/data/study.json`, encrypted when set to "Only me"; page code in `planner/study/` |
| List of research projects | the `PROJECTS` list in `research/index.html` |
| Blog posts (private) | `research/blogs/data.json` in sabaflz/site-private |
| A research project's overview, meetings, learning log, reading, to-dos | `research/<project>/data.js` (public) or `data.enc.json` (private, encrypted) |
| Research meeting transcripts (encrypted) | `research/<project>/private/transcripts.json`, added on the meeting's page |

## Common edits

**Add a project:** open `content.js`, copy one project object, paste it in the list, edit. Save and commit.

**Update the resume:** in Overleaf, Download PDF. Rename it `Saba_Feilizadeh_Resume.pdf`. In this repo, open `assets/resume/`, choose Add file, Upload files, drop it in, commit. It replaces the old one.

**Plan a new semester:** copy `planner/data/terms/_template.js` to e.g. `fall-2027.js`, list what's offered (times, rooms; course facts come from `catalog.js`), and add its `<script>` tag in `planner/index.html` above `planner.js`. At the end of each term, move the courses you passed into `done` in `planner/data/degree.js`.

**Hide something without deleting it:** add `hidden: true` to that object in `content.js`.

**Research 001 is private.** Its content is encrypted in `research/research-001/data.enc.json`, and the page asks for the team passphrase. To edit it, decrypt to a local file, change it, and encrypt again (the plain file is git-ignored):

```
RESEARCH_PASS='team passphrase' node tools/research-crypt.mjs decrypt research/research-001
# edit research/research-001/data.local.json (copy an existing meeting to add one)
RESEARCH_PASS='team passphrase' node tools/research-crypt.mjs encrypt research/research-001
```

**Add a transcript:** `RESEARCH_PASS='...' node tools/research-crypt.mjs transcript research/research-001 <meeting-id> transcript.txt`, or on the site: open the meeting, choose Add transcript, and paste it (that route also asks for your planner admin password, since it saves through the planner's GitHub token).

**Start a new research project:** copy `research/research-001/` to a new folder, empty its `data.js` and `private/transcripts.json` (back to `"check": null, "items": {}`), and add the project to `PROJECTS` in `research/index.html`.

**Every new page gets the Listen button:** include `<script src="…/assets/js/tts.js?v=2"></script>` (with the right number of `../`) before `theme.js`. It reads the page's `main` content aloud with the browser's built-in voice.

## Preview locally

Opening `index.html` directly works for the home page. The resume viewer needs a local server:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

**Study tab:** Planner has two subtabs, Semesters and Study. Study shows the finals study calendar (month and week views, check-offs, light days). It has its own "Only me / Everyone" switch and uses the same admin password. The plan itself lives only inside `planner/data/study.json`, never in a public file. To load a new semester's plan, log in on the Study tab and use Restore with the plan file (a `sf-study-backup` JSON); restoring replaces what's there, so download a backup first if you want to keep old check-offs.

## Planner admin

Visitors only see the planner when it's set to "Everyone", and even then it's read-only.
To edit: open the planner, click **Admin** at the bottom, and enter your admin password.
First time only: you set the password and paste a fine-grained GitHub token (this repo only,
Contents: Read and write). The token is stored in `planner/data/admin.json`, encrypted with
your password. "Only me" encrypts `state.json` with the same password. If the token expires,
the login asks for a new one. The password can't be recovered, so keep it in a password manager.

**Backups:** the admin bar has Download (saves your plan as a file on your computer) and Restore.
**Recovery key:** in the admin bar, choose **Make a recovery key** (it shows in red until you have one). Save the 32-character key in a password manager or on paper; it is shown only once.
**Forgot the password?** Choose Admin (or the owner login anywhere on the site), then **Forgot password?**, enter the recovery key and a new password. Everything locked with the old password (planner, study plan, the saved GitHub token) is re-locked with the new one, and the same recovery key keeps working. If the GitHub token has expired, the same box asks for a new one.
**No recovery key?** On GitHub, delete `planner/data/admin.json`, `planner/data/state.json` and `planner/data/study.json`, then click Admin: setup runs again, and you can restore your latest backup files.
then click Admin: setup runs again, and you can restore your latest backup file.
