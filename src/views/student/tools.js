'use client';
/* STUDENT — AI Study Assistant (rule-based demo), Study Planner, Quizzes, Quiz attempt, Results */
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Store, { uid } from '@/lib/storage';
import U from '@/lib/utils';
import { Domain, Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { Card, ChartBox, DataTable, DemoBanner, DueLabel, Empty, I, Md, PageHeader, palette, Progress, Select, Stat, Tabs } from '@/components/ui';
import { courseOptions } from '../shared';

/* ---------------- AI STUDY ASSISTANT ---------------- */
const GREETING = 'Hi! I’m your **Study Assistant (demo)**. I can explain topics, summarise notes from the library and generate practice questions.\n\nTry one of the suggestions, or ask me about normalization, deadlocks, scheduling, Bayes theorem, Big-O, SQL joins, design patterns or study tips.';
function aiReply(text, me) {
  const t = text.toLowerCase();
  const hit = Store.all('aiKnowledge').find(k => k.keywords.some(w => t.includes(w)));
  if (hit) return hit.answer;
  if (/^(hi|hello|hey|salam|assalam)/.test(t)) return `Hello ${me.name.split(' ')[0]}! What would you like to study today?`;
  if (t.includes('summar')) return 'To summarise a note, choose one under **“Summarize a note”** and click **Summarize**. I’ll extract the key points for you.';
  if (t.includes('question') || t.includes('quiz') || t.includes('practice')) return 'Pick a course under **“Generate practice questions”** and I’ll create a short practice set with answers. For a timed test, open **Practice Quizzes**.';
  if (t.includes('deadline') || t.includes('due') || t.includes('assignment')) {
    const a = Store.where('assignments', x => me.courses.includes(x.courseId) && U.daysLeft(x.dueDate) >= 0).sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate)).slice(0, 4);
    return a.length ? 'Here are your next deadlines:\n\n' + a.map(x => `- **${U.course(x.courseId).code}** — ${x.title} (${U.dateTime(x.dueDate)})`).join('\n') + '\n\nAdd revision tasks for them in the **Study Planner**.' : 'You have no upcoming deadlines. Great job!';
  }
  const notes = Domain.visibleNotes(me).filter(n => t.split(/\W+/).some(w => w.length > 3 && (n.title.toLowerCase().includes(w) || (n.tags || []).join(' ').toLowerCase().includes(w)))).slice(0, 3);
  if (notes.length) return 'I don’t have a built-in explanation for that yet, but these notes from the library look relevant:\n\n' + notes.map(n => `- **${n.title}** (${U.course(n.courseId).code}, ${U.avgRating(n).toFixed(1)}★)`).join('\n') + '\n\nOpen them from the **Notes Library**.';
  return 'I’m a rule-based demo assistant, so I only know a set of topics. Try asking about **normalization**, **deadlocks**, **CPU scheduling**, **Bayes theorem**, **Big-O**, **SQL joins**, **hypothesis testing**, **eigenvalues**, **design patterns** or **study tips**.';
}

