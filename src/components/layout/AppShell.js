'use client';
/* ==========================================================================
   AppShell — role guard, sidebar, top bar (search, notifications, profile),
   breadcrumbs and footer for the three portals.
   ========================================================================== */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Auth, Domain } from '@/lib/services';
import { useAuth, useMe } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUI } from '@/context/UIContext';
import { Avatar, I, Loading } from '@/components/ui';
import CacheInspector from '@/components/CacheInspector';

export const NAV = {
  student: [
    { section: 'Overview', items: [['Dashboard', 'grid-1x2', '/student/dashboard']] },
    { section: 'Learning', items: [['Learning Hub', 'book', '/student/learning'], ['Notes Library', 'journal-text', '/student/learning/notes'], ['Upload Notes', 'cloud-arrow-up', '/student/learning/upload'], ['Practice Quizzes', 'patch-question', '/student/quizzes'], ['AI Study Assistant', 'robot', '/student/ai-assistant'], ['Study Planner', 'calendar-check', '/student/planner']] },
    { section: 'Recognition', items: [['Achievements', 'trophy', '/student/achievements'], ['Badges & Rewards', 'award', '/student/achievements/badges'], ['Leaderboard', 'bar-chart-line', '/student/leaderboard']] },
    { section: 'Community', items: [['Community Feed', 'people', '/student/community'], ['Ask Questions', 'question-circle', '/student/community/questions'], ['Study Groups', 'collection', '/student/community/groups'], ['Projects', 'kanban', '/student/community/projects']] },
    { section: 'Campus', items: [['Exchange Corner', 'shop', '/student/exchange'], ['My Exchange', 'arrow-left-right', '/student/exchange/my-activity'], ['Opportunities', 'briefcase', '/student/opportunities'], ['Events', 'calendar-event', '/student/events'], ['Lost & Found', 'search-heart', '/student/lost-found'], ['Feedback', 'chat-square-text', '/student/feedback']] },
    { section: 'Account', items: [['Messages', 'chat-dots', '/student/messages', 'messages'], ['Notifications', 'bell', '/student/notifications', 'notifications'], ['Profile', 'person-circle', '/student/profile'], ['Settings', 'gear', '/student/settings']] }
  ],
  faculty: [
    { section: 'Overview', items: [['Dashboard', 'grid-1x2', '/faculty/dashboard']] },
    { section: 'Teaching', items: [['My Courses', 'journal-bookmark', '/faculty/courses'], ['Materials', 'folder2-open', '/faculty/materials'], ['Quizzes', 'patch-question', '/faculty/quizzes'], ['Students', 'people', '/faculty/students']] },
    { section: 'Engagement', items: [['Achievement Reviews', 'patch-check', '/faculty/achievements', 'pendingAch'], ['Announcements', 'megaphone', '/faculty/announcements']] },
    { section: 'Account', items: [['Profile', 'person-circle', '/faculty/profile']] }
  ],
  admin: [
    { section: 'Overview', items: [['Dashboard', 'grid-1x2', '/admin/dashboard'], ['Analytics', 'graph-up-arrow', '/admin/analytics']] },
    { section: 'Academics', items: [['Users', 'people', '/admin/users'], ['Courses', 'journal-bookmark', '/admin/courses'], ['Materials & Reports', 'folder-check', '/admin/materials']] },
    { section: 'Recognition', items: [['Achievements', 'patch-check', '/admin/achievements', 'pendingAch'], ['Leaderboard & Awards', 'trophy', '/admin/leaderboard']] },
    { section: 'Community', items: [['Marketplace', 'shop', '/admin/marketplace'], ['Community', 'chat-square-quote', '/admin/community'], ['Opportunities', 'briefcase', '/admin/opportunities'], ['Events', 'calendar-event', '/admin/events'], ['Announcements', 'megaphone', '/admin/announcements'], ['Feedback', 'chat-square-text', '/admin/feedback', 'openFeedback']] },
    { section: 'System', items: [['Settings', 'sliders', '/admin/settings']] }
  ]
};
export const notifIcon = { Academic: 'book', Achievement: 'trophy', Exchange: 'shop', Community: 'people', Event: 'calendar-event', System: 'gear' };

