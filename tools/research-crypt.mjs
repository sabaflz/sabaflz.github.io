#!/usr/bin/env node
/*
  research-crypt.mjs: lock and unlock a private research project's files.
  Same encryption as the site (AES-GCM, PBKDF2-SHA256, 600k rounds).

  The team passphrase comes from the RESEARCH_PASS environment variable, never an argument.

    RESEARCH_PASS='...' node tools/research-crypt.mjs decrypt research/research-001
        data.enc.json  ->  data.local.json   (plain text, git-ignored: edit this)

    RESEARCH_PASS='...' node tools/research-crypt.mjs encrypt research/research-001
        data.local.json  ->  data.enc.json   (commit this)

    RESEARCH_PASS='...' node tools/research-crypt.mjs transcript research/research-001 2026-11-13 notes.txt
        adds or replaces that meeting's transcript in private/transcripts.json

    RESEARCH_PASS='...' node tools/research-crypt.mjs show-transcript research/research-001 2026-11-06
*/
import { webcrypto as c } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ITER = 600000;
const te = new TextEncoder(), td = new TextDecoder();
const b64 = (u) => Buffer.from(u).toString("base64");
const unb64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

async function key(pass, salt, iter = ITER) {
  const base = await c.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]);
  return c.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function encrypt(text, pass) {
  const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await c.subtle.encrypt({ name: "AES-GCM", iv }, await key(pass, salt), te.encode(text)));
  return { v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
async function decrypt(enc, pass) {
  const k = await key(pass, unb64(enc.salt), enc.iter);
  return td.decode(await c.subtle.decrypt({ name: "AES-GCM", iv: unb64(enc.iv) }, k, unb64(enc.ct)));
}

const [cmd, dir, a, b] = process.argv.slice(2);
const pass = process.env.RESEARCH_PASS;
if (!cmd || !dir || !pass) {
  console.error("Usage: RESEARCH_PASS=... node tools/research-crypt.mjs <decrypt|encrypt|transcript|show-transcript> <project dir> [...]");
  process.exit(1);
}
const P = (f) => path.join(dir, f);
const readJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

async function checkPass(tx) {
  if (tx.check && (await decrypt(tx.check, pass).catch(() => null)) !== "team-ok") {
    throw new Error("That passphrase doesn't match the one already in use.");
  }
}

try {
  if (cmd === "decrypt") {
    const text = await decrypt(readJSON(P("data.enc.json")), pass);
    fs.writeFileSync(P("data.local.json"), JSON.stringify(JSON.parse(text), null, 2) + "\n");
    console.log("Wrote " + P("data.local.json") + " (do not commit it)");
  } else if (cmd === "encrypt") {
    const data = readJSON(P("data.local.json"));              // also validates the JSON
    const txPath = P("private/transcripts.json");
    if (fs.existsSync(txPath)) await checkPass(readJSON(txPath));
    const out = await encrypt(JSON.stringify(data), pass);
    out.note = "Encrypted project data. Edit data.local.json and re-run encrypt.";
    fs.writeFileSync(P("data.enc.json"), JSON.stringify(out, null, 2) + "\n");
    console.log("Wrote " + P("data.enc.json"));
  } else if (cmd === "transcript") {
    if (!a || !b) throw new Error("Give a meeting id and a text file.");
    const txPath = P("private/transcripts.json");
    const tx = fs.existsSync(txPath) ? readJSON(txPath) : { v: 1, items: {} };
    await checkPass(tx);
    if (!tx.check) tx.check = await encrypt("team-ok", pass);
    tx.items = tx.items || {};
    tx.items[a] = await encrypt(fs.readFileSync(b, "utf8").trim(), pass);
    tx.updated = new Date().toISOString();
    fs.mkdirSync(path.dirname(txPath), { recursive: true });
    fs.writeFileSync(txPath, JSON.stringify(tx, null, 2) + "\n");
    console.log("Saved transcript for " + a);
  } else if (cmd === "show-transcript") {
    const tx = readJSON(P("private/transcripts.json"));
    if (!tx.items || !tx.items[a]) throw new Error("No transcript for " + a);
    console.log(await decrypt(tx.items[a], pass));
  } else {
    throw new Error("Unknown command " + cmd);
  }
} catch (e) {
  console.error(e.message || "Wrong passphrase, or the file is damaged.");
  process.exit(1);
}
