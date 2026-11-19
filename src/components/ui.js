'use client';
/* ==========================================================================
   Reusable UI components (stat cards, tabs, tables, pagination, badges…)
   ========================================================================== */
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import U from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

export const I = ({ n, className = '' }) => <i className={`bi bi-${n} ${className}`} aria-hidden="true" />;

export function Avatar({ user, size = 36, className = '' }) {
  const st = { width: size, height: size };
  if (!user) return <span className={`avatar ${className}`} style={{ ...st, background: '#94a3b8', fontSize: size * 0.4 }}>?</span>;
  if (user.avatar) return <img src={user.avatar} alt={user.name} className={`avatar ${className}`} width={size} height={size} style={st} />;
  return <span className={`avatar ${className}`} style={{ ...st, background: user.avatarColor || '#6366f1', fontSize: Math.round(size * 0.38) }} aria-label={user.name}>{U.initials(user.name)}</span>;
}

export function Stars({ value }) {
  return <span className="text-nowrap">{[1, 2, 3, 4, 5].map(i => <i key={i} className={`bi bi-star${value >= i ? '-fill' : value >= i - 0.5 ? '-half' : ''} text-warning`} />)}</span>;
}

const toneMap = { approved: 'success', active: 'success', available: 'success', resolved: 'success', accepted: 'success', open: 'primary', published: 'success', recovered: 'success', visible: 'success',
  pending: 'warning', reserved: 'warning', 'in review': 'warning', submitted: 'info', draft: 'secondary',
  rejected: 'danger', inactive: 'secondary', suspended: 'danger', removed: 'danger', sold: 'secondary', exchanged: 'secondary', closed: 'secondary', dismissed: 'secondary', full: 'secondary', completed: 'success' };
export function StatusBadge({ status }) {
  const s = String(status);
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return <span className={`badge badge-soft-${toneMap[s.toLowerCase()] || 'secondary'}`}>{label === 'Pending' ? 'Pending Verification' : label}</span>;
}

export function Money({ price, isFree }) {
  if (isFree || +price === 0) return <span className="text-success fw-semibold">Free</span>;
  return <>{U.settings().currency}{(+price).toLocaleString()}</>;
}

export function DueLabel({ date }) {
  const n = U.daysLeft(date);
  if (n < 0) return <span className="text-danger">{Math.abs(n)}d overdue</span>;
  if (n === 0) return <span className="text-danger fw-semibold">Today</span>;
  if (n === 1) return <span className="text-warning fw-semibold">Tomorrow</span>;
  return <span className={n <= 3 ? 'text-warning' : 'text-muted'}>in {n} days</span>;
}

export function DateBlock({ date }) {
  const d = U.toDate(date);
  return <div className="date-block"><div className="d">{d.getDate()}</div><div className="m">{d.toLocaleString('en-US', { month: 'short' })}</div></div>;
}

export function Stat({ icon, label, value, tone = 'primary', sub, href }) {
  const inner = (
    <div className={`card stat-card h-100 ${href ? 'hover-lift' : ''}`}><div className="card-body d-flex align-items-center gap-3">
      <div className={`stat-icon soft-${tone}`}><I n={icon} /></div>
      <div className="min-w-0"><div className="text-muted small text-truncate">{label}</div><div className="fs-4 fw-bold lh-sm">{value}</div>{sub && <div className="small text-muted text-truncate">{sub}</div>}</div>
    </div></div>);
  return href ? <Link href={href} className="text-reset d-block h-100">{inner}</Link> : inner;
}

export function Card({ title, actions, children, className = '', bodyClass = '' }) {
  return <div className={`card ${className}`}>
    {title && <div className="card-header d-flex justify-content-between align-items-center gap-2"><h2 className="h6 fw-semibold mb-0">{title}</h2>{actions}</div>}
    <div className={`card-body ${bodyClass}`}>{children}</div></div>;
}