function counters(user) {
  return {
    messages: Domain.unreadMessages(user.id),
    notifications: Store.where('notifications', n => n.recipientId === user.id && !n.read).length,
    pendingAch: Store.where('achievements', a => a.status === 'pending' && (user.role === 'admin' || (U.user(a.studentId) || {}).department === user.department)).length,
    openFeedback: Store.where('feedback', f => f.status === 'Submitted').length
  };
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return { open, setOpen, ref };
}

function Sidebar({ user, path, onClose }) {
  const c = counters(user);
  let best = '';
  NAV[user.role].forEach(g => g.items.forEach(i => { if ((path === i[2] || path.startsWith(i[2] + '/')) && i[2].length > best.length) best = i[2]; }));
  const label = { student: 'Student Portal', faculty: 'Faculty Portal', admin: 'Admin Console' }[user.role];
  return <aside className="sidebar">
    <div className="sidebar-brand d-flex align-items-center gap-2 px-3">
      <Link href={Auth.home(user.role)} className="d-flex align-items-center gap-2 text-reset"><span className="brand-mark"><I n="mortarboard-fill" /></span><span className="brand-text"><span className="d-block fw-bold lh-1">Student Hub</span><small className="text-muted">{label}</small></span></Link>
      <button className="btn btn-sm btn-icon ms-auto d-lg-none" onClick={onClose} aria-label="Close menu"><I n="x-lg" /></button>
    </div>
    <nav className="px-2 pb-4" aria-label="Main navigation">{NAV[user.role].map(g => <div key={g.section}>
      <div className="nav-section">{g.section}</div>
      {g.items.map(([l, icon, href, counter]) => <Link key={href} href={href} className={`nav-link-side ${href === best ? 'active' : ''}`} title={l} onClick={onClose}>
        <I n={icon} /><span className="label">{l}</span>{counter && c[counter] ? <span className="badge rounded-pill bg-danger ms-auto">{c[counter]}</span> : null}</Link>)}
    </div>)}</nav>
  </aside>;
}

