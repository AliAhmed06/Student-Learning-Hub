'use client';
/* STUDENT — Community feed, Discussion details, Q&A, Study groups, Projects */
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { Avatar, Card, Chips, Empty, I, PageHeader, Progress, SearchInput, Select, StatusBadge, Tabs } from '@/components/ui';
import { courseOptions, useMessage, useReport } from '../shared';

const commentsOf = pid => Store.where('comments', c => c.postId === pid);

function usePostActions() {
  const me = useMe(); const { toast, formModal, confirm } = useUI(); const router = useRouter();
  return {
    like(id) {
      const p = Store.update('communityPosts', id, x => { const i = x.likes.indexOf(me.id); i > -1 ? x.likes.splice(i, 1) : x.likes.push(me.id); });
      if (p.likes.includes(me.id) && p.authorId !== me.id) Store.notify(p.authorId, 'Someone liked your post', `${me.name} liked “${p.title}”.`, 'Community', '/student/community/' + id);
    },
    save(id) { const p = Store.update('communityPosts', id, x => { const i = x.saves.indexOf(me.id); i > -1 ? x.saves.splice(i, 1) : x.saves.push(me.id); }); toast(p.saves.includes(me.id) ? 'Post saved.' : 'Removed from saved posts.', p.saves.includes(me.id) ? 'success' : 'info'); },
    share(id) { Store.update('communityPosts', id, x => { x.shares++; }); U.copy(U.pageUrl('/student/community/' + id)); toast('Link copied to clipboard — share it with classmates!'); },
    edit(p) { formModal({ title: 'Edit post', fields: [{ name: 'title', label: 'Title', required: true, value: p.title }, { name: 'category', label: 'Category', type: 'select', required: true, value: p.category, options: Store.obj('communityCategories') }, { name: 'body', label: 'Post', type: 'textarea', rows: 6, required: true, value: p.body }], onSubmit: v => { Store.update('communityPosts', p.id, v); toast('Post updated.'); } }); },
    del(id, redirect) { confirm('Delete this post and all of its comments?', () => { Store.remove('communityPosts', id); Store.removeWhere('comments', c => c.postId === id); toast('Post deleted.', 'info'); if (redirect) router.push('/student/community'); }, { danger: true, okText: 'Delete' }); }
  };
}

