"""
Refresh planner course times, rooms, and instructors from classes.berkeley.edu.

Runs from GitHub Actions (.github/workflows/update-planner-schedule.yml) once a day.
For every course in planner/data/terms/*.js it looks up that term's class page and writes
what it finds to planner/data/live.js. The planner shows live data over the hand-written
term files, so "TBA" fills in by itself as soon as Berkeley publishes it.

Debug locally: python3 scripts/update_schedule.py --debug "CS 61B" sp27
"""
import html, json, re, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TERMS_DIR = ROOT / "planner/data/terms"
OUT = ROOT / "planner/data/live.js"
UA = "Mozilla/5.0 (planner schedule refresh for sabaflz.github.io)"

# course id in the planner -> class-page subject slugs to try (cross-listed courses live under one subject)
SUBJECT = {"CS": ["compsci"], "DATA": ["data"], "COGSCI": ["cogsci"], "POLSCI": ["polsci"], "HISTORY": ["history"],
           "INFO": ["info"], "PUBHLTH": ["pbhlth"], "EECS": ["eecs"], "STAT": ["stat"]}
EXTRA = {
    "DATA C100": ["stat-c100", "compsci-c100"],
    "DATA C8": ["stat-c8", "compsci-c8", "info-c8"],
    "DATA C104": ["history-c184d", "sts-c104d"],
    "COGSCI C100": ["psych-c120"],
    "CS 182": ["compsci-c182", "eecs-c182"],
    "CS C176": ["cmpbio-c176"],
    "CS C177": ["econ-c177"],
}
SKIP = {"CC POLI", "CC HIST", "FUNG-SP", "RESEARCH", "CS 198-GC", "CS 47B", "CS 47C"}
DAYMAP = {"Mo": "M", "Tu": "Tu", "We": "W", "Th": "Th", "Fr": "F", "Sa": "Sa", "Su": "Su"}


def read_terms():
    terms = []
    for f in sorted(TERMS_DIR.glob("*.js")):
        if f.name.startswith("_"):
            continue
        m = re.match(r"(spring|summer|fall)-(\d{4})\.js$", f.name)
        if not m:
            continue
        text = f.read_text()
        tid = re.search(r'\bid:\s*"([^"]+)"', text).group(1)
        ids = re.findall(r'\{\s*id:\s*"([^"]+)"', text)
        terms.append({"id": tid, "season": m.group(1), "year": m.group(2), "courses": ids})
    return terms


def slugs(cid):
    subj, _, num = cid.partition(" ")
    out = [s + "-" + num.lower() for s in SUBJECT.get(subj, [subj.lower()])]
    return out + EXTRA.get(cid, [])


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def to_24h(t):
    t = t.strip().lower().replace(" ", "")
    h, m = t[:-2].split(":")
    h = int(h) % 12 + (12 if t.endswith("pm") else 0)
    return "%02d:%s" % (h, m)


def text_of(page):
    page = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", page)
    page = re.sub(r"(?i)<br\s*/?>|</(p|div|li|h\d|tr|section|span|a|dd|dt)>", "\n", page)
    page = re.sub(r"<[^>]+>", " ", page)
    lines = [re.sub(r"\s+", " ", html.unescape(l)).strip() for l in page.split("\n")]
    return [l for l in lines if l]


