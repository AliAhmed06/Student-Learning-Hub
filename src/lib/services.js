/* ==========================================================================
   Domain services: demo Auth, Scoring (points / ranking / badges), helpers
   ========================================================================== */
import Store from './storage';
import U from './utils';

/* ---------------- Auth (DEMO ONLY — not secure) ---------------- */
export const Auth = {
  KEY: 'ush_session',
  session() {
    if (typeof window === 'undefined') return null;
    try { const raw = localStorage.getItem(this.KEY) || sessionStorage.getItem(this.KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  },
  user() {
    const s = this.session();
    if (!s) return null;
    const u = U.user(s.userId);
    if (!u || u.status !== 'active') return null;
    return u;
  },
  login(email, password, remember = true) {
    const u = Store.all('users').find(x => x.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!u || u.password !== password) return { ok: false, error: 'Incorrect email or password. Try one of the demo accounts below.' };
    if (u.status === 'inactive') return { ok: false, error: 'This account has been deactivated by an administrator.' };
    if (u.status === 'suspended') return { ok: false, error: 'This account is suspended. Contact hub@university.edu.' };
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(this.KEY, JSON.stringify({ userId: u.id, at: Date.now() }));
    Store.update('users', u.id, { lastLogin: new Date().toISOString() });
    return { ok: true, user: u };
  },
  clear() { localStorage.removeItem(this.KEY); sessionStorage.removeItem(this.KEY); },
  home: role => `/${role}/dashboard`,
  register(d) {
    const users = Store.all('users');
    if (users.some(u => u.email.toLowerCase() === d.email.toLowerCase())) return { ok: false, field: 'email', error: 'An account with this email already exists.' };
    if (users.some(u => u.studentId && u.studentId.toLowerCase() === d.studentId.toLowerCase())) return { ok: false, field: 'studentId', error: 'This student ID is already registered.' };
    const sem = +d.semester;
    const courses = Store.where('courses', c => c.department === d.department && c.semester === sem).map(c => c.id);
    const u = Store.add('users', {
      role: 'student', name: d.name, email: d.email.toLowerCase(), password: d.password, studentId: d.studentId.toUpperCase(),
      department: d.department, semester: sem, courses, avatarColor: d.avatarColor || '#4f46e5', avatar: d.avatar || null,
      phone: '', bio: 'New member of the University Student Hub.', skills: [], status: 'active', joined: new Date().toISOString(), source: 'registration',
      privacy: { profile: 'public', showEmail: false, leaderboard: true }, notificationPrefs: { email: true, academic: true, community: true, exchange: true, events: true }
    }, 's');
    if (!u) return { ok: false, field: 'email', error: 'Could not save to the browser cache.' };
    Store.notify(u.id, 'Welcome to University Student Hub!', 'Your account is saved. Start by exploring your courses in the Learning Hub.', 'System', '/student/learning');
    Store.where('users', x => x.role === 'admin').forEach(a => Store.notify(a.id, 'New student registered', `${u.name} (${u.studentId}) created an account.`, 'System', '/admin/users'));
    return { ok: true, user: u };
  }
};

export const Permissions = {
  canAccess: (user, role) => !role || (user && user.role === role),
  isOwner: (user, ownerId) => user && user.id === ownerId,
  canModerate: user => user && (user.role === 'admin' || user.role === 'faculty')
};

/* ---------------- Scoring ---------------- */
export const Scoring = {
  rules: () => Store.obj('scoringRules'),
  inPeriod(dateStr, period) {
    if (period === 'overall') return true;
    const d = U.toDate(dateStr), n = new Date();
    if (period === 'monthly') return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    return d.getFullYear() === n.getFullYear();
  },
  metrics(uid, period = 'overall') {
    const ip = d => this.inPeriod(d, period);
    const answers = [];
    Store.all('questions').forEach(q => q.answers.forEach(a => { if (a.authorId === uid && ip(a.date)) answers.push(a); }));
    const appr = Store.where('achievements', a => a.studentId === uid && a.status === 'approved' && ip(a.reviewedAt || a.date));
    return {
      notes: Store.where('notes', n => n.uploaderId === uid && n.status === 'approved' && ip(n.date)).length,
      quizzes: Store.where('quizAttempts', a => a.userId === uid && a.score / a.total >= 0.6 && ip(a.date)).length,
      achievementPoints: appr.reduce((s, a) => s + (+a.points || 0), 0),
      achievements: appr.length,
      posts: Store.where('communityPosts', p => p.authorId === uid && p.status !== 'removed' && ip(p.date)).length,
      comments: Store.where('comments', c => c.authorId === uid && ip(c.date)).length,
      answers: answers.length,
      helpful: answers.filter(a => a.helpful).length,
      exchanges: Store.where('marketplaceItems', i => i.ownerId === uid && ['Sold', 'Exchanged'].includes(i.status) && ip(i.date)).length,
      events: Store.where('events', e => e.registrations.includes(uid) && ip(e.date)).length
    };
  },
  breakdown(uid, period = 'overall') {
    const r = this.rules();
    const lb = Store.all('leaderboard').find(x => x.userId === uid) || {};
    const base = (period === 'overall' ? lb.base : period === 'monthly' ? lb.monthly : lb.annual) || {};
    const m = this.metrics(uid, period);
    const academic = (base.academic || 0) + m.notes * r.noteUpload + m.quizzes * r.quizPass;
    const community = (base.community || 0) + m.posts * r.communityPost + m.comments * r.comment + m.answers * r.answer + m.helpful * r.helpfulAnswer + m.events * r.eventRegistration;
    const achievements = (base.achievements || 0) + m.achievementPoints;
    const exchange = (base.exchange || 0) + m.exchanges * r.exchangeCompleted;
    return { academic, community, achievements, exchange, total: academic + community + achievements + exchange, metrics: m };
  },
  ranking(period = 'overall', filters = {}) {
    const rows = Store.where('users', u => u.role === 'student' && u.status !== 'suspended')
      .map(u => ({ user: u, ...this.breakdown(u.id, period) }))
      .sort((a, b) => b.total - a.total || a.user.name.localeCompare(b.user.name));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows.filter(r => (!filters.department || r.user.department === filters.department) && (!filters.semester || r.user.semester === +filters.semester));
  },
  rankOf(uid, period = 'overall') { const r = this.ranking(period).find(x => x.user.id === uid); return r ? r.rank : '—'; },
  badges(uid) {
    const m = this.metrics(uid);
    m.points = this.breakdown(uid).total;
    return Store.all('badges').map(b => { const value = m[b.metric] || 0; return { ...b, value, earned: value >= b.min, progress: Math.min(100, Math.round(value / b.min * 100)) }; });
  },
  sotyScore(row) {
    const c = Store.obj('studentOfYearCriteria');
    return Math.round((row.academic * c.academic + row.achievements * c.achievements + row.community * c.community + row.exchange * c.exchange) / 100);
  }
};

/* ---------------- Domain helpers ---------------- */
export const Domain = {
  announcementsFor(user) {
    return Store.all('announcements').filter(a => {
      if (a.audience === 'all' || user.role === 'admin') return true;
      if (a.audience === 'students') return user.role === 'student';
      if (a.audience === 'faculty') return user.role === 'faculty';
      if (a.audience === 'department') return user.department === a.departmentId;
      if (a.audience === 'course') return user.role === 'student' ? (user.courses || []).some(c => a.courseIds.includes(c)) : a.authorId === user.id || a.courseIds.some(c => (U.course(c) || {}).facultyId === user.id);
      if (a.audience === 'selected') return a.studentIds.includes(user.id) || a.authorId === user.id;
      return false;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  audienceLabel(a) {
    if (a.audience === 'all') return 'Everyone';
    if (a.audience === 'students') return 'All students';
    if (a.audience === 'faculty') return 'All faculty';
    if (a.audience === 'department') return 'Department: ' + U.dept(a.departmentId);
    if (a.audience === 'course') return a.courseIds.map(c => (U.course(c) || {}).code).join(', ');
    if (a.audience === 'selected') return U.plural(a.studentIds.length, 'selected student');
    return a.audience;
  },
  notifyAnnouncement(a) {
    Store.where('users', u => u.id !== a.authorId && u.status === 'active').forEach(u => {
      if (Domain.announcementsFor(u).some(x => x.id === a.id)) Store.notify(u.id, 'New announcement: ' + a.title, U.truncate(a.body, 90), 'System', `/${u.role}/dashboard`);
    });
  },
  facultyCourses: fid => Store.where('courses', c => c.facultyId === fid),
  courseStudents: cid => Store.where('users', u => u.role === 'student' && (u.courses || []).includes(cid)),
  visibleNotes: user => Store.where('notes', n => n.status === 'approved' || (user && n.uploaderId === user.id)),
  conversationWith(uid, otherId) {
    let c = Store.all('conversations').find(x => x.participants.includes(uid) && x.participants.includes(otherId));
    if (!c) c = Store.add('conversations', { participants: [uid, otherId], messages: [] }, 'cv');
    return c;
  },
  unreadMessages: uid => Store.all('conversations').filter(c => c.participants.includes(uid)).reduce((s, c) => s + c.messages.filter(m => m.senderId !== uid && !m.read).length, 0),
  courseProgress(uid, cid) {
    const mods = Store.where('courseModules', m => m.courseId === cid);
    if (!mods.length) return 0;
    const done = Store.us(uid).completedModules.filter(id => mods.some(m => m.id === id)).length;
    return Math.round(done / mods.length * 100);
  },
  questionsOf: qid => Store.where('quizQuestions', q => q.quizId === qid),
  materialText(m) {
    const c = U.course(m.courseId) || {};
    return `${m.title}\n${'='.repeat(m.title.length)}\nCourse: ${c.code} — ${c.title}\nType: ${m.type}\n\n${m.description}\n\n${m.content || ''}\n\n— Downloaded from University Student Hub (demo)`;
  },
  logActivity(userId, hours) {
    const us = Store.us(userId);
    const i = (new Date().getDay() + 6) % 7;
    us.weeklyActivity[i] = +((us.weeklyActivity[i] || 0) + hours).toFixed(1);
    Store.saveUs();
  },
  report(targetType, targetId, reporterId, reason) {
    Store.add('reports', { targetType, targetId, reporterId, reason, date: new Date().toISOString(), status: 'open' }, 'rp');
    Store.where('users', u => u.role === 'admin').forEach(a => Store.notify(a.id, 'Content reported', `A ${targetType} was reported: ${U.truncate(reason, 60)}`, 'System', targetType === 'listing' ? '/admin/marketplace' : targetType === 'note' ? '/admin/materials' : '/admin/community'));
  }
};