function NotificationsMenu({ user }) {
  const dd = useDropdown();
  const router = useRouter();
  const list = Store.where('notifications', n => n.recipientId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const unread = Store.where('notifications', n => n.recipientId === user.id && !n.read).length;
  const open = n => { Store.update('notifications', n.id, { read: true }); dd.setOpen(false); if (n.link) router.push(n.link); };
  const readAll = () => { Store.all('notifications').forEach(n => { if (n.recipientId === user.id) n.read = true; }); Store.save('notifications', 'mark all read'); };
  return <div className="position-relative" ref={dd.ref}>
    <button className="btn btn-icon position-relative" onClick={() => dd.setOpen(!dd.open)} aria-label="Notifications" aria-expanded={dd.open}><I n="bell" />{unread > 0 && <span className="dot-badge">{unread}</span>}</button>
    {dd.open && <div className="dropdown-menu dropdown-menu-end show p-0 notif-menu shadow" style={{ right: 0, left: 'auto', position: 'absolute' }}>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"><strong className="small">Notifications {unread > 0 && <span className="badge bg-danger rounded-pill">{unread}</span>}</strong>{unread > 0 && <button className="btn btn-link btn-sm p-0" onClick={readAll}>Mark all read</button>}</div>
      <div className="notif-list">{list.length ? list.map(n => <button key={n.id} className={`dropdown-item d-flex gap-2 py-2 ${n.read ? '' : 'unread'}`} onClick={() => open(n)}>
        <span className="notif-icon soft-primary"><I n={notifIcon[n.category] || 'bell'} /></span>
        <span className="text-wrap small"><span className="d-block fw-semibold">{n.title}</span><span className="text-muted">{U.truncate(n.message, 80)}</span><span className="d-block text-muted xsmall">{U.ago(n.date)}</span></span></button>)
        : <div className="p-4 text-center text-muted small">You are all caught up 🎉</div>}</div>
      {user.role === 'student' && <Link href="/student/notifications" className="d-block text-center small py-2 border-top" onClick={() => dd.setOpen(false)}>View all notifications</Link>}
    </div>}
  </div>;
}

function ProfileMenu({ user }) {
  const dd = useDropdown();
  const { logout } = useAuth();
  const { toggle } = useTheme();
  const go = () => dd.setOpen(false);
  return <div className="position-relative" ref={dd.ref}>
    <button className="btn d-flex align-items-center gap-2 px-1 px-sm-2" onClick={() => dd.setOpen(!dd.open)} aria-label="Account menu" aria-expanded={dd.open}><Avatar user={user} size={34} />
      <span className="d-none d-md-block text-start lh-sm"><span className="d-block small fw-semibold">{user.name}</span><small className="text-muted text-capitalize">{user.role === 'admin' ? 'Administrator' : user.role}</small></span><I n="chevron-down" className="small text-muted d-none d-md-inline" /></button>
    {dd.open && <ul className="dropdown-menu dropdown-menu-end show shadow" style={{ right: 0, left: 'auto', position: 'absolute' }}>
      <li className="px-3 py-2 small"><div className="fw-semibold">{user.name}</div><div className="text-muted">{user.email}</div></li>
      <li><hr className="dropdown-divider" /></li>
      <li><Link className="dropdown-item" href={`/${user.role}/${user.role === 'admin' ? 'settings' : 'profile'}`} onClick={go}><I n="person" className="me-2" />{user.role === 'admin' ? 'Platform settings' : 'My profile'}</Link></li>
      {user.role === 'student' && <><li><Link className="dropdown-item" href="/student/settings" onClick={go}><I n="gear" className="me-2" />Settings</Link></li><li><Link className="dropdown-item" href="/student/achievements/badges" onClick={go}><I n="award" className="me-2" />Badges & rewards</Link></li></>}
      <li><button className="dropdown-item" onClick={() => { toggle(); go(); }}><I n="circle-half" className="me-2" />Toggle theme</button></li>
      <li><hr className="dropdown-divider" /></li>
      <li><button className="dropdown-item text-danger" onClick={logout}><I n="box-arrow-right" className="me-2" />Log out</button></li>
    </ul>}
  </div>;
}

function GlobalSearch({ user }) {
  const [q, setQ] = useState('');
  const dd = useDropdown();
  const m = (...f) => U.match(q, ...f);
  let groups = [];
  if (q.trim().length >= 2) {
    if (user.role === 'student') groups = [
      ['Courses', 'book', Store.where('courses', c => m(c.title, c.code, c.subject)).slice(0, 4).map(c => [c.code + ' · ' + c.title, '/student/learning/courses/' + c.id])],
      ['Notes', 'journal-text', Domain.visibleNotes(user).filter(n => m(n.title, n.subject, (n.tags || []).join(' '))).slice(0, 4).map(n => [n.title, '/student/learning/notes/' + n.id])],
      ['Discussions', 'people', Store.where('communityPosts', p => p.status !== 'removed' && m(p.title, p.body)).slice(0, 3).map(p => [p.title, '/student/community/' + p.id])],
      ['Marketplace', 'shop', Store.where('marketplaceItems', i => i.status !== 'Removed' && m(i.title, i.category)).slice(0, 3).map(i => [i.title, '/student/exchange/' + i.id])],
      ['Opportunities', 'briefcase', Store.where('opportunities', o => m(o.title, o.organization)).slice(0, 3).map(o => [o.title + ' — ' + o.organization, '/student/opportunities?q=' + encodeURIComponent(o.title)])]];
    else if (user.role === 'faculty') groups = [
      ['My courses', 'journal-bookmark', Domain.facultyCourses(user.id).filter(c => m(c.title, c.code)).map(c => [c.code + ' · ' + c.title, '/faculty/courses?c=' + c.id])],
      ['Students', 'people', Store.where('users', s => s.role === 'student' && m(s.name, s.studentId, s.email)).slice(0, 5).map(s => [s.name + ' · ' + s.studentId, '/faculty/students?q=' + encodeURIComponent(s.name)])],
      ['Materials', 'folder2-open', Store.where('studyMaterials', x => x.uploadedBy === user.id && m(x.title)).slice(0, 4).map(x => [x.title, '/faculty/materials?q=' + encodeURIComponent(x.title)])]];
    else groups = [
      ['Users', 'people', Store.where('users', s => m(s.name, s.email, s.studentId)).slice(0, 5).map(s => [s.name + ' · ' + s.role, '/admin/users?q=' + encodeURIComponent(s.name)])],
      ['Courses', 'journal-bookmark', Store.where('courses', c => m(c.title, c.code)).slice(0, 4).map(c => [c.code + ' · ' + c.title, '/admin/courses?q=' + encodeURIComponent(c.code)])],
      ['Notes', 'journal-text', Store.where('notes', n => m(n.title)).slice(0, 3).map(n => [n.title, '/admin/materials?q=' + encodeURIComponent(n.title)])]];
  }
  const hits = groups.filter(g => g[2].length);
  return <div className="global-search position-relative flex-grow-1" style={{ maxWidth: 440 }} ref={dd.ref}>
    <I n="search" className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
    <input type="search" className="form-control ps-5 bg-body-tertiary border-0" value={q} onChange={e => { setQ(e.target.value); dd.setOpen(true); }} onFocus={() => dd.setOpen(true)}
      placeholder={user.role === 'student' ? 'Search courses, notes, posts, items…' : 'Search users, courses…'} aria-label="Search" />
    {dd.open && q.trim().length >= 2 && <div className="search-results card shadow">
      {hits.length ? hits.map(([label, icon, items]) => <div key={label}><div className="px-3 pt-2 pb-1 xsmall text-uppercase text-muted fw-semibold">{label}</div>
        {items.map(([t, href]) => <Link key={href + t} className="dropdown-item small py-2" href={href} onClick={() => { setQ(''); dd.setOpen(false); }}><I n={icon} className="me-2 text-primary" />{t}</Link>)}</div>)
        : <div className="p-3 small text-muted">No results for “{q}”.</div>}
    </div>}
  </div>;
}

const LABELS = { student: 'Student', faculty: 'Faculty', admin: 'Admin', learning: 'Learning Hub', notes: 'Notes Library', upload: 'Upload', courses: 'Courses', achievements: 'Achievements', badges: 'Badges & Rewards', leaderboard: 'Leaderboard', exchange: 'Exchange Corner', create: 'Create listing', 'my-activity': 'My activity', community: 'Community', questions: 'Questions', groups: 'Study Groups', projects: 'Projects', opportunities: 'Opportunities', events: 'Events', 'ai-assistant': 'AI Assistant', planner: 'Study Planner', quizzes: 'Quizzes', results: 'Results', 'lost-found': 'Lost & Found', feedback: 'Feedback', messages: 'Messages', notifications: 'Notifications', profile: 'Profile', settings: 'Settings', materials: 'Materials', students: 'Students', announcements: 'Announcements', users: 'Users', marketplace: 'Marketplace', analytics: 'Analytics' };
function crumbLabel(seg, prev) {
  if (LABELS[seg] && !(prev === 'courses' || prev === 'notes' || prev === 'exchange' || prev === 'community' || prev === 'quizzes')) return LABELS[seg];
  const lookups = { courses: () => U.course(seg)?.code, notes: () => Store.find('notes', seg)?.title, exchange: () => Store.find('marketplaceItems', seg)?.title, community: () => Store.find('communityPosts', seg)?.title, quizzes: () => Store.find('quizzes', seg)?.title };
  return U.truncate((lookups[prev] && lookups[prev]()) || LABELS[seg] || seg, 40);
}
function Breadcrumbs({ path, role }) {
  const segs = path.split('/').filter(Boolean);
  if (segs.length < 2 || segs[1] === 'dashboard') return null;
  const items = []; let href = '';
  segs.forEach((s, i) => { href += '/' + s; if (s === 'learning' && segs[2] === 'courses' && i === 1) { items.push([LABELS[s], href]); return; } if (s === 'courses' && segs[1] === 'learning') return; items.push([crumbLabel(s, segs[i - 1]), i === 0 ? `/${role}/dashboard` : href]); });
  return <nav aria-label="breadcrumb" className="mb-2"><ol className="breadcrumb small mb-0">{items.map((c, i) => i === items.length - 1
    ? <li key={i} className="breadcrumb-item active" aria-current="page">{c[0]}</li>
    : <li key={i} className="breadcrumb-item"><Link href={c[1]}>{c[0]}</Link></li>)}</ol></nav>;
}

export default function AppShell({ role, children }) {
  const { ready } = useAuth();
  const user = useMe();
  const router = useRouter();
  const path = usePathname();
  const { toast, openModal } = useUI();
  const { resolved, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { setCollapsed(localStorage.getItem('ush_sidebar') === '1'); }, []);
  useEffect(() => { document.body.classList.toggle('sidebar-open', open); document.body.classList.toggle('sidebar-collapsed', collapsed); }, [open, collapsed]);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [path]);
  useEffect(() => {
    if (!ready) return;
    if (!user) { toast('Please log in to continue.', 'info'); router.replace('/login?next=' + encodeURIComponent(path)); }
    else if (user.role !== role) { toast('Access denied — that page belongs to another portal.', 'warning'); router.replace(Auth.home(user.role)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user && user.id, role]);

  if (!ready || !user || user.role !== role) return <div style={{ minHeight: '100vh' }} className="d-flex align-items-center justify-content-center"><Loading /></div>;
  const c = counters(user);
  const cache = Store.cacheInfo();
  const showCache = () => openModal({ title: <><I n="hdd-stack" className="me-2 text-primary" />Browser cache (demo database)</>, size: 'xl', body: <CacheInspector /> });

  return <div id="appShell">
    <Sidebar user={user} path={path} onClose={() => setOpen(false)} />
    <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
    <div className="app-main">
      <header className="topbar"><div className="d-flex align-items-center gap-2 h-100 px-3 px-lg-4">
        <button className="btn btn-icon d-lg-none" onClick={() => setOpen(true)} aria-label="Open menu"><I n="list" className="fs-5" /></button>
        <button className="btn btn-icon d-none d-lg-inline-flex" onClick={() => { const v = !collapsed; setCollapsed(v); localStorage.setItem('ush_sidebar', v ? '1' : '0'); }} aria-label="Collapse sidebar"><I n="layout-sidebar" /></button>
        <GlobalSearch user={user} />
        <div className="ms-auto d-flex align-items-center gap-1">
          <button className="btn btn-sm cache-chip d-none d-xl-inline-flex" onClick={showCache} title="Data saved in this browser"><I n="hdd-stack" className="me-1" />Cache · {cache.collections.length} tables · {U.fmtSize(cache.total || 0)}</button>
          <button className="btn btn-icon" onClick={toggle} title="Toggle theme" aria-label="Toggle theme"><I n={resolved === 'dark' ? 'sun' : 'moon-stars'} /></button>
          {role === 'student' && <Link href="/student/messages" className="btn btn-icon position-relative" title="Messages" aria-label="Messages"><I n="chat-dots" />{c.messages > 0 && <span className="dot-badge">{c.messages}</span>}</Link>}
          <NotificationsMenu user={user} />
          <ProfileMenu user={user} />
        </div></div></header>
      <main className="container-fluid px-3 px-lg-4 py-4"><Breadcrumbs path={path} role={role} />{children}</main>
      <footer className="px-4 py-3 small text-muted border-top d-flex flex-wrap justify-content-between gap-2">
        <span>© {new Date().getFullYear()} {Store.obj('university').name} · University Student Hub</span>
        <button className="btn btn-link btn-sm p-0 text-muted" onClick={showCache}><I n="hdd-stack" className="me-1" />Demo build — data saved in your browser cache</button></footer>
    </div>
  </div>;
}
