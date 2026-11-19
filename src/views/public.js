'use client';
/* ==========================================================================
   PUBLIC PAGES — Landing, Login, Register, Forgot password, 404
   ========================================================================== */
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Auth, Domain, Scoring } from '@/lib/services';
import { useAuth, useMe } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import { Avatar, I, Money, Progress } from '@/components/ui';
import CacheInspector from '@/components/CacheInspector';

const scrollTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

function PublicNav() {
  const user = useMe();
  const { toggle } = useTheme();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const link = (id, label) => path === '/' ? <li className="nav-item" key={id}><button className="nav-link btn btn-link" onClick={() => { scrollTo(id); setOpen(false); }}>{label}</button></li>
    : <li className="nav-item" key={id}><Link className="nav-link" href={`/?s=${id}`}>{label}</Link></li>;
  return <nav className="navbar navbar-expand-lg public-nav sticky-top py-2" aria-label="Site navigation"><div className="container">
    <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/"><span className="brand-mark"><I n="mortarboard-fill" /></span>University Student Hub</Link>
    <button className="navbar-toggler border-0" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><I n="list" className="fs-3" /></button>
    <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
      <ul className="navbar-nav mx-auto">{[['features', 'Features'], ['learning', 'Learning'], ['recognition', 'Recognition'], ['exchange', 'Exchange'], ['how', 'How it works']].map(([a, b]) => link(a, b))}</ul>
      <div className="d-flex gap-2 align-items-center">
        <button className="btn btn-icon" onClick={toggle} aria-label="Toggle theme"><I n="circle-half" /></button>
        {user ? <Link className="btn btn-primary" href={Auth.home(user.role)}><I n="grid-1x2" className="me-1" />Go to dashboard</Link>
          : <><Link className="btn btn-light" href="/login">Log in</Link><Link className="btn btn-primary" href="/register">Get started</Link></>}
      </div></div></div></nav>;
}

function Footer() {
  const uni = Store.obj('university');
  return <footer className="site-footer pt-5 pb-4 mt-auto"><div className="container"><div className="row g-4">
    <div className="col-lg-4"><div className="d-flex align-items-center gap-2 mb-3"><span className="brand-mark"><I n="mortarboard-fill" /></span><strong className="text-white">University Student Hub</strong></div>
      <p className="small mb-2">{uni.tagline}</p><p className="small mb-0">{uni.name} · {uni.address}<br />{uni.email} · {uni.phone}</p></div>
    <div className="col-6 col-lg-2"><h6 className="fw-semibold">Platform</h6><ul className="list-unstyled small d-grid gap-2"><li><Link href="/?s=features">Features</Link></li><li><Link href="/?s=learning">Learning Hub</Link></li><li><Link href="/?s=recognition">Leaderboard</Link></li><li><Link href="/?s=exchange">Exchange Corner</Link></li></ul></div>
    <div className="col-6 col-lg-2"><h6 className="fw-semibold">Account</h6><ul className="list-unstyled small d-grid gap-2"><li><Link href="/login">Log in</Link></li><li><Link href="/register">Create account</Link></li><li><Link href="/forgot-password">Reset password</Link></li></ul></div>
    <div className="col-6 col-lg-2"><h6 className="fw-semibold">Community</h6><ul className="list-unstyled small d-grid gap-2"><li><Link href="/?s=community">Discussions</Link></li><li><Link href="/?s=opportunities">Opportunities</Link></li><li><Link href="/?s=how">How it works</Link></li><li><Link href="/?s=benefits">Benefits</Link></li></ul></div>
    <div className="col-6 col-lg-2"><h6 className="fw-semibold">Demo</h6><p className="small">Frontend demonstration — data is stored in your browser cache.</p></div>
  </div><hr className="border-secondary" /><div className="small d-flex flex-wrap justify-content-between gap-2"><span>© {new Date().getFullYear()} {uni.name}. All rights reserved.</span><button className="link small" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top <I n="arrow-up" /></button></div></div></footer>;
}