function PostCard({ p, full = false }) {
  const me = useMe(); const act = usePostActions(); const report = useReport();
  const [menu, setMenu] = useState(false);
  const a = U.user(p.authorId) || { name: 'Unknown' };
  const liked = p.likes.includes(me.id), saved = p.saves.includes(me.id), cc = commentsOf(p.id).length;
  return <div className="card post-card mb-3"><div className="card-body">
    <div className="d-flex align-items-center gap-2 mb-2"><Avatar user={a} size={40} /><div className="min-w-0"><div className="small fw-semibold">{a.name}</div><div className="xsmall text-muted">{U.dept(a.department)} · {U.ago(p.date)}</div></div><span className="badge badge-soft-primary ms-auto">{p.category}</span>
      {p.authorId === me.id && <div className="position-relative"><button className="btn btn-icon btn-sm" onClick={() => setMenu(!menu)} aria-label="Post options"><I n="three-dots-vertical" /></button>
        {menu && <ul className="dropdown-menu dropdown-menu-end show" style={{ right: 0, left: 'auto', position: 'absolute' }}><li><button className="dropdown-item" onClick={() => { setMenu(false); act.edit(p); }}><I n="pencil" className="me-2" />Edit</button></li><li><button className="dropdown-item text-danger" onClick={() => { setMenu(false); act.del(p.id, full); }}><I n="trash" className="me-2" />Delete</button></li></ul>}</div>}</div>
    {full ? <h1 className="h4 fw-bold">{p.title}</h1> : <Link href={`/student/community/${p.id}`} className="h6 fw-semibold text-reset d-block">{p.title}</Link>}
    <p className={`post-body ${full ? '' : 'small text-muted'} mb-2`}>{full ? p.body : U.truncate(p.body, 260)}</p>
    {(p.tags || []).length > 0 && <div className="d-flex flex-wrap gap-1 mb-2">{p.tags.map(t => <span key={t} className="xsmall text-primary">#{t}</span>)}</div>}
    <div className="d-flex flex-wrap gap-1 border-top pt-2 mt-2">
      <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={() => act.like(p.id)} aria-pressed={liked}><I n={`heart${liked ? '-fill' : ''}`} />{p.likes.length}</button>
      <Link className="action-btn" href={`/student/community/${p.id}`}><I n="chat" />{cc}<span className="d-none d-sm-inline">Comment{cc === 1 ? '' : 's'}</span></Link>
      <button className="action-btn" onClick={() => act.share(p.id)}><I n="share" />{p.shares}<span className="d-none d-sm-inline">Share</span></button>
      <button className={`action-btn ${saved ? 'on' : ''}`} onClick={() => act.save(p.id)}><I n={`bookmark${saved ? '-fill' : ''}`} /><span className="d-none d-sm-inline">{saved ? 'Saved' : 'Save'}</span></button>
      {p.authorId !== me.id && <button className="action-btn ms-auto" onClick={() => report('post', p.id)}><I n="flag" /><span className="d-none d-sm-inline">Report</span></button>}
    </div></div></div>;
}

function CommunitySidebar() {
  const me = useMe();
  const trending = Store.where('communityPosts', p => p.status !== 'removed').map(p => ({ p, score: p.likes.length + commentsOf(p.id).length * 2 + p.shares })).sort((a, b) => b.score - a.score).slice(0, 5);
  const Tile = ({ href, icon, tone, title, sub }) => <Link href={href} className="d-flex align-items-center gap-3 text-reset p-2 rounded-3 hover-lift border"><span className={`stat-icon soft-${tone}`} style={{ width: 38, height: 38, fontSize: '1rem' }}><I n={icon} /></span><span className="small"><strong className="d-block">{title}</strong><span className="text-muted">{sub}</span></span></Link>;
  return <div className="d-grid gap-4 sticky-side">
    <Card title={<><I n="graph-up-arrow" className="me-2 text-danger" />Trending discussions</>} bodyClass="py-1">{trending.map(({ p }, i) => <Link key={p.id} href={`/student/community/${p.id}`} className="list-row text-reset"><span className={`rank-pill ${i < 3 ? 'soft-danger' : ''}`}>{i + 1}</span><div className="min-w-0"><div className="small fw-semibold text-truncate">{p.title}</div><div className="xsmall text-muted"><I n="heart" /> {p.likes.length} · <I n="chat" /> {commentsOf(p.id).length}</div></div></Link>)}</Card>
    <div className="card"><div className="card-body d-grid gap-2">
      <Tile href="/student/community/questions" icon="question-circle" tone="info" title="Ask questions" sub={`${Store.where('questions', q => !q.answers.length).length} unanswered`} />
      <Tile href="/student/community/groups" icon="collection" tone="success" title="Study groups" sub={`${Store.where('studyGroups', g => g.members.includes(me.id)).length} joined`} />
      <Tile href="/student/community/projects" icon="kanban" tone="purple" title="Project collaboration" sub={`${Store.where('projects', p => p.status === 'Open').length} open projects`} />
    </div></div></div>;
}

export function CommunityFeed() {
  const me = useMe(); const { toast } = useUI();
  const [f, setF] = useState({ q: '', cat: '', sort: 'recent', tab: 'all' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const [draft, setDraft] = useState({ title: '', body: '', category: '' });
  const [err, setErr] = useState({});
  const list = Store.where('communityPosts', p => p.status !== 'removed' && (!f.cat || p.category === f.cat) && U.match(f.q, p.title, p.body, (p.tags || []).join(' '), U.user(p.authorId)?.name)
    && (f.tab === 'all' || (f.tab === 'saved' && p.saves.includes(me.id)) || (f.tab === 'mine' && p.authorId === me.id)))
    .sort(f.sort === 'popular' ? (a, b) => (b.likes.length + commentsOf(b.id).length * 2) - (a.likes.length + commentsOf(a.id).length * 2) : (a, b) => new Date(b.date) - new Date(a.date));
  const create = e => {
    e.preventDefault();
    const er = {}; if (draft.title.trim().length < 5) er.title = 'Title must be at least 5 characters.'; if (draft.body.trim().length < 10) er.body = 'Write at least 10 characters.'; if (!draft.category) er.category = 'Choose a category.';
    setErr(er); if (Object.keys(er).length) return;
    const tags = (draft.body.match(/#(\w+)/g) || []).map(t => t.slice(1));
    Store.add('communityPosts', { authorId: me.id, category: draft.category, title: draft.title.trim(), body: draft.body.trim(), date: new Date().toISOString(), likes: [], saves: [], shares: 0, tags, status: 'visible' }, 'p');
    setDraft({ title: '', body: '', category: '' }); setF(p => ({ ...p, tab: 'all', sort: 'recent' }));
    toast(`Posted to the community feed! +${Scoring.rules().communityPost} points.`);
  };
  return <>
    <PageHeader title="Student Community" subtitle="Discuss, share ideas and help each other."><Link href="/student/community/questions" className="btn btn-light"><I n="question-circle" className="me-1" />Q&A</Link><Link href="/student/community/groups" className="btn btn-light"><I n="collection" className="me-1" />Groups</Link></PageHeader>
    <div className="row g-4"><div className="col-xl-8">
      <form className="card mb-3" onSubmit={create} noValidate><div className="card-body"><div className="d-flex gap-3"><Avatar user={me} size={42} /><div className="flex-grow-1">
        <input className={`form-control mb-2 ${err.title ? 'is-invalid' : ''}`} placeholder="Start a discussion — give it a title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} aria-label="Post title" />{err.title && <div className="invalid-feedback d-block mb-2">{err.title}</div>}
        <textarea className={`form-control mb-2 ${err.body ? 'is-invalid' : ''}`} rows={3} placeholder="Share an idea, resource or question… use #tags to help others find it" value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} aria-label="Post body" />{err.body && <div className="invalid-feedback d-block mb-2">{err.body}</div>}
        <div className="d-flex flex-wrap gap-2 align-items-start"><div><select className={`form-select form-select-sm ${err.category ? 'is-invalid' : ''}`} value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} aria-label="Category"><option value="">Choose category…</option>{Store.obj('communityCategories').map(c => <option key={c}>{c}</option>)}</select>{err.category && <div className="invalid-feedback d-block">{err.category}</div>}</div><button className="btn btn-primary btn-sm ms-auto" type="submit"><I n="send" className="me-1" />Post</button></div>
      </div></div></div></form>
      <div className="card mb-3"><div className="card-body py-2">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="btn-group btn-group-sm" role="group">{[['all', 'Feed'], ['saved', 'Saved'], ['mine', 'My posts']].map(([k, l]) => <button key={k} className={`btn btn-light ${f.tab === k ? 'active' : ''}`} onClick={() => set('tab', k)}>{l}</button>)}</div>
          <SearchInput className="flex-grow-1" style={{ minWidth: 180 }} value={f.q} onChange={v => set('q', v)} placeholder="Search discussions…" />
          <Select value={f.sort} onChange={v => set('sort', v)} label="Sort" className="form-select form-select-sm w-auto" options={[{ value: 'recent', label: 'Recent posts' }, { value: 'popular', label: 'Most popular' }]} />
        </div>
        <div className="mt-2"><Chips items={Store.obj('communityCategories')} active={f.cat} onChange={v => set('cat', v)} /></div>
      </div></div>
      {list.length ? list.map(p => <PostCard key={p.id} p={p} />) : <Empty icon="chat-square-text" title="No posts found" text={f.tab === 'saved' ? 'Save posts to read them later.' : 'Try another search or be the first to start a discussion.'} />}
    </div><div className="col-xl-4"><CommunitySidebar /></div></div>
  </>;
}

export function Discussion() {
  const me = useMe(); const { toast, confirm } = useUI(); const report = useReport();
  const { postId } = useParams();
  const [text, setText] = useState(''); const [bad, setBad] = useState(false);
  const [replyTo, setReplyTo] = useState(null); const [reply, setReply] = useState('');
  const p = Store.find('communityPosts', postId);
  if (!p || p.status === 'removed') return <Empty icon="chat-square-x" title="Discussion not available" text="It may have been deleted or removed by moderators."><Link href="/student/community" className="btn btn-primary">Back to community</Link></Empty>;
  const cs = commentsOf(p.id).sort((a, b) => new Date(a.date) - new Date(b.date));
  const post = (body, parentId = null) => {
    if (body.trim().length < 2) { if (!parentId) setBad(true); return; }
    Store.add('comments', { postId: p.id, authorId: me.id, parentId, text: body.trim(), date: new Date().toISOString(), likes: [] }, 'cm');
    const target = parentId ? Store.find('comments', parentId).authorId : p.authorId;
    if (target !== me.id) Store.notify(target, parentId ? 'New reply to your comment' : 'New comment on your post', `${me.name}: “${U.truncate(body, 60)}”`, 'Community', '/student/community/' + p.id);
    toast(parentId ? 'Reply posted.' : 'Comment posted.');
    if (parentId) { setReply(''); setReplyTo(null); } else setText('');
  };
  const likeC = id => Store.update('comments', id, c => { const i = c.likes.indexOf(me.id); i > -1 ? c.likes.splice(i, 1) : c.likes.push(me.id); });
  const delC = id => confirm('Delete this comment?', () => { Store.removeWhere('comments', c => c.id === id || c.parentId === id); toast('Comment deleted.', 'info'); }, { danger: true, okText: 'Delete' });
  const Comment = ({ c, nested }) => { const u = U.user(c.authorId) || { name: 'Unknown' }; const liked = c.likes.includes(me.id);
    return <div className={`d-flex gap-3 mb-3 ${nested ? 'comment-reply' : ''}`}><Avatar user={u} size={nested ? 30 : 38} /><div className="flex-grow-1 min-w-0">
      <div className="p-3 rounded-3 border"><div className="small"><strong>{u.name}</strong> <span className="text-muted xsmall">· {U.ago(c.date)}</span></div><div className="small mt-1" style={{ whiteSpace: 'pre-line' }}>{c.text}</div></div>
      <div className="d-flex gap-1 mt-1"><button className={`action-btn ${liked ? 'liked' : ''}`} onClick={() => likeC(c.id)}><I n={`heart${liked ? '-fill' : ''}`} />{c.likes.length || ''}</button>
        {!nested && <button className="action-btn" onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReply(''); }}><I n="reply" />Reply</button>}
        {c.authorId === me.id ? <button className="action-btn" onClick={() => delC(c.id)}><I n="trash" />Delete</button> : <button className="action-btn" onClick={() => report('comment', c.id)}><I n="flag" />Report</button>}</div>
      {replyTo === c.id && <div className="mt-2"><textarea className="form-control form-control-sm" rows={2} placeholder="Write a reply…" value={reply} onChange={e => setReply(e.target.value)} autoFocus /><div className="d-flex gap-2 mt-2"><button className="btn btn-primary btn-sm" onClick={() => post(reply, c.id)}>Reply</button><button className="btn btn-light btn-sm" onClick={() => setReplyTo(null)}>Cancel</button></div></div>}
    </div></div>; };
  return <div className="row g-4"><div className="col-xl-8">
    <PostCard p={p} full />
    <div className="card"><div className="card-header"><h2 className="h6 fw-semibold mb-0">{U.plural(cs.length, 'comment')}</h2></div><div className="card-body">
      <div className="d-flex gap-3 mb-4"><Avatar user={me} size={38} /><div className="flex-grow-1"><textarea className={`form-control ${bad ? 'is-invalid' : ''}`} rows={2} placeholder="Add to the discussion…" value={text} onChange={e => { setText(e.target.value); setBad(false); }} />{bad && <div className="invalid-feedback d-block">Comment cannot be empty.</div>}<button className="btn btn-primary btn-sm mt-2" onClick={() => post(text)}><I n="send" className="me-1" />Comment</button></div></div>
      {cs.filter(c => !c.parentId).length ? cs.filter(c => !c.parentId).map(c => <div key={c.id}>{Comment({ c })}{cs.filter(r => r.parentId === c.id).map(r => <div key={r.id}>{Comment({ c: r, nested: true })}</div>)}</div>) : <p className="text-muted small mb-0">No comments yet — start the conversation!</p>}
    </div></div>
  </div><div className="col-xl-4"><CommunitySidebar /></div></div>;
}

export function Questions() {
  const me = useMe(); const { formModal, toast } = useUI(); const report = useReport();
  const [f, setF] = useState({ q: '', cat: '', tab: 'all' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const [open, setOpen] = useState(null);
  const [drafts, setDrafts] = useState({});
  const all = Store.all('questions');
  const list = all.filter(q => (!f.cat || q.category === f.cat) && U.match(f.q, q.title, q.body) && (f.tab === 'all' || (f.tab === 'unanswered' && !q.answers.length) || (f.tab === 'mine' && q.authorId === me.id))).sort((a, b) => new Date(b.date) - new Date(a.date));
  const ask = () => formModal({ title: <><I n="question-circle" className="me-2" />Ask a question</>, submitText: 'Post question',
    fields: [{ name: 'title', label: 'Question', required: true, minlength: 10, placeholder: 'Be specific — e.g. How does LRU differ from FIFO?' }, { name: 'category', label: 'Category', type: 'select', required: true, options: Store.obj('questionCategories') }, { name: 'body', label: 'Details', type: 'textarea', rows: 4, required: true, minlength: 15, placeholder: 'What have you tried? Where are you stuck?' }],
    onSubmit: v => { const q = Store.add('questions', { authorId: me.id, ...v, date: new Date().toISOString(), answers: [] }, 'q'); setOpen(q.id); setF(p => ({ ...p, tab: 'all' })); toast('Question posted!'); } });
  const answer = qid => {
    const t = (drafts[qid] || '').trim(); if (t.length < 10) return toast('Answers should be at least 10 characters.', 'warning');
    const q = Store.update('questions', qid, x => { x.answers.push({ id: 'qa' + Date.now(), authorId: me.id, text: t, date: new Date().toISOString(), helpful: false, votes: 0 }); });
    if (q.authorId !== me.id) Store.notify(q.authorId, 'New answer to your question', `${me.name} answered “${q.title}”.`, 'Community', '/student/community/questions');
    setDrafts({ ...drafts, [qid]: '' }); toast(`Answer posted! +${Scoring.rules().answer} points.`);
  };
  const helpful = (qid, aid) => { const q = Store.update('questions', qid, x => { const a = x.answers.find(a => a.id === aid); a.helpful = !a.helpful; }); const a = q.answers.find(x => x.id === aid);
    if (a.helpful && a.authorId !== me.id) Store.notify(a.authorId, 'Your answer was marked helpful 🎉', `Your answer on “${q.title}” was marked helpful. +${Scoring.rules().helpfulAnswer} points!`, 'Community', '/student/community/questions');
    toast(a.helpful ? 'Marked as helpful answer.' : 'Helpful mark removed.', 'info'); };
  const vote = (qid, aid) => Store.update('questions', qid, x => { x.answers.find(a => a.id === aid).votes++; });
  return <>
    <PageHeader title="Ask Questions" subtitle="Get help from classmates and help others to earn points."><button className="btn btn-primary" onClick={ask}><I n="plus-lg" className="me-1" />Ask a question</button></PageHeader>
    <div className="d-flex flex-wrap gap-2 justify-content-between"><Tabs active={f.tab} onChange={v => set('tab', v)} items={[{ key: 'all', label: 'All questions', count: all.length }, { key: 'unanswered', label: 'Unanswered', count: all.filter(q => !q.answers.length).length }, { key: 'mine', label: 'My questions', count: all.filter(q => q.authorId === me.id).length }]} />
      <div className="d-flex gap-2 mb-3"><SearchInput value={f.q} onChange={v => set('q', v)} placeholder="Search questions…" /><Select value={f.cat} onChange={v => set('cat', v)} all="All categories" options={Store.obj('questionCategories')} /></div></div>
    {list.length ? list.map(q => { const a = U.user(q.authorId) || {}; const isOpen = open === q.id; const solved = q.answers.some(x => x.helpful);
      return <div className="card mb-3" key={q.id}><div className="card-body">
        <div className="d-flex gap-3"><div className="text-center flex-shrink-0" style={{ width: 58 }}><div className={`rounded-3 p-2 ${solved ? 'soft-success' : q.answers.length ? 'soft-primary' : 'soft-warning'}`}><div className="fw-bold">{q.answers.length}</div><div className="xsmall">answer{q.answers.length === 1 ? '' : 's'}</div></div></div>
          <div className="min-w-0 flex-grow-1"><button className="btn btn-link p-0 text-start h6 fw-semibold text-reset text-decoration-none" onClick={() => setOpen(isOpen ? null : q.id)}>{q.title}</button>
            <p className="small text-muted mb-2">{isOpen ? q.body : U.truncate(q.body, 150)}</p>
            <div className="d-flex flex-wrap align-items-center gap-2 xsmall text-muted"><span className="badge badge-soft-primary">{q.category}</span>{solved && <span className="badge badge-soft-success"><I n="check2" /> Solved</span>}<span className="d-flex align-items-center gap-1"><Avatar user={a} size={18} /> {a.name}</span><span>· {U.ago(q.date)}</span><button className="btn btn-sm btn-link ms-auto p-0" onClick={() => setOpen(isOpen ? null : q.id)}>{isOpen ? 'Hide answers' : q.answers.length ? 'View answers' : 'Answer'}</button></div></div></div>
        {isOpen && <div className="border-top mt-3 pt-3">{[...q.answers].sort((x, y) => (y.helpful - x.helpful) || (y.votes - x.votes)).map(ans => <div key={ans.id} className={`d-flex gap-3 mb-3 p-3 rounded-3 ${ans.helpful ? 'soft-success' : 'border'}`}><Avatar user={U.user(ans.authorId)} size={34} /><div className="flex-grow-1"><div className="small"><strong>{U.user(ans.authorId)?.name}</strong> <span className="text-muted xsmall">{U.ago(ans.date)}</span>{ans.helpful && <span className="badge bg-success ms-1"><I n="check2" /> Helpful answer</span>}</div><div className="small mt-1" style={{ whiteSpace: 'pre-line' }}>{ans.text}</div>
          <div className="d-flex gap-1 mt-2"><button className="action-btn" onClick={() => vote(q.id, ans.id)}><I n="hand-thumbs-up" />{ans.votes}</button>{q.authorId === me.id && <button className={`action-btn ${ans.helpful ? 'on' : ''}`} onClick={() => helpful(q.id, ans.id)}><I n="check2-circle" />{ans.helpful ? 'Unmark helpful' : 'Mark helpful'}</button>}<button className="action-btn ms-auto" onClick={() => report('answer', ans.id)}><I n="flag" /></button></div></div></div>)}
          <div className="d-flex gap-2 align-items-start"><Avatar user={me} size={34} /><div className="flex-grow-1"><textarea className="form-control" rows={2} placeholder="Write a helpful answer…" value={drafts[q.id] || ''} onChange={e => setDrafts({ ...drafts, [q.id]: e.target.value })} /><button className="btn btn-primary btn-sm mt-2" onClick={() => answer(q.id)}>Post answer</button></div></div></div>}
      </div></div>; }) : <Empty icon="question-circle" title="No questions found" text="Ask the first question in this category."><button className="btn btn-primary btn-sm" onClick={ask}>Ask a question</button></Empty>}
  </>;
}

export function StudyGroups() {
  const me = useMe(); const { formModal, toast, confirm, openModal, closeModal } = useUI(); const message = useMessage();
  const [f, setF] = useState({ q: '', course: '', tab: 'all' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const all = Store.all('studyGroups');
  const list = all.filter(g => (!f.course || g.courseId === f.course) && U.match(f.q, g.name, g.description, g.subject) && (f.tab === 'all' || (f.tab === 'mine' && g.members.includes(me.id)) || (f.tab === 'courses' && me.courses.includes(g.courseId))));
  const join = g => { if (g.members.length >= g.maxMembers) return toast('This group is full.', 'warning'); Store.update('studyGroups', g.id, x => { x.members.push(me.id); }); Store.notify(g.creatorId, 'New group member', `${me.name} joined “${g.name}”.`, 'Community', '/student/community/groups'); toast(`You joined “${g.name}”.`); closeModal(); };
  const leave = g => confirm(`Leave “${g.name}”?`, () => { Store.update('studyGroups', g.id, x => { x.members = x.members.filter(m => m !== me.id); }); if (!Store.find('studyGroups', g.id).members.length) { Store.remove('studyGroups', g.id); toast('You left and the empty group was closed.', 'info'); } else toast('You left the group.', 'info'); }, { okText: 'Leave group', danger: true });
  const create = () => formModal({ title: <><I n="collection" className="me-2" />Create a study group</>, submitText: 'Create group',
    fields: [{ name: 'name', label: 'Group name', required: true, minlength: 4 }, { name: 'courseId', label: 'Course', type: 'select', required: true, col: 'col-md-6', options: courseOptions() }, { name: 'maxMembers', label: 'Max members', type: 'number', min: 2, value: '8', required: true, col: 'col-md-6' }, { name: 'mode', label: 'Mode', type: 'select', required: true, col: 'col-md-6', options: ['In person', 'Online', 'Hybrid'] }, { name: 'meeting', label: 'Meeting schedule & place', required: true, col: 'col-md-6', placeholder: 'e.g. Fridays 4 PM · Library 204' }, { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true, minlength: 15 }],
    onSubmit: v => { Store.add('studyGroups', { ...v, maxMembers: +v.maxMembers, subject: U.course(v.courseId).subject, members: [me.id], creatorId: me.id, date: new Date().toISOString() }, 'g'); set('tab', 'mine'); toast('Study group created!'); } });
  const details = g => { const c = U.course(g.courseId) || {}; const member = g.members.includes(me.id);
    openModal({ title: g.name, size: 'lg', body: <><div className="d-flex flex-wrap gap-2 mb-3"><span className="badge badge-soft-primary">{c.code}</span><span className="badge badge-soft-secondary">{g.subject}</span><span className="badge badge-soft-info">{g.mode}</span></div>
      <p>{g.description}</p><div className="row g-3 small mb-3"><div className="col-md-6"><div className="p-3 border rounded-3"><div className="text-muted xsmall">Meeting</div><div className="fw-semibold">{g.meeting}</div></div></div><div className="col-md-6"><div className="p-3 border rounded-3"><div className="text-muted xsmall">Created by</div><div className="fw-semibold">{U.user(g.creatorId)?.name} · {U.date(g.date)}</div></div></div></div>
      <h3 className="h6 fw-semibold">Members ({g.members.length}/{g.maxMembers})</h3><Progress value={Math.round(g.members.length / g.maxMembers * 100)} tone="success" h={6} />
      <div className="row g-2 mt-2">{g.members.map(m => { const u = U.user(m); return u && <div className="col-md-6" key={m}><div className="d-flex align-items-center gap-2 p-2 border rounded-3"><Avatar user={u} size={32} /><div className="small"><div className="fw-semibold">{u.name}{m === g.creatorId && <span className="badge badge-soft-warning ms-1">Organizer</span>}</div><div className="xsmall text-muted">{U.dept(u.department)} · Sem {u.semester}</div></div>{m !== me.id && <button className="btn btn-sm btn-light ms-auto" onClick={() => { closeModal(); message(m); }} aria-label="Message"><I n="chat-dots" /></button>}</div></div>; })}</div></>,
      footer: member ? <button className="btn btn-light text-danger" onClick={() => { closeModal(); leave(g); }}>Leave group</button> : g.members.length >= g.maxMembers ? <span className="text-muted small">Group is full</span> : <button className="btn btn-primary" onClick={() => join(g)}>Join group</button> }); };
  return <>
    <PageHeader title="Study Groups" subtitle="Find classmates to study with, or start your own group."><button className="btn btn-primary" onClick={create}><I n="plus-lg" className="me-1" />Create group</button></PageHeader>
    <div className="d-flex flex-wrap gap-2 justify-content-between"><Tabs active={f.tab} onChange={v => set('tab', v)} items={[{ key: 'all', label: 'All groups', count: all.length }, { key: 'courses', label: 'For my courses', count: all.filter(g => me.courses.includes(g.courseId)).length }, { key: 'mine', label: 'My groups', count: all.filter(g => g.members.includes(me.id)).length }]} />
      <div className="d-flex gap-2 mb-3"><SearchInput value={f.q} onChange={v => set('q', v)} placeholder="Search groups…" /><Select value={f.course} onChange={v => set('course', v)} all="All courses" options={courseOptions()} /></div></div>
    <div className="row g-3">{list.length ? list.map(g => { const member = g.members.includes(me.id); const full = g.members.length >= g.maxMembers; const c = U.course(g.courseId);
      return <div className="col-md-6 col-xl-4" key={g.id}><div className="card h-100"><div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between mb-2"><span className="badge badge-soft-primary">{c?.code}</span><span className={`badge badge-soft-${g.mode === 'Online' ? 'info' : g.mode === 'Hybrid' ? 'purple' : 'secondary'}`}>{g.mode}</span></div>
        <h3 className="h6 fw-semibold">{g.name}</h3><div className="small text-primary mb-2">{g.subject}</div>
        <p className="small text-muted flex-grow-1">{U.truncate(g.description, 120)}</p>
        <div className="small mb-2"><I n="clock" className="me-1 text-muted" />{g.meeting}</div>
        <div className="d-flex align-items-center gap-2 mb-3"><div className="avatar-stack d-flex">{g.members.slice(0, 5).map(m => <Avatar key={m} user={U.user(m)} size={28} />)}</div><span className="xsmall text-muted">{g.members.length}/{g.maxMembers} members</span></div>
        <div className="d-flex gap-2"><button className="btn btn-sm btn-light flex-grow-1" onClick={() => details(g)}>Details</button>
          {member ? <button className="btn btn-sm btn-soft" onClick={() => leave(g)}><I n="check2" className="me-1" />Joined · Leave</button> : <button className="btn btn-sm btn-primary" disabled={full} onClick={() => join(g)}>{full ? 'Full' : 'Join group'}</button>}</div>
      </div></div></div>; }) : <div className="col-12"><Empty icon="collection" title="No study groups found" text="Create a group for your course and invite classmates."><button className="btn btn-primary btn-sm" onClick={create}>Create group</button></Empty></div>}</div>
  </>;
}

export function Projects() {
  const me = useMe(); const { formModal, toast, confirm, openModal, closeModal } = useUI();
  const [f, setF] = useState({ q: '', tab: 'open' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const all = Store.all('projects');
  const list = all.filter(p => U.match(f.q, p.title, p.description, p.skills.join(' '), p.category) && (f.tab === 'all' || (f.tab === 'open' && p.status === 'Open') || (f.tab === 'mine' && (p.creatorId === me.id || p.members.includes(me.id))))).sort((a, b) => new Date(b.date) - new Date(a.date));
  const create = () => formModal({ title: <><I n="kanban" className="me-2" />Post a project</>, submitText: 'Publish project',
    fields: [{ name: 'title', label: 'Project title', required: true, minlength: 5 }, { name: 'category', label: 'Category', type: 'select', required: true, col: 'col-md-6', options: ['Web App', 'Mobile App', 'Research', 'Hardware', 'IoT', 'Business', 'Social Impact', 'Other'] }, { name: 'teamSize', label: 'Team size', type: 'number', min: 2, value: '4', required: true, col: 'col-md-6' }, { name: 'skills', label: 'Required skills', required: true, placeholder: 'comma separated, e.g. React, UX, Python' }, { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, minlength: 20 }],
    onSubmit: v => { Store.add('projects', { title: v.title, category: v.category, teamSize: +v.teamSize, skills: v.skills.split(',').map(s => s.trim()).filter(Boolean), description: v.description, creatorId: me.id, members: [me.id], requests: [], status: 'Open', date: new Date().toISOString() }, 'pr'); set('tab', 'mine'); toast('Project published!'); } });
  const requestJoin = p => formModal({ title: `Request to join “${p.title}”`, submitText: 'Send request', fields: [{ name: 'message', label: 'Why are you a good fit?', type: 'textarea', rows: 4, required: true, minlength: 15, placeholder: 'Mention relevant skills, experience and availability.' }],
    onSubmit: v => { Store.update('projects', p.id, x => { x.requests.push({ userId: me.id, message: v.message, status: 'pending', date: new Date().toISOString() }); }); Store.notify(p.creatorId, 'New project join request', `${me.name} wants to join “${p.title}”.`, 'Community', '/student/community/projects'); toast('Join request sent to the project creator.'); } });
  const respond = (p, k, accept) => { const np = Store.update('projects', p.id, x => { const r = x.requests[k]; r.status = accept ? 'accepted' : 'rejected'; if (accept && !x.members.includes(r.userId)) x.members.push(r.userId); if (x.members.length >= x.teamSize) x.status = 'Full'; }); const r = np.requests[k];
    Store.notify(r.userId, accept ? 'You joined a project team 🎉' : 'Project request declined', `${accept ? 'Welcome to' : 'Your request for'} “${np.title}”${accept ? '!' : ' was declined.'}`, 'Community', '/student/community/projects'); toast(accept ? 'Member added to the team.' : 'Request declined.', accept ? 'success' : 'info'); closeModal(); };
  const manage = p => openModal({ title: `Manage “${p.title}”`, size: 'lg',
    body: <><h3 className="h6 fw-semibold">Team ({p.members.length}/{p.teamSize})</h3><div className="d-flex flex-wrap gap-2 mb-4">{p.members.map(m => <span className="chip" key={m}><Avatar user={U.user(m)} size={20} /> {U.user(m)?.name}</span>)}</div>
      <h3 className="h6 fw-semibold">Join requests</h3>{p.requests.length ? p.requests.map((r, k) => <div className="d-flex gap-3 p-3 border rounded-3 mb-2" key={k}><Avatar user={U.user(r.userId)} size={36} /><div className="flex-grow-1"><div className="small fw-semibold">{U.user(r.userId)?.name} <span className="xsmall text-muted">{U.ago(r.date)}</span> <StatusBadge status={r.status} /></div><div className="small">{r.message}</div>
        {r.status === 'pending' && <div className="d-flex gap-2 mt-2"><button className="btn btn-sm btn-success" onClick={() => respond(p, k, true)}>Accept</button><button className="btn btn-sm btn-light" onClick={() => respond(p, k, false)}>Decline</button></div>}</div></div>) : <p className="small text-muted">No requests yet.</p>}</>,
    footer: <><select className="form-select w-auto me-auto" defaultValue={p.status} onChange={e => { Store.update('projects', p.id, { status: e.target.value }); toast('Project status updated.'); }} aria-label="Project status">{['Open', 'Full', 'Completed'].map(s => <option key={s}>{s}</option>)}</select>
      <button className="btn btn-light text-danger" onClick={() => { closeModal(); setTimeout(() => confirm('Delete this project post?', () => { Store.remove('projects', p.id); toast('Project deleted.', 'info'); }, { danger: true, okText: 'Delete' }), 50); }}>Delete project</button></> });
  const leave = p => confirm('Leave this project team?', () => { Store.update('projects', p.id, x => { x.members = x.members.filter(m => m !== me.id); if (x.status === 'Full') x.status = 'Open'; }); toast('You left the project.', 'info'); }, { danger: true, okText: 'Leave' });
  return <>
    <PageHeader title="Project Collaboration" subtitle="Find teammates for side projects, research and competitions."><button className="btn btn-primary" onClick={create}><I n="plus-lg" className="me-1" />Post a project</button></PageHeader>
    <div className="d-flex flex-wrap gap-2 justify-content-between"><Tabs active={f.tab} onChange={v => set('tab', v)} items={[{ key: 'open', label: 'Open projects', count: all.filter(p => p.status === 'Open').length }, { key: 'all', label: 'All', count: all.length }, { key: 'mine', label: 'My projects', count: all.filter(p => p.creatorId === me.id || p.members.includes(me.id)).length }]} />
      <SearchInput className="mb-3" style={{ maxWidth: 300 }} value={f.q} onChange={v => set('q', v)} placeholder="Search by title or skill…" /></div>
    <div className="row g-3">{list.length ? list.map(p => { const creator = U.user(p.creatorId); const isCreator = p.creatorId === me.id; const member = p.members.includes(me.id); const req = p.requests.find(r => r.userId === me.id); const pending = p.requests.filter(r => r.status === 'pending').length;
      let btn;
      if (isCreator) btn = <button className="btn btn-sm btn-primary" onClick={() => manage(p)}>Manage{pending > 0 && <span className="badge bg-white text-primary ms-1">{pending}</span>}</button>;
      else if (member) btn = <button className="btn btn-sm btn-soft" onClick={() => leave(p)}><I n="check2" className="me-1" />Member · Leave</button>;
      else if (req && req.status === 'pending') btn = <span className="badge badge-soft-warning align-self-center">Request pending</span>;
      else if (req && req.status === 'rejected') btn = <span className="badge badge-soft-secondary align-self-center">Request declined</span>;
      else btn = <button className="btn btn-sm btn-primary" disabled={p.status !== 'Open'} onClick={() => requestJoin(p)}>{p.status === 'Open' ? 'Request to join' : p.status}</button>;
      return <div className="col-md-6" key={p.id}><div className="card h-100"><div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between mb-2"><span className="badge badge-soft-primary">{p.category}</span><StatusBadge status={p.status} /></div>
        <h3 className="h6 fw-semibold">{p.title}</h3><p className="small text-muted flex-grow-1">{p.description}</p>
        <div className="d-flex flex-wrap gap-1 mb-3">{p.skills.map(s => <span className="chip" key={s}>{s}</span>)}</div>
        <div className="d-flex align-items-center gap-2 small mb-3"><Avatar user={creator} size={28} /><span>{creator?.name}</span><span className="text-muted ms-auto"><I n="people" className="me-1" />{p.members.length}/{p.teamSize} team</span></div>
        <div className="d-flex justify-content-end gap-2 border-top pt-3">{btn}</div></div></div></div>; }) : <div className="col-12"><Empty icon="kanban" title="No projects found" text="Post a project idea and find collaborators." /></div>}</div>
  </>;
}
