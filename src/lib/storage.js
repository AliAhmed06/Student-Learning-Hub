/* ==========================================================================
   Store — frontend "database" backed by the browser cache (localStorage)
   --------------------------------------------------------------------------
   • First read of a collection comes from src/data/data.js (seed data).
   • When a collection changes, ONLY that collection is written to
     localStorage under "ush:<collection>" — it then behaves like a saved
     database table: survives refresh, visible to every page and every role.
   • A small activity log ("ush:__cachelog") records every write so the UI
     can show what is stored in the cache.
   • Store.reset() clears the cache and returns to data.js.
   To connect a real backend later, replace these methods with API calls.
   ========================================================================== */
import DATA from '@/data/data';

const PREFIX = 'ush:';
const LOG_KEY = 'ush:__cachelog';
const cache = {};
const listeners = new Set();
const clone = o => JSON.parse(JSON.stringify(o));
const hasWindow = () => typeof window !== 'undefined';

let onError = null;

function emit() { listeners.forEach(fn => fn()); }

function load(key) {
  if (!(key in cache)) {
    let raw = null;
    if (hasWindow()) { try { raw = localStorage.getItem(PREFIX + key); } catch (e) { /* ignore */ } }
    cache[key] = raw ? JSON.parse(raw) : clone(DATA[key] ?? []);
  }
  return cache[key];
}

function log(key, action, label) {
  if (!hasWindow()) return;
  try {
    const list = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    list.unshift({ key, action, label: label ? String(label).slice(0, 80) : '', at: new Date().toISOString() });
    localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, 60)));
  } catch (e) { /* ignore */ }
}

function save(key, action = 'update', label = '') {
  if (!hasWindow()) return true;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(cache[key]));
    log(key, action, label);
    emit();
    return true;
  } catch (e) {
    if (onError) onError('Browser storage is full. Remove large uploads or reset the demo data.');
    return false;
  }
}

export const uid = (p = 'id') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const Store = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  setErrorHandler(fn) { onError = fn; },
  all: key => load(key),
  obj: key => load(key),
  find: (key, id) => load(key).find(x => x.id === id),
  where: (key, fn) => load(key).filter(fn),
  add(key, item, prefix) {
    if (!item.id) item.id = uid(prefix || key.slice(0, 2));
    load(key).unshift(item);
    if (!save(key, 'create', item.title || item.name || item.text || item.message || item.id)) { load(key).shift(); return null; }
    return item;
  },
  update(key, id, changes) {
    const it = Store.find(key, id);
    if (!it) return null;
    if (typeof changes === 'function') changes(it); else Object.assign(it, changes);
    save(key, 'update', it.title || it.name || it.id);
    return it;
  },
  remove(key, id) {
    const arr = load(key);
    const i = arr.findIndex(x => x.id === id);
    if (i > -1) { const [it] = arr.splice(i, 1); save(key, 'delete', it.title || it.name || id); }
  },
  removeWhere(key, fn) {
    const arr = load(key);
    for (let i = arr.length - 1; i >= 0; i--) if (fn(arr[i])) arr.splice(i, 1);
    save(key, 'delete');
  },
  set(key, value) { cache[key] = value; save(key, 'update'); },
  save: (key, label) => save(key, 'update', label),

  /** per-user state: bookmarks, saved items, progress, chat… */
  us(userId) {
    const all = load('userState');
    if (!all[userId]) all[userId] = {};
    const s = all[userId];
    const d = { bookmarks: [], savedResources: [], savedOpportunities: [], appliedOpportunities: [], completedModules: [], submittedAssignments: [], aiChat: [], weeklyActivity: [0, 0, 0, 0, 0, 0, 0] };
    for (const k in d) if (!(k in s)) s[k] = d[k];
    return s;
  },
  saveUs() { save('userState', 'update', 'user preferences'); },
  toggleUs(userId, field, value) {
    const s = Store.us(userId);
    const i = s[field].indexOf(value);
    if (i > -1) s[field].splice(i, 1); else s[field].push(value);
    Store.saveUs();
    return i === -1;
  },
  notify(recipientId, title, message, category = 'System', link = '') {
    if (!recipientId) return;
    Store.add('notifications', { recipientId, title, message, category, link, date: new Date().toISOString(), read: false }, 'nt');
  },

  /* ---------- cache inspection (for the "Browser cache" panels) ---------- */
  cacheInfo() {
    const out = { collections: [], total: 0, log: [] };
    if (!hasWindow()) return out;
    try {
      Object.keys(localStorage).filter(k => k.startsWith(PREFIX) && k !== LOG_KEY).forEach(k => {
        const v = localStorage.getItem(k) || '';
        const key = k.slice(PREFIX.length);
        let records = 0; try { const p = JSON.parse(v); records = Array.isArray(p) ? p.length : Object.keys(p).length; } catch (e) { /* ignore */ }
        const seed = DATA[key]; const seedCount = Array.isArray(seed) ? seed.length : seed ? Object.keys(seed).length : 0;
        out.collections.push({ key, bytes: v.length * 2, records, seedCount });
        out.total += v.length * 2;
      });
      out.log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch (e) { /* ignore */ }
    out.collections.sort((a, b) => b.bytes - a.bytes);
    return out;
  },
  /** users created at runtime (registered / added by admin) — not in data.js */
  cachedUsers() {
    const seedIds = new Set(DATA.users.map(u => u.id));
    return load('users').filter(u => !seedIds.has(u.id));
  },
  isSeed(key, id) { return (DATA[key] || []).some(x => x.id === id); },
  reset() {
    if (!hasWindow()) return;
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    Object.keys(cache).forEach(k => delete cache[k]);
    emit();
  }
};

export default Store;