/* ---------------- LANDING ---------------- */
export function Landing() {
  useMe();
  const sp = useSearchParams();
  useEffect(() => { const s = sp.get('s'); if (s) setTimeout(() => scrollTo(s), 80); }, [sp]);
  const uni = Store.obj('university');
  const star = U.user('s1');
  const courses = Store.all('courses').slice(1, 4);
  const top = Scoring.ranking('overall').slice(0, 5);
  const items = Store.where('marketplaceItems', i => i.status === 'Available').slice(0, 3);
  const posts = Store.where('communityPosts', x => x.status !== 'removed').sort((a, b) => b.likes.length - a.likes.length).slice(0, 2);
  const opps = Store.where('opportunities', o => U.daysLeft(o.deadline) >= 0).slice(0, 3);
  const resources = Store.where('notes', n => n.status === 'approved').length + Store.all('studyMaterials').length;
  const features = [
    ['book', 'primary', 'Academic Learning Hub', 'Course pages, lecture materials, peer notes and a built-in reader for every subject.'],
    ['trophy', 'warning', 'Achievements & Leaderboard', 'Upload certificates and awards, get them verified and climb the rankings.'],
    ['shop', 'success', 'Student Exchange Corner', 'Buy, sell, swap or give away textbooks, calculators and lab gear on campus.'],
    ['people', 'info', 'Community & Study Groups', 'Discussions, Q&A, study groups and project collaboration with classmates.'],
    ['briefcase', 'purple', 'Opportunities & Events', 'Internships, scholarships, competitions and campus events in one feed.'],
    ['robot', 'danger', 'Study Tools', 'AI-style study assistant, planner, practice quizzes and progress tracking.']];
  return <>
    <PublicNav />
    <header className="hero"><div className="container"><div className="row align-items-center g-5">
      <div className="col-lg-6">
        <span className="badge rounded-pill soft-primary px-3 py-2 mb-3"><I n="stars" className="me-1" />{uni.name} · {uni.currentTerm}</span>
        <h1 className="mb-3">Learn Together.<br />Share Together.<br /><span className="grad">Grow Together.</span></h1>
        <p className="lead text-muted mb-4">University Student Hub is one home for your courses, notes, achievements, campus marketplace, community and career opportunities — built for students, faculty and administrators.</p>
        <div className="d-flex flex-wrap gap-2 mb-4"><Link href="/register" className="btn btn-primary btn-lg px-4">Get started — it’s free</Link><Link href="/login" className="btn btn-light btn-lg px-4"><I n="box-arrow-in-right" className="me-1" />Log in</Link></div>
        <div className="d-flex flex-wrap gap-4 small text-muted">
          <span><strong className="text-body fs-5 d-block">{(Store.where('users', u => u.role === 'student').length * 255).toLocaleString()}+</strong>active students</span>
          <span><strong className="text-body fs-5 d-block">{resources}+</strong>shared resources</span>
          <span><strong className="text-body fs-5 d-block">{Store.all('courses').length}</strong>courses online</span></div>
      </div>
      <div className="col-lg-6"><div className="card hero-preview"><div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 mb-3"><Avatar user={star} size={44} /><div><div className="fw-semibold">Welcome back, {star.name.split(' ')[0]} 👋</div><small className="text-muted">Semester {star.semester} · {U.dept(star.department)}</small></div><span className="badge soft-warning ms-auto"><I n="trophy" className="me-1" />Rank #{Scoring.rankOf('s1')}</span></div>
        <div className="row g-2 mb-3">{[['journal-text', 'Notes', Store.where('notes', n => n.uploaderId === 's1').length, 'primary'], ['star', 'Points', Scoring.breakdown('s1').total, 'warning'], ['calendar-check', 'Due soon', Store.where('assignments', a => U.daysLeft(a.dueDate) >= 0 && U.daysLeft(a.dueDate) <= 7).length, 'danger']].map(([i, l, v, t]) =>
          <div className="col-4" key={l}><div className={`p-3 rounded-3 soft-${t}`}><I n={i} /><div className="fw-bold fs-5">{v}</div><div className="xsmall">{l}</div></div></div>)}</div>
        <div className="small fw-semibold mb-2">Study progress</div>
        {['c2', 'c3', 'c4'].map(c => { const pc = Domain.courseProgress('s1', c); return <div className="mb-2" key={c}><div className="d-flex justify-content-between xsmall mb-1"><span>{U.course(c).title}</span><span>{pc}%</span></div><Progress value={pc} h={6} /></div>; })}
        <div className="d-flex gap-2 mt-3"><span className="chip"><I n="robot" />AI assistant</span><span className="chip"><I n="patch-question" />Quizzes</span><span className="chip"><I n="shop" />Exchange</span></div>
      </div></div></div></div></div></header>

    <section className="section" id="features"><div className="container"><div className="text-center mb-5"><div className="eyebrow mb-2">Everything in one place</div><h2 className="fw-bold">A complete digital campus for students</h2><p className="text-muted mx-auto" style={{ maxWidth: 620 }}>Stop juggling group chats, shared drives and notice boards. Student Hub brings academic resources, recognition and community together.</p></div>
      <div className="row g-4">{features.map(([i, t, title, d]) => <div className="col-md-6 col-lg-4" key={title}><div className="card h-100 hover-lift"><div className="card-body p-4"><div className={`feature-icon soft-${t} mb-3`}><I n={i} /></div><h3 className="h5 fw-semibold">{title}</h3><p className="text-muted mb-0">{d}</p></div></div></div>)}</div></div></section>

    <section className="section section-alt" id="learning"><div className="container"><div className="row g-5 align-items-center">
      <div className="col-lg-5"><div className="eyebrow mb-2">Academic Learning Hub</div><h2 className="fw-bold mb-3">Every course, every note, one search away</h2><p className="text-muted">Filter by department, semester and subject. Read notes online, bookmark the best ones, rate them and download for offline study. Faculty publish lecture slides, assignments and references by module.</p>
        <ul className="list-unstyled d-grid gap-2 mb-4"><li><I n="check-circle-fill" className="text-success me-2" />Built-in document reader</li><li><I n="check-circle-fill" className="text-success me-2" />Peer ratings and reviews</li><li><I n="check-circle-fill" className="text-success me-2" />Module-by-module progress tracking</li></ul>
        <Link href="/login" className="btn btn-primary">Explore the Learning Hub</Link></div>
      <div className="col-lg-7"><div className="row g-3">{courses.map(c => <div className="col-md-4" key={c.id}><div className="card h-100 course-card"><div className="course-top" style={{ background: U.deptColor(c.department) }} /><div className="card-body"><div className="code">{c.code}</div><h3 className="h6 fw-semibold mt-1">{c.title}</h3><p className="small text-muted">{U.truncate(c.description, 80)}</p><div className="small"><I n="journal-text" className="me-1 text-primary" />{Store.where('notes', n => n.courseId === c.id).length + Store.where('studyMaterials', m => m.courseId === c.id).length} resources</div></div></div></div>)}</div></div>
    </div></div></section>

    <section className="section" id="recognition"><div className="container"><div className="row g-5 align-items-center">
      <div className="col-lg-6 order-lg-2"><div className="eyebrow mb-2">Achievements & Leaderboard</div><h2 className="fw-bold mb-3">Recognition for every contribution</h2><p className="text-muted">Upload certificates, projects and competition results. Once faculty verify them, you earn points. Sharing notes, answering questions and helping classmates also counts — the best contributors win annual awards like <strong>Student of the Year</strong>.</p><Link href="/register" className="btn btn-outline-primary">Start earning points</Link></div>
      <div className="col-lg-6"><div className="card"><div className="card-header"><h3 className="h6 fw-semibold mb-0"><I n="bar-chart-line" className="me-2 text-primary" />Top contributors</h3></div><div className="card-body py-2">{top.map(r => <div className="list-row" key={r.user.id}><span className={`rank-pill ${r.rank <= 3 ? 'soft-warning' : ''}`}>{r.rank}</span><Avatar user={r.user} size={36} /><div className="min-w-0"><div className="fw-semibold small">{r.user.name}</div><div className="xsmall text-muted">{U.dept(r.user.department)}</div></div><span className="ms-auto fw-bold text-primary">{r.total.toLocaleString()} pts</span></div>)}</div></div></div>
    </div></div></section>

    <section className="section section-alt" id="exchange"><div className="container"><div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><div className="eyebrow mb-2">Student Exchange Corner</div><h2 className="fw-bold mb-0">Pass it on, save money, reduce waste</h2></div><Link href="/login" className="btn btn-light">Browse marketplace <I n="arrow-right" /></Link></div>
      <div className="row g-4">{items.map(i => <div className="col-md-4" key={i.id}><div className="card h-100"><div className="thumb"><I n={i.icon} /><span className="badge bg-white text-dark">{i.category}</span></div><div className="card-body"><h3 className="h6 fw-semibold">{i.title}</h3><div className="d-flex justify-content-between align-items-center"><span className="fw-bold"><Money price={i.price} isFree={i.isFree} /></span><span className="badge badge-soft-secondary">{i.condition}</span></div></div></div></div>)}</div></div></section>

    <section className="section" id="community"><div className="container"><div className="row g-5">
      <div className="col-lg-6"><div className="eyebrow mb-2">Community</div><h2 className="fw-bold mb-4">Discussions that actually help</h2>{posts.map(x => <div className="card mb-3" key={x.id}><div className="card-body"><div className="d-flex gap-2 align-items-center mb-2"><Avatar user={U.user(x.authorId)} size={32} /><div className="small"><strong>{U.user(x.authorId)?.name}</strong><div className="text-muted xsmall">{x.category} · {U.ago(x.date)}</div></div></div><h3 className="h6 fw-semibold">{x.title}</h3><p className="small text-muted mb-2">{U.truncate(x.body, 140)}</p><span className="small text-muted"><I n="heart" className="me-1" />{x.likes.length} · <I n="chat" className="ms-1 me-1" />{Store.where('comments', c => c.postId === x.id).length}</span></div></div>)}</div>
      <div className="col-lg-6" id="opportunities"><div className="eyebrow mb-2">Opportunities</div><h2 className="fw-bold mb-4">Never miss a deadline</h2>{opps.map(o => <div className="card mb-3" key={o.id}><div className="card-body d-flex gap-3 align-items-center"><div className="feature-icon soft-primary"><I n="briefcase" /></div><div className="min-w-0"><span className="badge badge-soft-primary mb-1">{o.type}</span><h3 className="h6 fw-semibold mb-0">{o.title}</h3><small className="text-muted">{o.organization} · Deadline {U.date(o.deadline)}</small></div></div></div>)}</div>
    </div></div></section>

    <section className="section section-alt" id="how"><div className="container"><div className="text-center mb-5"><div className="eyebrow mb-2">How it works</div><h2 className="fw-bold">Up and running in four steps</h2></div>
      <div className="row g-4">{[['Create your account', 'Register with your university email and student ID.'], ['Join your courses', 'Your semester courses appear automatically in the Learning Hub.'], ['Share & collaborate', 'Upload notes, join study groups, ask questions and trade items.'], ['Earn recognition', 'Collect points and badges, and compete for annual awards.']].map((s, i) => <div className="col-md-6 col-lg-3" key={i}><div className="text-center px-2"><div className="step-num mx-auto mb-3">{i + 1}</div><h3 className="h6 fw-semibold">{s[0]}</h3><p className="small text-muted mb-0">{s[1]}</p></div></div>)}</div></div></section>

    <section className="section" id="benefits"><div className="container"><div className="row g-4 align-items-center">
      <div className="col-lg-5"><div className="eyebrow mb-2">Benefits for students</div><h2 className="fw-bold">Built around how students actually study</h2></div>
      <div className="col-lg-7"><div className="row g-3">{[['clock-history', 'Save hours each week', 'Find the right notes and materials instantly instead of digging through chats.'], ['graph-up', 'Track your progress', 'Planner, quizzes and module tracking show exactly where you stand.'], ['piggy-bank', 'Save money', 'Get textbooks and equipment from seniors for less — or free.'], ['award', 'Build your portfolio', 'Verified achievements and badges you can show to employers.']].map(([i, t, d]) => <div className="col-sm-6" key={t}><div className="d-flex gap-3"><div className="feature-icon soft-primary flex-shrink-0"><I n={i} /></div><div><h3 className="h6 fw-semibold mb-1">{t}</h3><p className="small text-muted mb-0">{d}</p></div></div></div>)}</div></div></div>
      <div className="cta-band p-4 p-md-5 mt-5 text-center"><h2 className="fw-bold mb-2">Ready to join your classmates?</h2><p className="mb-4 opacity-75">Use a demo account or create your own student profile in under a minute.</p><div className="d-flex justify-content-center flex-wrap gap-2"><Link href="/register" className="btn btn-light btn-lg">Create account</Link><Link href="/login" className="btn btn-outline-light btn-lg">Try a demo account</Link></div></div>
    </div></section>
    <Footer />
  </>;
}

