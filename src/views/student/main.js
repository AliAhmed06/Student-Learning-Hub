'use client';
/* STUDENT — Dashboard */
import Link from 'next/link';
import Store from '@/lib/storage';
import U from '@/lib/utils';
import { Domain, Scoring } from '@/lib/services';
import { useMe } from '@/context/AuthContext';
import { Avatar, Card, ChartBox, DateBlock, DueLabel, Empty, I, Stars, Stat } from '@/components/ui';
import { notifIcon } from '@/components/layout/AppShell';
import { useRouter } from 'next/navigation';

export function StudentDashboard() {
  const me = useMe();
  const router = useRouter();
  const us = Store.us(me.id);
  const b = Scoring.breakdown(me.id);
  const rank = Scoring.rankOf(me.id);
  const myCourses = (me.courses || []).map(U.course).filter(Boolean);
  const myNotes = Store.where('notes', n => n.uploaderId === me.id);
  const earned = Scoring.badges(me.id).filter(x => x.earned);
  const courses = me.courses || [];
  const assignments = Store.where('assignments', a => courses.includes(a.courseId) && U.daysLeft(a.dueDate) >= 0 && !us.submittedAssignments.includes(a.id)).sort((a, c) => new Date(a.dueDate) - new Date(c.dueDate)).slice(0, 4);
  const exams = Store.where('exams', e => courses.includes(e.courseId) && U.daysLeft(e.date) >= 0).sort((a, c) => new Date(a.date) - new Date(c.date)).slice(0, 3);
  const notifs = Store.where('notifications', n => n.recipientId === me.id).sort((a, c) => new Date(c.date) - new Date(a.date)).slice(0, 4);
  const posts = Store.where('communityPosts', p => p.status !== 'removed').sort((a, c) => new Date(c.date) - new Date(a.date)).slice(0, 4);
  const recommended = Domain.visibleNotes(me).filter(n => courses.includes(n.courseId) && n.uploaderId !== me.id && n.status === 'approved').sort((a, c) => U.avgRating(c) - U.avgRating(a) || c.downloads - a.downloads).slice(0, 4);
  const events = Store.where('events', e => U.daysLeft(e.date) >= 0).sort((a, c) => new Date(a.date) - new Date(c.date)).slice(0, 3);
  const anns = Domain.announcementsFor(me).slice(0, 3);
  const attempts = Store.where('quizAttempts', a => a.userId === me.id).sort((a, c) => new Date(a.date) - new Date(c.date)).slice(-8);
  const tasksToday = Store.where('tasks', t => t.userId === me.id && t.date === U.ymd() && !t.done).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const openNotif = n => { Store.update('notifications', n.id, { read: true }); if (n.link) router.push(n.link); };

  return <>
    <div className="card welcome-banner mb-4"><div className="card-body p-4 p-lg-5 position-relative" style={{ zIndex: 1 }}><div className="row align-items-center g-4">
      <div className="col-lg-7"><div className="small opacity-75 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h1 className="h2 fw-bold mb-2">{greet}, {me.name.split(' ')[0]}! 👋</h1>
        <p className="opacity-75 mb-4">{tasksToday ? <>You have <strong>{U.plural(tasksToday, 'task')}</strong> planned for today and {U.plural(assignments.length, 'upcoming assignment')}.</> : U.settings().welcomeMessage}</p>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/student/learning/upload" className="btn btn-light"><I n="cloud-arrow-up" className="me-1" />Upload notes</Link>
          <Link href="/student/planner" className="btn btn-light"><I n="plus-lg" className="me-1" />Add task</Link>
          <Link href="/student/ai-assistant" className="btn btn-light"><I n="robot" className="me-1" />Ask assistant</Link>
          <Link href="/student/achievements/upload" className="btn btn-light"><I n="trophy" className="me-1" />Add achievement</Link>
          <Link href="/student/exchange/create" className="btn btn-light"><I n="tag" className="me-1" />Sell an item</Link>
        </div></div>
      <div className="col-lg-5"><div className="d-flex align-items-center gap-3 p-3 rounded-4" style={{ background: 'rgba(255,255,255,.1)' }}>
        <Avatar user={me} size={64} className="avatar-ring" /><div className="min-w-0"><div className="fw-semibold">{me.name}</div><div className="small opacity-75">{me.studentId} · {U.dept(me.department)}</div>
          <div className="small opacity-75">Semester {me.semester} · {Store.obj('university').currentTerm}</div>
          <Link href="/student/profile" className="small text-white text-decoration-underline">View profile</Link></div></div></div>
    </div></div></div>

    <div className="row g-3 mb-4">
      <div className="col-6 col-xl"><Stat icon="book" label="Enrolled courses" value={myCourses.length} sub={`Semester ${me.semester}`} href="/student/learning" /></div>
      <div className="col-6 col-xl"><Stat icon="journal-arrow-up" label="Uploaded notes" value={myNotes.length} tone="info" sub={`${myNotes.reduce((s, n) => s + n.downloads, 0)} downloads`} href="/student/learning/notes?tab=mine" /></div>
      <div className="col-6 col-xl"><Stat icon="bookmark-star" label="Saved resources" value={us.bookmarks.length + us.savedResources.length} tone="purple" sub="Notes & materials" href="/student/learning/notes?tab=saved" /></div>
      <div className="col-6 col-xl"><Stat icon="bar-chart-line" label="Leaderboard rank" value={'#' + rank} tone="warning" sub="Overall ranking" href="/student/leaderboard" /></div>
      <div className="col-12 col-xl"><Stat icon="star" label="Earned points" value={b.total.toLocaleString()} tone="success" sub={`${earned.length} badges earned`} href="/student/achievements/badges" /></div>
    </div>

    {anns.length > 0 && <div className="card mb-4 border-start border-4 border-primary"><div className="card-body py-3"><div className="d-flex align-items-center gap-2 mb-2"><I n="megaphone" className="text-primary" /><strong className="small">Announcements</strong></div>
      {anns.map(a => <div className="small mb-1" key={a.id}>{a.priority === 'high' && <span className="badge badge-soft-danger me-1">Important</span>}<strong>{a.title}</strong> — <span className="text-muted">{U.truncate(a.body, 140)}</span> <span className="xsmall text-muted">· {U.user(a.authorId)?.name || 'Admin'}, {U.ago(a.date)}</span></div>)}</div></div>}

    <div className="row g-4 mb-4">
      <div className="col-lg-4"><Card title="Study progress" actions={<Link href="/student/learning" className="small">Courses</Link>}><ChartBox type="bar" labels={myCourses.map(c => c.code)} datasets={[{ label: 'Completed %', data: myCourses.map(c => Domain.courseProgress(me.id, c.id)) }]} opts={{ max: 100, horizontal: true }} height={200} /></Card></div>
      <div className="col-lg-4"><Card title="Quiz performance" actions={<Link href="/student/quizzes" className="small">Quizzes</Link>}>{attempts.length ? <ChartBox type="line" labels={attempts.map(a => U.shortDate(a.date))} datasets={[{ label: 'Score %', data: attempts.map(a => Math.round(a.score / a.total * 100)), color: '#16a34a' }]} opts={{ max: 100 }} height={200} /> : <Empty icon="patch-question" title="No quiz attempts yet"><Link href="/student/quizzes" className="btn btn-sm btn-primary">Take a quiz</Link></Empty>}</Card></div>
      <div className="col-lg-4"><Card title="Weekly activity (hours)" actions={<Link href="/student/planner" className="small">Planner</Link>}><ChartBox type="bar" labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} datasets={[{ label: 'Hours', data: us.weeklyActivity, color: '#a78bfa' }]} height={200} /></Card></div>
    </div>

    <div className="row g-4"><div className="col-xl-8"><div className="row g-4">
      <div className="col-md-6"><Card title={<><I n="clipboard-check" className="me-2 text-primary" />Upcoming assignments</>} actions={<Link href="/student/planner?tab=deadlines" className="small">View all</Link>} bodyClass="py-1">
        {assignments.length ? assignments.map(a => <div className="list-row" key={a.id}><div className="thumb-sm soft-primary" style={{ width: 42, height: 42, fontSize: '1.1rem' }}><I n="file-earmark-text" /></div><div className="min-w-0"><div className="small fw-semibold text-truncate">{a.title}</div><div className="xsmall text-muted">{U.course(a.courseId)?.code} · {U.dateTime(a.dueDate)}</div></div><div className="ms-auto xsmall text-nowrap"><DueLabel date={a.dueDate} /></div></div>) : <Empty icon="check2-all" title="All caught up!" text="No pending assignments." />}</Card></div>
      <div className="col-md-6"><Card title={<><I n="pencil-square" className="me-2 text-danger" />Upcoming exams</>} actions={<Link href="/student/planner?tab=deadlines" className="small">Schedule</Link>} bodyClass="py-1">
        {exams.length ? exams.map(e => <div className="list-row" key={e.id}><DateBlock date={e.date} /><div className="min-w-0"><div className="small fw-semibold">{U.course(e.courseId)?.code} {e.type}</div><div className="xsmall text-muted">{U.time(e.date)} · {e.room}</div></div><div className="ms-auto xsmall"><DueLabel date={e.date} /></div></div>) : <Empty icon="emoji-smile" title="No exams scheduled" />}</Card></div>
      <div className="col-12"><Card title={<><I n="stars" className="me-2 text-warning" />Recommended study materials</>} actions={<Link href="/student/learning/notes" className="small">Notes library</Link>}>
        {recommended.length ? <div className="row g-3">{recommended.map(n => <div className="col-sm-6" key={n.id}><Link href={`/student/learning/notes/${n.id}`} className="d-flex gap-3 p-2 rounded-3 text-reset hover-lift border"><div className="thumb-sm"><i className={U.fileIcon(n.fileType)} /></div><div className="min-w-0"><div className="small fw-semibold text-truncate">{n.title}</div><div className="xsmall text-muted">{U.course(n.courseId)?.code} · by {U.user(n.uploaderId)?.name}</div><div className="xsmall"><Stars value={U.avgRating(n)} /> <span className="text-muted">{n.downloads} downloads</span></div></div></Link></div>)}</div> : <Empty icon="journal" title="No recommendations yet" />}</Card></div>
      <div className="col-12"><Card title={<><I n="people" className="me-2 text-info" />Recent community activity</>} actions={<Link href="/student/community" className="small">Open feed</Link>} bodyClass="py-1">
        {posts.map(p => <Link href={`/student/community/${p.id}`} className="list-row text-reset" key={p.id}><Avatar user={U.user(p.authorId)} size={36} /><div className="min-w-0"><div className="small"><strong>{U.user(p.authorId)?.name}</strong> posted in <span className="badge badge-soft-primary">{p.category}</span></div><div className="small text-truncate">{p.title}</div></div><div className="ms-auto xsmall text-muted text-nowrap"><I n="heart" /> {p.likes.length} · {U.ago(p.date)}</div></Link>)}</Card></div>
    </div></div>
    <div className="col-xl-4"><div className="d-grid gap-4">
      <Card title={<><I n="award" className="me-2 text-success" />Achievement badges</>} actions={<Link href="/student/achievements/badges" className="small">All badges</Link>}>
        {earned.length ? <div className="d-flex flex-wrap gap-2">{earned.map(x => <span className="chip" key={x.id} title={x.description}><i className={`bi bi-${x.icon}`} style={{ color: x.color }} />{x.name}</span>)}</div> : <p className="small text-muted mb-0">Complete activities to unlock badges.</p>}</Card>
      <Card title={<><I n="bell" className="me-2 text-primary" />Recent notifications</>} actions={<Link href="/student/notifications" className="small">View all</Link>} bodyClass="py-1">
        {notifs.length ? notifs.map(n => <button key={n.id} className="list-row w-100 bg-transparent border-0 text-start text-reset" onClick={() => openNotif(n)}><span className={`notif-icon soft-${n.read ? 'secondary' : 'primary'}`}><I n={notifIcon[n.category] || 'bell'} /></span><div className="min-w-0"><div className={`small ${n.read ? '' : 'fw-semibold'}`}>{n.title}</div><div className="xsmall text-muted">{U.ago(n.date)}</div></div>{!n.read && <span className="ms-auto badge rounded-pill bg-primary">new</span>}</button>) : <Empty icon="bell" title="No notifications" />}</Card>
      <Card title={<><I n="calendar-event" className="me-2 text-danger" />Upcoming events</>} actions={<Link href="/student/events" className="small">All events</Link>} bodyClass="py-1">
        {events.map(e => <div className="list-row" key={e.id}><DateBlock date={e.date} /><div className="min-w-0"><div className="small fw-semibold text-truncate">{e.title}</div><div className="xsmall text-muted text-truncate"><I n="geo-alt" /> {e.location}</div></div>{e.registrations.includes(me.id) && <span className="ms-auto badge badge-soft-success">Going</span>}</div>)}</Card>
    </div></div></div>
  </>;
}