def parse(page):
    """Pull meetings, location, instructor, seats out of a class page. Returns {} if nothing found."""
    out = {}
    lines = text_of(page)
    joined = "\n".join(lines)

    # meetings: "Tu, Th, 08:00 am - 09:29 am" or "MoWeFr 3:00 pm - 3:59 pm"
    day = r"(?:Mo|Tu|We|Th|Fr|Sa|Su)"
    pat = re.compile(r"((?:%s[,\s]*)+)\s*(\d{1,2}:\d{2}\s*[ap]m)\s*-\s*(\d{1,2}:\d{2}\s*[ap]m)" % day, re.I)
    meets, seen = [], set()
    for m in pat.finditer(joined):
        ds = "".join(DAYMAP[d] for d in re.findall(day, m.group(1)))
        key = (ds, m.group(2), m.group(3))
        if ds and key not in seen:
            seen.add(key)
            meets.append({"days": ds, "start": to_24h(m.group(2)), "end": to_24h(m.group(3))})
    if meets:
        out["meet"] = meets[:1]   # first block on the page is the lecture

    # location: the campus-map link text
    loc = re.search(r'<a[^>]+href="[^"]*(?:maps?\.berkeley|campus-?map|/map)[^"]*"[^>]*>(.*?)</a>', page, re.I | re.S)
    if loc:
        out["location"] = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", loc.group(1)))).strip()

    # instructor: an element whose class mentions instructor, else the line right before the date range
    ins = re.search(r'class="[^"]*instructor[^"]*"[^>]*>(.*?)</', page, re.I | re.S)
    name = None
    if ins:
        name = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", ins.group(1)))).strip()
    if not name:
        for i, l in enumerate(lines):
            if re.match(r"[A-Z][a-z]{2} \d{1,2}, \d{4} ?- ?[A-Z][a-z]{2} \d{1,2}, \d{4}", l) and i > 0:
                prev = lines[i - 1]
                if re.match(r"^[A-Z][\w.'-]+(?: [A-Z][\w.'-]+)+(?:, [A-Z][\w.'-]+(?: [A-Z][\w.'-]+)+)*$", prev) and len(prev) < 80:
                    name = prev
                break
    if name and name.lower() not in ("instructor", "instructors", "staff", "the staff"):
        out["instructor"] = name

    cap = re.search(r"Capacity:?\s*(\d+)", joined)
    enr = re.search(r"Enrolled:?\s*(\d+)", joined)
    wl = re.search(r"Waitlisted:?\s*(\d+)", joined)
    res = re.search(r"Open Reserved Seats:?\s*([^\n]+)", joined)
    if cap:
        s = "%s seats" % cap.group(1)
        if enr:
            s += ", %s enrolled" % enr.group(1)
        if wl and int(wl.group(1)):
            s += ", %s waitlisted" % wl.group(1)
        if res and re.search(r"\d", res.group(1)):
            s += ". Reserved: " + res.group(1).strip()[:120]
        out["seats"] = s
    return out


def lookup(term, cid):
    for slug in slugs(cid):
        url = "https://classes.berkeley.edu/content/%s-%s-%s-001-lec-001" % (term["year"], term["season"], slug)
        page = fetch(url)
        time.sleep(0.4)
        if page:
            data = parse(page)
            if data:
                data["link"] = url
                return data
    return None


def main():
    if len(sys.argv) >= 4 and sys.argv[1] == "--debug":
        term = next(t for t in read_terms() if t["id"] == sys.argv[3])
        for slug in slugs(sys.argv[2]):
            url = "https://classes.berkeley.edu/content/%s-%s-%s-001-lec-001" % (term["year"], term["season"], slug)
            page = fetch(url)
            print("URL", url, "->", "404" if page is None else "%d bytes" % len(page))
            if page:
                print("\n".join(text_of(page)[:120]))
                print("PARSED", json.dumps(parse(page), indent=1))
                for m in re.finditer(r'class="([^"]*(?:instructor|location|meeting|time)[^"]*)"', page, re.I):
                    print("CLASS", m.group(1))
        return

    prev = {}
    if OUT.exists():
        m = re.search(r"window\.PLANNER_LIVE\s*=\s*(\{.*\});", OUT.read_text(), re.S)
        if m:
            prev = json.loads(m.group(1)).get("terms", {})
    live = {}
    found = 0
    for term in read_terms():
        live[term["id"]] = {}
        for cid in term["courses"]:
            if cid in SKIP:
                continue
            try:
                data = lookup(term, cid)
            except Exception as e:                       # network hiccup: keep yesterday's data
                print("error", term["id"], cid, e)
                data = prev.get(term["id"], {}).get(cid)
            if data:
                live[term["id"]][cid] = data
                found += 1
                print("ok ", term["id"], cid, json.dumps(data)[:140])
            else:
                print("-- ", term["id"], cid, "not published yet")
    body = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "terms": live}
    old = OUT.read_text() if OUT.exists() else ""
    new_core = json.dumps(live, sort_keys=True)
    if old and new_core == json.dumps(json.loads(re.search(r"=\s*(\{.*\});", old, re.S).group(1))["terms"], sort_keys=True):
        print("no changes")
        return
    OUT.write_text("/* Auto-generated by scripts/update_schedule.py from classes.berkeley.edu. Don't edit by hand. */\n"
                   "window.PLANNER_LIVE = " + json.dumps(body, indent=1, ensure_ascii=False) + ";\n")
    print("wrote", OUT, "courses found:", found)


if __name__ == "__main__":
    main()