/* ---------------- AUTH PAGES ---------------- */
function AuthSide({ title, text }) {
  return <div className="col-lg-5 d-none d-lg-flex auth-side p-5 flex-column">
    <Link href="/" className="d-flex align-items-center gap-2 text-white fw-bold mb-auto"><span className="brand-mark" style={{ background: 'rgba(255,255,255,.15)' }}><I n="mortarboard-fill" /></span>University Student Hub</Link>
    <div className="position-relative"><h1 className="display-6 fw-bold mb-3">{title}</h1><p className="opacity-75 mb-4">{text}</p>
      <div className="d-grid gap-3 small">{[['book', 'Notes, materials & quizzes for every course'], ['trophy', 'Verified achievements and leaderboards'], ['people', 'Study groups, Q&A and projects']].map(([i, t]) => <div className="d-flex align-items-center gap-2" key={t}><span className="stat-icon" style={{ width: 34, height: 34, fontSize: '1rem', background: 'rgba(255,255,255,.12)' }}><I n={i} /></span>{t}</div>)}</div></div>
    <div className="mt-auto pt-5 small opacity-75">“{Store.obj('university').tagline}”</div></div>;
}
const MobileBrand = () => <Link href="/" className="d-lg-none d-flex align-items-center gap-2 fw-bold mb-4"><span className="brand-mark"><I n="mortarboard-fill" /></span>Student Hub</Link>;

