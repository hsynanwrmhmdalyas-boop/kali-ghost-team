// KALI COMMUNITY — Firebase / Firestore bridge
// Keeps the existing KALI_DB API and LocalStorage cache.
// Firebase SDK v10.14.1 (modular browser imports).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfKXR-LA6sJUJqfUkhqpyfRN6FjmuxKsM",
  authDomain: "kali-community.firebaseapp.com",
  projectId: "kali-community",
  storageBucket: "kali-community.firebasestorage.app",
  messagingSenderId: "629118157408",
  appId: "1:629118157408:web:1e8c9155d92d9d4f45f905",
  measurementId: "G-LR58D5XZFM"
};

const DATASETS = {
  posts: "kali_comm_posts_v2",
  discussions: "kali_comm_discussions_v2",
  topics: "kali_comm_topics_v2",
  members: "kali_comm_members_v2",
  stats: "kali_comm_stats_v2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ready = new Set();
const applyingRemote = new Set();
const timers = new Map();

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("[KALI Firebase] Could not read local data:", key, error);
    return null;
  }
}

function applyRemote(key, value) {
  applyingRemote.add(key);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("kali_db_updated", { detail: { key, remote: true } }));
  } finally {
    // Keep the guard through the synchronous storage event dispatch.
    applyingRemote.delete(key);
  }
}

async function saveDataset(name, key) {
  if (!ready.has(key) || applyingRemote.has(key)) return;
  const value = readLocal(key);
  if (value === null) return;
  try {
    await setDoc(doc(db, "kali_app_data", name), {
      value,
      updatedAt: serverTimestamp()
    });
    console.info("[KALI Firebase] Synced:", name);
  } catch (error) {
    console.error("[KALI Firebase] Sync failed:", name, error);
    window.dispatchEvent(new CustomEvent("kali_firebase_error", {
      detail: { message: "تعذر حفظ البيانات في Firebase. تحقق من اتصال الإنترنت وقواعد Firestore." }
    }));
  }
}

function queueSave(name, key) {
  if (!ready.has(key) || applyingRemote.has(key)) return;
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => saveDataset(name, key), 350));
}

async function start() {
  if (!window.KALI_DB) {
    console.error("[KALI Firebase] KALI_DB is missing. Load db.js before this file.");
    return;
  }

  await signInAnonymously(auth);

  for (const [name, key] of Object.entries(DATASETS)) {
    const ref = doc(db, "kali_app_data", name);
    const initial = await getDoc(ref);

    if (initial.exists() && initial.data() && initial.data().value !== undefined) {
      applyRemote(key, initial.data().value);
    } else {
      const local = readLocal(key);
      if (local !== null) {
        await setDoc(ref, { value: local, updatedAt: serverTimestamp() });
      }
    }

    ready.add(key);

    onSnapshot(ref, snapshot => {
      if (!snapshot.exists()) return;
      const remoteValue = snapshot.data()?.value;
      if (remoteValue === undefined) return;
      const localValue = readLocal(key);
      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        applyRemote(key, remoteValue);
      }
    }, error => {
      console.error("[KALI Firebase] Live listener failed:", name, error);
    });
  }

  window.addEventListener("kali_db_updated", event => {
    const key = event.detail?.key;
    if (!key || event.detail?.remote || applyingRemote.has(key)) return;
    const entry = Object.entries(DATASETS).find(([, storageKey]) => storageKey === key);
    if (entry) queueSave(entry[0], key);
  });

  window.dispatchEvent(new CustomEvent("kali_firebase_ready"));
  console.info("[KALI Firebase] Connected to project:", firebaseConfig.projectId);
}

start().catch(error => {
  console.error("[KALI Firebase] Startup failed:", error);
  window.dispatchEvent(new CustomEvent("kali_firebase_error", {
    detail: { message: "فشل الاتصال بقاعدة البيانات. راجع إعدادات تسجيل الدخول وقواعد Firestore." }
  }));
});