export function AIAssistant() {
  const me = useMe(); const { confirm, toast } = useUI();
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false);
  const [noteId, setNoteId] = useState(''); const [courseId, setCourseId] = useState('');
  const boxRef = useRef(null); const timer = useRef(null);
  const history = Store.us(me.id).aiChat;
  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [history.length, busy]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const push = (role, text) => { const h = Store.us(me.id).aiChat; h.push({ role, text, date: new Date().toISOString() }); if (h.length > 60) h.splice(0, h.length - 60); Store.saveUs(); };
  const respond = fn => { setBusy(true); timer.current = setTimeout(() => { push('ai', fn()); setBusy(false); Domain.logActivity(me.id, 0.1); }, 700 + Math.random() * 500); };
  const send = text => { if (busy) return; text = (text ?? input).trim(); if (!text) return; setInput(''); push('user', text); respond(() => aiReply(text, me)); };
  const summarize = () => {
    if (!noteId) return toast('Choose a note to summarise.', 'warning');
    const n = Store.find('notes', noteId); push('user', `Summarize “${n.title}”`);
    respond(() => {
      const div = document.createElement('div'); div.innerHTML = n.content || '';
      const heads = [...div.querySelectorAll('h3')].map(h => h.textContent.replace(/^\d+\.\s*/, ''));
      const sentences = [...div.querySelectorAll('p,li')].map(p => p.textContent.split(/(?<=\.)\s/)[0]).filter(s => s.length > 20).slice(0, 5);
      const terms = [...div.querySelectorAll('strong,code')].map(x => x.textContent).filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);
      if (!sentences.length && n.file && n.file.text) sentences.push(...n.file.text.split(/(?<=\.)\s/).filter(s => s.length > 20).slice(0, 5));
      return `**Summary of “${n.title}”** (${U.course(n.courseId).code})\n\n${heads.length ? '**Sections covered:** ' + heads.join(' · ') + '\n\n' : ''}**Key points:**\n${(sentences.length ? sentences : [n.description]).map(s => '- ' + s).join('\n')}${terms.length ? '\n\n**Key terms:** ' + terms.map(x => '`' + x + '`').join(', ') : ''}\n\nOpen the full note in the Notes Library for details.`;
    });
  };
  const practice = () => {
    if (!courseId) return toast('Choose a course first.', 'warning');
    const c = U.course(courseId); push('user', `Generate practice questions for ${c.code} ${c.title}`);
    respond(() => {
      const ids = Store.where('quizzes', q => q.courseId === courseId && q.published).map(q => q.id);
      const qs = Store.where('quizQuestions', q => ids.includes(q.quizId)).sort(() => Math.random() - 0.5).slice(0, 3);
      if (!qs.length) return `**Practice questions — ${c.code}**\n\n` + Store.where('courseModules', m => m.courseId === courseId).map((m, i) => `${i + 1}. Explain the main ideas of **${m.title}** and give one real-world example. (${m.description})`).join('\n') + '\n\nWrite your answers, then compare with the course materials.';
      return `**Practice questions — ${c.code}**\n\n` + qs.map((q, i) => `${i + 1}. ${q.text}\n${q.options.map((o, k) => `- ${'ABCD'[k]}) ${o}`).join('\n')}\n**Answer:** ${'ABCD'[q.answer]} — ${q.explanation}`).join('\n\n') + '\n\nWant a timed test? Open **Practice Quizzes**.';
    });
  };
  const clear = () => confirm('Clear the whole conversation?', () => { Store.us(me.id).aiChat = []; Store.saveUs(); toast('Chat cleared.', 'info'); }, { okText: 'Clear chat', danger: true });
  const notes = Domain.visibleNotes(me).filter(n => n.status === 'approved');
  return <>
    <PageHeader title="AI Study Assistant" subtitle="Explanations, summaries and practice questions — available 24/7."><button className="btn btn-light" onClick={clear}><I n="trash" className="me-1" />Clear chat</button></PageHeader>
    <DemoBanner><strong>Demo assistant:</strong> this assistant uses predefined, rule-based responses and does <u>not</u> connect to a live AI service. Your chat history is kept in the browser cache.</DemoBanner>
    <div className="row g-4">
      <div className="col-lg-4 order-lg-2"><div className="d-grid gap-4">
        <Card title={<><I n="lightbulb" className="me-2 text-warning" />Suggested questions</>}><div className="d-grid gap-2">{Store.obj('aiSuggestions').map(s => <button key={s} className="btn btn-light btn-sm text-start" onClick={() => send(s)}>{s}</button>)}</div></Card>
        <Card title={<><I n="file-text" className="me-2 text-primary" />Summarize a note</>}><Select className="form-select form-select-sm mb-2" value={noteId} onChange={setNoteId} all="Choose a note…" options={notes.map(n => ({ value: n.id, label: `${U.course(n.courseId)?.code} · ${n.title}` }))} /><button className="btn btn-soft btn-sm w-100" onClick={summarize}><I n="magic" className="me-1" />Summarize</button></Card>
        <Card title={<><I n="patch-question" className="me-2 text-success" />Generate practice questions</>}><Select className="form-select form-select-sm mb-2" value={courseId} onChange={setCourseId} all="Choose a course…" options={courseOptions([...me.courses.map(U.course).filter(Boolean), ...Store.where('courses', c => !me.courses.includes(c.id))])} /><button className="btn btn-soft btn-sm w-100" onClick={practice}><I n="list-check" className="me-1" />Generate questions</button></Card>
      </div></div>
      <div className="col-lg-8"><div className="card d-flex flex-column" style={{ height: 'calc(100vh - 260px)', minHeight: 520 }}>
        <div className="card-header d-flex align-items-center gap-2"><span className="stat-icon soft-primary" style={{ width: 36, height: 36, fontSize: '1rem' }}><I n="robot" /></span><div><div className="fw-semibold small">Study Assistant</div><div className="xsmall text-success"><I n="circle-fill" /> Online · demo mode</div></div></div>
        <div ref={boxRef} className="chat-body flex-grow-1 p-3" aria-live="polite">
          <div className="bubble them ai"><Md text={GREETING} /></div>
          {history.map((m, i) => <div key={i} className={`bubble ${m.role === 'user' ? 'me' : 'them ai'}`}>{m.role === 'user' ? m.text : <Md text={m.text} />}<div className="meta">{U.time(m.date)}</div></div>)}
          {busy && <div className="bubble them"><span className="typing"><span /><span /><span /></span></div>}
        </div>
        <form className="card-footer d-flex gap-2 bg-transparent" onSubmit={e => { e.preventDefault(); send(); }}><input className="form-control" placeholder="Ask about a topic, e.g. “Explain BCNF”" value={input} onChange={e => setInput(e.target.value)} autoComplete="off" aria-label="Message" /><button className="btn btn-primary" type="submit" aria-label="Send" disabled={busy}><I n="send" /></button></form>
      </div></div>
    </div>
  </>;
}