function useGuestOnly() {
  const user = useMe(); const router = useRouter();
  useEffect(() => { if (user) router.replace(Auth.home(user.role)); }, [user, router]);
  return user;
}

/** Every dummy account (seed + cached registrations) with its password */
export function CredentialsTable({ onPick }) {
  useMe();
  const users = Store.all('users');
  const cached = new Set(Store.cachedUsers().map(u => u.id));
  return <div className="table-responsive cred-table" style={{ maxHeight: 340 }}><table className="table table-sm align-middle small mb-0">
    <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Password</th><th /></tr></thead>
    <tbody>{users.map(u => <tr key={u.id}><td><span className="d-flex align-items-center gap-2"><Avatar user={u} size={22} />{u.name}{cached.has(u.id) && <span className="badge badge-soft-info">cache</span>}</span></td>
      <td className="text-capitalize">{u.role}{u.status !== 'active' && <span className="badge badge-soft-secondary ms-1">{u.status}</span>}</td><td><code>{u.email}</code></td><td><code>{u.password}</code></td>
      <td>{onPick && u.status === 'active' && <button type="button" className="btn btn-sm btn-light py-0" onClick={() => onPick(u.email, u.password)}>Use</button>}</td></tr>)}</tbody></table></div>;
}

export function Login() {
  useGuestOnly();
  const { login } = useAuth();
  const { toast, openModal, closeModal } = useUI();
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState(sp.get('email') || '');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [inv, setInv] = useState({});
  const [busy, setBusy] = useState(false);
  const fill = (e, p) => { setEmail(e); setPw(p); setErr(''); setInv({}); };
  const cached = Store.cachedUsers();
  const submit = e => {
    e.preventDefault();
    const bad = { email: !U.validEmail(email), pw: pw.length < 6 };
    setInv(bad); if (bad.email || bad.pw) return;
    setBusy(true);
    setTimeout(() => {
      const r = login(email, pw, remember);
      setBusy(false);
      if (!r.ok) { setErr(r.error); return; }
      toast(`Welcome back, ${r.user.name.split(' ')[0]}!`);
      const next = sp.get('next');
      router.replace(next && next.startsWith('/' + r.user.role + '/') ? next : Auth.home(r.user.role));
    }, 400);
  };
  const allAccounts = () => openModal({ title: <><I n="key" className="me-2 text-primary" />All dummy accounts</>, size: 'lg', body: <><p className="small text-muted">Seed accounts come from <code>src/data/data.js</code>. Accounts marked <span className="badge badge-soft-info">cache</span> were registered in this browser.</p><CredentialsTable onPick={(e, p) => { fill(e, p); closeModal(); }} /></> });
  return <div className="container-fluid"><div className="row auth-wrap"><AuthSide title="Welcome back." text="Log in to continue learning, sharing and growing with your university community." />
    <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5"><div className="w-100" style={{ maxWidth: 460 }}>
      <MobileBrand />
      <h2 className="fw-bold mb-1">Log in to your account</h2><p className="text-muted mb-4">Students, faculty and administrators use the same login.</p>
      {sp.get('registered') && <div className="alert alert-success small"><I n="check-circle" className="me-2" />Account created and saved in the browser cache! Log in with your new credentials.</div>}
      {err && <div className="alert alert-danger small" role="alert"><I n="exclamation-octagon" className="me-2" />{err}</div>}
      <form onSubmit={submit} noValidate>
        <div className="mb-3"><label className="form-label" htmlFor="lEmail">University email</label><input id="lEmail" type="email" className={`form-control form-control-lg ${inv.email ? 'is-invalid' : ''}`} placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /><div className="invalid-feedback">Enter a valid email address.</div></div>
        <div className="mb-3"><label className="form-label d-flex justify-content-between" htmlFor="lPass">Password <Link href="/forgot-password" className="small fw-normal">Forgot password?</Link></label>
          <div className="input-group has-validation"><input id="lPass" type={show ? 'text' : 'password'} className={`form-control form-control-lg ${inv.pw ? 'is-invalid' : ''}`} placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" /><button className="btn btn-light border" type="button" onClick={() => setShow(!show)} aria-label="Show password"><I n={show ? 'eye-slash' : 'eye'} /></button><div className="invalid-feedback">Password must be at least 6 characters.</div></div></div>
        <div className="form-check mb-4"><input className="form-check-input" type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} /><label className="form-check-label" htmlFor="remember">Remember me on this device</label></div>
        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={busy}>{busy && <span className="spinner-border spinner-border-sm me-2" />}{busy ? 'Signing in…' : 'Log in'}</button>
      </form>
      <div className="my-4 d-flex align-items-center gap-2 text-muted small"><hr className="flex-grow-1" />Demo accounts — click to fill<hr className="flex-grow-1" /></div>
      <div className="d-grid gap-2">{Store.obj('demoCredentials').map(d => <button type="button" key={d.role} className="demo-account d-flex align-items-center gap-3" onClick={() => fill(d.email, d.password)}><span className="stat-icon soft-primary" style={{ width: 38, height: 38, fontSize: '1rem' }}><I n={d.icon} /></span><span className="small"><strong className="d-block">{d.label}{d.role === 'student' && ` — ${U.user('s1')?.name}`}</strong><span className="text-muted">{d.email} · {d.password}</span></span><I n="arrow-right-short" className="ms-auto fs-5 text-muted" /></button>)}</div>
      {cached.length > 0 && <div className="mt-3 p-3 rounded-3 border"><div className="small fw-semibold mb-2"><I n="hdd-stack" className="me-1 text-primary" />Accounts registered in this browser (cache)</div>
        {cached.slice(0, 4).map(u => <button type="button" key={u.id} className="demo-account d-flex align-items-center gap-2 mb-2 py-2" onClick={() => fill(u.email, u.password)}><Avatar user={u} size={28} /><span className="small"><strong>{u.name}</strong> <span className="text-muted">· {u.email} · {u.password}</span></span></button>)}</div>}
      <button type="button" className="btn btn-link btn-sm w-100 mt-2" onClick={allAccounts}><I n="key" className="me-1" />View all {Store.all('users').length} dummy accounts & passwords</button>
      <p className="text-center small text-muted mt-3 mb-1">New student? <Link href="/register" className="fw-semibold">Create an account</Link></p>
      <p className="text-center xsmall text-muted mb-0"><I n="shield-exclamation" className="me-1" />Demonstration authentication only — not production-secure.</p>
    </div></div></div></div>;
}

