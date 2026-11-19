'use client';
/* STUDENT — Learning Hub, Course details, Notes library, Note reader, Upload notes */
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Domain, Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import { Avatar, Card, Chips, Empty, I, Loading, PageHeader, Pager, paginate, Progress, SearchInput, Select, Stars, StatusBadge, Tabs } from '@/components/ui';
import { courseOptions, deptOptions, semOptions, useMaterialViewer, useReport } from '../shared';

/* ---------- shared pieces ---------- */
function CourseCard({ c, me }) {
  const notes = Store.where('notes', n => n.courseId === c.id && n.status === 'approved').length;
  const mats = Store.where('studyMaterials', m => m.courseId === c.id).length;
  const enrolled = (me.courses || []).includes(c.id);
  const pc = Domain.courseProgress(me.id, c.id);
  const fac = U.user(c.facultyId);
  return <div className="col-md-6 col-xl-4"><Link href={`/student/learning/courses/${c.id}`} className="card h-100 course-card hover-lift text-reset">
    <div className="course-top" style={{ background: U.deptColor(c.department) }} />
    <div className="card-body d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-1"><span className="code">{c.code}</span><span className={`badge badge-soft-${c.category === 'Core' ? 'primary' : c.category === 'Elective' ? 'info' : c.category === 'Lab' ? 'warning' : 'secondary'}`}>{c.category}</span></div>
      <h3 className="h6 fw-semibold">{c.title}</h3>
      <p className="small text-muted flex-grow-1">{U.truncate(c.description, 110)}</p>
      <div className="d-flex align-items-center gap-2 small mb-3"><Avatar user={fac} size={26} /><span className="text-truncate">{fac?.name || 'TBA'}</span></div>
      {enrolled && <div className="mb-3"><div className="d-flex justify-content-between xsmall mb-1"><span>Your progress</span><span>{pc}%</span></div><Progress value={pc} h={5} /></div>}
      <div className="d-flex flex-wrap gap-2 xsmall text-muted border-top pt-2"><span><I n="journal-text" /> {notes} notes</span><span><I n="folder2" /> {mats} materials</span><span><I n="layers" /> Sem {c.semester}</span><span>{U.deptCode(c.department)}</span>{enrolled && <span className="ms-auto text-success fw-semibold"><I n="check-circle" /> Enrolled</span>}</div>
    </div></Link></div>;
}

function useNoteActions() {
  const me = useMe(); const { toast } = useUI();
  return {
    bookmark(id) { const a = Store.toggleUs(me.id, 'bookmarks', id); toast(a ? 'Note bookmarked.' : 'Bookmark removed.', a ? 'success' : 'info'); },
    download(id) {
      const n = Store.find('notes', id);
      Store.update('notes', id, x => { x.downloads++; });
      if (n.file && n.file.dataUrl) U.download(n.file.name, n.file.dataUrl);
      else U.download(U.slug(n.title) + '.html', `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${n.title}</title><style>body{font-family:system-ui;max-width:760px;margin:40px auto;line-height:1.7;padding:0 16px}</style></head><body><h1>${n.title}</h1><p><em>${n.description}</em></p><p>Course: ${U.course(n.courseId)?.code} · Author: ${U.user(n.uploaderId)?.name}</p><hr>${n.content || ''}<hr><small>Downloaded from University Student Hub (demo)</small></body></html>`, 'text/html');
      toast('Download started.');
    }
  };
}

export function NoteCard({ n, me }) {
  const act = useNoteActions();
  const bm = Store.us(me.id).bookmarks.includes(n.id);
  const author = U.user(n.uploaderId) || { name: 'Unknown' };
  return <div className="col-md-6 col-xl-4"><div className="card h-100"><div className="card-body d-flex flex-column">
    <div className="d-flex gap-3 mb-2"><div className="thumb-sm"><i className={U.fileIcon(n.fileType)} /></div><div className="min-w-0">
      <Link href={`/student/learning/notes/${n.id}`} className="fw-semibold text-reset d-block lh-sm mb-1">{n.title}</Link>
      <div className="d-flex flex-wrap gap-1"><span className="badge badge-soft-primary">{n.subject}</span><span className="badge badge-soft-secondary">Sem {n.semester}</span>{n.status !== 'approved' && <StatusBadge status={n.status} />}</div></div></div>
    <p className="small text-muted flex-grow-1 mb-2">{U.truncate(n.description, 110)}</p>
    <div className="xsmall text-muted mb-2">{U.course(n.courseId)?.code} · {n.fileType} · {n.size}</div>
    <div className="d-flex align-items-center gap-2 small mb-3"><Avatar user={author} size={24} /><span className="text-truncate">{author.name}</span><span className="text-muted ms-auto text-nowrap xsmall">{U.date(n.date)}</span></div>
    <div className="d-flex align-items-center justify-content-between border-top pt-2"><span className="small"><Stars value={U.avgRating(n)} /> <span className="text-muted xsmall">({n.ratings.length})</span></span><span className="xsmall text-muted"><I n="download" /> {n.downloads}</span></div>
    <div className="d-flex gap-2 mt-2">
      <Link href={`/student/learning/notes/${n.id}`} className="btn btn-sm btn-primary flex-grow-1"><I n="book" className="me-1" />Read online</Link>
      <button className="btn btn-sm btn-light" onClick={() => act.download(n.id)} title="Download" aria-label="Download"><I n="download" /></button>
      <button className={`btn btn-sm btn-light ${bm ? 'text-primary' : ''}`} onClick={() => act.bookmark(n.id)} title={bm ? 'Remove bookmark' : 'Bookmark'} aria-label="Bookmark"><I n={`bookmark${bm ? '-fill' : ''}`} /></button>
    </div></div></div></div>;
}

