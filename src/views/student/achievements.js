'use client';
/* STUDENT — Achievement Center, Upload Achievement, Leaderboard, Badges & Rewards */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import { Avatar, Card, DataTable, Empty, I, PageHeader, Progress, Select, Stat, StatusBadge, Tabs } from '@/components/ui';
import { catIcon, deptOptions, semOptions, useEvidence } from '../shared';

export function AchievementCenter() {
  const me = useMe();
  const { confirm, toast } = useUI();
  const evidence = useEvidence();
  const [cat, setCat] = useState('All');
  const [status, setStatus] = useState('');
  const all = Store.where('achievements', a => a.studentId === me.id).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const cats = Store.all('achievementCategories');
  const list = all.filter(a => (cat === 'All' || a.category === cat) && (!status || a.status === status));
  const pts = all.filter(a => a.status === 'approved').reduce((s, a) => s + a.points, 0);
  const withdraw = id => confirm('Withdraw this pending submission? You can submit it again later.', () => { Store.remove('achievements', id); toast('Submission withdrawn.', 'info'); }, { danger: true, okText: 'Withdraw' });
  return <>
    <PageHeader title="Achievement Center" subtitle="Showcase certificates, projects, awards and competitions. Verified achievements earn contribution points.">
      <Link href="/student/achievements/badges" className="btn btn-light"><I n="award" className="me-1" />Badges & rewards</Link><Link href="/student/achievements/upload" className="btn btn-primary"><I n="plus-lg" className="me-1" />Upload achievement</Link></PageHeader>
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3"><Stat icon="trophy" label="Total submitted" value={all.length} /></div>
      <div className="col-6 col-lg-3"><Stat icon="patch-check" label="Verified" value={all.filter(a => a.status === 'approved').length} tone="success" /></div>
      <div className="col-6 col-lg-3"><Stat icon="hourglass-split" label="Pending verification" value={all.filter(a => a.status === 'pending').length} tone="warning" /></div>
      <div className="col-6 col-lg-3"><Stat icon="star" label="Points from achievements" value={pts} tone="purple" /></div></div>
    <div className="d-flex flex-wrap justify-content-between gap-2">
      <Tabs active={cat} onChange={setCat} items={[{ key: 'All', label: 'All', count: all.length }, ...cats.map(c => ({ key: c.id, label: c.id + (c.id.endsWith('ing') ? '' : 's'), icon: c.icon, count: all.filter(a => a.category === c.id).length }))]} />
      <Select className="form-select w-auto mb-3" value={status} onChange={setStatus} all="All statuses" options={[{ value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending verification' }, { value: 'rejected', label: 'Rejected' }]} />
    </div>
    <div className="row g-4"><div className="col-lg-8">
      {list.length ? <div className="row g-3">{list.map(a => <div className="col-md-6" key={a.id}><div className="card h-100"><div className="card-body d-flex flex-column">
        <div className="d-flex gap-3 mb-2"><div className={`stat-icon soft-${a.status === 'approved' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}><I n={catIcon(a.category)} /></div>
          <div className="min-w-0"><h3 className="h6 fw-semibold mb-1">{a.title}</h3><div className="d-flex flex-wrap gap-1"><StatusBadge status={a.status} /><span className="badge badge-soft-secondary">{a.category}</span></div></div></div>
        <p className="small text-muted mb-2 flex-grow-1">{a.description}</p>
        {a.details && <div className="xsmall text-muted mb-2"><I n="info-circle" className="me-1" />{a.details}</div>}
        {a.reviewNote && <div className={`xsmall p-2 rounded-2 mb-2 soft-${a.status === 'rejected' ? 'danger' : 'success'}`}><I n="chat-left-quote" className="me-1" /><strong>{U.user(a.reviewedBy)?.name || 'Reviewer'}:</strong> {a.reviewNote}</div>}
        <div className="d-flex align-items-center gap-2 border-top pt-2 small"><span className="text-muted"><I n="calendar3" className="me-1" />{U.date(a.date)}</span>{a.status === 'approved' && <span className="ms-auto fw-bold text-success">+{a.points} pts</span>}</div>
        <div className="d-flex gap-2 mt-2"><button className="btn btn-sm btn-light flex-grow-1" onClick={() => evidence(a.id)}><I n="paperclip" className="me-1" />View evidence</button>
          {a.status === 'pending' && <button className="btn btn-sm btn-light text-danger" onClick={() => withdraw(a.id)}>Withdraw</button>}
          {a.status === 'rejected' && <Link className="btn btn-sm btn-soft" href={`/student/achievements/upload?from=${a.id}`}>Resubmit</Link>}</div>
      </div></div></div>)}</div> : <Empty icon="trophy" title="No achievements here yet" text="Upload a certificate, project or award to get it verified."><Link href="/student/achievements/upload" className="btn btn-primary btn-sm">Upload achievement</Link></Empty>}
    </div>
    <div className="col-lg-4"><div className="d-grid gap-4">
      <Card title="Achievement history">{all.length ? <div className="timeline">{all.slice(0, 8).map(a => <div className="tl-item" key={a.id}><div className="small fw-semibold">{a.title}</div><div className="xsmall text-muted">Submitted {U.date(a.submittedAt)}{a.reviewedAt ? ` · ${a.status === 'approved' ? 'Verified' : a.status === 'rejected' ? 'Rejected' : 'Reviewed'} ${U.date(a.reviewedAt)}` : ' · awaiting review'}</div></div>)}</div> : <p className="small text-muted mb-0">Your history will appear here.</p>}</Card>
      <Card title="Points by category"><div className="small d-grid gap-2">{cats.map(c => <div className="d-flex justify-content-between" key={c.id}><span><I n={c.icon} className="me-2 text-primary" />{c.id}</span><span className="fw-semibold">{c.points} pts</span></div>)}</div><p className="xsmall text-muted mt-3 mb-0">Default points awarded on verification. Reviewers may adjust points.</p></Card>
    </div></div></div>
  </>;
}

export function UploadAchievement() {
  const me = useMe();
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useUI();
  const from = sp.get('from') ? Store.find('achievements', sp.get('from')) : null;
  const [preview, setPreview] = useState(null);
  const fields = [
    { name: 'title', label: 'Achievement title', required: true, minlength: 5, value: from?.title, placeholder: 'e.g. Google Data Analytics Certificate' },
    { name: 'category', label: 'Category', type: 'select', required: true, col: 'col-md-6', value: from?.category, options: Store.all('achievementCategories').map(c => ({ value: c.id, label: `${c.id} (${c.points} pts)` })) },
    { name: 'date', label: 'Date achieved', type: 'date', required: true, col: 'col-md-6', value: from?.date || U.ymd(), max: U.ymd(), validate: v => U.daysLeft(v) > 0 ? 'Date cannot be in the future.' : '' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, minlength: 20, rows: 3, value: from?.description, placeholder: 'Describe what you achieved and your role.' },
    { name: 'details', label: 'Supporting details', value: from?.details, placeholder: 'Issuer, credential ID, team members, link…' },
    { name: 'evidence', label: 'Certificate or evidence', type: 'file', required: true, accept: '.pdf,.png,.jpg,.jpeg', exts: ['pdf', 'png', 'jpg', 'jpeg'], maxSize: 1.5 * 1024 * 1024, help: 'PDF, PNG or JPG · max 1.5 MB',
      onChange: f => { if (f && /^image\//.test(f.type) && f.size < 1.5 * 1024 * 1024) U.readFile(f).then(setPreview); else setPreview(null); } }];
  const submit = async v => {
    const dataUrl = await U.readFile(v.evidence);
    const a = Store.add('achievements', { studentId: me.id, title: v.title, category: v.category, date: v.date, submittedAt: new Date().toISOString(), status: 'pending', points: 0, description: v.description, details: v.details, evidence: { name: v.evidence.name, type: v.evidence.type, dataUrl }, reviewedBy: null, reviewNote: '', reviewedAt: null }, 'ac');
    if (!a) return;
    Store.where('users', u => (u.role === 'faculty' && u.department === me.department) || u.role === 'admin').forEach(u => Store.notify(u.id, 'Achievement awaiting review', `${me.name} submitted “${a.title}”.`, 'Achievement', u.role === 'admin' ? '/admin/achievements' : '/faculty/achievements'));
    toast('Submitted! Your achievement is pending verification.');
    router.push('/student/achievements');
  };
  return <>
    <PageHeader title="Upload Achievement" subtitle="Submit evidence for verification by faculty or administrators." />
    <div className="row g-4"><div className="col-lg-8"><div className="card"><div className="card-body p-4">
      {from && <div className="alert alert-warning small"><I n="arrow-repeat" className="me-1" />Resubmitting “{from.title}”. Reviewer note: {from.reviewNote}</div>}
      <Form fields={fields} onSubmit={submit} submitText="Submit for verification" submitIcon="send" onCancel={() => router.push('/student/achievements')} footerClass="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
        {preview && <img src={preview} className="img-fluid rounded border mt-2" style={{ maxHeight: 220 }} alt="Evidence preview" />}</Form>
    </div></div></div>
    <div className="col-lg-4"><Card title={<><I n="shield-check" className="me-2 text-success" />Verification process</>}><div className="timeline small"><div className="tl-item"><strong>1. Submit</strong><div className="text-muted">Status becomes “Pending Verification”.</div></div><div className="tl-item"><strong>2. Review</strong><div className="text-muted">A faculty member from your department or an administrator checks your evidence.</div></div><div className="tl-item"><strong>3. Points awarded</strong><div className="text-muted">Approved achievements add points and update the leaderboard instantly.</div></div></div></Card></div></div>
  </>;
}

export function Leaderboard() {
  const me = useMe();
  const [period, setPeriod] = useState('overall');
  const [dept, setDept] = useState('');
  const [sem, setSem] = useState('');
  const rows = Scoring.ranking(period, { department: dept, semester: sem });
  const all = Scoring.ranking(period);
  const myRow = all.find(r => r.user.id === me.id);
  const top3 = rows.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const r = Scoring.rules();
  const name = x => x.user.id !== me.id && x.user.privacy && x.user.privacy.leaderboard === false ? 'Anonymous student' : x.user.name;
  const periodLabel = { overall: 'All time', monthly: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), annual: 'Academic year ' + new Date().getFullYear() }[period];
  return <>
    <PageHeader title="Leaderboard" subtitle={`Rankings based on verified contributions · ${periodLabel}`}><Link href="/student/achievements/badges" className="btn btn-light"><I n="award" className="me-1" />Annual rewards</Link></PageHeader>
    <div className="d-flex flex-wrap gap-2 align-items-start justify-content-between">
      <Tabs active={period} onChange={setPeriod} items={[{ key: 'overall', label: 'Overall', icon: 'infinity' }, { key: 'monthly', label: 'Monthly', icon: 'calendar-month' }, { key: 'annual', label: 'Annual', icon: 'calendar3' }]} />
      <div className="d-flex gap-2 mb-3"><Select className="form-select" value={dept} onChange={setDept} all="All departments" options={deptOptions()} /><Select className="form-select" value={sem} onChange={setSem} all="All semesters" options={semOptions()} /></div>
    </div>
    <div className="row g-4">
      <div className="col-xl-8">
        {top3.length > 0 && <div className="podium mb-4">{[top3[1], top3[0], top3[2]].map((x, k) => x ? <div key={x.user.id} className={`place ${x === top3[0] ? 'first' : ''}`}><div className="medal">{medals[top3.indexOf(x)]}</div><div className="my-2"><Avatar user={x.user} size={x === top3[0] ? 72 : 56} className="avatar-ring" /></div><div className="fw-semibold small text-truncate">{name(x)}</div><div className="xsmall text-muted">{U.deptCode(x.user.department)} · Sem {x.user.semester}</div><div className="fw-bold text-primary mt-1">{x.total.toLocaleString()} pts</div></div> : <div key={'e' + k} />)}</div>}
        <div className="card"><div className="card-body p-0"><DataTable rows={rows} rowKey={x => x.user.id} rowClass={x => x.user.id === me.id ? 'me' : ''} empty="No students match these filters." cols={[
          { label: 'Rank', render: x => <span className={`rank-pill ${x.rank <= 3 ? 'soft-warning' : ''}`}>{x.rank}</span> },
          { label: 'Student', render: x => <div className="d-flex align-items-center gap-2"><Avatar user={x.user} size={34} /><div className="text-start"><div className="fw-semibold small">{name(x)}{x.user.id === me.id && <span className="badge bg-primary ms-1">You</span>}</div><div className="xsmall text-muted">{U.dept(x.user.department)}</div></div></div> },
          { label: 'Sem', render: x => x.user.semester },
          { label: 'Academic', render: x => x.academic, cls: 'd-none d-lg-table-cell' },
          { label: 'Achievements', render: x => x.achievements, cls: 'd-none d-lg-table-cell' },
          { label: 'Community', render: x => x.community, cls: 'd-none d-lg-table-cell' },
          { label: 'Exchange', render: x => x.exchange, cls: 'd-none d-lg-table-cell' },
          { label: 'Points', render: x => <strong className="text-primary">{x.total.toLocaleString()}</strong> }]} /></div></div>
      </div>
      <div className="col-xl-4"><div className="d-grid gap-4">
        <div className="card welcome-banner"><div className="card-body p-4 position-relative" style={{ zIndex: 1 }}><div className="small opacity-75">My current position</div>
          <div className="d-flex align-items-center gap-3 my-2"><Avatar user={me} size={54} className="avatar-ring" /><div><div className="display-6 fw-bold">#{myRow ? myRow.rank : '—'}</div><div className="small opacity-75">of {all.length} students</div></div></div>
          {myRow && <><div className="row g-2 text-center small mt-2">{[['Academic', myRow.academic], ['Achieve.', myRow.achievements], ['Community', myRow.community], ['Exchange', myRow.exchange]].map(([l, v]) => <div className="col-3" key={l}><div className="fw-bold">{v}</div><div className="xsmall opacity-75">{l}</div></div>)}</div>
            <div className="mt-3 small">{myRow.rank > 1 ? <><I n="arrow-up-circle" className="me-1" />{all[myRow.rank - 2].total - myRow.total + 1} points to overtake #{myRow.rank - 1}</> : <><I n="trophy" className="me-1" />You are #1. Keep it up!</>}</div></>}</div></div>
        <Card title={<><I n="calculator" className="me-2 text-primary" />How points are calculated</>}><div className="small d-grid gap-2">
          {[['cloud-arrow-up', 'Approved note upload', r.noteUpload], ['patch-question', 'Quiz passed (60%+)', r.quizPass], ['trophy', 'Verified achievement', 'by category'], ['chat-square-text', 'Community post', r.communityPost], ['reply', 'Comment', r.comment], ['life-preserver', 'Answer in Q&A', r.answer], ['hand-thumbs-up', 'Answer marked helpful', '+' + r.helpfulAnswer], ['arrow-left-right', 'Completed exchange', r.exchangeCompleted], ['calendar-check', 'Event registration', r.eventRegistration]].map(([i, l, v]) => <div className="d-flex justify-content-between" key={l}><span><I n={i} className="me-2 text-muted" />{l}</span><strong>{v}</strong></div>)}</div>
          <p className="xsmall text-muted mt-3 mb-0">Totals include historic points from previous terms. Monthly and annual views only count activity in that period. Students can hide their name in Settings → Privacy.</p></Card>
      </div></div>
    </div>
  </>;
}

export function Badges() {
  const me = useMe();
  const list = Scoring.badges(me.id);
  const earned = list.filter(b => b.earned), locked = list.filter(b => !b.earned);
  const crit = Store.obj('studentOfYearCriteria');
  const annual = Scoring.breakdown(me.id, 'annual');
  const metricLabel = { notes: 'notes uploaded', points: 'points', achievements: 'verified achievements', posts: 'posts', answers: 'answers', quizzes: 'quizzes passed', exchanges: 'exchanges', events: 'events' };
  const pct = Math.round(earned.length / list.length * 100);
  const Tile = ({ b }) => <div className="col-6 col-md-4 col-xl-3"><div className={`card h-100 badge-tile ${b.earned ? '' : 'locked'}`}><div className="badge-medal" style={{ background: b.color }}><I n={b.earned ? b.icon : 'lock-fill'} /></div>
    <h3 className="h6 fw-semibold mb-1">{b.name}</h3><p className="small text-muted mb-2">{b.description}</p>
    {b.earned ? <span className="badge badge-soft-success"><I n="check2" className="me-1" />Earned</span> : <><div className="xsmall text-muted mb-1">Requirement: {b.min.toLocaleString()} {metricLabel[b.metric] || b.metric}</div><Progress value={b.progress} h={6} /><div className="xsmall mt-1">{b.value.toLocaleString()} / {b.min.toLocaleString()}</div></>}</div></div>;
  return <>
    <PageHeader title="Badges & Rewards" subtitle={`You have earned ${earned.length} of ${list.length} badges.`}><Link href="/student/leaderboard" className="btn btn-light"><I n="bar-chart-line" className="me-1" />Leaderboard</Link></PageHeader>
    <div className="card mb-4"><div className="card-body d-flex flex-wrap align-items-center gap-4"><div className="flex-grow-1"><div className="small text-muted mb-1">Badge collection progress</div><Progress value={pct} tone="success" h={10} /></div><div className="h4 fw-bold mb-0">{pct}%</div></div></div>
    <h2 className="h5 fw-semibold mb-3">Earned badges</h2>
    <div className="row g-3 mb-4">{earned.length ? earned.map(b => <Tile key={b.id} b={b} />) : <div className="col-12"><Empty icon="award" title="No badges yet" text="Upload notes, pass quizzes and help others to unlock badges." /></div>}</div>
    <h2 className="h5 fw-semibold mb-3">Locked badges</h2>
    <div className="row g-3 mb-5">{locked.length ? locked.map(b => <Tile key={b.id} b={b} />) : <div className="col-12"><Empty icon="stars" title="You unlocked every badge!" text="Incredible work." /></div>}</div>
    <h2 className="h5 fw-semibold mb-3">Annual rewards {new Date().getFullYear()}</h2>
    <div className="row g-3 mb-4">{Store.all('annualAwards').map(a => <div className="col-md-6 col-xl-3" key={a.id}><div className="card h-100"><div className="card-body"><div className="stat-icon soft-warning mb-3"><I n={a.icon} /></div><h3 className="h6 fw-semibold">{a.title}</h3><p className="small text-muted">{a.description}</p><div className="small"><I n="gift" className="me-1 text-primary" />{a.prize}</div></div></div></div>)}</div>
    <Card title={<><I n="gem" className="me-2 text-primary" />Student of the Year — selection criteria</>}>
      <p className="small text-muted">Candidates need at least <strong>{crit.minimumPoints}</strong> points in the academic year. The final score is a weighted combination of category points:</p>
      <div className="row g-3">{[['Academic', crit.academic, 'primary'], ['Achievements', crit.achievements, 'warning'], ['Community', crit.community, 'info'], ['Exchange', crit.exchange, 'success']].map(([l, v, t]) => <div className="col-6 col-md-3" key={l}><div className={`p-3 rounded-3 soft-${t} text-center`}><div className="h4 fw-bold mb-0">{v}%</div><div className="small">{l}</div></div></div>)}</div>
      <p className="small mt-3 mb-0">Your current weighted score: <strong>{Scoring.sotyScore(annual)}</strong> · annual points: <strong>{annual.total}</strong></p></Card>
  </>;
}