/* ---------------- REGISTER ---------------- */
const colors = ['#4f46e5', '#7c3aed', '#db2777', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#475569'];
export function Register() {
  useGuestOnly();
  const { register } = useAuth();
  const { toast } = useUI();
  const router = useRouter();
  const [color, setColor] = useState(colors[0]);
  const [avatar, setAvatar] = useState(null);
  const [terms, setTerms] = useState(false);
  const [termsErr, setTermsErr] = useState(false);
  const year = new Date().getFullYear();
  const [values, setValues] = useState({ name: '', studentId: `NFU-${year}-${String(Math.floor(1000 + Math.random() * 8999))}`, email: '', department: '', semester: '', password: '', confirm: '' });
  const fields = [
    { name: 'name', label: 'Full name', required: true, col: 'col-md-6', placeholder: 'e.g. Sara Ali', minlength: 3 },
    { name: 'studentId', label: 'Student ID', required: true, col: 'col-md-6', placeholder: 'NFU-2026-0001', validate: v => /^NFU-\d{4}-\d{4}$/i.test(v) ? '' : 'Use the format NFU-YYYY-NNNN.' },
    { name: 'email', label: 'University email', type: 'email', required: true, placeholder: 'name@university.edu', validate: v => /@university\.edu$/i.test(v) ? '' : 'Use your @university.edu email address.' },
    { name: 'department', label: 'Department', type: 'select', required: true, col: 'col-md-6', options: Store.all('departments').map(d => ({ value: d.id, label: d.name })) },
    { name: 'semester', label: 'Semester', type: 'select', required: true, col: 'col-md-6', options: Store.all('semesters').map(s => ({ value: String(s.id), label: s.name })) },
    { name: 'password', label: 'Password', type: 'password', required: true, col: 'col-md-6', minlength: 8, help: 'At least 8 characters including a number.', validate: v => /\d/.test(v) ? '' : 'Include at least one number.' },
    { name: 'confirm', label: 'Confirm password', type: 'password', required: true, col: 'col-md-6', validate: (v, all) => v === all.password ? '' : 'Passwords do not match.' }];
  const upload = async e => {
    const f = e.target.files[0]; if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return toast('Choose a PNG, JPG or WEBP image.', 'warning');
    if (f.size > 700 * 1024) return toast('Profile picture must be under 700 KB in this demo.', 'warning');
    setAvatar(await U.readFile(f));
  };
  const onSubmit = v => {
    if (!terms) { setTermsErr(true); return; }
    const r = register({ ...v, avatarColor: color, avatar });
    if (!r.ok) return { errors: { [r.field]: r.error } };
    toast('Account created and saved in the browser cache. Please log in.');
    router.push('/login?registered=1&email=' + encodeURIComponent(r.user.email));
  };
  return <div className="container-fluid"><div className="row auth-wrap"><AuthSide title="Join your campus community." text="Create a free student account to access notes, track achievements and connect with classmates." />
    <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5"><div className="w-100" style={{ maxWidth: 600 }}>
      <MobileBrand />
      <h2 className="fw-bold mb-1">Create your student account</h2><p className="text-muted mb-4">Faculty and staff accounts are created by administrators.</p>
      <div className="demo-banner p-2 small mb-3"><I n="hdd-stack" className="me-1" />No database yet — your new account is saved in this browser’s cache and works like a real account (login, profile, leaderboard, admin user list).</div>
      <div className="card mb-3"><div className="card-body d-flex flex-wrap align-items-center gap-3"><Avatar user={{ name: values.name || 'New Student', avatarColor: color, avatar }} size={64} /><div className="flex-grow-1"><div className="form-label mb-1">Profile picture</div>
        <div className="d-flex flex-wrap gap-2 mb-2">{colors.map(c => <button type="button" key={c} className={`avatar-pick ${c === color && !avatar ? 'active' : ''}`} style={{ background: c }} onClick={() => { setColor(c); setAvatar(null); }} aria-label={`Avatar colour ${c}`} />)}</div>
        <label className="btn btn-sm btn-light"><I n="upload" className="me-1" />Upload photo<input type="file" accept="image/png,image/jpeg,image/webp" className="d-none" onChange={upload} /></label></div></div></div>
      <Form fields={fields} values={values} setValues={setValues} onSubmit={onSubmit} submitText="Create account" submitIcon="person-plus" footerClass="d-grid mt-4">
        <div className="form-check mt-3"><input className={`form-check-input ${termsErr ? 'is-invalid' : ''}`} type="checkbox" id="terms" checked={terms} onChange={e => { setTerms(e.target.checked); setTermsErr(false); }} /><label className="form-check-label small" htmlFor="terms">I agree to the Student Hub community guidelines and acceptable use policy.</label>{termsErr && <div className="invalid-feedback d-block">You must accept the terms to continue.</div>}</div>
      </Form>
      <p className="text-center small text-muted mt-3 mb-0">Already have an account? <Link href="/login" className="fw-semibold">Log in</Link></p>
    </div></div></div></div>;
}

/* ---------------- FORGOT PASSWORD ---------------- */
export function Forgot() {
  useMe();
  const [email, setEmail] = useState('');
  const [bad, setBad] = useState(false);
  const [sent, setSent] = useState(null);
  const submit = e => {
    e.preventDefault();
    if (!U.validEmail(email)) { setBad(true); return; }
    const u = Store.all('users').find(x => x.email.toLowerCase() === email.trim().toLowerCase());
    setSent({ email, user: u, code: String(Math.floor(100000 + Math.random() * 899999)) });
  };
  return <div className="container-fluid"><div className="row auth-wrap"><AuthSide title="Forgot your password?" text="It happens to everyone. We will help you get back into your account." />
    <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5"><div className="w-100" style={{ maxWidth: 440 }}>
      {sent ? <div className="text-center"><div className="empty-icon soft-success mx-auto"><I n="envelope-check" /></div>
        <h2 className="h4 fw-bold">Check your inbox</h2><p className="text-muted">If an account exists for <strong>{sent.email}</strong>, we have sent a password reset link. It expires in 30 minutes.</p>
        <div className="demo-banner p-3 small text-start mb-4"><I n="info-circle" className="me-1" /><strong>Demo mode:</strong> no email was sent. {sent.user ? <>This account exists — its demo password is <code>{sent.user.password}</code>. Simulated reset code: <code>{sent.code}</code>.</> : 'This email is not registered in the demo data or browser cache.'}</div>
        <Link href="/login" className="btn btn-primary w-100">Back to log in</Link><button className="btn btn-link mt-2" onClick={() => { setSent(null); setEmail(''); }}>Try a different email</button></div>
        : <><Link href="/login" className="small"><I n="arrow-left" className="me-1" />Back to log in</Link>
          <h2 className="fw-bold mt-3 mb-1">Reset your password</h2><p className="text-muted mb-4">Enter the email address linked to your account and we’ll send you a reset link.</p>
          <form onSubmit={submit} noValidate><label className="form-label" htmlFor="fEmail">Email address</label><input id="fEmail" type="email" className={`form-control form-control-lg ${bad ? 'is-invalid' : ''}`} placeholder="you@university.edu" value={email} onChange={e => { setEmail(e.target.value); setBad(false); }} /><div className="invalid-feedback">Enter a valid email address.</div>
            <button className="btn btn-primary btn-lg w-100 mt-3" type="submit">Send reset link</button></form></>}
    </div></div></div></div>;
}

export function NotFound() {
  const user = useMe();
  return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}><div className="text-center p-4">
    <div className="display-1 fw-bold text-primary">404</div><h1 className="h3 fw-bold">Page not found</h1><p className="text-muted">The page you are looking for doesn’t exist or has moved.</p>
    <Link className="btn btn-primary" href={user ? Auth.home(user.role) : '/'}>{user ? 'Back to dashboard' : 'Go to homepage'}</Link></div></div>;
}

export { CacheInspector };