/* ---------------- STUDY PLANNER ---------------- */
function dayItems(me, ymd) {
  const items = [];
  Store.where('tasks', t => t.userId === me.id && t.date === ymd).forEach(t => items.push({ label: t.title, tone: t.done ? 'secondary' : 'primary', kind: 'Task' }));
  Store.where('assignments', a => me.courses.includes(a.courseId) && U.ymd(new Date(a.dueDate)) === ymd).forEach(a => items.push({ label: U.course(a.courseId).code + ' due', full: a.title, tone: 'warning', kind: 'Assignment' }));
  Store.where('exams', e => me.courses.includes(e.courseId) && U.ymd(new Date(e.date)) === ymd).forEach(e => items.push({ label: U.course(e.courseId).code + ' ' + e.type, tone: 'danger', kind: 'Exam' }));
  Store.where('events', e => e.registrations.includes(me.id) && U.ymd(new Date(e.date)) === ymd).forEach(e => items.push({ label: e.title, tone: 'success', kind: 'Event' }));
  return items;
}
export function MonthGrid({ month, onShift, renderDay, onDay }) {
  const y = month.getFullYear(), mo = month.getMonth();
  const first = new Date(y, mo, 1); const start = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const today = U.ymd();
  return <><div className="d-flex align-items-center justify-content-between mb-3"><button className="btn btn-light btn-sm" onClick={() => onShift(-1)} aria-label="Previous month"><I n="chevron-left" /></button><h2 className="h6 fw-semibold mb-0">{first.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2><button className="btn btn-light btn-sm" onClick={() => onShift(1)} aria-label="Next month"><I n="chevron-right" /></button></div>
    <div className="cal-grid">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div className="cal-head" key={d}>{d}</div>)}
      {cells.map(d => { const ymd = U.ymd(d); return <div key={ymd} className={`cal-day ${d.getMonth() !== mo ? 'other' : ''} ${ymd === today ? 'today' : ''}`} onClick={onDay ? () => onDay(ymd) : undefined} role={onDay ? 'button' : undefined} tabIndex={onDay ? 0 : undefined} style={onDay ? undefined : { cursor: 'default' }}><span className="num">{d.getDate()}</span>{renderDay(ymd)}</div>; })}</div></>;
}

