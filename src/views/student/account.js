'use client';
/* STUDENT — Messages, Notifications, Profile, Settings */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Store, { uid } from '@/lib/storage';
import U from '@/lib/utils';
import { Domain, Scoring } from '@/lib/services';
import { useAuth, useMe } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import CacheInspector from '@/components/CacheInspector';
import { Avatar, Card, ChartBox, Empty, I, PageHeader, SearchInput, Stars, Stat, StatusBadge, Tabs } from '@/components/ui';
import { notifIcon } from '@/components/layout/AppShell';
import { catIcon, semOptions, useEvidence } from '../shared';

/* ---------------- MESSAGES ---------------- */
const REPLIES = ['Sounds good! 👍', 'Thanks for letting me know.', 'Sure, let’s meet at the library.', 'Got it — I’ll get back to you soon.', 'Perfect, see you then!', 'Haha yes 😄'];
export function Messages() {
  const me = useMe(); const sp = useSearchParams(); const { formModal, confirm, toast } = useUI();
  const [active, setActive] = useState(sp.get('c') || null);
  const [q, setQ] = useState(''); const [text, setText] = useState(''); const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null); const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const convs = Store.where('conversations', c => c.participants.includes(me.id)).sort((a, b) => { const la = a.messages[a.messages.length - 1], lb = b.messages[b.messages.length - 1]; return new Date(lb ? lb.date : 0) - new Date(la ? la.date : 0); });
  const other = c => U.user(c.participants.find(p => p !== me.id)) || { name: 'Unknown user' };
  const c = active && Store.find('conversations', active);
  useEffect(() => {
    if (c && c.messages.some(m => m.senderId !== me.id && !m.read)) { c.messages.forEach(m => { if (m.senderId !== me.id) m.read = true; }); Store.save('conversations', 'messages read'); }
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  });
  const send = e => {
    e.preventDefault(); const t = text.trim(); if (!t || !c) return;
    const cid = c.id; const o = other(c);
    Store.update('conversations', cid, x => { x.messages.push({ id: uid('mg'), senderId: me.id, text: t, date: new Date().toISOString(), read: false }); });
    Store.notify(o.id, 'New message', `${me.name}: ${U.truncate(t, 60)}`, 'Community', o.role === 'student' ? '/student/messages?c=' + cid : '');
    setText('');
    timers.current.push(setTimeout(() => setTyping(true), 700));
    timers.current.push(setTimeout(() => { setTyping(false); Store.update('conversations', cid, x => { x.messages.forEach(m => { if (m.senderId === me.id) m.read = true; }); x.messages.push({ id: uid('mg'), senderId: o.id, text: REPLIES[Math.floor(Math.random() * REPLIES.length)] + ' (auto-reply · demo)', date: new Date().toISOString(), read: false }); }); }, 2200));
  };
  const newChat = () => formModal({ title: <><I n="pencil-square" className="me-2" />New message</>, submitText: 'Start conversation',
    fields: [{ name: 'to', label: 'To', type: 'select', required: true, options: Store.where('users', u => u.id !== me.id && u.status === 'active' && u.role !== 'admin').map(u => ({ value: u.id, label: `${u.name} · ${u.role === 'student' ? U.deptCode(u.department) + ' student' : u.designation}` })) }, { name: 'text', label: 'Message', type: 'textarea', rows: 3, required: true }],
    onSubmit: v => { const cv = Domain.conversationWith(me.id, v.to); Store.update('conversations', cv.id, x => { x.messages.push({ id: uid('mg'), senderId: me.id, text: v.text, date: new Date().toISOString(), read: false }); }); setActive(cv.id); } });
  const del = id => confirm('Delete this conversation? This cannot be undone in the demo.', () => { Store.remove('conversations', id); setActive(null); toast('Conversation deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  const list = convs.filter(x => U.match(q, other(x).name, x.messages.map(m => m.text).join(' ')));
  let lastDay = '';
  return <>
    <PageHeader title="Messages" subtitle="Chat with classmates about notes, groups and exchanges."><button className="btn btn-primary" onClick={newChat}><I n="pencil-square" className="me-1" />New message</button></PageHeader>
    <div className="card overflow-hidden"><div className={`row g-0 chat-wrap ${c ? 'show-chat' : ''}`}>
      <div className="col-md-4 border-end d-flex flex-column chat-side h-100"><div className="p-2 border-bottom"><SearchInput value={q} onChange={setQ} placeholder="Search conversations…" /></div>
        <div className="chat-list flex-grow-1">{list.length ? list.map(x => { const o = other(x); const last = x.messages[x.messages.length - 1]; const unread = x.messages.filter(m => m.senderId !== me.id && !m.read).length;
          return <button key={x.id} className={`chat-item ${x.id === active ? 'active' : ''}`} onClick={() => setActive(x.id)}><Avatar user={o} size={42} /><div className="min-w-0 flex-grow-1"><div className="d-flex justify-content-between gap-2"><span className={`small ${unread ? 'fw-bold' : 'fw-semibold'} text-truncate`}>{o.name}</span><span className="xsmall text-muted text-nowrap">{last ? U.ago(last.date) : ''}</span></div>
            <div className="d-flex justify-content-between gap-2"><span className={`xsmall text-truncate ${unread ? 'fw-semibold' : 'text-muted'}`}>{last ? (last.senderId === me.id ? 'You: ' : '') + last.text : 'No messages yet'}</span>{unread > 0 && <span className="badge rounded-pill bg-primary">{unread}</span>}</div></div></button>; })
          : <div className="p-4 text-center small text-muted">{q ? 'No conversations match your search.' : 'No conversations yet.'}</div>}</div></div>
      <div className="col-md-8 d-flex flex-column chat-main h-100">{c ? <>
        <div className="card-header d-flex align-items-center gap-2"><button className="btn btn-icon d-md-none" onClick={() => setActive(null)} aria-label="Back"><I n="arrow-left" /></button><Avatar user={other(c)} size={38} /><div className="min-w-0"><div className="fw-semibold small">{other(c).name}</div><div className="xsmall text-muted">{other(c).role === 'student' ? U.dept(other(c).department) + ' · Semester ' + other(c).semester : other(c).designation}</div></div>
          <button className="btn btn-icon ms-auto" onClick={() => del(c.id)} title="Delete conversation" aria-label="Delete conversation"><I n="trash" /></button></div>
        <div className="chat-body flex-grow-1 p-3" ref={bodyRef}>{c.messages.length ? c.messages.map(m => { const d = U.date(m.date); const sep = d !== lastDay; lastDay = d;
          return <div key={m.id}>{sep && <div className="text-center xsmall text-muted my-2">{d === U.date(new Date().toISOString()) ? 'Today' : d}</div>}<div className={`bubble ${m.senderId === me.id ? 'me' : 'them'}`}>{m.text}<div className="meta text-end">{U.time(m.date)}{m.senderId === me.id && <> <I n={`check2${m.read ? '-all' : ''}`} /></>}</div></div></div>; }) : <div className="text-center small text-muted mt-5">Say hello 👋</div>}
          {typing && <div className="bubble them"><span className="typing"><span /><span /><span /></span></div>}</div>
        <form className="card-footer bg-transparent d-flex gap-2" onSubmit={send}><input className="form-control" placeholder="Type a message…" value={text} onChange={e => setText(e.target.value)} autoComplete="off" maxLength={1000} aria-label="Message" /><button className="btn btn-primary" type="submit" aria-label="Send"><I n="send" /></button></form></>
        : <div className="h-100 d-flex align-items-center justify-content-center"><Empty icon="chat-dots" title="Select a conversation" text="Choose a chat on the left or start a new one."><button className="btn btn-primary btn-sm" onClick={newChat}>New message</button></Empty></div>}</div>
    </div></div>
  </>;
}

/* ---------------- NOTIFICATIONS ---------------- */
export function Notifications() {
  const me = useMe(); const router = useRouter(); const { confirm, toast } = useUI();
  const [tab, setTab] = useState('all'); const [cat, setCat] = useState('');
  const all = Store.where('notifications', n => n.recipientId === me.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = all.filter(n => (tab === 'all' || !n.read) && (!cat || n.category === cat));
  const readAll = () => { Store.all('notifications').forEach(n => { if (n.recipientId === me.id) n.read = true; }); Store.save('notifications', 'mark all read'); toast('All notifications marked as read.'); };
  const clearRead = () => confirm('Delete all read notifications?', () => { Store.removeWhere('notifications', n => n.recipientId === me.id && n.read); toast('Read notifications cleared.', 'info'); }, { danger: true, okText: 'Delete' });
  return <>
    <PageHeader title="Notifications" subtitle={`${all.filter(n => !n.read).length} unread`}><button className="btn btn-light" onClick={readAll}><I n="check2-all" className="me-1" />Mark all as read</button><button className="btn btn-light text-danger" onClick={clearRead}><I n="trash" className="me-1" />Clear read</button></PageHeader>
    <div className="d-flex flex-wrap justify-content-between gap-2"><Tabs active={tab} onChange={setTab} items={[{ key: 'all', label: 'All', count: all.length }, { key: 'unread', label: 'Unread', count: all.filter(n => !n.read).length }]} />
      <div className="d-flex flex-wrap gap-2 mb-3"><button className={`chip chip-btn ${!cat ? 'active' : ''}`} onClick={() => setCat('')}>All categories</button>{Object.keys(notifIcon).map(c => <button key={c} className={`chip chip-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}><I n={notifIcon[c]} />{c}</button>)}</div></div>
    <div className="card"><div className="card-body p-0">{list.length ? list.map(n => <div key={n.id} className="d-flex gap-3 p-3 border-bottom" style={n.read ? undefined : { background: 'var(--hub-primary-50)' }}>
      <span className={`notif-icon soft-${n.read ? 'secondary' : 'primary'}`}><I n={notifIcon[n.category] || 'bell'} /></span>
      <div className="min-w-0 flex-grow-1"><div className="d-flex flex-wrap gap-2 align-items-center"><span className={`small ${n.read ? 'fw-semibold' : 'fw-bold'}`}>{n.title}</span><span className="badge badge-soft-secondary">{n.category}</span>{!n.read && <span className="badge bg-primary">New</span>}</div><div className="small text-body-secondary">{n.message}</div><div className="xsmall text-muted">{U.dateTime(n.date)}</div></div>
      <div className="d-flex gap-1 align-items-start">{n.link && <button className="btn btn-sm btn-light" onClick={() => { Store.update('notifications', n.id, { read: true }); router.push(n.link); }}>Open</button>}
        <button className="btn btn-sm btn-light" onClick={() => Store.update('notifications', n.id, { read: !n.read })} title={`Mark as ${n.read ? 'unread' : 'read'}`} aria-label={`Mark as ${n.read ? 'unread' : 'read'}`}><I n={`envelope${n.read ? '' : '-open'}`} /></button>
        <button className="btn btn-sm btn-light text-danger" onClick={() => { Store.remove('notifications', n.id); toast('Notification deleted.', 'info'); }} title="Delete" aria-label="Delete notification"><I n="trash" /></button></div></div>)
      : <Empty icon="bell-slash" title={tab === 'unread' ? 'No unread notifications' : 'No notifications'} text="You are all caught up!" />}</div></div>
  </>;
}

/* ---------------- PROFILE ---------------- */
export function Profile() {
  const me = useMe(); const { formModal, toast } = useUI(); const evidence = useEvidence();
  const [tab, setTab] = useState('overview');
  const b = Scoring.breakdown(me.id);
  const achs = Store.where('achievements', a => a.studentId === me.id && a.status === 'approved');
  const certs = achs.filter(a => a.category === 'Certificate'); const projAch = achs.filter(a => a.category === 'Project');
  const projs = Store.where('projects', p => p.members.includes(me.id) || p.creatorId === me.id);
  const notes = Store.where('notes', n => n.uploaderId === me.id);
  const badges = Scoring.badges(me.id).filter(x => x.earned);
  const edit = () => formModal({ title: <><I n="person-gear" className="me-2" />Edit profile</>, size: 'lg', submitText: 'Save profile',
    fields: [{ name: 'name', label: 'Full name', required: true, minlength: 3, value: me.name, col: 'col-md-6' }, { name: 'phone', label: 'Phone', type: 'tel', value: me.phone, col: 'col-md-6' }, { name: 'semester', label: 'Semester', type: 'select', required: true, value: String(me.semester), col: 'col-md-6', options: semOptions() }, { name: 'avatarColor', label: 'Avatar colour', type: 'color', value: me.avatarColor, col: 'col-md-6' }, { name: 'bio', label: 'Bio', type: 'textarea', rows: 3, value: me.bio, maxlength: 300 }, { name: 'skills', label: 'Skills', value: (me.skills || []).join(', '), help: 'Comma separated' }, { name: 'avatar', label: 'Profile picture', type: 'file', accept: 'image/png,image/jpeg,image/webp', exts: ['png', 'jpg', 'jpeg', 'webp'], maxSize: 700 * 1024, help: 'Optional · max 700 KB' }, { name: 'removeAvatar', label: 'Remove current photo and use initials', type: 'switch' }],
    onSubmit: async v => { const ch = { name: v.name, phone: v.phone, semester: +v.semester, avatarColor: v.avatarColor, bio: v.bio, skills: v.skills.split(',').map(s => s.trim()).filter(Boolean) }; if (v.avatar) ch.avatar = await U.readFile(v.avatar); if (v.removeAvatar) ch.avatar = null; Store.update('users', me.id, ch); toast('Profile updated and saved.'); } });
  let body;
  if (tab === 'overview') body = <div className="row g-4"><div className="col-md-6"><h3 className="h6 fw-semibold">Verified achievements</h3>{achs.length ? achs.map(a => <div className="list-row" key={a.id}><span className="stat-icon soft-success" style={{ width: 38, height: 38, fontSize: '1rem' }}><I n={catIcon(a.category)} /></span><div className="min-w-0"><div className="small fw-semibold">{a.title}</div><div className="xsmall text-muted">{a.category} · {U.date(a.date)}</div></div><span className="ms-auto small fw-bold text-success">+{a.points}</span></div>) : <p className="small text-muted">No verified achievements yet.</p>}</div>
    <div className="col-md-6"><h3 className="h6 fw-semibold">Contribution breakdown</h3><ChartBox type="doughnut" labels={['Academic', 'Achievements', 'Community', 'Exchange']} datasets={[{ data: [b.academic, b.achievements, b.community, b.exchange] }]} height={220} /></div></div>;
  else if (tab === 'projects') body = (projs.length || projAch.length) ? <div className="row g-3">{projs.map(p => <div className="col-md-6" key={p.id}><div className="p-3 border rounded-3 h-100"><div className="d-flex justify-content-between"><strong className="small">{p.title}</strong><StatusBadge status={p.status} /></div><p className="small text-muted my-2">{U.truncate(p.description, 120)}</p><div className="d-flex flex-wrap gap-1">{p.skills.map(s => <span className="chip" key={s}>{s}</span>)}</div><div className="xsmall text-muted mt-2">{p.creatorId === me.id ? 'Project lead' : 'Team member'} · {p.members.length} members</div></div></div>)}
    {projAch.map(a => <div className="col-md-6" key={a.id}><div className="p-3 border rounded-3 h-100"><div className="d-flex justify-content-between"><strong className="small">{a.title}</strong><span className="badge badge-soft-success">Verified</span></div><p className="small text-muted my-2">{a.description}</p><div className="xsmall text-muted">{a.details}</div></div></div>)}</div> : <Empty icon="kanban" title="No projects yet"><Link href="/student/community/projects" className="btn btn-sm btn-primary">Find a project</Link></Empty>;
  else if (tab === 'certificates') body = certs.length ? <div className="row g-3">{certs.map(a => <div className="col-md-6" key={a.id}><div className="p-3 border rounded-3 d-flex gap-3"><span className="stat-icon soft-primary"><I n="patch-check" /></span><div><div className="small fw-semibold">{a.title}</div><div className="xsmall text-muted">{a.details} · {U.date(a.date)}</div><button className="btn btn-link btn-sm px-0" onClick={() => evidence(a.id)}>View certificate</button></div></div></div>)}</div> : <Empty icon="patch-check" title="No certificates yet"><Link href="/student/achievements/upload" className="btn btn-sm btn-primary">Upload certificate</Link></Empty>;
  else body = notes.length ? notes.map(n => <Link key={n.id} href={`/student/learning/notes/${n.id}`} className="list-row text-reset"><div className="thumb-sm" style={{ width: 40, height: 40, fontSize: '1rem' }}><i className={U.fileIcon(n.fileType)} /></div><div className="min-w-0"><div className="small fw-semibold">{n.title}</div><div className="xsmall text-muted">{U.course(n.courseId)?.code} · {U.date(n.date)} · {n.downloads} downloads</div></div><span className="ms-auto"><Stars value={U.avgRating(n)} /></span></Link>) : <Empty icon="journal" title="No notes uploaded"><Link href="/student/learning/upload" className="btn btn-sm btn-primary">Upload notes</Link></Empty>;
  return <>
    <div className="card mb-4 overflow-hidden"><div style={{ height: 110, background: 'linear-gradient(120deg,#312e81,#4338ca 60%,#7c3aed)' }} /><div className="card-body pt-0 px-4">
      <div className="d-flex flex-wrap align-items-end gap-3" style={{ marginTop: -48 }}><Avatar user={me} size={104} className="avatar-ring" />
        <div className="flex-grow-1 pb-2"><h1 className="h3 fw-bold mb-0">{me.name}</h1><div className="text-muted small">{me.studentId} · {U.dept(me.department)} · Semester {me.semester}</div></div>
        <div className="pb-2 d-flex gap-2"><Link href="/student/settings" className="btn btn-light" aria-label="Settings"><I n="gear" /></Link><button className="btn btn-primary" onClick={edit}><I n="pencil" className="me-1" />Edit profile</button></div></div>
      <p className="mt-3 mb-3">{me.bio || 'No bio yet.'}</p>
      <div className="d-flex flex-wrap gap-2 mb-3">{(me.skills || []).length ? me.skills.map(s => <span className="chip" key={s}><I n="lightning-charge" />{s}</span>) : <span className="small text-muted">Add skills to your profile.</span>}</div>
      <div className="d-flex flex-wrap gap-4 small text-muted"><span><I n="envelope" className="me-1" />{me.email}</span>{me.phone && <span><I n="telephone" className="me-1" />{me.phone}</span>}<span><I n="calendar3" className="me-1" />Joined {U.date(me.joined)}</span><span><I n="eye" className="me-1" />Profile {me.privacy?.profile || 'public'}</span>{me.source === 'registration' && <span className="badge badge-soft-info"><I n="hdd-stack" className="me-1" />Account stored in browser cache</span>}</div>
    </div></div>
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3"><Stat icon="star" label="Contribution points" value={b.total.toLocaleString()} tone="warning" /></div>
      <div className="col-6 col-lg-3"><Stat icon="bar-chart-line" label="Ranking" value={'#' + Scoring.rankOf(me.id)} href="/student/leaderboard" /></div>
      <div className="col-6 col-lg-3"><Stat icon="trophy" label="Achievements" value={achs.length} tone="success" href="/student/achievements" /></div>
      <div className="col-6 col-lg-3"><Stat icon="award" label="Badges" value={badges.length} tone="purple" href="/student/achievements/badges" /></div></div>
    <Tabs active={tab} onChange={setTab} items={[{ key: 'overview', label: 'Achievements', icon: 'trophy' }, { key: 'projects', label: 'Projects', icon: 'kanban', count: projs.length + projAch.length }, { key: 'certificates', label: 'Certificates', icon: 'patch-check', count: certs.length }, { key: 'notes', label: 'Notes', icon: 'journal-text', count: notes.length }]} />
    <div className="card"><div className="card-body">{body}</div></div>
  </>;
}

/* ---------------- SETTINGS ---------------- */
export function Settings() {
  const me = useMe(); const { logout } = useAuth(); const { mode, setMode } = useTheme(); const { toast } = useUI();
  const pr = me.privacy || {}; const np = me.notificationPrefs || {};
  const pref = (g, k, v) => { Store.update('users', me.id, u => { u[g] = { ...(u[g] || {}), [k]: v }; }); toast('Preference saved.'); };
  const Sw = ({ g, k, label, desc, val }) => <div className="d-flex justify-content-between align-items-center py-3 border-bottom gap-3"><div><div className="small fw-semibold">{label}</div><div className="xsmall text-muted">{desc}</div></div><div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" role="switch" checked={!!val} onChange={e => pref(g, k, e.target.checked)} aria-label={label} /></div></div>;
  return <>
    <PageHeader title="Settings" subtitle="Manage your account, privacy and preferences." />
    <div className="row g-4"><div className="col-lg-6 d-grid gap-4 align-content-start">
      <Card title={<><I n="person" className="me-2" />Personal information</>}><Form submitText="Save changes" footerClass="mt-3" fields={[{ name: 'name', label: 'Full name', required: true, minlength: 3, value: me.name, col: 'col-md-6' }, { name: 'email', label: 'University email', value: me.email, disabled: true, col: 'col-md-6', help: 'Contact the registrar to change your email.' }, { name: 'phone', label: 'Phone', type: 'tel', value: me.phone, col: 'col-md-6' }, { name: 'sid', label: 'Student ID', value: me.studentId, disabled: true, col: 'col-md-6' }, { name: 'bio', label: 'Bio', type: 'textarea', rows: 3, value: me.bio }]}
        onSubmit={v => { Store.update('users', me.id, { name: v.name, phone: v.phone, bio: v.bio }); toast('Personal information saved.'); }} /></Card>
      <Card title={<><I n="key" className="me-2" />Change password <span className="badge badge-soft-warning ms-1">Demo</span></>}><Form submitText="Update password" footerClass="mt-3" resetOnSubmit fields={[{ name: 'current', label: 'Current password', type: 'password', required: true, validate: v => v === me.password ? '' : 'Current password is incorrect.' }, { name: 'next', label: 'New password', type: 'password', required: true, minlength: 8, col: 'col-md-6', help: 'Min 8 characters incl. a number', validate: v => !/\d/.test(v) ? 'Include at least one number.' : v === me.password ? 'New password must be different.' : '' }, { name: 'confirm', label: 'Confirm new password', type: 'password', required: true, col: 'col-md-6', validate: (v, all) => v === all.next ? '' : 'Passwords do not match.' }]}
        onSubmit={v => { Store.update('users', me.id, { password: v.next }); toast('Password changed and saved in the browser cache. Use it next time you log in.'); }} /></Card>
      <Card title={<><I n="hdd-stack" className="me-2" />My data in the browser cache</>}><CacheInspector compact /></Card>
    </div><div className="col-lg-6 d-grid gap-4 align-content-start">
      <div className="card"><div className="card-header"><h2 className="h6 fw-semibold mb-0"><I n="shield-lock" className="me-2" />Profile privacy</h2></div><div className="card-body pt-0">
        <div className="d-flex justify-content-between align-items-center py-3 border-bottom gap-3"><div><div className="small fw-semibold">Profile visibility</div><div className="xsmall text-muted">Who can view your full profile</div></div><select className="form-select form-select-sm w-auto" value={pr.profile || 'public'} onChange={e => pref('privacy', 'profile', e.target.value)} aria-label="Profile visibility"><option value="public">Everyone</option><option value="university">University members</option><option value="private">Only me</option></select></div>
        <Sw g="privacy" k="showEmail" label="Show email on profile" desc="Let other students see your email address" val={pr.showEmail} />
        <Sw g="privacy" k="leaderboard" label="Show my name on leaderboard" desc="When off, you appear as “Anonymous student” to others" val={pr.leaderboard !== false} /></div></div>
      <div className="card"><div className="card-header"><h2 className="h6 fw-semibold mb-0"><I n="bell" className="me-2" />Notification preferences</h2></div><div className="card-body pt-0">
        <Sw g="notificationPrefs" k="email" label="Email digests" desc="Daily summary sent to your university email (simulated)" val={np.email} />
        <Sw g="notificationPrefs" k="academic" label="Academic updates" desc="New materials, assignments and exams" val={np.academic} />
        <Sw g="notificationPrefs" k="community" label="Community activity" desc="Comments, replies and likes" val={np.community} />
        <Sw g="notificationPrefs" k="exchange" label="Exchange requests" desc="Requests and replies for your listings" val={np.exchange} />
        <Sw g="notificationPrefs" k="events" label="Event reminders" desc="Reminders for registered events" val={np.events} /></div></div>
      <Card title={<><I n="palette" className="me-2" />Theme</>}><div className="row g-2">{[['light', 'sun', 'Light'], ['dark', 'moon-stars', 'Dark'], ['system', 'laptop', 'System']].map(([k, i, l]) => <div className="col-4" key={k}><button className={`btn w-100 py-3 ${mode === k ? 'btn-primary' : 'btn-light'}`} onClick={() => { setMode(k); toast(`Theme set to ${k}.`); }}><I n={i} className="d-block fs-4 mb-1" />{l}</button></div>)}</div></Card>
      <div className="card border-danger-subtle"><div className="card-body d-flex justify-content-between align-items-center gap-3"><div><div className="fw-semibold small">Log out</div><div className="xsmall text-muted">End your session on this device.</div></div><button className="btn btn-outline-danger" onClick={logout}><I n="box-arrow-right" className="me-1" />Log out</button></div></div>
    </div></div>
  </>;
}