/* ---------------- LEARNING HUB ---------------- */
export function LearningHub() {
  const me = useMe();
  const { view } = useMaterialViewer();
  const blank = { q: '', dept: '', sem: '', subject: '', cat: '', mine: false };
  const [f, setF] = useState(blank);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const subjects = [...new Set(Store.all('courses').map(c => c.subject))].sort();
  const list = Store.where('courses', c => (!f.cat || c.category === f.cat) && (!f.dept || c.department === f.dept) && (!f.sem || c.semester === +f.sem) && (!f.subject || c.subject === f.subject) && (!f.mine || me.courses.includes(c.id)) && U.match(f.q, c.title, c.code, c.description, c.subject));
  const recent = [...Store.where('notes', n => n.status === 'approved').map(n => ({ kind: 'note', id: n.id, title: n.title, date: n.date, course: n.courseId, by: n.uploaderId, ft: n.fileType })),
    ...Store.all('studyMaterials').map(m => ({ kind: 'mat', id: m.id, title: m.title, date: m.date, course: m.courseId, by: m.uploadedBy, ft: m.fileType, type: m.type }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const popular = Store.where('notes', n => n.status === 'approved').sort((a, b) => b.downloads - a.downloads).slice(0, 5);
  return <>
    <PageHeader title="Academic Learning Hub" subtitle="Browse courses, lecture materials and peer notes across every department.">
      <Link href="/student/learning/notes" className="btn btn-light"><I n="journal-text" className="me-1" />Notes library</Link><Link href="/student/learning/upload" className="btn btn-primary"><I n="cloud-arrow-up" className="me-1" />Upload notes</Link></PageHeader>
    <div className="card mb-4"><div className="card-body">
      <div className="mb-3"><Chips items={['Core', 'Elective', 'Lab', 'General'].map(c => ({ value: c, label: `${c} (${Store.where('courses', x => x.category === c).length})` }))} active={f.cat} onChange={v => set('cat', v)} /></div>
      <div className="row g-2">
        <div className="col-lg-4"><SearchInput value={f.q} onChange={v => set('q', v)} placeholder="Search courses by name, code or topic…" /></div>
        <div className="col-6 col-lg-2"><Select className="form-select" value={f.dept} onChange={v => set('dept', v)} all="All departments" options={deptOptions()} /></div>
        <div className="col-6 col-lg-2"><Select className="form-select" value={f.sem} onChange={v => set('sem', v)} all="All semesters" options={semOptions()} /></div>
        <div className="col-6 col-lg-2"><Select className="form-select" value={f.subject} onChange={v => set('subject', v)} all="All subjects" options={subjects} /></div>
        <div className="col-6 col-lg-2 d-flex align-items-center"><div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" id="mineOnly" checked={f.mine} onChange={e => set('mine', e.target.checked)} /><label className="form-check-label small" htmlFor="mineOnly">My courses only</label></div></div>
      </div></div></div>
    <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h6 fw-semibold mb-0">Courses <span className="text-muted fw-normal">{U.plural(list.length, 'course')}</span></h2><button className="btn btn-sm btn-link" onClick={() => setF(blank)}>Reset filters</button></div>
    <div className="row g-3 mb-4">{list.length ? list.map(c => <CourseCard key={c.id} c={c} me={me} />) : <div className="col-12"><Empty icon="search" title="No courses match your filters" text="Try clearing a filter or searching a different keyword."><button className="btn btn-sm btn-primary" onClick={() => setF(blank)}>Clear filters</button></Empty></div>}</div>
    <div className="row g-4">
      <div className="col-lg-7"><Card title={<><I n="clock-history" className="me-2 text-primary" />Recently uploaded materials</>} bodyClass="py-1">{recent.map(r => <div className="list-row" key={r.kind + r.id}><div className="thumb-sm" style={{ width: 42, height: 42, fontSize: '1.1rem' }}><i className={U.fileIcon(r.ft)} /></div><div className="min-w-0"><div className="small fw-semibold text-truncate">{r.title}</div><div className="xsmall text-muted">{U.course(r.course)?.code} · {r.kind === 'note' ? 'Student note' : r.type} · {U.user(r.by)?.name} · {U.ago(r.date)}</div></div>
        {r.kind === 'note' ? <Link href={`/student/learning/notes/${r.id}`} className="btn btn-sm btn-light ms-auto">Open</Link> : <button className="btn btn-sm btn-light ms-auto" onClick={() => view(r.id)}>Preview</button>}</div>)}</Card></div>
      <div className="col-lg-5"><Card title={<><I n="fire" className="me-2 text-danger" />Popular study resources</>} bodyClass="py-1">{popular.map((n, i) => <Link href={`/student/learning/notes/${n.id}`} className="list-row text-reset" key={n.id}><span className={`rank-pill ${i < 3 ? 'soft-warning' : ''}`}>{i + 1}</span><div className="min-w-0"><div className="small fw-semibold text-truncate">{n.title}</div><div className="xsmall text-muted"><Stars value={U.avgRating(n)} /> · {n.downloads} downloads</div></div></Link>)}</Card></div>
    </div>
  </>;
}

/* ---------------- COURSE DETAILS ---------------- */
export function CourseDetails() {
  const me = useMe();
  const { courseId } = useParams();
  const sp = useSearchParams();
  const { toast } = useUI();
  const { view, download } = useMaterialViewer();
  const [tab, setTab] = useState(sp.get('tab') || 'modules');
  const c = U.course(courseId);
  if (!c) return <Empty icon="journal-x" title="Course not found" text="This course may have been removed."><Link className="btn btn-primary" href="/student/learning">Back to Learning Hub</Link></Empty>;
  const fac = U.user(c.facultyId);
  const modules = Store.where('courseModules', m => m.courseId === c.id).sort((a, b) => a.order - b.order);
  const mats = Store.where('studyMaterials', m => m.courseId === c.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const notes = Store.where('notes', n => n.courseId === c.id && n.status === 'approved');
  const assigns = Store.where('assignments', a => a.courseId === c.id);
  const us = Store.us(me.id);
  const pc = Domain.courseProgress(me.id, c.id);
  const enrolled = me.courses.includes(c.id);
  const byType = t => mats.filter(m => m.type === t);
  const toggleModule = mid => { const d = Store.toggleUs(me.id, 'completedModules', mid); if (d) Domain.logActivity(me.id, 0.5); toast(d ? 'Module marked as complete. 🎉' : 'Module marked as not complete.', d ? 'success' : 'info'); };
  const MatRow = ({ m }) => <div className="list-row"><div className="thumb-sm" style={{ width: 42, height: 42, fontSize: '1.1rem' }}><i className={U.fileIcon(m.fileType)} /></div><div className="min-w-0"><div className="small fw-semibold">{m.title}</div><div className="xsmall text-muted">{m.type} · {m.fileType} · {m.size} · {U.date(m.date)}</div></div>
    <div className="ms-auto d-flex gap-1"><button className="btn btn-sm btn-light" onClick={() => view(m.id)}><I n="eye" /><span className="d-none d-md-inline ms-1">View</span></button><button className="btn btn-sm btn-light" onClick={() => download(m)} aria-label="Download"><I n="download" /></button></div></div>;
  const openMod = modules[0]?.id;
  let body;
  if (tab === 'modules') body = modules.length ? <ModuleAccordion modules={modules} mats={mats} us={us} onToggle={toggleModule} MatRow={MatRow} initial={openMod} /> : <Empty icon="layers" title="No modules yet" text="The instructor has not published modules for this course." />;
  else if (tab === 'notes') body = notes.length ? <div className="row g-3">{notes.map(n => <NoteCard key={n.id} n={n} me={me} />)}</div> : <Empty icon="journal" title="No student notes yet" text="Be the first to share notes for this course."><Link className="btn btn-sm btn-primary" href={`/student/learning/upload?course=${c.id}`}>Upload notes</Link></Empty>;
  else if (tab === 'Assignment') body = (assigns.length || byType('Assignment').length) ? <>
    {assigns.length > 0 && <><h3 className="h6 fw-semibold">Graded assignments</h3>{assigns.map(a => <div className="list-row" key={a.id}><div className="thumb-sm soft-warning" style={{ width: 42, height: 42, fontSize: '1.1rem' }}><I n="clipboard-check" /></div><div className="min-w-0"><div className="small fw-semibold">{a.title}</div><div className="xsmall text-muted">{a.description} · {a.maxMarks} marks</div></div><div className="ms-auto text-end xsmall">{U.dateTime(a.dueDate)}<br />{us.submittedAssignments.includes(a.id) ? <span className="text-success">Submitted</span> : null}</div></div>)}</>}
    {byType('Assignment').length > 0 && <><h3 className="h6 fw-semibold mt-4">Assignment briefs</h3>{byType('Assignment').map(m => <MatRow key={m.id} m={m} />)}</>}</> : <Empty icon="clipboard" title="No assignments" />;
  else body = byType(tab).length ? byType(tab).map(m => <MatRow key={m.id} m={m} />) : <Empty icon="folder2" title={`No ${tab.toLowerCase()} materials yet`} />;
  return <>
    <div className="card mb-4 overflow-hidden"><div className="course-top" style={{ height: 8, background: U.deptColor(c.department) }} /><div className="card-body p-4"><div className="row g-4 align-items-center">
      <div className="col-lg-8"><div className="d-flex flex-wrap gap-2 mb-2"><span className="badge badge-soft-primary">{c.code}</span><span className="badge badge-soft-secondary">{c.category}</span><span className="badge badge-soft-info">{U.dept(c.department)}</span><span className="badge badge-soft-secondary">Semester {c.semester}</span><span className="badge badge-soft-secondary">{c.credits} credits</span></div>
        <h1 className="h3 fw-bold mb-2">{c.title}</h1><p className="text-muted mb-3">{c.description}</p>
        <div className="d-flex align-items-center gap-2"><Avatar user={fac} size={40} /><div className="small"><div className="fw-semibold">{fac?.name || 'TBA'}</div><div className="text-muted">{fac?.designation} · {fac?.office}</div></div>{fac && <span className="small text-muted ms-3 d-none d-md-inline"><I n="clock" className="me-1" />Office hours: {fac.officeHours}</span>}</div></div>
      <div className="col-lg-4">{enrolled ? <div className="p-3 rounded-3 soft-primary"><div className="d-flex justify-content-between small fw-semibold mb-2"><span>Your progress</span><span>{pc}%</span></div><Progress value={pc} /><div className="xsmall mt-2">{us.completedModules.filter(id => modules.some(m => m.id === id)).length} of {modules.length} modules completed</div></div> : <div className="p-3 rounded-3 soft-secondary small"><I n="info-circle" className="me-1" />You are not enrolled in this course, but you can browse its materials.</div>}
        <div className="d-flex gap-2 mt-3"><Link href={`/student/learning/upload?course=${c.id}`} className="btn btn-primary btn-sm flex-grow-1"><I n="cloud-arrow-up" className="me-1" />Share notes</Link><Link href={`/student/quizzes?course=${c.id}`} className="btn btn-light btn-sm flex-grow-1"><I n="patch-question" className="me-1" />Quizzes</Link></div></div>
    </div></div></div>
    <Tabs active={tab} onChange={setTab} items={[{ key: 'modules', label: 'Modules', icon: 'layers', count: modules.length }, { key: 'Lecture', label: 'Lecture materials', icon: 'easel', count: byType('Lecture').length }, { key: 'Presentation', label: 'Presentations', icon: 'file-slides', count: byType('Presentation').length }, { key: 'Assignment', label: 'Assignments', icon: 'clipboard-check', count: byType('Assignment').length + assigns.length }, { key: 'Reference', label: 'References', icon: 'bookmarks', count: byType('Reference').length }, { key: 'notes', label: 'Student notes', icon: 'journal-text', count: notes.length }]} />
    <div className="card"><div className="card-body">{body}</div></div>
  </>;
}

function ModuleAccordion({ modules, mats, us, onToggle, MatRow, initial }) {
  const [open, setOpen] = useState(initial);
  return <div className="accordion">{modules.map(m => {
    const done = us.completedModules.includes(m.id); const mm = mats.filter(x => x.moduleId === m.id); const isOpen = open === m.id;
    return <div className="accordion-item" key={m.id}><h3 className="accordion-header"><button className={`accordion-button ${isOpen ? '' : 'collapsed'}`} type="button" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen}>
      <span className={`badge ${done ? 'bg-success' : 'badge-soft-primary'} me-2`}>{done ? <I n="check-lg" /> : 'M' + m.order}</span><span className={done ? 'module-done' : ''}>{m.title}</span><span className="ms-auto me-3 xsmall text-muted">{U.plural(mm.length, 'item')}</span></button></h3>
      {isOpen && <div className="accordion-collapse"><div className="accordion-body"><p className="small text-muted">{m.description}</p>{mm.length ? mm.map(x => <MatRow key={x.id} m={x} />) : <p className="small text-muted mb-2">No materials uploaded for this module yet.</p>}
        <button className={`btn btn-sm ${done ? 'btn-light' : 'btn-soft'} mt-2`} onClick={() => onToggle(m.id)}><I n={done ? 'arrow-counterclockwise' : 'check2-circle'} className="me-1" />{done ? 'Mark as not complete' : 'Mark module complete'}</button></div></div>}</div>;
  })}</div>;
}

/* ---------------- NOTES LIBRARY ---------------- */
export function NotesLibrary() {
  const me = useMe();
  const sp = useSearchParams();
  const [f, setF] = useState({ q: '', course: '', sem: '', type: '', sort: 'newest', tab: sp.get('tab') || 'all', page: 1 });
  const set = (k, v) => setF(p => ({ ...p, [k]: v, page: k === 'page' ? v : 1 }));
  const us = Store.us(me.id);
  let list = Domain.visibleNotes(me).filter(n => (!f.course || n.courseId === f.course) && (!f.sem || n.semester === +f.sem) && (!f.type || n.fileType === f.type)
    && U.match(f.q, n.title, n.description, n.subject, (n.tags || []).join(' '), U.user(n.uploaderId)?.name)
    && (f.tab === 'all' || (f.tab === 'saved' && us.bookmarks.includes(n.id)) || (f.tab === 'mine' && n.uploaderId === me.id)));
  const sorts = { newest: (a, b) => new Date(b.date) - new Date(a.date), rating: (a, b) => U.avgRating(b) - U.avgRating(a), downloads: (a, b) => b.downloads - a.downloads, title: (a, b) => a.title.localeCompare(b.title) };
  list = list.sort(sorts[f.sort]);
  const pg = paginate(list, f.page, 9);
  return <>
    <PageHeader title="Notes Library" subtitle="Peer-reviewed notes shared by students across the university."><Link href="/student/learning/upload" className="btn btn-primary"><I n="cloud-arrow-up" className="me-1" />Upload notes</Link></PageHeader>
    <Tabs active={f.tab} onChange={v => set('tab', v)} items={[{ key: 'all', label: 'All notes', icon: 'journals', count: Domain.visibleNotes(me).length }, { key: 'saved', label: 'Bookmarked', icon: 'bookmark-star', count: us.bookmarks.length }, { key: 'mine', label: 'My uploads', icon: 'person', count: Store.where('notes', n => n.uploaderId === me.id).length }]} />
    <div className="card mb-3"><div className="card-body"><div className="row g-2">
      <div className="col-lg-4"><SearchInput value={f.q} onChange={v => set('q', v)} placeholder="Search title, subject, tag or author…" /></div>
      <div className="col-6 col-lg-3"><Select className="form-select" value={f.course} onChange={v => set('course', v)} all="All courses" options={courseOptions()} /></div>
      <div className="col-6 col-lg-2"><Select className="form-select" value={f.sem} onChange={v => set('sem', v)} all="All semesters" options={semOptions()} /></div>
      <div className="col-6 col-lg-1"><Select className="form-select" value={f.type} onChange={v => set('type', v)} all="Type" options={['PDF', 'DOCX', 'PPTX', 'TXT', 'MD']} /></div>
      <div className="col-6 col-lg-2"><Select className="form-select" value={f.sort} onChange={v => set('sort', v)} label="Sort" options={[{ value: 'newest', label: 'Newest first' }, { value: 'rating', label: 'Top rated' }, { value: 'downloads', label: 'Most downloaded' }, { value: 'title', label: 'Title A–Z' }]} /></div>
    </div></div></div>
    <div className="row g-3">{pg.items.length ? pg.items.map(n => <NoteCard key={n.id} n={n} me={me} />) : <div className="col-12"><Empty icon={f.tab === 'saved' ? 'bookmark' : 'journal-x'} title={f.tab === 'saved' ? 'No bookmarked notes yet' : f.tab === 'mine' ? 'You have not uploaded notes yet' : 'No notes found'} text={f.tab === 'saved' ? 'Bookmark notes to find them quickly here.' : 'Try another search or filter.'}>{f.tab === 'mine' && <Link className="btn btn-sm btn-primary" href="/student/learning/upload">Upload notes</Link>}</Empty></div>}</div>
    <Pager pg={pg} onPage={p => { set('page', p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
  </>;
}

/* ---------------- NOTE READER ---------------- */
export function NoteReader() {
  const me = useMe();
  const { noteId } = useParams();
  const { toast } = useUI();
  const act = useNoteActions();
  const report = useReport();
  const n = Store.find('notes', noteId);
  const mine = n && n.ratings.find(r => r.userId === me.id);
  const [rate, setRate] = useState(mine ? mine.score : 0);
  const [text, setText] = useState(mine ? mine.review : '');
  const [bad, setBad] = useState(false);
  const [font, setFont] = useState(1);
  useEffect(() => {
    if (n && !sessionStorage.getItem('viewed_' + n.id)) { sessionStorage.setItem('viewed_' + n.id, '1'); Store.update('notes', n.id, x => { x.views++; }); Domain.logActivity(me.id, 0.25); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);
  if (!n || (n.status !== 'approved' && n.uploaderId !== me.id)) return <Empty icon="journal-x" title="Note not available" text="It may have been removed or is awaiting review."><Link className="btn btn-primary" href="/student/learning/notes">Back to library</Link></Empty>;
  const c = U.course(n.courseId) || {};
  const author = U.user(n.uploaderId) || { name: 'Unknown' };
  const bm = Store.us(me.id).bookmarks.includes(n.id);
  const avg = U.avgRating(n);
  const related = Domain.visibleNotes(me).filter(x => x.id !== n.id && x.status === 'approved' && (x.courseId === n.courseId || x.subject === n.subject)).slice(0, 4);
  const review = () => {
    if (!rate) return toast('Select a star rating first.', 'warning');
    if (text.trim().length < 5) return setBad(true);
    Store.update('notes', n.id, x => { x.ratings = x.ratings.filter(r => r.userId !== me.id); x.ratings.unshift({ userId: me.id, score: rate, review: text.trim(), date: new Date().toISOString() }); });
    if (n.uploaderId !== me.id) Store.notify(n.uploaderId, 'New review on your notes', `${me.name} rated “${n.title}” ${rate}★.`, 'Academic', '/student/learning/notes/' + n.id);
    toast('Thanks! Your review has been posted.');
  };
  const delReview = () => { Store.update('notes', n.id, x => { x.ratings = x.ratings.filter(r => r.userId !== me.id); }); setRate(0); setText(''); toast('Your review was removed.', 'info'); };
  let reading;
  if (n.file && n.file.dataUrl && /pdf/.test(n.file.type)) reading = <><iframe className="reader-frame" src={n.file.dataUrl} title={n.title} /><p className="xsmall text-muted mt-2 mb-0"><I n="info-circle" className="me-1" />Displayed with your browser’s built-in PDF viewer.</p></>;
  else if (n.file && n.file.text) reading = <div className="reader-page"><pre className="reader mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: font + 'rem' }}>{n.file.text}</pre></div>;
  else if (n.file && n.file.dataUrl) reading = <div className="reader-page text-center"><i className={U.fileIcon(n.fileType) + ' display-3'} /><h3 className="h5 mt-3">{n.file.name}</h3><p className="text-muted">Online preview is available for PDF, TXT and Markdown files. Download this {n.fileType} file to open it in its native app.</p><button className="btn btn-primary" onClick={() => act.download(n.id)}><I n="download" className="me-1" />Download file</button></div>;
  else reading = <div className="reader-page"><div className="reader" style={{ fontSize: font + 'rem' }} dangerouslySetInnerHTML={{ __html: n.content || '<p>No preview available.</p>' }} /></div>;
  return <div className="row g-4">
    <div className="col-xl-8">
      <div className="card mb-4"><div className="card-body p-4">
        <div className="d-flex flex-wrap gap-2 mb-2"><span className="badge badge-soft-primary">{n.subject}</span><span className="badge badge-soft-secondary">Semester {n.semester}</span>{(n.tags || []).map(t => <span key={t} className="badge badge-soft-info">#{t}</span>)}{n.status !== 'approved' && <StatusBadge status={n.status} />}</div>
        <h1 className="h3 fw-bold">{n.title}</h1><p className="text-muted">{n.description}</p>
        <div className="d-flex flex-wrap align-items-center gap-3 small"><span className="d-flex align-items-center gap-2"><Avatar user={author} size={30} /><strong>{author.name}</strong></span><span className="text-muted"><I n="calendar3" className="me-1" />{U.date(n.date)}</span><span><Stars value={avg} /> <span className="text-muted">{avg ? avg.toFixed(1) : 'No ratings'} ({n.ratings.length})</span></span><span className="text-muted"><I n="eye" className="me-1" />{n.views} views</span><span className="text-muted"><I n="download" className="me-1" />{n.downloads}</span></div>
        <div className="d-flex flex-wrap gap-2 mt-3 no-print">
          <button className="btn btn-primary" onClick={() => act.download(n.id)}><I n="download" className="me-1" />Download</button>
          <button className={`btn ${bm ? 'btn-soft' : 'btn-light'}`} onClick={() => act.bookmark(n.id)}><I n={`bookmark${bm ? '-fill' : ''}`} className="me-1" />{bm ? 'Bookmarked' : 'Bookmark'}</button>
          <div className="btn-group"><button className="btn btn-light" onClick={() => setFont(Math.max(0.85, font - 0.1))} aria-label="Smaller text">A−</button><button className="btn btn-light" onClick={() => setFont(Math.min(1.4, font + 0.1))} aria-label="Larger text">A+</button></div>
          <button className="btn btn-light" onClick={() => window.print()}><I n="printer" className="me-1" />Print</button>
          {n.uploaderId !== me.id && <button className="btn btn-light text-danger ms-auto" onClick={() => report('note', n.id)}><I n="flag" className="me-1" />Report</button>}
        </div></div></div>
      {reading}
      <div className="card mt-4"><div className="card-header"><h2 className="h6 fw-semibold mb-0">Ratings & reviews</h2></div><div className="card-body">
        {n.uploaderId !== me.id ? <div className="p-3 rounded-3 border mb-4"><div className="small fw-semibold mb-2">{mine ? 'Update your review' : 'Rate these notes'}</div>
          <div className="star-input mb-2" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map(i => <i key={i} className={`bi bi-star-fill ${i <= rate ? 'on' : ''}`} role="radio" aria-checked={i === rate} tabIndex={0} aria-label={`${i} stars`} onClick={() => setRate(i)} onKeyDown={e => e.key === 'Enter' && setRate(i)} />)}</div>
          <textarea className={`form-control mb-2 ${bad ? 'is-invalid' : ''}`} rows={2} placeholder="What did you find helpful?" value={text} onChange={e => { setText(e.target.value); setBad(false); }} />{bad && <div className="invalid-feedback d-block mb-2">Write at least a few words.</div>}
          <div className="d-flex gap-2"><button className="btn btn-primary btn-sm" onClick={review}>{mine ? 'Update review' : 'Post review'}</button>{mine && <button className="btn btn-light btn-sm" onClick={delReview}>Delete my review</button>}</div></div>
          : <div className="alert alert-info small"><I n="info-circle" className="me-1" />These are your notes — other students can rate and review them.</div>}
        {n.ratings.length ? n.ratings.map(r => <div className="d-flex gap-3 mb-3" key={r.userId + r.date}><Avatar user={U.user(r.userId)} size={36} /><div><div className="small"><strong>{U.user(r.userId)?.name || 'Student'}</strong> <span className="ms-1"><Stars value={r.score} /></span> <span className="text-muted xsmall ms-1">{U.ago(r.date)}</span></div><div className="small">{r.review}</div></div></div>) : <p className="text-muted small mb-0">No reviews yet.</p>}
      </div></div>
    </div>
    <div className="col-xl-4"><div className="sticky-side d-grid gap-4">
      <Card title="Course information"><div className="small d-grid gap-2"><div><span className="text-muted">Course</span><div className="fw-semibold"><Link href={`/student/learning/courses/${c.id}`}>{c.code} · {c.title}</Link></div></div><div><span className="text-muted">Instructor</span><div>{U.user(c.facultyId)?.name}</div></div><div><span className="text-muted">Department</span><div>{U.dept(c.department)}</div></div></div></Card>
      <Card title="File information"><div className="d-flex align-items-center gap-3"><div className="thumb-sm"><i className={U.fileIcon(n.fileType)} /></div><div className="small"><div className="fw-semibold">{n.file ? n.file.name : U.slug(n.title) + '.' + n.fileType.toLowerCase()}</div><div className="text-muted">{n.fileType} · {n.size} · uploaded {U.date(n.date)}</div></div></div></Card>
      <Card title="Related notes" bodyClass="py-1">{related.length ? related.map(r => <Link key={r.id} href={`/student/learning/notes/${r.id}`} className="list-row text-reset"><div className="thumb-sm" style={{ width: 40, height: 40, fontSize: '1rem' }}><i className={U.fileIcon(r.fileType)} /></div><div className="min-w-0"><div className="small fw-semibold text-truncate">{r.title}</div><div className="xsmall"><Stars value={U.avgRating(r)} /></div></div></Link>) : <p className="small text-muted mb-0 py-2">No related notes yet.</p>}</Card>
    </div></div>
  </div>;
}

/* ---------------- UPLOAD NOTES ---------------- */
const EXTS = ['pdf', 'docx', 'pptx', 'txt', 'md'];
export function UploadNotes() {
  const me = useMe();
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useUI();
  const pre = U.course(sp.get('course'));
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ title: '', course: pre ? pre.id : '', semester: pre ? String(pre.semester) : '', subject: pre ? pre.subject : '', description: '', tags: '' });
  const fields = [
    { name: 'title', label: 'Note title', required: true, minlength: 5, placeholder: 'e.g. Transactions & Concurrency — Summary' },
    { name: 'course', label: 'Course', type: 'select', required: true, col: 'col-md-6', options: courseOptions(), onChange: (v, set) => { const c = U.course(v); if (c) { set('semester', String(c.semester)); set('subject', c.subject); } } },
    { name: 'semester', label: 'Semester', type: 'select', required: true, col: 'col-md-3', options: semOptions() },
    { name: 'subject', label: 'Subject', required: true, col: 'col-md-3' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, minlength: 20, rows: 3, placeholder: 'What topics do these notes cover? Who are they useful for?' },
    { name: 'tags', label: 'Tags', placeholder: 'comma separated, e.g. exam prep, SQL', help: 'Optional — helps others find your notes.' }];
  const pick = async e => {
    const f = e.target.files[0]; setFileErr(''); setFile(null);
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!EXTS.includes(ext)) { setFileErr(`.${ext} files are not supported. Use PDF, DOCX, PPTX, TXT or MD.`); e.target.value = ''; return; }
    if (f.size > 2 * 1024 * 1024) { setFileErr(`File is ${U.fmtSize(f.size)}. The demo limit is 2 MB because files are stored in your browser cache.`); e.target.value = ''; return; }
    setLoading(true);
    const dataUrl = await U.readFile(f);
    const text = ['txt', 'md'].includes(ext) ? await U.readFile(f, 'text') : null;
    setFile({ name: f.name, type: f.type || (ext === 'md' ? 'text/markdown' : ''), size: f.size, ext, dataUrl, text });
    setLoading(false);
    if (!values.title) setValues(v => ({ ...v, title: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') }));
  };
  const submit = v => {
    if (!file) { setFileErr('Please choose a file to upload.'); return; }
    const needs = U.settings().requireNoteApproval;
    const n = Store.add('notes', {
      title: v.title, courseId: v.course, semester: +v.semester, subject: v.subject, uploaderId: me.id, date: new Date().toISOString(),
      fileType: file.ext.toUpperCase(), size: U.fmtSize(file.size), description: v.description, downloads: 0, views: 0,
      status: needs ? 'pending' : 'approved', tags: v.tags ? v.tags.split(',').map(x => x.trim()).filter(Boolean) : [], ratings: [], content: null,
      file: { name: file.name, type: file.type, dataUrl: file.dataUrl, text: file.text }
    }, 'n');
    if (!n) return;
    const c = U.course(v.course);
    if (c && c.facultyId) Store.notify(c.facultyId, 'New student note', `${me.name} uploaded “${n.title}” to ${c.code}.`, 'Academic', '/faculty/courses?c=' + c.id);
    Domain.logActivity(me.id, 1);
    toast(needs ? 'Uploaded! Your note is awaiting moderator approval.' : `Uploaded and saved! +${Scoring.rules().noteUpload} contribution points.`);
    router.push('/student/learning/notes/' + n.id);
  };
  return <>
    <PageHeader title="Upload Notes" subtitle="Share your notes with classmates and earn contribution points." />
    <div className="row g-4"><div className="col-lg-8"><div className="card"><div className="card-body p-4">
      <Form fields={fields} values={values} setValues={setValues} onSubmit={submit} submitText="Upload notes" submitIcon="cloud-arrow-up" onCancel={() => router.push('/student/learning/notes')} footerClass="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
        <div className="mt-3"><label className="form-label" htmlFor="noteFile">File <span className="text-danger">*</span></label>
          <input type="file" id="noteFile" className={`form-control ${fileErr ? 'is-invalid' : ''}`} accept=".pdf,.docx,.pptx,.txt,.md" onChange={pick} />
          <div className="form-text">Supported: PDF, DOCX, PPTX, TXT, MD · max 2 MB (browser cache limit)</div>{fileErr && <div className="small text-danger mt-1">{fileErr}</div>}</div>
        <div className="mt-3">{loading && <Loading />}{file && <>
          <div className="d-flex align-items-center gap-3 p-3 border rounded-3 mb-3"><div className="thumb-sm"><i className={U.fileIcon(file.ext)} /></div><div className="min-w-0"><div className="fw-semibold small text-truncate">{file.name}</div><div className="xsmall text-muted">{file.ext.toUpperCase()} · {U.fmtSize(file.size)}</div></div><button type="button" className="btn btn-sm btn-light ms-auto" onClick={() => { setFile(null); document.getElementById('noteFile').value = ''; }}>Remove</button></div>
          {file.ext === 'pdf' ? <iframe src={file.dataUrl} className="reader-frame" style={{ height: 360 }} title="PDF preview" /> : file.text ? <pre className="reader-page small mb-0" style={{ maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{file.text.slice(0, 3000)}</pre> : <div className="text-muted small"><I n="info-circle" className="me-1" />Preview is shown for PDF, TXT and MD files. {file.ext.toUpperCase()} files can be downloaded by readers.</div>}</>}</div>
      </Form></div></div></div>
      <div className="col-lg-4"><div className="d-grid gap-4">
        <Card title={<><I n="lightbulb" className="me-2 text-warning" />Tips for great notes</>}><ul className="small mb-0 ps-3 d-grid gap-2"><li>Use clear headings and short paragraphs.</li><li>Include worked examples and exam tips.</li><li>Cite the textbook chapters you summarise.</li><li>Only upload your own work — no copyrighted slides.</li></ul></Card>
        <Card title={<><I n="star" className="me-2 text-primary" />Earn points</>}><p className="small mb-2">Each approved upload earns <strong>{Scoring.rules().noteUpload} points</strong>. Highly rated notes help you unlock the <strong>Knowledge Sharer</strong> badge.</p><Link href="/student/leaderboard" className="small">See how points work →</Link></Card>
      </div></div></div>
  </>;
}