export function Planner() {
  const me = useMe(); const sp = useSearchParams(); const { formModal, toast, confirm, openModal, closeModal } = useUI();
  const [tab, setTab] = useState(sp.get('tab') || 'tasks');
  const [filter, setFilter] = useState('upcoming');
  const [month, setMonth] = useState(new Date());
  const us = Store.us(me.id);
  const tasks = Store.where('tasks', t => t.userId === me.id);
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const today = U.ymd();
  const fields = (t = {}) => [
    { name: 'title', label: 'Task', required: true, minlength: 3, value: t.title }, { name: 'date', label: 'Date', type: 'date', required: true, col: 'col-md-6', value: t.date || U.ymd() }, { name: 'time', label: 'Time', type: 'time', col: 'col-md-6', value: t.time || '18:00' },
    { name: 'priority', label: 'Priority', type: 'select', required: true, col: 'col-md-6', value: t.priority || 'Medium', options: ['High', 'Medium', 'Low'] }, { name: 'category', label: 'Category', type: 'select', required: true, col: 'col-md-6', value: t.category || 'Study', options: ['Study', 'Assignment', 'Reading', 'Exam prep', 'Meeting', 'Personal'] }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2, value: t.notes }];
  const add = date => formModal({ title: <><I n="plus-circle" className="me-2" />New task</>, fields: fields(date ? { date } : {}), submitText: 'Add task', onSubmit: v => { Store.add('tasks', { ...v, userId: me.id, done: false }, 'tk'); toast('Task added to your planner.'); } });
  const edit = t => formModal({ title: 'Edit task', fields: fields(t), onSubmit: v => { Store.update('tasks', t.id, v); toast('Task updated.'); } });
  const toggle = id => { const t = Store.update('tasks', id, x => { x.done = !x.done; }); if (t.done) { Domain.logActivity(me.id, 0.5); toast('Nice work! Task completed. ✅'); } };
  const del = id => confirm('Delete this task?', () => { Store.remove('tasks', id); toast('Task deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  const submitA = id => { const a = Store.toggleUs(me.id, 'submittedAssignments', id); toast(a ? 'Assignment marked as submitted.' : 'Marked as not submitted.', a ? 'success' : 'info'); };
  const showDay = ymd => { const items = dayItems(me, ymd); openModal({ title: U.date(ymd), body: items.length ? items.map((i, k) => <div className="list-row" key={k}><span className={`badge badge-soft-${i.tone}`}>{i.kind}</span><span className="small">{i.full || i.label}</span></div>) : <p className="text-muted small mb-0">Nothing scheduled for this day.</p>, footer: <button className="btn btn-primary" onClick={() => { closeModal(); setTimeout(() => add(ymd), 50); }}><I n="plus-lg" className="me-1" />Add task on this day</button> }); };
  const match = (x, k) => k === 'all' || (k === 'today' && x.date === today) || (k === 'upcoming' && !x.done && x.date >= today) || (k === 'overdue' && !x.done && x.date < today) || (k === 'completed' && x.done);
  let body;
  if (tab === 'tasks') {
    const list = tasks.filter(x => match(x, filter)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const groups = {}; list.forEach(x => { (groups[x.date] = groups[x.date] || []).push(x); });
    body = <><div className="d-flex flex-wrap gap-2 mb-3">{[['upcoming', 'Upcoming'], ['today', 'Today'], ['overdue', 'Overdue'], ['completed', 'Completed'], ['all', 'All']].map(([k, l]) => <button key={k} className={`chip chip-btn ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l} <span className="opacity-75">{tasks.filter(x => match(x, k)).length}</span></button>)}</div>
      {Object.keys(groups).length ? Object.entries(groups).map(([d, items]) => <div className="mb-3" key={d}><div className="small fw-semibold text-muted mb-2">{d === today ? 'Today' : U.daysLeft(d) === 1 ? 'Tomorrow' : U.date(d)}</div>{items.map(x => <div key={x.id} className={`d-flex align-items-center gap-3 p-3 border rounded-3 mb-2 ${x.done ? 'opacity-75' : ''}`}>
        <input className="form-check-input mt-0 flex-shrink-0" type="checkbox" checked={x.done} onChange={() => toggle(x.id)} aria-label={`Mark ${x.title} complete`} style={{ width: '1.3em', height: '1.3em' }} />
        <div className="min-w-0 flex-grow-1"><div className={`fw-semibold small ${x.done ? 'text-decoration-line-through' : ''}`}>{x.title}</div><div className="xsmall text-muted">{x.time} · {x.category}{x.notes ? ' · ' + x.notes : ''}</div></div>
        <span className={`badge badge-soft-${x.priority === 'High' ? 'danger' : x.priority === 'Medium' ? 'warning' : 'secondary'}`}>{x.priority}</span>
        <button className="btn btn-sm btn-icon" onClick={() => edit(x)} aria-label="Edit task"><I n="pencil" /></button><button className="btn btn-sm btn-icon text-danger" onClick={() => del(x.id)} aria-label="Delete task"><I n="trash" /></button></div>)}</div>)
        : <Empty icon="check2-square" title="No tasks here" text="Plan your study sessions and never miss a deadline."><button className="btn btn-primary btn-sm" onClick={() => add()}>Add a task</button></Empty>}</>;
  } else if (tab === 'week') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; const slots = Array.from({ length: 10 }, (_, i) => i + 8);
    const tt = Store.where('timetable', x => me.courses.includes(x.courseId));
    const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    const hrs = s => +s.split(':')[0] + s.split(':')[1] / 60;
    body = tt.length ? <div className="table-responsive"><div className="tt-grid border-top border-start"><div className="tt-head" />{days.map(d => <div key={d} className={`tt-head ${d === todayName ? 'text-primary' : ''}`}>{d}{d === todayName && ' · today'}</div>)}
      {slots.map(h => [<div className="tt-time" key={'t' + h}>{h}:00</div>, ...days.map(d => <div key={d + h}>{tt.filter(x => x.day === d && +x.start.split(':')[0] === h).map(x => { const c = U.course(x.courseId); return <Link key={x.id} href={`/student/learning/courses/${c.id}`} className="tt-class d-block text-white position-absolute start-0 end-0 mx-1" style={{ top: `${x.start.split(':')[1] / 60 * 100}%`, height: `calc(${(hrs(x.end) - hrs(x.start)) * 100}% - 2px)`, background: palette[me.courses.indexOf(c.id) % palette.length], zIndex: 1 }}><strong>{c.code}</strong> {x.type}<br />{x.start}–{x.end}<br /><span className="opacity-75">{x.room}</span></Link>; })}</div>)])}</div></div>
      : <Empty icon="calendar-week" title="No timetable" text="Your weekly timetable will appear here once you are enrolled in courses." />;
  } else if (tab === 'calendar') {
    body = <><MonthGrid month={month} onShift={d => setMonth(new Date(month.getFullYear(), month.getMonth() + d, 1))} onDay={showDay} renderDay={ymd => { const items = dayItems(me, ymd); return <>{items.slice(0, 3).map((i, k) => <span key={k} className={`cal-ev badge-soft-${i.tone}`}>{i.label}</span>)}{items.length > 3 && <span className="xsmall text-muted">+{items.length - 3} more</span>}</>; }} />
      <div className="d-flex flex-wrap gap-3 mt-3 xsmall"><span><span className="badge badge-soft-primary">■</span> Tasks</span><span><span className="badge badge-soft-warning">■</span> Assignments</span><span><span className="badge badge-soft-danger">■</span> Exams</span><span><span className="badge badge-soft-success">■</span> Events</span></div></>;
  } else {
    const assigns = Store.where('assignments', a => me.courses.includes(a.courseId)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const exams = Store.where('exams', e => me.courses.includes(e.courseId)).sort((a, b) => new Date(a.date) - new Date(b.date));
    body = <><h2 className="h6 fw-semibold mb-3">Assignment deadlines</h2><DataTable rows={assigns} cols={[
      { label: 'Assignment', render: a => <div className="text-start"><div className="fw-semibold small">{a.title}</div><div className="xsmall text-muted">{U.course(a.courseId).code} · {a.maxMarks} marks</div></div> },
      { label: 'Due', render: a => <span className="small">{U.dateTime(a.dueDate)}</span> },
      { label: 'Time left', render: a => us.submittedAssignments.includes(a.id) ? <span className="badge badge-soft-success">Submitted</span> : <span className="small"><DueLabel date={a.dueDate} /></span> },
      { label: '', render: a => <button className={`btn btn-sm ${us.submittedAssignments.includes(a.id) ? 'btn-light' : 'btn-soft'}`} onClick={() => submitA(a.id)}>{us.submittedAssignments.includes(a.id) ? 'Undo' : 'Mark submitted'}</button> }]} />
      <h2 className="h6 fw-semibold mt-4 mb-3">Exam schedule</h2><DataTable rows={exams} cols={[
        { label: 'Exam', render: e => <div className="text-start"><div className="fw-semibold small">{U.course(e.courseId).code} {e.type}</div><div className="xsmall text-muted">{e.syllabus}</div></div> },
        { label: 'Date & time', render: e => <span className="small">{U.dateTime(e.date)}</span> }, { label: 'Duration', render: e => <span className="small">{e.duration}</span> }, { label: 'Room', render: e => <span className="small">{e.room}</span> }, { label: 'Countdown', render: e => <span className="small"><DueLabel date={e.date} /></span> }]} /></>;
  }
  return <>
    <PageHeader title="Study Planner" subtitle="Your timetable, tasks, deadlines and exams in one place."><button className="btn btn-primary" onClick={() => add()}><I n="plus-lg" className="me-1" />New task</button></PageHeader>
    <div className="row g-3 mb-4">
      <div className="col-md-6 col-xl-3"><Stat icon="list-check" label="Tasks completed" value={`${done}/${tasks.length}`} tone="success" /></div>
      <div className="col-md-6 col-xl-3"><Stat icon="calendar-day" label="Due today" value={tasks.filter(x => x.date === today && !x.done).length} /></div>
      <div className="col-md-6 col-xl-3"><Stat icon="exclamation-triangle" label="Overdue" value={tasks.filter(x => x.date < today && !x.done).length} tone="danger" /></div>
      <div className="col-md-6 col-xl-3"><div className="card h-100"><div className="card-body"><div className="d-flex justify-content-between small mb-2"><span className="text-muted">Overall progress</span><strong>{pct}%</strong></div><Progress value={pct} tone="success" h={10} /><div className="xsmall text-muted mt-2">{tasks.length - done} tasks remaining</div></div></div></div></div>
    <Tabs active={tab} onChange={setTab} items={[{ key: 'tasks', label: 'Daily tasks', icon: 'list-check' }, { key: 'week', label: 'Weekly timetable', icon: 'calendar-week' }, { key: 'calendar', label: 'Calendar', icon: 'calendar3' }, { key: 'deadlines', label: 'Deadlines & exams', icon: 'alarm' }]} />
    <div className="card"><div className="card-body">{body}</div></div>
  </>;
}

/* ---------------- QUIZZES ---------------- */
export function Quizzes() {
  const me = useMe(); const sp = useSearchParams();
  const [f, setF] = useState({ subject: '', diff: '', course: sp.get('course') || '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const all = Store.where('quizzes', x => x.published);
  const list = all.filter(x => (!f.subject || x.subject === f.subject) && (!f.diff || x.difficulty === f.diff) && (!f.course || x.courseId === f.course));
  const attempts = Store.where('quizAttempts', a => a.userId === me.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length * 100) : 0;
  return <>
    <PageHeader title="Practice Quizzes" subtitle="Test yourself with timed, subject-wise quizzes created by faculty." />
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3"><Stat icon="collection" label="Available quizzes" value={all.length} /></div>
      <div className="col-6 col-lg-3"><Stat icon="pencil-square" label="Attempts" value={attempts.length} tone="info" /></div>
      <div className="col-6 col-lg-3"><Stat icon="percent" label="Average score" value={avg + '%'} tone="success" /></div>
      <div className="col-6 col-lg-3"><Stat icon="trophy" label="Quizzes passed" value={new Set(attempts.filter(a => a.score / a.total >= 0.6).map(a => a.quizId)).size} tone="warning" /></div></div>
    <div className="card mb-3"><div className="card-body py-2 d-flex flex-wrap gap-2">
      <Select value={f.subject} onChange={v => set('subject', v)} all="All subjects" options={[...new Set(all.map(x => x.subject))]} />
      <Select value={f.diff} onChange={v => set('diff', v)} all="All difficulty levels" options={['Easy', 'Medium', 'Hard']} />
      <Select value={f.course} onChange={v => set('course', v)} all="All courses" options={courseOptions()} />
      {(f.subject || f.diff || f.course) && <button className="btn btn-link btn-sm" onClick={() => setF({ subject: '', diff: '', course: '' })}>Clear</button>}
    </div></div>
    <div className="row g-3 mb-4">{list.length ? list.map(z => { const my = attempts.filter(a => a.quizId === z.id); const best = my.length ? Math.max(...my.map(a => Math.round(a.score / a.total * 100))) : null; const nq = Domain.questionsOf(z.id).length; const c = U.course(z.courseId) || {};
      return <div className="col-md-6 col-xl-4" key={z.id}><div className="card h-100"><div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between mb-2"><span className="badge badge-soft-primary">{z.subject}</span><span className={`badge badge-soft-${z.difficulty === 'Easy' ? 'success' : z.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{z.difficulty}</span></div>
        <h3 className="h6 fw-semibold">{z.title}</h3><div className="small text-muted mb-3">{c.code} · {c.title}</div>
        <div className="d-flex gap-3 small text-muted mb-3"><span><I n="question-circle" className="me-1" />{nq} questions</span><span><I n="stopwatch" className="me-1" />{z.duration} min</span><span><I n="person" className="me-1" />{U.user(z.createdBy)?.name.split(' ').slice(-1)[0]}</span></div>
        <div className="mt-auto">{best !== null ? <><div className="d-flex justify-content-between xsmall mb-1"><span>Best score · {my.length} attempt{my.length > 1 ? 's' : ''}</span><strong>{best}%</strong></div><Progress value={best} tone={best >= 60 ? 'success' : 'warning'} h={6} /></> : <div className="xsmall text-muted">Not attempted yet</div>}
          <div className="d-flex gap-2 mt-3"><Link href={`/student/quizzes/${z.id}`} className={`btn btn-primary btn-sm flex-grow-1 ${nq ? '' : 'disabled'}`}><I n="play-fill" className="me-1" />{my.length ? 'Retake quiz' : 'Start quiz'}</Link>{my.length > 0 && <Link href={`/student/quizzes/${z.id}/results`} className="btn btn-light btn-sm">Last result</Link>}</div></div>
      </div></div></div>; }) : <div className="col-12"><Empty icon="patch-question" title="No quizzes match your filters" /></div>}</div>
    <Card title="Previous scores" bodyClass="p-0"><DataTable rows={attempts.slice(0, 10)} empty="Your quiz attempts will appear here." cols={[
      { label: 'Quiz', render: a => <span className="small fw-semibold">{Store.find('quizzes', a.quizId)?.title || 'Removed quiz'}</span> },
      { label: 'Date', render: a => <span className="small">{U.dateTime(a.date)}</span> }, { label: 'Score', render: a => `${a.score}/${a.total}` },
      { label: 'Percentage', render: a => { const p = Math.round(a.score / a.total * 100); return <span className={`badge badge-soft-${p >= 80 ? 'success' : p >= 60 ? 'warning' : 'danger'}`}>{p}%</span>; } },
      { label: 'Time', render: a => <span className="small">{Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s</span> },
      { label: '', render: a => Store.find('quizzes', a.quizId) && <Link className="btn btn-sm btn-light" href={`/student/quizzes/${a.quizId}/results?attempt=${a.id}`}>Review</Link> }]} /></Card>
  </>;
}

export function QuizAttempt() {
  const me = useMe(); const { quizId } = useParams(); const router = useRouter(); const { confirm, toast } = useUI();
  const quiz = Store.find('quizzes', quizId);
  const [qs] = useState(() => Domain.questionsOf(quizId));
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(qs.length).fill(null));
  const [remaining, setRemaining] = useState(quiz ? quiz.duration * 60 : 0);
  const started = useRef(Date.now()); const submitted = useRef(false); const ansRef = useRef(answers);
  ansRef.current = answers;
  const finish = () => {
    if (submitted.current) return; submitted.current = true;
    const a = ansRef.current;
    const score = qs.reduce((s, q, k) => s + (a[k] === q.answer ? 1 : 0), 0);
    const timeTaken = Math.min(quiz.duration * 60, Math.round((Date.now() - started.current) / 1000));
    const at = Store.add('quizAttempts', { quizId, userId: me.id, score, total: qs.length, answers: a, date: new Date().toISOString(), timeTaken }, 'at');
    Domain.logActivity(me.id, Math.max(0.2, timeTaken / 3600));
    router.push(`/student/quizzes/${quizId}/results?attempt=${at.id}`);
  };
  useEffect(() => {
    if (!quiz) return;
    const t = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(t);
  }, [quiz]);
  useEffect(() => { if (quiz && remaining <= 0 && !submitted.current) { toast('Time is up! Your quiz was submitted automatically.', 'warning'); finish(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [remaining]);
  if (!quiz || !quiz.published) return <Empty icon="patch-question" title="Quiz not available" text="This quiz is unpublished or was removed."><Link href="/student/quizzes" className="btn btn-primary">Back to quizzes</Link></Empty>;
  if (!qs.length) return <Empty icon="patch-question" title="This quiz has no questions yet"><Link href="/student/quizzes" className="btn btn-primary">Back to quizzes</Link></Empty>;
  const q = qs[i]; const c = U.course(quiz.courseId) || {};
  const confirmSubmit = () => { const left = answers.filter(a => a === null).length; confirm(left ? <>You have <strong>{left} unanswered question{left > 1 ? 's' : ''}</strong>. Submit anyway?</> : 'Submit your answers? You cannot change them afterwards.', finish, { title: 'Submit quiz', okText: 'Submit quiz' }); };
  const r = Math.max(0, remaining);
  return <div className="row g-4">
    <div className="col-lg-8"><div className="card"><div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-center mb-2"><span className="badge badge-soft-primary">Question {i + 1} of {qs.length}</span><span className="xsmall text-muted">{answers.filter(a => a !== null).length} answered</span></div>
      <Progress value={Math.round((i + 1) / qs.length * 100)} h={4} />
      <h2 className="h5 fw-semibold my-4">{q.text}</h2>
      <div role="radiogroup" aria-label="Answer options">{q.options.map((o, k) => <button key={k} className={`quiz-option ${answers[i] === k ? 'selected' : ''}`} role="radio" aria-checked={answers[i] === k} onClick={() => setAnswers(a => a.map((x, j) => j === i ? k : x))}><span className="letter">{'ABCD'[k]}</span><span>{o}</span></button>)}</div>
      <div className="d-flex justify-content-between mt-4"><button className="btn btn-light" disabled={i === 0} onClick={() => setI(i - 1)}><I n="arrow-left" className="me-1" />Previous</button>
        {i < qs.length - 1 ? <button className="btn btn-primary" onClick={() => setI(i + 1)}>Next<I n="arrow-right" className="ms-1" /></button> : <button className="btn btn-success" onClick={confirmSubmit}><I n="check2-circle" className="me-1" />Submit quiz</button>}</div>
    </div></div></div>
    <div className="col-lg-4"><div className="sticky-side d-grid gap-4">
      <div className="card"><div className="card-body text-center"><div className="small text-muted">Time remaining</div><div className={`display-5 fw-bold timer ${r <= 30 ? 'low' : ''}`}>{String(Math.floor(r / 60)).padStart(2, '0')}:{String(r % 60).padStart(2, '0')}</div><div className="small text-muted">{quiz.title}<br />{c.code} · {quiz.difficulty}</div></div></div>
      <Card title="Questions"><div className="q-palette d-flex flex-wrap gap-2">{qs.map((_, k) => <button key={k} className={k === i ? 'current' : answers[k] !== null ? 'answered' : ''} onClick={() => setI(k)} aria-label={`Go to question ${k + 1}`}>{k + 1}</button>)}</div>
        <div className="d-flex gap-3 xsmall text-muted mt-3"><span><span className="badge soft-primary">■</span> Answered</span><span><span className="badge bg-primary">■</span> Current</span></div><button className="btn btn-success w-100 mt-3" onClick={confirmSubmit}><I n="check2-circle" className="me-1" />Submit quiz</button></Card>
      <Link href="/student/quizzes" className="btn btn-link btn-sm text-muted">Exit without submitting</Link>
    </div></div>
  </div>;
}

export function QuizResults() {
  const me = useMe(); const { quizId } = useParams(); const sp = useSearchParams();
  const quiz = Store.find('quizzes', quizId);
  const attempts = Store.where('quizAttempts', a => a.quizId === quizId && a.userId === me.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const a = sp.get('attempt') ? attempts.find(x => x.id === sp.get('attempt')) : attempts[0];
  if (!quiz || !a) return <Empty icon="clipboard-x" title="No results yet" text="You have not attempted this quiz."><Link href={quiz ? `/student/quizzes/${quizId}` : '/student/quizzes'} className="btn btn-primary">{quiz ? 'Start quiz' : 'Back to quizzes'}</Link></Empty>;
  const qs = Domain.questionsOf(quizId);
  const pct = Math.round(a.score / a.total * 100);
  const wrong = a.answers.filter((x, k) => x !== null && qs[k] && x !== qs[k].answer).length;
  const skipped = a.answers.filter(x => x === null).length;
  const fb = pct >= 90 ? ['🏆', 'Outstanding!', 'You have mastered this topic. Try a harder quiz next.'] : pct >= 75 ? ['🎉', 'Great job!', 'Strong understanding — review the questions you missed to reach 100%.'] : pct >= 60 ? ['👍', 'Good effort — you passed.', 'Revisit the explanations below and the related notes to strengthen weak areas.'] : ['📚', 'Keep practising', 'Review the course materials and explanations below, then retake the quiz.'];
  return <>
    <div className="row g-4 mb-4"><div className="col-lg-5"><div className="card h-100"><div className="card-body text-center p-4">
      <div className="position-relative mx-auto" style={{ maxWidth: 220 }}><ChartBox type="doughnut" labels={['Correct', 'Incorrect', 'Unanswered']} datasets={[{ data: [a.score, wrong, skipped], backgroundColor: ['#16a34a', '#ef4444', '#cbd5e1'] }]} opts={{ legend: false }} height={200} /><div className="position-absolute top-50 start-50 translate-middle"><div className="display-6 fw-bold">{pct}%</div><div className="xsmall text-muted">{a.score}/{a.total}</div></div></div>
      <div className="fs-1 mt-2">{fb[0]}</div><h1 className="h4 fw-bold">{fb[1]}</h1><p className="text-muted small">{fb[2]}</p>
      <div className="d-flex gap-2 justify-content-center"><Link href={`/student/quizzes/${quizId}`} className="btn btn-primary"><I n="arrow-repeat" className="me-1" />Retake quiz</Link><Link href="/student/quizzes" className="btn btn-light">All quizzes</Link></div></div></div></div>
      <div className="col-lg-7"><div className="row g-3 h-100">
        <div className="col-6"><Stat icon="check-circle" label="Correct answers" value={a.score} tone="success" /></div>
        <div className="col-6"><Stat icon="x-circle" label="Incorrect answers" value={wrong} tone="danger" /></div>
        <div className="col-6"><Stat icon="dash-circle" label="Unanswered" value={skipped} tone="secondary" /></div>
        <div className="col-6"><Stat icon="stopwatch" label="Time taken" value={`${Math.floor(a.timeTaken / 60)}m ${a.timeTaken % 60}s`} tone="info" sub={`Limit ${quiz.duration} min`} /></div>
        <div className="col-12"><div className="card"><div className="card-body small"><strong>{quiz.title}</strong> · {U.course(quiz.courseId)?.code} · {quiz.difficulty} · attempted {U.dateTime(a.date)}{attempts.length > 1 && ` · attempt ${attempts.length - attempts.indexOf(a)} of ${attempts.length}`}{pct >= 60 && <> · <span className="text-success fw-semibold">+{Scoring.rules().quizPass} points</span></>}</div></div></div>
      </div></div></div>
    <h2 className="h5 fw-semibold mb-3">Answer explanations</h2>
    {qs.map((qq, k) => { const ans = a.answers[k]; const st = ans === null || ans === undefined ? 'skipped' : ans === qq.answer ? 'correct' : 'wrong';
      return <div className={`card mb-3 answer-review ${st}`} key={qq.id}><div className="card-body"><div className="d-flex gap-2 mb-2"><span className={`badge badge-soft-${st === 'correct' ? 'success' : st === 'wrong' ? 'danger' : 'secondary'}`}>{st === 'correct' ? 'Correct' : st === 'wrong' ? 'Incorrect' : 'Not answered'}</span><span className="small text-muted">Question {k + 1}</span></div>
        <div className="fw-semibold mb-2">{qq.text}</div>
        <div className="row g-2 small mb-2">{qq.options.map((o, x) => <div className="col-md-6" key={x}><div className={`p-2 rounded-2 border ${x === qq.answer ? 'soft-success border-success' : x === ans ? 'soft-danger border-danger' : ''}`}><strong>{'ABCD'[x]}.</strong> {o} {x === qq.answer ? <I n="check-lg" /> : x === ans ? <I n="x-lg" /> : null}</div></div>)}</div>
        <div className="small text-muted"><I n="lightbulb" className="me-1 text-warning" />{qq.explanation}</div></div></div>; })}
  </>;
}
export { uid };
