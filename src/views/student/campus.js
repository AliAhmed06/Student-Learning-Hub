'use client';
/* STUDENT — Opportunities, Events, Lost & Found, Feedback */
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import Form from '@/components/Form';
import { Avatar, Chips, DateBlock, DueLabel, Empty, I, PageHeader, Progress, SearchInput, Select, StatusBadge, Tabs } from '@/components/ui';
import { useMessage } from '../shared';
import { MonthGrid } from './tools';

/* ---------------- OPPORTUNITIES ---------------- */
const OICON = { Internship: 'briefcase', Scholarship: 'mortarboard', Job: 'person-workspace', Competition: 'trophy', Workshop: 'tools', Seminar: 'mic' };
export function Opportunities() {
  const me = useMe(); const sp = useSearchParams(); const { toast, openModal, closeModal, formModal } = useUI();
  const [f, setF] = useState({ q: sp.get('q') || '', type: 'All', mode: '', sort: 'deadline', showExpired: false });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const us = Store.us(me.id);
  const all = Store.all('opportunities');
  const list = all.filter(o => (f.type === 'All' || o.type === f.type || (f.type === 'Saved' && us.savedOpportunities.includes(o.id)) || (f.type === 'Applied' && us.appliedOpportunities.some(a => a.id === o.id)))
    && (!f.mode || o.mode === f.mode) && (f.showExpired || ['Saved', 'Applied'].includes(f.type) || U.daysLeft(o.deadline) >= 0) && U.match(f.q, o.title, o.organization, o.description, (o.tags || []).join(' ')))
    .sort(f.sort === 'deadline' ? (a, b) => new Date(a.deadline) - new Date(b.deadline) : (a, b) => new Date(b.date) - new Date(a.date));
  const save = id => { const a = Store.toggleUs(me.id, 'savedOpportunities', id); toast(a ? 'Opportunity saved.' : 'Removed from saved.', a ? 'success' : 'info'); };
  const apply = o => { closeModal(); setTimeout(() => formModal({ title: `Apply — ${o.title}`, submitText: 'Submit application',
    intro: <div className="demo-banner p-2 small mb-3"><I n="info-circle" className="me-1" />Demo: your application is saved in the browser cache. In production it would be forwarded to the organisation’s portal.</div>,
    fields: [{ name: 'name', label: 'Full name', value: me.name, required: true, col: 'col-md-6' }, { name: 'email', label: 'Email', type: 'email', value: me.email, required: true, col: 'col-md-6' }, { name: 'cover', label: 'Cover note', type: 'textarea', rows: 4, required: true, minlength: 30, placeholder: 'Why are you interested and what makes you a strong candidate?' }, { name: 'cv', label: 'CV / résumé (PDF)', type: 'file', accept: '.pdf', exts: ['pdf'], maxSize: 2 * 1024 * 1024, help: 'Optional in the demo' }],
    onSubmit: () => { Store.us(me.id).appliedOpportunities.push({ id: o.id, date: new Date().toISOString() }); Store.saveUs(); Store.notify(me.id, 'Application submitted', `Your application for “${o.title}” at ${o.organization} was submitted.`, 'System', '/student/opportunities'); toast('Application submitted! Good luck. 🍀'); } }), 50); };
  const details = o => { const saved = us.savedOpportunities.includes(o.id); const ap = us.appliedOpportunities.find(a => a.id === o.id); const dl = U.daysLeft(o.deadline);
    openModal({ title: <><I n={OICON[o.type]} className="me-2 text-primary" />{o.title}</>, size: 'lg',
      body: <><div className="d-flex flex-wrap gap-2 mb-3"><span className="badge badge-soft-primary">{o.type}</span><span className="badge badge-soft-secondary">{o.mode}</span>{ap && <span className="badge badge-soft-success">Applied</span>}</div>
        <h3 className="h6">{o.organization}</h3><p>{o.description}</p>
        <div className="row g-3 small mb-3">{[['geo-alt', 'Location', o.location], ['cash-coin', o.type === 'Scholarship' ? 'Award' : 'Compensation', o.stipend], ['calendar-x', 'Deadline', U.date(o.deadline) + (dl >= 0 ? ` (${dl} days left)` : ' (closed)')], ['person-check', 'Eligibility', o.eligibility]].map(([i, l, v]) => <div className="col-md-6" key={l}><div className="p-3 border rounded-3 h-100"><div className="text-muted xsmall"><I n={i} className="me-1" />{l}</div><div className="fw-semibold">{v}</div></div></div>)}</div>
        <div className="small"><I n="link-45deg" className="me-1" />Official application portal: <code>{o.link}</code></div>
        {ap && <div className="alert alert-success small mt-3 mb-0"><I n="check-circle" className="me-1" />You applied on {U.dateTime(ap.date)}.</div>}</>,
      footer: <><button className="btn btn-light" onClick={() => { save(o.id); closeModal(); }}><I n={`bookmark${saved ? '-fill' : ''}`} className="me-1" />{saved ? 'Saved' : 'Save'}</button>{!ap && dl >= 0 && <button className="btn btn-primary" onClick={() => apply(o)}><I n="send" className="me-1" />Apply now</button>}</> }); };
  return <>
    <PageHeader title="Opportunities" subtitle="Internships, scholarships, jobs, competitions, workshops and seminars." />
    <Tabs active={f.type} onChange={v => set('type', v)} items={[{ key: 'All', label: 'All', count: all.filter(o => U.daysLeft(o.deadline) >= 0).length }, ...Store.obj('opportunityTypes').map(t => ({ key: t, label: t + 's', icon: OICON[t], count: all.filter(o => o.type === t && U.daysLeft(o.deadline) >= 0).length })), { key: 'Saved', label: 'Saved', icon: 'bookmark-star', count: us.savedOpportunities.length }, { key: 'Applied', label: 'Applied', icon: 'send-check', count: us.appliedOpportunities.length }]} />
    <div className="card mb-3"><div className="card-body py-2 d-flex flex-wrap gap-2 align-items-center">
      <SearchInput className="flex-grow-1" style={{ minWidth: 220 }} value={f.q} onChange={v => set('q', v)} placeholder="Search by title, organisation or keyword…" />
      <Select value={f.mode} onChange={v => set('mode', v)} all="Any mode" options={['On-site', 'Remote', 'Hybrid']} />
      <Select value={f.sort} onChange={v => set('sort', v)} label="Sort" options={[{ value: 'deadline', label: 'Deadline soonest' }, { value: 'new', label: 'Newest' }]} />
      <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" id="exp" checked={f.showExpired} onChange={e => set('showExpired', e.target.checked)} /><label className="form-check-label small" htmlFor="exp">Show closed</label></div>
    </div></div>
    <div className="row g-3">{list.length ? list.map(o => { const saved = us.savedOpportunities.includes(o.id); const ap = us.appliedOpportunities.some(a => a.id === o.id); const dl = U.daysLeft(o.deadline);
      return <div className="col-md-6 col-xl-4" key={o.id}><div className={`card h-100 ${dl < 0 ? 'opacity-75' : ''}`}><div className="card-body d-flex flex-column">
        <div className="d-flex gap-3 mb-2"><div className="stat-icon soft-primary"><I n={OICON[o.type]} /></div><div className="min-w-0 flex-grow-1"><span className="badge badge-soft-primary mb-1">{o.type}</span><h3 className="h6 fw-semibold mb-0">{o.title}</h3><div className="small text-muted">{o.organization}</div></div>
          <button className={`btn btn-icon ${saved ? 'active' : ''}`} onClick={() => save(o.id)} aria-label={saved ? 'Unsave' : 'Save'}><I n={`bookmark${saved ? '-fill' : ''}`} /></button></div>
        <p className="small text-muted flex-grow-1">{U.truncate(o.description, 120)}</p>
        <div className="d-flex flex-wrap gap-2 small mb-3"><span className="chip"><I n="geo-alt" />{o.location}</span><span className="chip">{o.mode}</span><span className="chip"><I n="cash" />{o.stipend}</span></div>
        <div className="d-flex align-items-center justify-content-between border-top pt-2"><span className="small"><I n="alarm" className="me-1" />{dl < 0 ? <span className="text-muted">Closed</span> : <>Deadline {U.shortDate(o.deadline)} · <DueLabel date={o.deadline} /></>}</span>{ap && <span className="badge badge-soft-success">Applied</span>}</div>
        <div className="d-flex gap-2 mt-2"><button className="btn btn-sm btn-light flex-grow-1" onClick={() => details(o)}>View details</button>{!ap && dl >= 0 && <button className="btn btn-sm btn-primary flex-grow-1" onClick={() => apply(o)}>Apply</button>}</div>
      </div></div></div>; }) : <div className="col-12"><Empty icon={f.type === 'Saved' ? 'bookmark' : 'briefcase'} title={f.type === 'Saved' ? 'No saved opportunities' : 'No opportunities found'} text={f.type === 'Saved' ? 'Tap the bookmark icon on any opportunity to save it here.' : 'Try a different filter.'} /></div>}</div>
  </>;
}

