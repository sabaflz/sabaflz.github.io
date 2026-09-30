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

## Common edits

**Add a project:** open `content.js`, copy one project object, paste it in the list, edit. Save and commit.

**Update the resume:** in Overleaf, Download PDF. Rename it `Saba_Feilizadeh_Resume.pdf`. In this repo, open `assets/resume/`, choose Add file, Upload files, drop it in, commit. It replaces the old one.

**Hide something without deleting it:** add `hidden: true` to that object in `content.js`.

## Preview locally

Opening `index.html` directly works for the home page. The resume viewer needs a local server:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.
