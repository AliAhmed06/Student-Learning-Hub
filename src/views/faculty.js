'use client';
/* ==========================================================================
   FACULTY PORTAL + shared achievement review (used by admin too)
   ========================================================================== */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Store, { uid } from '@/lib/storage';
import U from '@/lib/utils';
import { Domain, Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import { Avatar, Card, ChartBox, DataTable, DateBlock, Empty, I, PageHeader, Progress, SearchInput, Select, Stat, StatusBadge, Tabs } from '@/components/ui';
import { courseOptions, deptOptions, semOptions, useEvidence, useMaterialViewer } from './shared';

/* ---------------- SHARED: Achievement review ---------------- */
const defaultPoints = cat => (Store.all('achievementCategories').find(c => c.id === cat) || {}).points || 20;
export function AchievementReview({ title, subtitle }) {
  const me = useMe(); const { formModal, toast } = useUI(); const evidence = useEvidence();
  const [f, setF] = useState({ status: 'pending', dept: '', cat: '', q: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const scope = Store.where('achievements', a => { const s = U.user(a.studentId); return s && (me.role === 'admin' || s.department === me.department); });
  const list = scope.filter(a => (!f.status || a.status === f.status) && (!f.cat || a.category === f.cat) && (!f.dept || U.user(a.studentId)?.department === f.dept) && U.match(f.q, a.title, U.user(a.studentId)?.name)).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const count = s => scope.filter(a => a.status === s).length;
  const Intro = ({ a }) => <div className="p-3 border rounded-3 mb-3 small"><strong>{a.title}</strong><br />{U.user(a.studentId)?.name} · {a.category}</div>;
  const approve = a => formModal({ title: <><I n="patch-check" className="me-2 text-success" />{a.status === 'approved' ? 'Adjust points' : 'Approve achievement'}</>, submitText: 'Approve & award points', intro: <Intro a={a} />,
    fields: [{ name: 'points', label: 'Points to award', type: 'number', min: 0, required: true, value: String(a.status === 'approved' ? a.points : defaultPoints(a.category)), help: `Default for ${a.category}: ${defaultPoints(a.category)} points` }, { name: 'note', label: 'Verification comment', type: 'textarea', rows: 3, value: a.reviewNote, placeholder: 'e.g. Verified using credential ID.' }],
    onSubmit: v => { Store.update('achievements', a.id, { status: 'approved', points: +v.points, reviewNote: v.note, reviewedBy: me.id, reviewedAt: new Date().toISOString() }); Store.notify(a.studentId, 'Achievement verified 🎉', `“${a.title}” was approved by ${me.name}. +${v.points} points!`, 'Achievement', '/student/achievements'); toast(`Approved — ${v.points} points awarded. Leaderboard updated.`); } });
  const reject = a => formModal({ title: <><I n="x-octagon" className="me-2 text-danger" />Reject achievement</>, submitText: 'Reject submission', intro: <Intro a={a} />,
    fields: [{ name: 'note', label: 'Reason (shared with the student)', type: 'textarea', rows: 3, required: true, minlength: 10, placeholder: 'Explain what is missing or incorrect.' }],
    onSubmit: v => { Store.update('achievements', a.id, { status: 'rejected', points: 0, reviewNote: v.note, reviewedBy: me.id, reviewedAt: new Date().toISOString() }); Store.notify(a.studentId, 'Achievement not approved', `“${a.title}” was not approved: ${v.note}`, 'Achievement', '/student/achievements'); toast('Submission rejected and the student was notified.', 'info'); } });
  const reopen = a => { Store.update('achievements', a.id, { status: 'pending', points: 0, reviewedAt: null }); toast('Moved back to pending review.', 'info'); };
  return <>
    <PageHeader title={title} subtitle={subtitle} />
    <div className="row g-3 mb-4"><div className="col-6 col-lg-3"><Stat icon="hourglass-split" label="Pending" value={count('pending')} tone="warning" /></div><div className="col-6 col-lg-3"><Stat icon="patch-check" label="Approved" value={count('approved')} tone="success" /></div><div className="col-6 col-lg-3"><Stat icon="x-octagon" label="Rejected" value={count('rejected')} tone="danger" /></div><div className="col-6 col-lg-3"><Stat icon="star" label="Points awarded" value={scope.filter(a => a.status === 'approved').reduce((s, a) => s + a.points, 0)} /></div></div>
    <div className="d-flex flex-wrap justify-content-between gap-2"><Tabs active={f.status} onChange={v => set('status', v)} items={[{ key: 'pending', label: 'Pending', count: count('pending') }, { key: 'approved', label: 'Approved', count: count('approved') }, { key: 'rejected', label: 'Rejected', count: count('rejected') }, { key: '', label: 'All', count: scope.length }]} />
      <div className="d-flex flex-wrap gap-2 mb-3"><SearchInput style={{ maxWidth: 200 }} value={f.q} onChange={v => set('q', v)} /><Select value={f.cat} onChange={v => set('cat', v)} all="All categories" options={Store.all('achievementCategories').map(c => c.id)} />{me.role === 'admin' && <Select value={f.dept} onChange={v => set('dept', v)} all="All departments" options={deptOptions()} />}</div></div>
    <div className="card"><div className="card-body p-0"><DataTable rows={list} empty="No submissions in this view." cols={[
      { label: 'Student', render: a => { const s = U.user(a.studentId); return <div className="d-flex align-items-center gap-2 text-start"><Avatar user={s} size={34} /><div><div className="small fw-semibold">{s?.name}</div><div className="xsmall text-muted">{s?.studentId} · {U.deptCode(s?.department)}</div></div></div>; } },
      { label: 'Achievement', render: a => <div className="text-start" style={{ maxWidth: 320 }}><div className="small fw-semibold">{a.title}</div><div className="xsmall text-muted">{U.truncate(a.description, 90)}</div>{a.reviewNote && <div className="xsmall mt-1"><I n="chat-left-quote" className="me-1" />{a.reviewNote}</div>}</div> },
      { label: 'Category', render: a => <span className="badge badge-soft-secondary">{a.category}</span> },
      { label: 'Submitted', render: a => <span className="small">{U.date(a.submittedAt)}</span> },
      { label: 'Status', render: a => <><StatusBadge status={a.status} />{a.status === 'approved' && <div className="xsmall text-success fw-semibold">+{a.points} pts</div>}</> },
      { label: 'Actions', render: a => <div className="d-flex gap-1 justify-content-end flex-wrap"><button className="btn btn-sm btn-light" onClick={() => evidence(a.id)} title="View evidence"><I n="paperclip" /></button>
        {a.status === 'pending' ? <><button className="btn btn-sm btn-success" onClick={() => approve(a)}>Approve</button><button className="btn btn-sm btn-outline-danger" onClick={() => reject(a)}>Reject</button></>
          : <>{a.status === 'approved' && <button className="btn btn-sm btn-light" onClick={() => approve(a)} title="Adjust points"><I n="pencil" /> Points</button>}<button className="btn btn-sm btn-light" onClick={() => reopen(a)} title="Reopen review"><I n="arrow-counterclockwise" /></button></>}</div> }]} /></div></div>
  </>;
}

/* ---------------- SHARED: Announcements manager (faculty & admin) ---------------- */
export function AnnouncementsManager() {
  const me = useMe(); const { formModal, confirm, toast } = useUI();
  const [filter, setFilter] = useState('mine');
  const isAdmin = me.role === 'admin';
  const myCourses = isAdmin ? Store.all('courses') : Domain.facultyCourses(me.id);
  const students = Store.where('users', u => u.role === 'student' && (isAdmin || (u.courses || []).some(c => myCourses.some(x => x.id === c))));
  const all = (isAdmin ? Store.all('announcements') : Domain.announcementsFor(me)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = all.filter(a => filter === 'all' || a.authorId === me.id);
  const audiences = isAdmin ? [{ value: 'all', label: 'Everyone' }, { value: 'students', label: 'All students' }, { value: 'faculty', label: 'All faculty' }, { value: 'department', label: 'A department' }, { value: 'course', label: 'Specific courses' }, { value: 'selected', label: 'Selected students' }] : [{ value: 'course', label: 'Students in selected courses' }, { value: 'selected', label: 'Selected students' }];
  const open = a => formModal({ title: <><I n="megaphone" className="me-2" />{a ? 'Edit announcement' : 'New announcement'}</>, size: 'lg', submitText: a ? 'Save changes' : 'Publish announcement',
    fields: [{ name: 'title', label: 'Title', required: true, minlength: 5, value: a?.title }, { name: 'body', label: 'Message', type: 'textarea', rows: 4, required: true, minlength: 10, value: a?.body },
      { name: 'audience', label: 'Target audience', type: 'select', required: true, col: 'col-md-6', value: a?.audience || audiences[0].value, options: audiences, placeholder: false },
      { name: 'priority', label: 'Priority', type: 'select', required: true, col: 'col-md-6', value: a?.priority || 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'high', label: 'Important' }], placeholder: false },
      ...(isAdmin ? [{ name: 'departmentId', label: 'Department', type: 'select', value: a?.departmentId || '', options: deptOptions(), help: 'Used when the audience is “A department”.', validate: (v, all) => all.audience === 'department' && !v ? 'Choose a department.' : '' }] : []),
      { name: 'courseIds', label: 'Courses', type: 'checkboxes', value: a?.courseIds || [], options: courseOptions(myCourses), help: 'Used when the audience is “courses”.', validate: (v, all) => all.audience === 'course' && !v.length ? 'Choose at least one course.' : '' },
      { name: 'studentIds', label: 'Students', type: 'checkboxes', value: a?.studentIds || [], options: students.map(s => ({ value: s.id, label: `${s.name} (${s.studentId})` })), help: 'Used when the audience is “Selected students”.', validate: (v, all) => all.audience === 'selected' && !v.length ? 'Choose at least one student.' : '' }],
    onSubmit: v => {
      const data = { title: v.title, body: v.body, audience: v.audience, priority: v.priority, departmentId: v.departmentId || null, courseIds: v.audience === 'course' ? v.courseIds : [], studentIds: v.audience === 'selected' ? v.studentIds : [] };
      if (a) { Store.update('announcements', a.id, data); toast('Announcement updated.'); }
      else { const n = Store.add('announcements', { ...data, authorId: me.id, date: new Date().toISOString() }, 'an'); Domain.notifyAnnouncement(n); toast('Announcement published and recipients notified.'); }
    } });
  const del = a => confirm(`Delete “${a.title}”?`, () => { Store.remove('announcements', a.id); toast('Announcement deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  return <>
    <PageHeader title="Announcements" subtitle={isAdmin ? 'Publish announcements to students, faculty, departments or courses.' : 'Share updates with students in your courses.'}><button className="btn btn-primary" onClick={() => open()}><I n="plus-lg" className="me-1" />New announcement</button></PageHeader>
    <Tabs active={filter} onChange={setFilter} items={[{ key: 'mine', label: 'Posted by me', count: all.filter(a => a.authorId === me.id).length }, { key: 'all', label: isAdmin ? 'All announcements' : 'All visible to me', count: all.length }]} />
    {list.length ? list.map(a => <div className="card mb-3" key={a.id}><div className="card-body"><div className="d-flex flex-wrap gap-2 justify-content-between">
      <div className="min-w-0"><div className="d-flex flex-wrap gap-2 align-items-center mb-1">{a.priority === 'high' && <span className="badge badge-soft-danger">Important</span>}<span className="badge badge-soft-primary"><I n="people" className="me-1" />{Domain.audienceLabel(a)}</span></div><h3 className="h6 fw-semibold mb-1">{a.title}</h3><p className="small text-muted mb-2" style={{ whiteSpace: 'pre-line' }}>{a.body}</p>
        <div className="xsmall text-muted d-flex align-items-center gap-2"><Avatar user={U.user(a.authorId)} size={20} />{U.user(a.authorId)?.name} · {U.dateTime(a.date)}</div></div>
      {(a.authorId === me.id || isAdmin) && <div className="d-flex gap-1 align-items-start"><button className="btn btn-sm btn-light" onClick={() => open(a)}><I n="pencil" /></button><button className="btn btn-sm btn-light text-danger" onClick={() => del(a)}><I n="trash" /></button></div>}</div></div></div>)
      : <Empty icon="megaphone" title="No announcements yet" text="Publish your first announcement."><button className="btn btn-primary btn-sm" onClick={() => open()}>New announcement</button></Empty>}
  </>;
}

/* ---------------- FACULTY DASHBOARD ---------------- */
export function FacultyDashboard() {
  const me = useMe();
  const courses = Domain.facultyCourses(me.id);
  const cids = courses.map(c => c.id);
  const studentIds = new Set(courses.flatMap(c => Domain.courseStudents(c.id).map(s => s.id)));
  const pending = Store.where('achievements', a => a.status === 'pending' && U.user(a.studentId)?.department === me.department);
  const mats = Store.where('studyMaterials', m => m.uploadedBy === me.id);
  const activity = [...Store.where('notes', n => cids.includes(n.courseId)).map(n => ({ date: n.date, icon: 'journal-arrow-up', text: <><strong>{U.user(n.uploaderId)?.name}</strong> uploaded notes “{n.title}”</>, sub: U.course(n.courseId)?.code })),
    ...Store.where('quizAttempts', a => cids.includes(Store.find('quizzes', a.quizId)?.courseId)).map(a => ({ date: a.date, icon: 'patch-check', text: <><strong>{U.user(a.userId)?.name}</strong> scored {a.score}/{a.total} on “{Store.find('quizzes', a.quizId)?.title}”</>, sub: 'Quiz' })),
    ...Store.where('achievements', a => U.user(a.studentId)?.department === me.department).map(a => ({ date: a.submittedAt, icon: 'trophy', text: <><strong>{U.user(a.studentId)?.name}</strong> submitted “{a.title}”</>, sub: a.status }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  const events = Store.where('events', e => U.daysLeft(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
  const anns = Domain.announcementsFor(me).slice(0, 3);
  const quizAvg = courses.map(c => { const qids = Store.where('quizzes', q => q.courseId === c.id).map(q => q.id); const at = Store.where('quizAttempts', a => qids.includes(a.quizId)); return at.length ? Math.round(at.reduce((s, a) => s + a.score / a.total, 0) / at.length * 100) : 0; });
  return <>
    <div className="card welcome-banner mb-4"><div className="card-body p-4 p-lg-5 position-relative" style={{ zIndex: 1 }}>
      <div className="small opacity-75 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {Store.obj('university').currentTerm}</div>
      <h1 className="h2 fw-bold mb-1">Welcome, {me.name} 👋</h1><p className="opacity-75 mb-4">{me.designation} · {U.dept(me.department)}</p>
      <div className="d-flex flex-wrap gap-2"><Link href="/faculty/materials" className="btn btn-light"><I n="cloud-arrow-up" className="me-1" />Upload material</Link><Link href="/faculty/quizzes" className="btn btn-light"><I n="patch-plus" className="me-1" />Create quiz</Link><Link href="/faculty/achievements" className="btn btn-light"><I n="patch-check" className="me-1" />Review achievements ({pending.length})</Link><Link href="/faculty/announcements" className="btn btn-light"><I n="megaphone" className="me-1" />Announce</Link></div></div></div>
    <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3"><Stat icon="journal-bookmark" label="Assigned courses" value={courses.length} href="/faculty/courses" /></div>
      <div className="col-6 col-xl-3"><Stat icon="people" label="Total students" value={studentIds.size} tone="info" href="/faculty/students" /></div>
      <div className="col-6 col-xl-3"><Stat icon="folder2-open" label="Uploaded materials" value={mats.length} tone="purple" href="/faculty/materials" /></div>
      <div className="col-6 col-xl-3"><Stat icon="hourglass-split" label="Pending verifications" value={pending.length} tone="warning" href="/faculty/achievements" /></div></div>
    <div className="row g-4">
      <div className="col-xl-8 d-grid gap-4 align-content-start">
        <Card title="My courses" actions={<Link href="/faculty/courses" className="small">Manage</Link>}><div className="row g-3">{courses.map(c => <div className="col-md-6" key={c.id}><Link href={`/faculty/courses?c=${c.id}`} className="d-block p-3 border rounded-3 text-reset hover-lift"><div className="d-flex justify-content-between"><span className="badge badge-soft-primary">{c.code}</span><span className="xsmall text-muted">Sem {c.semester}</span></div><div className="fw-semibold mt-2">{c.title}</div><div className="xsmall text-muted mt-1"><I n="people" /> {Domain.courseStudents(c.id).length} students · <I n="folder2" /> {Store.where('studyMaterials', m => m.courseId === c.id).length} materials · <I n="layers" /> {Store.where('courseModules', m => m.courseId === c.id).length} modules</div></Link></div>)}</div></Card>
        <Card title="Average quiz score by course"><ChartBox type="bar" labels={courses.map(c => c.code)} datasets={[{ label: 'Average %', data: quizAvg }]} opts={{ max: 100 }} height={220} /></Card>
        <Card title="Recent student activity" bodyClass="py-1">{activity.length ? activity.map((a, i) => <div className="list-row" key={i}><span className="notif-icon soft-primary"><I n={a.icon} /></span><div className="min-w-0 small">{a.text}<div className="xsmall text-muted">{a.sub} · {U.ago(a.date)}</div></div></div>) : <Empty icon="activity" title="No recent activity" />}</Card>
      </div>
      <div className="col-xl-4 d-grid gap-4 align-content-start">
        <Card title="Pending verifications" actions={<Link href="/faculty/achievements" className="small">Review</Link>} bodyClass="py-1">{pending.length ? pending.slice(0, 5).map(a => <div className="list-row" key={a.id}><Avatar user={U.user(a.studentId)} size={32} /><div className="min-w-0"><div className="small fw-semibold text-truncate">{a.title}</div><div className="xsmall text-muted">{U.user(a.studentId)?.name} · {a.category}</div></div></div>) : <Empty icon="check2-all" title="Nothing pending" />}</Card>
        <Card title="Upcoming academic events" bodyClass="py-1">{events.map(e => <div className="list-row" key={e.id}><DateBlock date={e.date} /><div className="min-w-0"><div className="small fw-semibold text-truncate">{e.title}</div><div className="xsmall text-muted text-truncate">{e.location}</div></div></div>)}</Card>
        <Card title="Announcements" actions={<Link href="/faculty/announcements" className="small">All</Link>}>{anns.map(a => <div className="mb-2 small" key={a.id}><strong>{a.title}</strong><div className="text-muted">{U.truncate(a.body, 100)}</div></div>)}</Card>
      </div></div>
  </>;
}

/* ---------------- FACULTY COURSES ---------------- */
export function FacultyCourses() {
  const me = useMe(); const sp = useSearchParams(); const { formModal, confirm, toast } = useUI(); const { view } = useMaterialViewer();
  const courses = Domain.facultyCourses(me.id);
  const [sel, setSel] = useState(sp.get('c') && courses.some(c => c.id === sp.get('c')) ? sp.get('c') : courses[0]?.id);
  const [tab, setTab] = useState('overview');
  if (!courses.length) return <><PageHeader title="My Courses" /><Empty icon="journal" title="No courses assigned" text="An administrator assigns courses to faculty." /></>;
  const c = U.course(sel) || courses[0];
  const students = Domain.courseStudents(c.id);
  const modules = Store.where('courseModules', m => m.courseId === c.id).sort((a, b) => a.order - b.order);
  const mats = Store.where('studyMaterials', m => m.courseId === c.id);
  const notes = Store.where('notes', n => n.courseId === c.id);
  const modFields = (m = {}) => [{ name: 'title', label: 'Module title', required: true, value: m.title }, { name: 'order', label: 'Order', type: 'number', min: 1, required: true, value: String(m.order || modules.length + 1) }, { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true, value: m.description }];
  const addMod = () => formModal({ title: 'Add module', fields: modFields(), onSubmit: v => { Store.add('courseModules', { courseId: c.id, title: v.title, order: +v.order, description: v.description }, 'm'); toast('Module added — visible to students now.'); } });
  const editMod = m => formModal({ title: 'Edit module', fields: modFields(m), onSubmit: v => { Store.update('courseModules', m.id, { title: v.title, order: +v.order, description: v.description }); toast('Module updated.'); } });
  const delMod = m => confirm(`Delete module “${m.title}”? Materials in it will stay in the course.`, () => { Store.remove('courseModules', m.id); toast('Module deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  let body;
  if (tab === 'overview') body = <div className="row g-4"><div className="col-md-7"><p>{c.description}</p><div className="row g-2 small">{[['Code', c.code], ['Department', U.dept(c.department)], ['Semester', c.semester], ['Credits', c.credits], ['Category', c.category], ['Subject', c.subject]].map(([l, v]) => <div className="col-6" key={l}><div className="p-2 border rounded-3"><div className="xsmall text-muted">{l}</div><div className="fw-semibold">{v}</div></div></div>)}</div></div>
    <div className="col-md-5"><h3 className="h6 fw-semibold">Module completion by students</h3>{modules.map(m => { const done = students.filter(s => Store.us(s.id).completedModules.includes(m.id)).length; const pc = students.length ? Math.round(done / students.length * 100) : 0; return <div className="mb-2" key={m.id}><div className="d-flex justify-content-between xsmall mb-1"><span>M{m.order} · {m.title}</span><span>{pc}%</span></div><Progress value={pc} h={6} /></div>; })}</div></div>;
  else if (tab === 'students') body = <DataTable rows={students} empty="No students enrolled." cols={[{ label: 'Student', render: s => <div className="d-flex align-items-center gap-2"><Avatar user={s} size={30} /><div className="text-start"><div className="small fw-semibold">{s.name}</div><div className="xsmall text-muted">{s.email}</div></div></div> }, { label: 'ID', render: s => <span className="small">{s.studentId}</span> }, { label: 'Semester', render: s => s.semester }, { label: 'Progress', render: s => <div style={{ minWidth: 120 }}><Progress value={Domain.courseProgress(s.id, c.id)} h={6} /><span className="xsmall">{Domain.courseProgress(s.id, c.id)}%</span></div> }, { label: 'Status', render: s => <StatusBadge status={s.status} /> }]} />;
  else if (tab === 'materials') body = <>{mats.length ? mats.map(m => <div className="list-row" key={m.id}><div className="thumb-sm" style={{ width: 40, height: 40, fontSize: '1rem' }}><i className={U.fileIcon(m.fileType)} /></div><div className="min-w-0"><div className="small fw-semibold">{m.title}</div><div className="xsmall text-muted">{m.type} · {Store.find('courseModules', m.moduleId)?.title || 'General'} · {U.date(m.date)}</div></div><button className="btn btn-sm btn-light ms-auto" onClick={() => view(m.id)}>Preview</button></div>) : <Empty icon="folder2" title="No materials yet" />}
    <h3 className="h6 fw-semibold mt-4">Student notes for this course ({notes.length})</h3>{notes.map(n => <div className="list-row" key={n.id}><div className="min-w-0"><div className="small fw-semibold">{n.title}</div><div className="xsmall text-muted">{U.user(n.uploaderId)?.name} · {U.date(n.date)} · {n.downloads} downloads</div></div><span className="ms-auto"><StatusBadge status={n.status} /></span></div>)}
    <Link href="/faculty/materials" className="btn btn-primary btn-sm mt-3"><I n="cloud-arrow-up" className="me-1" />Manage materials</Link></>;
  else body = <><div className="d-flex justify-content-between align-items-center mb-3"><p className="small text-muted mb-0">Modules organise materials on the student course page.</p><button className="btn btn-primary btn-sm" onClick={addMod}><I n="plus-lg" className="me-1" />Add module</button></div>
    {modules.length ? modules.map(m => <div className="d-flex gap-3 p-3 border rounded-3 mb-2" key={m.id}><span className="badge badge-soft-primary align-self-start">M{m.order}</span><div className="flex-grow-1"><div className="fw-semibold small">{m.title}</div><div className="xsmall text-muted">{m.description}</div><div className="xsmall mt-1">{U.plural(mats.filter(x => x.moduleId === m.id).length, 'material')}</div></div><div className="d-flex gap-1 align-items-start"><button className="btn btn-sm btn-light" onClick={() => editMod(m)} aria-label="Edit module"><I n="pencil" /></button><button className="btn btn-sm btn-light text-danger" onClick={() => delMod(m)} aria-label="Delete module"><I n="trash" /></button></div></div>) : <Empty icon="layers" title="No modules yet" />}</>;
  return <>
    <PageHeader title="My Courses" subtitle="Assigned courses, enrolled students, materials and modules." />
    <div className="d-flex flex-wrap gap-2 mb-4">{courses.map(x => <button key={x.id} className={`btn ${x.id === c.id ? 'btn-primary' : 'btn-light'}`} onClick={() => { setSel(x.id); setTab('overview'); }}><strong>{x.code}</strong> · {x.title}</button>)}</div>
    <div className="row g-3 mb-4"><div className="col-6 col-lg-3"><Stat icon="people" label="Enrolled students" value={students.length} /></div><div className="col-6 col-lg-3"><Stat icon="layers" label="Modules" value={modules.length} tone="info" /></div><div className="col-6 col-lg-3"><Stat icon="folder2-open" label="Materials" value={mats.length} tone="purple" /></div><div className="col-6 col-lg-3"><Stat icon="journal-text" label="Student notes" value={notes.length} tone="success" /></div></div>
    <Tabs active={tab} onChange={setTab} items={[{ key: 'overview', label: 'Course details', icon: 'info-circle' }, { key: 'students', label: 'Enrolled students', icon: 'people', count: students.length }, { key: 'materials', label: 'Course materials', icon: 'folder2', count: mats.length }, { key: 'modules', label: 'Module management', icon: 'layers', count: modules.length }]} />
    <div className="card"><div className="card-body">{body}</div></div>
  </>;
}

/* ---------------- MATERIALS (faculty + reused by admin course manager) ---------------- */
export function useMaterialForm() {
  const me = useMe(); const { formModal, toast } = useUI();
  return (courses, m) => {
    const modOpts = courses.flatMap(c => [{ value: `${c.id}::`, label: `${c.code} · General (no module)` }, ...Store.where('courseModules', x => x.courseId === c.id).sort((a, b) => a.order - b.order).map(x => ({ value: `${c.id}::${x.id}`, label: `${c.code} · M${x.order} ${x.title}` }))]);
    formModal({ title: <><I n="cloud-arrow-up" className="me-2" />{m ? 'Edit material' : 'Upload academic material'}</>, size: 'lg', submitText: m ? 'Save changes' : 'Upload material',
      fields: [{ name: 'title', label: 'Title', required: true, minlength: 5, value: m?.title }, { name: 'place', label: 'Course & module', type: 'select', required: true, col: 'col-md-8', value: m ? `${m.courseId}::${m.moduleId || ''}` : '', options: modOpts }, { name: 'type', label: 'Type', type: 'select', required: true, col: 'col-md-4', value: m?.type || 'Lecture', options: ['Lecture', 'Presentation', 'Assignment', 'Reference'] }, { name: 'description', label: 'Description', type: 'textarea', rows: 2, required: true, value: m?.description }, { name: 'content', label: 'Preview text / summary', type: 'textarea', rows: 3, value: m?.content, help: 'Shown in the online preview when no PDF is attached.' },
        { name: 'file', label: m ? 'Replace file (optional)' : 'File', type: 'file', required: !m, accept: '.pdf,.docx,.pptx,.xlsx,.txt', exts: ['pdf', 'docx', 'pptx', 'xlsx', 'txt'], maxSize: 2 * 1024 * 1024, help: 'PDF, DOCX, PPTX, XLSX or TXT · max 2 MB (browser cache limit)' }],
      onSubmit: async v => {
        const [courseId, moduleId] = v.place.split('::');
        const data = { title: v.title, courseId, moduleId: moduleId || null, type: v.type, description: v.description, content: v.content };
        if (v.file) { const ext = v.file.name.split('.').pop().toLowerCase(); data.file = { name: v.file.name, type: v.file.type, dataUrl: await U.readFile(v.file), text: ext === 'txt' ? await U.readFile(v.file, 'text') : null }; data.fileType = ext.toUpperCase(); data.size = U.fmtSize(v.file.size); }
        if (m) { Store.update('studyMaterials', m.id, data); toast('Material updated.'); }
        else {
          const x = Store.add('studyMaterials', { ...data, uploadedBy: me.id, date: new Date().toISOString() }, 'sm'); if (!x) return false;
          const c = U.course(courseId);
          Domain.courseStudents(courseId).forEach(s => Store.notify(s.id, `New material in ${c.title}`, `${me.name} uploaded “${x.title}”.`, 'Academic', `/student/learning/courses/${courseId}`));
          toast('Material uploaded — students in the course were notified.');
        }
      } });
  };
}
export function FacultyMaterials() {
  const me = useMe(); const sp = useSearchParams(); const { confirm, toast } = useUI(); const { view } = useMaterialViewer(); const openForm = useMaterialForm();
  const courses = Domain.facultyCourses(me.id);
  const [f, setF] = useState({ course: '', type: '', q: sp.get('q') || '', group: true });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const list = Store.where('studyMaterials', m => courses.some(c => c.id === m.courseId) && (!f.course || m.courseId === f.course) && (!f.type || m.type === f.type) && U.match(f.q, m.title, m.description)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const del = m => confirm(`Delete “${m.title}”? Students will no longer see it.`, () => { Store.remove('studyMaterials', m.id); toast('Material deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  const cols = [{ label: 'Material', render: m => <div className="d-flex align-items-center gap-2 text-start"><div className="thumb-sm" style={{ width: 40, height: 40, fontSize: '1rem' }}><i className={U.fileIcon(m.fileType)} /></div><div><div className="small fw-semibold">{m.title}</div><div className="xsmall text-muted">{m.fileType} · {m.size}</div></div></div> },
    { label: 'Course', render: m => <span className="badge badge-soft-primary">{U.course(m.courseId)?.code}</span> }, { label: 'Module', render: m => <span className="small">{Store.find('courseModules', m.moduleId)?.title || 'General'}</span> }, { label: 'Type', render: m => <span className="small">{m.type}</span> }, { label: 'Uploaded', render: m => <span className="small">{U.date(m.date)}</span> },
    { label: '', render: m => <div className="d-flex gap-1 justify-content-end"><button className="btn btn-sm btn-light" onClick={() => view(m.id)} title="Preview"><I n="eye" /></button><button className="btn btn-sm btn-light" onClick={() => openForm(courses, m)} title="Edit"><I n="pencil" /></button><button className="btn btn-sm btn-light text-danger" onClick={() => del(m)} title="Delete"><I n="trash" /></button></div> }];
  return <>
    <PageHeader title="Course Materials" subtitle="Upload, edit and organise lecture materials by course and module."><button className="btn btn-primary" onClick={() => openForm(courses)}><I n="cloud-arrow-up" className="me-1" />Upload material</button></PageHeader>
    <div className="card mb-3"><div className="card-body py-2 d-flex flex-wrap gap-2 align-items-center"><SearchInput style={{ maxWidth: 260 }} value={f.q} onChange={v => set('q', v)} placeholder="Search materials…" /><Select value={f.course} onChange={v => set('course', v)} all="All my courses" options={courseOptions(courses)} /><Select value={f.type} onChange={v => set('type', v)} all="All types" options={['Lecture', 'Presentation', 'Assignment', 'Reference']} />
      <div className="form-check form-switch mb-0 ms-auto"><input className="form-check-input" type="checkbox" id="grp" checked={f.group} onChange={e => set('group', e.target.checked)} /><label className="form-check-label small" htmlFor="grp">Group by course</label></div></div></div>
    {f.group ? courses.filter(c => !f.course || c.id === f.course).map(c => { const rows = list.filter(m => m.courseId === c.id); return <Card key={c.id} className="mb-3" title={<>{c.code} · {c.title} <span className="text-muted fw-normal small">({rows.length})</span></>} bodyClass="p-0"><DataTable rows={rows} cols={cols.filter(x => x.label !== 'Course')} empty="No materials for this course." /></Card>; })
      : <div className="card"><div className="card-body p-0"><DataTable rows={list} cols={cols} empty="No materials match your filters." /></div></div>}
  </>;
}

/* ---------------- FACULTY QUIZZES (builder) ---------------- */
const blankQ = () => ({ id: uid('qq'), text: '', options: ['', '', '', ''], answer: 0, explanation: '' });
function QuizBuilder({ quiz, courses, onDone }) {
  const me = useMe(); const { toast } = useUI();
  const [meta, setMeta] = useState({ title: quiz?.title || '', courseId: quiz?.courseId || courses[0]?.id || '', difficulty: quiz?.difficulty || 'Medium', duration: String(quiz?.duration || 10), published: quiz ? quiz.published : false });
  const [qs, setQs] = useState(() => quiz ? Domain.questionsOf(quiz.id).map(q => ({ ...q, options: [...q.options] })) : [blankQ()]);
  const [err, setErr] = useState('');
  const upd = (i, k, v) => setQs(list => list.map((q, j) => j === i ? { ...q, [k]: v } : q));
  const updOpt = (i, k, v) => setQs(list => list.map((q, j) => j === i ? { ...q, options: q.options.map((o, x) => x === k ? v : o) } : q));
  const save = publish => {
    if (meta.title.trim().length < 4) return setErr('Quiz title must be at least 4 characters.');
    if (!meta.courseId) return setErr('Choose a course.');
    if (+meta.duration < 1) return setErr('Duration must be at least 1 minute.');
    if (!qs.length) return setErr('Add at least one question.');
    const bad = qs.findIndex(q => !q.text.trim() || q.options.some(o => !o.trim()));
    if (bad > -1) return setErr(`Question ${bad + 1}: fill in the question and all four options.`);
    const c = U.course(meta.courseId);
    const data = { title: meta.title.trim(), courseId: meta.courseId, subject: c.subject, difficulty: meta.difficulty, duration: +meta.duration, published: publish ?? meta.published };
    let id = quiz?.id;
    if (id) Store.update('quizzes', id, data); else id = Store.add('quizzes', { ...data, createdBy: me.id, date: new Date().toISOString() }, 'qz').id;
    Store.removeWhere('quizQuestions', q => q.quizId === id);
    const all = Store.all('quizQuestions'); qs.forEach(q => all.push({ id: q.id, quizId: id, text: q.text.trim(), options: q.options.map(o => o.trim()), answer: +q.answer, explanation: q.explanation.trim() || 'No explanation provided.' })); Store.save('quizQuestions', data.title);
    if (data.published && !(quiz && quiz.published)) Domain.courseStudents(meta.courseId).forEach(s => Store.notify(s.id, 'New practice quiz', `“${data.title}” is now available for ${c.code}.`, 'Academic', '/student/quizzes'));
    toast(data.published ? 'Quiz saved and published to students.' : 'Quiz saved as draft.');
    onDone();
  };
  return <div>
    {err && <div className="alert alert-danger small">{err}</div>}
    <div className="row g-3 mb-3">
      <div className="col-md-6"><label className="form-label">Quiz title *</label><input className="form-control" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} /></div>
      <div className="col-md-6"><label className="form-label">Course *</label><select className="form-select" value={meta.courseId} onChange={e => setMeta({ ...meta, courseId: e.target.value })}>{courses.map(c => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}</select></div>
      <div className="col-md-4"><label className="form-label">Difficulty</label><select className="form-select" value={meta.difficulty} onChange={e => setMeta({ ...meta, difficulty: e.target.value })}>{['Easy', 'Medium', 'Hard'].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="col-md-4"><label className="form-label">Duration (minutes) *</label><input type="number" min={1} className="form-control" value={meta.duration} onChange={e => setMeta({ ...meta, duration: e.target.value })} /></div>
      <div className="col-md-4 d-flex align-items-end"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="pub" checked={meta.published} onChange={e => setMeta({ ...meta, published: e.target.checked })} /><label className="form-check-label" htmlFor="pub">Published</label></div></div></div>
    {qs.map((q, i) => <div className="border rounded-3 p-3 mb-3" key={q.id}>
      <div className="d-flex justify-content-between align-items-center mb-2"><strong className="small">Question {i + 1}</strong><button className="btn btn-sm btn-light text-danger" onClick={() => setQs(qs.filter((_, j) => j !== i))} disabled={qs.length === 1}><I n="trash" /></button></div>
      <textarea className="form-control mb-2" rows={2} placeholder="Question text" value={q.text} onChange={e => upd(i, 'text', e.target.value)} />
      {q.options.map((o, k) => <div className="input-group input-group-sm mb-2" key={k}><span className="input-group-text"><input className="form-check-input mt-0" type="radio" name={'ans' + q.id} checked={+q.answer === k} onChange={() => upd(i, 'answer', k)} aria-label={`Mark option ${'ABCD'[k]} correct`} /></span><span className="input-group-text">{'ABCD'[k]}</span><input className="form-control" placeholder={`Option ${'ABCD'[k]}`} value={o} onChange={e => updOpt(i, k, e.target.value)} /></div>)}
      <input className="form-control form-control-sm" placeholder="Explanation shown after submission" value={q.explanation} onChange={e => upd(i, 'explanation', e.target.value)} />
      <div className="xsmall text-muted mt-1">Select the radio button next to the correct answer.</div></div>)}
    <button className="btn btn-soft btn-sm mb-3" onClick={() => setQs([...qs, blankQ()])}><I n="plus-lg" className="me-1" />Add question</button>
    <div className="d-flex justify-content-end gap-2 border-top pt-3"><button className="btn btn-light" onClick={onDone}>Cancel</button><button className="btn btn-light" onClick={() => save(false)}>Save as draft</button><button className="btn btn-primary" onClick={() => save(true)}><I n="send" className="me-1" />Save & publish</button></div>
  </div>;
}
export function FacultyQuizzes() {
  const me = useMe(); const { openModal, closeModal, confirm, toast } = useUI();
  const courses = Domain.facultyCourses(me.id);
  const quizzes = Store.where('quizzes', q => q.createdBy === me.id || courses.some(c => c.id === q.courseId)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const open = quiz => openModal({ title: <><I n="patch-plus" className="me-2" />{quiz ? 'Edit quiz' : 'Create quiz'}</>, size: 'xl', body: <QuizBuilder quiz={quiz} courses={courses} onDone={closeModal} /> });
  const del = q => confirm(`Delete “${q.title}” and all its questions? Student attempts will be kept.`, () => { Store.remove('quizzes', q.id); Store.removeWhere('quizQuestions', x => x.quizId === q.id); toast('Quiz deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  const togglePub = q => { Store.update('quizzes', q.id, { published: !q.published }); toast(q.published ? 'Quiz unpublished.' : 'Quiz published to students.'); };
  return <>
    <PageHeader title="Quizzes" subtitle="Create practice quizzes, set correct answers and publish them to students."><button className="btn btn-primary" onClick={() => open()}><I n="plus-lg" className="me-1" />Create quiz</button></PageHeader>
    <div className="card"><div className="card-body p-0"><DataTable rows={quizzes} empty="You have not created any quizzes." cols={[
      { label: 'Quiz', render: q => <div className="text-start"><div className="small fw-semibold">{q.title}</div><div className="xsmall text-muted">{U.course(q.courseId)?.code} · {q.difficulty}</div></div> },
      { label: 'Questions', render: q => Domain.questionsOf(q.id).length }, { label: 'Duration', render: q => `${q.duration} min` },
      { label: 'Attempts', render: q => { const at = Store.where('quizAttempts', a => a.quizId === q.id); return <span className="small">{at.length}{at.length > 0 && ` · avg ${Math.round(at.reduce((s, a) => s + a.score / a.total, 0) / at.length * 100)}%`}</span>; } },
      { label: 'Status', render: q => <StatusBadge status={q.published ? 'published' : 'draft'} /> },
      { label: '', render: q => <div className="d-flex gap-1 justify-content-end"><button className="btn btn-sm btn-light" onClick={() => togglePub(q)}>{q.published ? 'Unpublish' : 'Publish'}</button><button className="btn btn-sm btn-light" onClick={() => open(q)} title="Edit"><I n="pencil" /></button><button className="btn btn-sm btn-light text-danger" onClick={() => del(q)} title="Delete"><I n="trash" /></button></div> }]} /></div></div>
  </>;
}

/* ---------------- STUDENT DIRECTORY (faculty) ---------------- */
export function useStudentProfile() {
  const { openModal } = useUI();
  return s => {
    const b = Scoring.breakdown(s.id);
    const attempts = Store.where('quizAttempts', a => a.userId === s.id);
    const avg = attempts.length ? Math.round(attempts.reduce((x, a) => x + a.score / a.total, 0) / attempts.length * 100) : 0;
    openModal({ title: 'Student profile', size: 'lg', body: <>
      <div className="d-flex align-items-center gap-3 mb-3"><Avatar user={s} size={64} /><div><h3 className="h5 fw-bold mb-0">{s.name}</h3><div className="small text-muted">{s.studentId} · {U.dept(s.department)} · Semester {s.semester}</div><div className="small text-muted">{s.email}</div></div><span className="ms-auto"><StatusBadge status={s.status} /></span></div>
      <p className="small">{s.bio}</p><div className="d-flex flex-wrap gap-1 mb-3">{(s.skills || []).map(k => <span className="chip" key={k}>{k}</span>)}</div>
      <div className="row g-2 mb-3">{[['Points', b.total], ['Rank', '#' + Scoring.rankOf(s.id)], ['Quiz average', avg + '%'], ['Notes', Store.where('notes', n => n.uploaderId === s.id).length]].map(([l, v]) => <div className="col-6 col-md-3" key={l}><div className="p-2 border rounded-3 text-center"><div className="fw-bold">{v}</div><div className="xsmall text-muted">{l}</div></div></div>)}</div>
      <h4 className="h6 fw-semibold">Enrolled courses</h4><div className="d-flex flex-wrap gap-2 mb-3">{(s.courses || []).map(c => <span className="badge badge-soft-primary" key={c}>{U.course(c)?.code} · {Domain.courseProgress(s.id, c)}%</span>)}</div>
      <h4 className="h6 fw-semibold">Academic activity</h4>
      {[...Store.where('notes', n => n.uploaderId === s.id).map(n => ({ d: n.date, t: `Uploaded notes “${n.title}”` })), ...attempts.map(a => ({ d: a.date, t: `Scored ${a.score}/${a.total} on “${Store.find('quizzes', a.quizId)?.title}”` })), ...Store.where('achievements', a => a.studentId === s.id).map(a => ({ d: a.submittedAt, t: `Achievement “${a.title}” (${a.status})` }))].sort((a, b) => new Date(b.d) - new Date(a.d)).slice(0, 8).map((x, i) => <div className="small border-bottom py-1" key={i}>{x.t} <span className="xsmall text-muted">· {U.ago(x.d)}</span></div>)}
    </> });
  };
}
export function FacultyStudents() {
  const me = useMe(); const sp = useSearchParams(); const showProfile = useStudentProfile();
  const courses = Domain.facultyCourses(me.id);
  const [f, setF] = useState({ q: sp.get('q') || '', dept: '', sem: '', mine: true, course: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const list = Store.where('users', u => u.role === 'student' && (!f.mine || (u.courses || []).some(c => courses.some(x => x.id === c))) && (!f.course || (u.courses || []).includes(f.course)) && (!f.dept || u.department === f.dept) && (!f.sem || u.semester === +f.sem) && U.match(f.q, u.name, u.studentId, u.email));
  return <>
    <PageHeader title="Students" subtitle="Browse student profiles and academic activity." />
    <div className="card mb-3"><div className="card-body py-2 d-flex flex-wrap gap-2 align-items-center"><SearchInput style={{ maxWidth: 260 }} value={f.q} onChange={v => set('q', v)} placeholder="Search name, ID or email…" /><Select value={f.dept} onChange={v => set('dept', v)} all="All departments" options={deptOptions()} /><Select value={f.sem} onChange={v => set('sem', v)} all="All semesters" options={semOptions()} /><Select value={f.course} onChange={v => set('course', v)} all="Any of my courses" options={courseOptions(courses)} />
      <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" id="mineS" checked={f.mine} onChange={e => set('mine', e.target.checked)} /><label className="form-check-label small" htmlFor="mineS">Only my students</label></div></div></div>
    <div className="card"><div className="card-body p-0"><DataTable rows={list} empty="No students match these filters." cols={[
      { label: 'Student', render: s => <div className="d-flex align-items-center gap-2 text-start"><Avatar user={s} size={34} /><div><div className="small fw-semibold">{s.name}</div><div className="xsmall text-muted">{s.email}</div></div></div> },
      { label: 'ID', render: s => <span className="small">{s.studentId}</span> }, { label: 'Department', render: s => <span className="small">{U.dept(s.department)}</span> }, { label: 'Sem', render: s => s.semester },
      { label: 'My courses', render: s => <div className="d-flex flex-wrap gap-1">{(s.courses || []).filter(c => courses.some(x => x.id === c)).map(c => <span className="badge badge-soft-primary" key={c}>{U.course(c)?.code}</span>)}</div> },
      { label: 'Points', render: s => Scoring.breakdown(s.id).total }, { label: '', render: s => <button className="btn btn-sm btn-light" onClick={() => showProfile(s)}>View profile</button> }]} /></div></div>
  </>;
}

/* ---------------- FACULTY PROFILE ---------------- */
export function FacultyProfile() {
  const me = useMe(); const { toast } = useUI();
  const courses = Domain.facultyCourses(me.id);
  return <>
    <div className="card mb-4 overflow-hidden"><div style={{ height: 100, background: 'linear-gradient(120deg,#312e81,#4338ca 60%,#7c3aed)' }} /><div className="card-body pt-0 px-4"><div className="d-flex flex-wrap align-items-end gap-3" style={{ marginTop: -44 }}><Avatar user={me} size={96} className="avatar-ring" /><div className="pb-2"><h1 className="h3 fw-bold mb-0">{me.name}</h1><div className="text-muted small">{me.designation} · {U.dept(me.department)}</div></div></div>
      <div className="d-flex flex-wrap gap-4 small text-muted mt-3"><span><I n="envelope" className="me-1" />{me.email}</span><span><I n="telephone" className="me-1" />{me.phone}</span><span><I n="geo-alt" className="me-1" />{me.office}</span><span><I n="clock" className="me-1" />{me.officeHours}</span></div></div></div>
    <div className="row g-4"><div className="col-lg-7"><Card title="Edit profile"><Form submitText="Save profile" footerClass="mt-3" fields={[
      { name: 'name', label: 'Full name', required: true, value: me.name, col: 'col-md-6' }, { name: 'designation', label: 'Designation', type: 'select', required: true, value: me.designation, col: 'col-md-6', options: ['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'] },
      { name: 'department', label: 'Department', type: 'select', required: true, value: me.department, col: 'col-md-6', options: deptOptions() }, { name: 'email', label: 'Email', value: me.email, disabled: true, col: 'col-md-6' },
      { name: 'phone', label: 'Phone', type: 'tel', value: me.phone, col: 'col-md-6' }, { name: 'office', label: 'Office', value: me.office, col: 'col-md-6' }, { name: 'officeHours', label: 'Office hours', value: me.officeHours }, { name: 'bio', label: 'Bio', type: 'textarea', rows: 3, value: me.bio }, { name: 'avatarColor', label: 'Avatar colour', type: 'color', value: me.avatarColor, col: 'col-md-6' }]}
      onSubmit={v => { const { email, ...rest } = v; Store.update('users', me.id, rest); toast('Profile saved.'); }} /></Card></div>
      <div className="col-lg-5"><Card title="Assigned courses" bodyClass="py-1">{courses.map(c => <Link key={c.id} href={`/faculty/courses?c=${c.id}`} className="list-row text-reset"><span className="badge badge-soft-primary">{c.code}</span><div className="min-w-0"><div className="small fw-semibold">{c.title}</div><div className="xsmall text-muted">Semester {c.semester} · {Domain.courseStudents(c.id).length} students</div></div></Link>)}</Card></div></div>
  </>;
}