/* ---------------- EVENTS ---------------- */
export function Events() {
  const me = useMe(); const { toast, confirm, openModal, closeModal } = useUI();
  const [tab, setTab] = useState('upcoming'); const [cat, setCat] = useState(''); const [view, setView] = useState('list'); const [month, setMonth] = useState(new Date());
  const all = Store.all('events');
  const list = all.filter(e => (!cat || e.category === cat) && (tab === 'upcoming' ? U.daysLeft(e.date) >= 0 : tab === 'registered' ? e.registrations.includes(me.id) : U.daysLeft(e.date) < 0)).sort((a, b) => tab === 'past' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
  const register = e => {
    if (e.registrations.includes(me.id)) return confirm(`Cancel your registration for “${e.title}”?`, () => { Store.update('events', e.id, x => { x.registrations = x.registrations.filter(u => u !== me.id); }); toast('Registration cancelled.', 'info'); }, { okText: 'Cancel registration', danger: true });
    if (e.registrations.length >= e.capacity) return toast('Sorry, this event is full.', 'warning');
    Store.update('events', e.id, x => { x.registrations.push(me.id); });
    Store.notify(me.id, 'Registration confirmed', `You are registered for “${e.title}” on ${U.dateTime(e.date)}.`, 'Event', '/student/events');
    toast(`Registered for “${e.title}”! +${Scoring.rules().eventRegistration} points.`); closeModal();
  };
  const details = e => { const reg = e.registrations.includes(me.id); const past = U.daysLeft(e.date) < 0;
    openModal({ title: <><I n={e.icon || 'calendar-event'} className="me-2 text-primary" />{e.title}</>,
      body: <><div className="d-flex flex-wrap gap-2 mb-3"><span className="badge badge-soft-primary">{e.category}</span>{reg && <span className="badge badge-soft-success">Registered</span>}{past && <span className="badge badge-soft-secondary">Past event</span>}</div><p>{e.description}</p>
        <div className="d-grid gap-2 small"><div><I n="calendar3" className="me-2 text-primary" />{U.toDate(e.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div><div><I n="clock" className="me-2 text-primary" />{U.time(e.date)} – {e.endTime}</div><div><I n="geo-alt" className="me-2 text-primary" />{e.location}</div><div><I n="person-badge" className="me-2 text-primary" />Organised by {e.organizer}</div><div><I n="people" className="me-2 text-primary" />{e.registrations.length} / {e.capacity} registered</div></div>
        <div className="mt-3"><Progress value={Math.min(100, Math.round(e.registrations.length / e.capacity * 100))} h={6} /></div></>,
      footer: past ? null : <button className={`btn ${reg ? 'btn-light text-danger' : 'btn-primary'}`} onClick={() => { closeModal(); register(e); }}>{reg ? 'Cancel registration' : 'Register now'}</button> }); };
  return <>
    <PageHeader title="University Events" subtitle="Workshops, seminars, career fairs, cultural and sports events.">
      <div className="btn-group" role="group" aria-label="View"><button className={`btn btn-light ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><I n="grid" className="me-1" />List</button><button className={`btn btn-light ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}><I n="calendar3" className="me-1" />Calendar</button></div></PageHeader>
    <div className="d-flex flex-wrap justify-content-between gap-2">
      {view === 'list' ? <Tabs active={tab} onChange={setTab} items={[{ key: 'upcoming', label: 'Upcoming', count: all.filter(e => U.daysLeft(e.date) >= 0).length }, { key: 'registered', label: 'My registrations', count: all.filter(e => e.registrations.includes(me.id)).length }, { key: 'past', label: 'Past events', count: all.filter(e => U.daysLeft(e.date) < 0).length }]} /> : <div />}
      <div className="mb-3"><Chips items={Store.obj('eventCategories')} active={cat} onChange={setCat} /></div></div>
    {view === 'calendar' ? <div className="card"><div className="card-body"><MonthGrid month={month} onShift={d => setMonth(new Date(month.getFullYear(), month.getMonth() + d, 1))} renderDay={ymd => all.filter(e => (!cat || e.category === cat) && U.ymd(new Date(e.date)) === ymd).map(e => <button key={e.id} className={`cal-ev border-0 w-100 text-start badge-soft-${e.registrations.includes(me.id) ? 'success' : 'primary'}`} onClick={() => details(e)}>{e.title}</button>)} />
      <div className="d-flex gap-3 mt-3 xsmall"><span><span className="badge badge-soft-success">■</span> Registered</span><span><span className="badge badge-soft-primary">■</span> Other events</span></div></div></div>
      : <div className="row g-3">{list.length ? list.map(e => { const reg = e.registrations.includes(me.id); const full = e.registrations.length >= e.capacity; const past = U.daysLeft(e.date) < 0; const d = U.toDate(e.date);
        return <div className="col-md-6 col-xl-4" key={e.id}><div className="card h-100"><div className="card-body d-flex flex-column">
          <div className="d-flex gap-3 mb-2"><DateBlock date={e.date} /><div className="min-w-0"><span className="badge badge-soft-primary mb-1">{e.category}</span><h3 className="h6 fw-semibold mb-0">{e.title}</h3></div></div>
          <p className="small text-muted flex-grow-1">{U.truncate(e.description, 110)}</p>
          <div className="small d-grid gap-1 mb-3"><span><I n="clock" className="me-2 text-muted" />{d.toLocaleDateString('en-US', { weekday: 'short' })}, {U.time(e.date)} – {e.endTime}</span><span className="text-truncate"><I n="geo-alt" className="me-2 text-muted" />{e.location}</span><span><I n="people" className="me-2 text-muted" />{e.registrations.length}/{e.capacity} registered</span></div>
          <div className="d-flex gap-2"><button className="btn btn-sm btn-light flex-grow-1" onClick={() => details(e)}>Details</button>{past ? <span className="badge badge-soft-secondary align-self-center">Ended</span> : reg ? <button className="btn btn-sm btn-soft flex-grow-1" onClick={() => register(e)}><I n="check2" className="me-1" />Registered</button> : <button className="btn btn-sm btn-primary flex-grow-1" disabled={full} onClick={() => register(e)}>{full ? 'Full' : 'Register'}</button>}</div>
        </div></div></div>; }) : <div className="col-12"><Empty icon="calendar-x" title={tab === 'registered' ? 'You have not registered for any events' : 'No events found'} text="Browse upcoming events and register in one click." /></div>}</div>}
  </>;
}

/* ---------------- LOST & FOUND ---------------- */
const LICON = { Electronics: 'phone', 'ID Cards': 'person-vcard', Books: 'book', Bags: 'backpack', Keys: 'key', Clothing: 'bag', Other: 'question-diamond' };
export function LostFound() {
  const me = useMe(); const { formModal, toast, confirm } = useUI(); const message = useMessage();
  const [f, setF] = useState({ tab: 'all', q: '', cat: '', status: 'open' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const all = Store.all('lostFoundItems');
  const list = all.filter(i => (f.tab === 'all' || (f.tab === 'mine' ? i.posterId === me.id : i.type === f.tab)) && (!f.cat || i.category === f.cat) && (!f.status || i.status === f.status) && U.match(f.q, i.title, i.description, i.location)).sort((a, b) => b.date.localeCompare(a.date));
  const report = type => formModal({ title: <><I n={type === 'lost' ? 'search' : 'hand-index'} className="me-2" />Report {type} item</>, submitText: 'Post report',
    fields: [{ name: 'title', label: 'Item', required: true, minlength: 3, placeholder: type === 'lost' ? 'e.g. Black wallet' : 'e.g. Water bottle with stickers' }, { name: 'category', label: 'Category', type: 'select', required: true, col: 'col-md-6', options: Store.obj('lostFoundCategories') }, { name: 'date', label: type === 'lost' ? 'Date lost' : 'Date found', type: 'date', required: true, col: 'col-md-6', value: U.ymd(), max: U.ymd() }, { name: 'location', label: 'Location', required: true, placeholder: 'Building / room / area' }, { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true, minlength: 10, placeholder: 'Colour, brand, distinguishing marks…' }, { name: 'image', label: 'Photo', type: 'file', accept: 'image/png,image/jpeg,image/webp', exts: ['png', 'jpg', 'jpeg', 'webp'], maxSize: 800 * 1024, help: 'Optional · max 800 KB' }],
    onSubmit: async v => { const image = v.image ? await U.readFile(v.image) : null; Store.add('lostFoundItems', { type, title: v.title, category: v.category, description: v.description, location: v.location, date: v.date, posterId: me.id, status: 'open', icon: LICON[v.category] || 'box', image }, 'lf'); setF(p => ({ ...p, tab: type, status: 'open' })); toast(`${type === 'lost' ? 'Lost' : 'Found'} item report posted.`); } });
  return <>
    <PageHeader title="Lost & Found" subtitle="Report lost items or help return found items to their owners."><button className="btn btn-light" onClick={() => report('found')}><I n="hand-index" className="me-1" />Report found item</button><button className="btn btn-primary" onClick={() => report('lost')}><I n="search" className="me-1" />Report lost item</button></PageHeader>
    <div className="d-flex flex-wrap justify-content-between gap-2"><Tabs active={f.tab} onChange={v => set('tab', v)} items={[{ key: 'all', label: 'All', count: all.length }, { key: 'lost', label: 'Lost items', icon: 'search', count: all.filter(i => i.type === 'lost').length }, { key: 'found', label: 'Found items', icon: 'hand-index', count: all.filter(i => i.type === 'found').length }, { key: 'mine', label: 'My reports', count: all.filter(i => i.posterId === me.id).length }]} />
      <div className="d-flex flex-wrap gap-2 mb-3"><SearchInput style={{ maxWidth: 220 }} value={f.q} onChange={v => set('q', v)} /><Select value={f.cat} onChange={v => set('cat', v)} all="All categories" options={Store.obj('lostFoundCategories')} /><Select value={f.status} onChange={v => set('status', v)} all="Any status" options={[{ value: 'open', label: 'Open' }, { value: 'recovered', label: 'Recovered' }]} /></div></div>
    <div className="row g-3">{list.length ? list.map(i => { const p = U.user(i.posterId) || {}; const mine = i.posterId === me.id;
      return <div className="col-sm-6 col-xl-4" key={i.id}><div className={`card h-100 ${i.status === 'recovered' ? 'opacity-75' : ''}`}><div className="thumb">{i.image ? <img src={i.image} alt={i.title} /> : <I n={i.icon || 'box'} />}<span className={`badge ${i.type === 'lost' ? 'bg-danger' : 'bg-success'}`}>{i.type === 'lost' ? 'LOST' : 'FOUND'}</span></div>
        <div className="card-body d-flex flex-column"><div className="d-flex justify-content-between gap-2"><h3 className="h6 fw-semibold">{i.title}</h3><StatusBadge status={i.status} /></div>
          <p className="small text-muted flex-grow-1">{i.description}</p>
          <div className="small d-grid gap-1 mb-3"><span><I n="geo-alt" className="me-2 text-muted" />{i.location}</span><span><I n="calendar3" className="me-2 text-muted" />{U.date(i.date)}</span><span><I n="tag" className="me-2 text-muted" />{i.category}</span><span className="d-flex align-items-center gap-2"><Avatar user={p} size={20} />{p.name}</span></div>
          <div className="d-flex gap-2">{mine ? <>{i.status === 'open' ? <button className="btn btn-sm btn-success flex-grow-1" onClick={() => confirm('Mark this item as recovered / returned to its owner?', () => { Store.update('lostFoundItems', i.id, { status: 'recovered' }); toast('Marked as recovered. 🎉'); }, { okText: 'Mark recovered' })}><I n="check2-circle" className="me-1" />Mark recovered</button> : <button className="btn btn-sm btn-light flex-grow-1" onClick={() => { Store.update('lostFoundItems', i.id, { status: 'open' }); toast('Report reopened.', 'info'); }}>Reopen</button>}
            <button className="btn btn-sm btn-light text-danger" onClick={() => confirm('Delete this report?', () => { Store.remove('lostFoundItems', i.id); toast('Report deleted.', 'info'); }, { danger: true, okText: 'Delete' })} aria-label="Delete"><I n="trash" /></button></>
            : <button className="btn btn-sm btn-primary flex-grow-1" onClick={() => message(i.posterId)}><I n="chat-dots" className="me-1" />{i.type === 'lost' ? 'I found this' : 'This is mine'} — contact</button>}</div>
        </div></div></div>; }) : <div className="col-12"><Empty icon="search-heart" title="No items found" text="Nothing matches these filters." /></div>}</div>
  </>;
}

/* ---------------- FEEDBACK ---------------- */
export function Feedback() {
  const me = useMe(); const { toast, confirm } = useUI();
  const mine = Store.where('feedback', x => x.userId === me.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const steps = ['Submitted', 'In Review', 'Resolved'];
  const fields = [{ name: 'category', label: 'Category', type: 'select', required: true, col: 'col-md-6', options: Store.obj('feedbackCategories') }, { name: 'title', label: 'Title', required: true, minlength: 5, col: 'col-md-6' }, { name: 'description', label: 'Description', type: 'textarea', rows: 5, required: true, minlength: 20, placeholder: 'Describe the issue or suggestion in detail.' },
    ...(U.settings().allowAnonymousFeedback ? [{ name: 'anonymous', label: 'Submit anonymously (your name is hidden from staff)', type: 'switch' }] : [])];
  const submit = v => {
    const now = new Date().toISOString();
    Store.add('feedback', { userId: me.id, category: v.category, title: v.title, description: v.description, anonymous: !!v.anonymous, date: now, status: 'Submitted', history: [{ status: 'Submitted', date: now }], response: null }, 'fb');
    Store.where('users', u => u.role === 'admin').forEach(a => Store.notify(a.id, 'New feedback received', `${v.anonymous ? 'An anonymous student' : me.name} submitted “${v.title}”.`, 'System', '/admin/feedback'));
    toast('Thank you! Your feedback was submitted.');
  };
  return <>
    <PageHeader title="Submit Feedback" subtitle="Help us improve academics, facilities and the Student Hub." />
    <div className="row g-4"><div className="col-lg-5"><div className="card sticky-side"><div className="card-header"><h2 className="h6 fw-semibold mb-0">New feedback</h2></div><div className="card-body"><Form fields={fields} onSubmit={submit} submitText="Submit feedback" submitIcon="send" resetOnSubmit footerClass="d-grid mt-4" key={mine.length} /></div></div></div>
      <div className="col-lg-7"><h2 className="h6 fw-semibold mb-3">Submission history ({mine.length})</h2>
        {mine.length ? mine.map(x => { const idx = x.status === 'Closed' ? 3 : steps.indexOf(x.status);
          return <div className="card mb-3" key={x.id}><div className="card-body">
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-2"><div><h3 className="h6 fw-semibold mb-1">{x.title}</h3><div className="d-flex flex-wrap gap-2 xsmall text-muted"><span className="badge badge-soft-primary">{x.category}</span>{x.anonymous && <span className="badge badge-soft-secondary"><I n="incognito" className="me-1" />Anonymous</span>}<span>{U.dateTime(x.date)}</span></div></div><StatusBadge status={x.status} /></div>
            <p className="small text-muted">{x.description}</p>
            <div className="status-steps mb-1">{steps.map((s, k) => <div key={s} className={`step ${k < idx || ['Resolved', 'Closed'].includes(x.status) ? 'done' : k === idx ? 'current' : ''}`} />)}</div>
            <div className="d-flex justify-content-between xsmall text-muted mb-2">{steps.map(s => <span key={s}>{s}</span>)}</div>
            <div className="xsmall text-muted mb-2">{(x.history || []).map(h => `${h.status} · ${U.date(h.date)}`).join(' → ')}</div>
            {x.response ? <div className="p-3 rounded-3 soft-primary small"><div className="fw-semibold mb-1"><I n="reply" className="me-1" />Response from {U.user(x.response.by)?.name || 'Administration'} · {U.date(x.response.date)}</div>{x.response.text}</div> : <div className="small text-muted"><I n="hourglass-split" className="me-1" />Awaiting response from administration.</div>}
            {x.status === 'Submitted' && <button className="btn btn-sm btn-link text-danger px-0 mt-2" onClick={() => confirm('Withdraw this feedback?', () => { Store.remove('feedback', x.id); toast('Feedback withdrawn.', 'info'); }, { danger: true, okText: 'Withdraw' })}>Withdraw</button>}
          </div></div>; }) : <Empty icon="chat-square-text" title="No feedback submitted yet" text="Your submissions and their status will appear here." />}
      </div></div>
  </>;
}