export function PageHeader({ title, subtitle, children }) {
  return <div className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
    <div><h1 className="h3 fw-bold mb-1">{title}</h1>{subtitle && <p className="text-muted mb-0">{subtitle}</p>}</div>
    {children && <div className="d-flex flex-wrap gap-2">{children}</div>}</div>;
}

export function Tabs({ items, active, onChange, className = 'mb-3' }) {
  return <ul className={`nav nav-pills nav-pills-soft flex-nowrap overflow-auto gap-1 ${className}`} role="tablist">
    {items.map(t => <li className="nav-item" key={t.key}><button type="button" className={`nav-link text-nowrap ${t.key === active ? 'active' : ''}`} role="tab" aria-selected={t.key === active} onClick={() => onChange(t.key)}>
      {t.icon && <I n={t.icon} className="me-1" />}{t.label}{t.count !== undefined && <span className="badge rounded-pill ms-1 tab-count">{t.count}</span>}</button></li>)}</ul>;
}

export function Chips({ items, active, onChange, all = 'All' }) {
  return <div className="d-flex flex-wrap gap-2">
    {all && <button type="button" className={`chip chip-btn ${!active ? 'active' : ''}`} onClick={() => onChange('')}><I n="grid" />{all}</button>}
    {items.map(c => { const v = typeof c === 'object' ? c.value : c; const l = typeof c === 'object' ? c.label : c; return <button type="button" key={v} className={`chip chip-btn ${active === v ? 'active' : ''}`} onClick={() => onChange(v)}>{c.icon && <I n={c.icon} />}{l}</button>; })}</div>;
}

export function Empty({ icon = 'inbox', title, text, children }) {
  return <div className="empty-state"><div className="empty-icon"><I n={icon} /></div><h6 className="fw-semibold mb-1">{title}</h6>{text && <p className="text-muted small mb-3">{text}</p>}{children}</div>;
}

export function Progress({ value, tone = 'primary', h = 8 }) {
  return <div className="progress" style={{ height: h }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className={`progress-bar bg-${tone}`} style={{ width: value + '%' }} /></div>;
}

export function Loading() { return <div className="py-5 text-center text-muted"><div className="spinner-border text-primary mb-2" role="status" /><div className="small">Loading…</div></div>; }

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '', style }) {
  return <div className={`position-relative ${className}`} style={style}><I n="search" className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
    <input className="form-control ps-5" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} aria-label={placeholder} /></div>;
}

export function Select({ value, onChange, options, all, className = 'form-select w-auto', label }) {
  return <select className={className} value={value} onChange={e => onChange(e.target.value)} aria-label={label || all}>
    {all !== undefined && <option value="">{all}</option>}
    {options.map(o => { const v = typeof o === 'object' ? o.value : o; const l = typeof o === 'object' ? o.label : o; return <option key={v} value={v}>{l}</option>; })}</select>;
}

