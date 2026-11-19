/* Small helpers shared by every page (no React here) */
import Store from './storage';

const pad = n => String(n).padStart(2, '0');
export const toDate = s => new Date(String(s).length === 10 ? s + 'T00:00' : s);

const U = {
  date: s => (s ? toDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
  shortDate: s => toDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  time: s => toDate(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  dateTime: s => `${U.date(s)}, ${U.time(s)}`,
  toDate,
  ymd(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; },
  ago(s) {
    const diff = (Date.now() - toDate(s).getTime()) / 1000;
    if (diff < 0) return U.date(s);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return U.date(s);
  },
  daysLeft(s) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const d = toDate(s); d.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  },
  user: id => Store.find('users', id),
  course: id => Store.find('courses', id),
  dept: id => (Store.all('departments').find(d => d.id === id) || {}).name || '—',
  deptCode: id => (Store.all('departments').find(d => d.id === id) || {}).code || '—',
  deptColor: id => (Store.all('departments').find(d => d.id === id) || {}).color || '#4f46e5',
  settings: () => Store.obj('platformSettings'),
  initials: n => String(n || '?').replace(/^(Dr\.|Prof\.)\s*/, '').split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase(),
  avgRating: n => (n.ratings && n.ratings.length ? n.ratings.reduce((s, r) => s + r.score, 0) / n.ratings.length : 0),
  plural: (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`,
  fileIcon(t) {
    const m = { PDF: 'file-earmark-pdf text-danger', DOCX: 'file-earmark-word text-primary', PPTX: 'file-earmark-slides text-warning', XLSX: 'file-earmark-spreadsheet text-success', TXT: 'file-earmark-text text-secondary', MD: 'file-earmark-code text-secondary', PNG: 'file-earmark-image text-info', JPG: 'file-earmark-image text-info' };
    return `bi bi-${m[String(t).toUpperCase()] || 'file-earmark text-secondary'}`;
  },
  readFile(file, as = 'dataURL') {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      as === 'text' ? r.readAsText(file) : r.readAsDataURL(file);
    });
  },
  fmtSize: b => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'),
  download(filename, content, mime = 'text/plain') {
    const a = document.createElement('a');
    a.href = typeof content === 'string' && content.startsWith('data:') ? content : URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  },
  stripHtml(h) { if (typeof document === 'undefined') return String(h || ''); const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent || ''; },
  truncate: (s, n = 120) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; },
  match: (q, ...fields) => { q = String(q || '').trim().toLowerCase(); return !q || fields.some(f => String(f || '').toLowerCase().includes(q)); },
  copy(text) { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); },
  pageUrl: path => window.location.origin + path,
  validEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  slug: s => String(s).replace(/[^a-z0-9]+/gi, '_')
};

export default U;