/** Responsive table: stacks into cards on mobile */
export function DataTable({ cols, rows, empty = 'No records found.', rowClass, rowKey = r => r.id }) {
  if (!rows.length) return <Empty icon="inbox" title="Nothing here yet" text={empty} />;
  return <div className="table-responsive"><table className="table table-hover align-middle table-stack mb-0">
    <thead><tr>{cols.map((c, i) => <th key={i} className={c.cls}>{c.label}</th>)}</tr></thead>
    <tbody>{rows.map((r, ri) => <tr key={rowKey(r) ?? ri} className={rowClass ? rowClass(r) : ''}>{cols.map((c, i) => <td key={i} data-label={typeof c.label === 'string' ? c.label : ''} className={c.cls}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody>
  </table></div>;
}

export function paginate(items, page, per) {
  const pages = Math.max(1, Math.ceil(items.length / per));
  const p = Math.min(Math.max(1, page), pages);
  return { items: items.slice((p - 1) * per, p * per), page: p, pages, total: items.length };
}
export function Pager({ pg, onPage }) {
  if (pg.pages <= 1) return null;
  return <nav className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2" aria-label="Pagination">
    <small className="text-muted">Page {pg.page} of {pg.pages} · {pg.total} results</small>
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item ${pg.page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => onPage(pg.page - 1)} aria-label="Previous"><I n="chevron-left" /></button></li>
      {Array.from({ length: pg.pages }, (_, i) => i + 1).map(i => <li key={i} className={`page-item ${i === pg.page ? 'active' : ''}`}><button className="page-link" onClick={() => onPage(i)}>{i}</button></li>)}
      <li className={`page-item ${pg.page === pg.pages ? 'disabled' : ''}`}><button className="page-link" onClick={() => onPage(pg.page + 1)} aria-label="Next"><I n="chevron-right" /></button></li>
    </ul></nav>;
}

/** Markdown-lite renderer (AI chat) */
export function Md({ text }) {
  const inline = s => s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : p);
  const out = []; let list = null; let k = 0;
  const flush = () => { if (list) { const L = list.type; out.push(<L key={k++}>{list.items.map((x, i) => <li key={i}>{inline(x)}</li>)}</L>); list = null; } };
  String(text).split('\n').forEach(ln => {
    const ul = ln.match(/^\s*[-•]\s+(.*)/), ol = ln.match(/^\s*\d+\.\s+(.*)/);
    if (ul || ol) { const t = ul ? 'ul' : 'ol'; if (!list || list.type !== t) { flush(); list = { type: t, items: [] }; } list.items.push((ul || ol)[1]); }
    else { flush(); if (ln.trim()) out.push(<p key={k++}>{inline(ln)}</p>); }
  });
  flush();
  return <>{out}</>;
}

/* ---------- Chart.js wrapper ---------- */
export const palette = ['#4f46e5', '#0ea5e9', '#a78bfa', '#16a34a', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899'];
export function ChartBox({ type, labels, datasets, opts = {}, height = 260, className = '' }) {
  const ref = useRef(null);
  const { resolved } = useTheme();
  const key = JSON.stringify({ type, labels, datasets, opts, resolved });
  useEffect(() => {
    let chart; let cancelled = false;
    import('chart.js/auto').then(({ default: Chart }) => {
      if (cancelled || !ref.current) return;
      const dark = resolved === 'dark';
      const grid = dark ? 'rgba(148,163,184,.15)' : 'rgba(15,23,42,.06)';
      const tick = dark ? '#94a3b8' : '#64748b';
      const round = ['doughnut', 'pie', 'polarArea'].includes(type);
      const ds = datasets.map((d, i) => {
        const c = d.color || palette[i % palette.length];
        if (round) return { ...d, backgroundColor: d.backgroundColor || palette, borderWidth: 2, borderColor: dark ? '#121a2e' : '#fff' };
        if (type === 'line') return { ...d, borderColor: c, backgroundColor: c + '22', tension: 0.35, fill: d.fill ?? true, pointRadius: 3, borderWidth: 2 };
        return { ...d, backgroundColor: d.backgroundColor || c, borderRadius: 6, maxBarThickness: 34 };
      });
      chart = new Chart(ref.current, {
        type, data: { labels, datasets: ds },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: opts.horizontal ? 'y' : 'x',
          plugins: { legend: { display: opts.legend ?? (datasets.length > 1 || round), position: 'bottom', labels: { color: tick, usePointStyle: true, boxWidth: 8 } }, tooltip: { mode: 'index', intersect: false } },
          scales: round ? {} : { x: { grid: { display: false }, ticks: { color: tick }, stacked: opts.stacked }, y: { grid: { color: grid }, ticks: { color: tick }, beginAtZero: true, stacked: opts.stacked, max: opts.max } },
          cutout: type === 'doughnut' ? '68%' : undefined
        }
      });
    });
    return () => { cancelled = true; if (chart) chart.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <div className={`chart-box ${className}`} style={{ height }}><canvas ref={ref} /></div>;
}

export function DemoBanner({ children }) {
  return <div className="demo-banner p-3 small mb-4"><I n="info-circle" className="me-1" />{children}</div>;
}
