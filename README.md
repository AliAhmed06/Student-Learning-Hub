# University Student Hub — Next.js (JavaScript)

**Learn Together. Share Together. Grow Together.**

A complete frontend for a university platform with three portals (Student, Faculty, Administrator), built with **Next.js App Router + React + JavaScript** (no TypeScript), Bootstrap 5, Bootstrap Icons and Chart.js.

There is **no database yet**. All starting data comes from JS files, and everything users do is saved in the **browser cache (localStorage)**, so the app behaves like a complete system.

---

## 1. How to run

Requirements: **Node.js 20.9 or newer**.

```bash
npm install
npm run dev          # development  → http://localhost:3000
# or
npm run build && npm start   # production build
```

Open http://localhost:3000 and log in with one of the accounts below.

---

## 2. Dummy login credentials

### Main demo accounts
| Role | Name | Email | Password |
|---|---|---|---|
| Student | Hajra Saif Ullah | student@university.edu | `student123` |
| Faculty | Dr. Sarah Mitchell | faculty@university.edu | `faculty123` |
| Administrator | Michael Grant | admin@university.edu | `admin123` |

### Every account in `src/data/data.js`
| Role | Name | Email | Password | Note |
|---|---|---|---|---|
| Student | Hajra Saif Ullah | student@university.edu | `student123` | |
| Student | Daniel Okafor | daniel.okafor@university.edu | `password123` | |
| Student | Mei Lin Chen | meilin.chen@university.edu | `password123` | |
| Student | Omar Siddiqui | omar.siddiqui@university.edu | `password123` | |
| Student | Sofia Rossi | sofia.rossi@university.edu | `password123` | |
| Student | Hamza Raza | hamza.raza@university.edu | `password123` | |
| Student | Priya Sharma | priya.sharma@university.edu | `password123` | |
| Student | Lucas Martin | lucas.martin@university.edu | `password123` | |
| Student | Fatima Noor | fatima.noor@university.edu | `password123` | |
| Student | Ethan Brooks | ethan.brooks@university.edu | `password123` | |
| Student | Zara Ahmed | zara.ahmed@university.edu | `password123` | |
| Student | Noah Kim | noah.kim@university.edu | `password123` | deactivated (login blocked on purpose) |
| Faculty | Dr. Sarah Mitchell | faculty@university.edu | `faculty123` | |
| Faculty | Dr. Imran Qureshi | imran.qureshi@university.edu | `password123` | |
| Faculty | Dr. Elena Petrova | elena.petrova@university.edu | `password123` | |
| Faculty | Prof. James Walker | james.walker@university.edu | `password123` | |
| Faculty | Dr. Aisha Rahman | aisha.rahman@university.edu | `password123` | |
| Admin | Michael Grant | admin@university.edu | `admin123` | |


There are three places in the app where you can see these credentials:
- **Login page:** click a demo account to fill the form, or click **View all dummy accounts & passwords**.
- **Admin → Users → Credentials:** includes accounts created at runtime.
- **Admin → Settings → Credentials.**

---

## 3. Browser cache (the demo "database")

| What happens | Where it is stored |
|---|---|
| App starts | All data is read from `src/data/data.js` |
| A user registers, uploads a note, posts, sends a message, approves an achievement… | Only the **changed collection** is written to `localStorage` as `ush:<collection>` (for example `ush:users`, `ush:notes`) |
| Page refresh / new visit | Cached collections are read from localStorage; untouched ones still come from `data.js` |
| Log in | Session saved as `ush_session` (localStorage when "Remember me" is ticked, otherwise sessionStorage) |
| Admin → Settings → Cache & reset → **Reset demo data** | Clears every `ush:*` key and goes back to `data.js` |

**Example: a new registration**
1. Open `/register` and create a student, e.g. `sara@university.edu` / `sara12345`.
2. The account is saved in `ush:users`, and the student is automatically enrolled in their semester's courses.
3. The student can log in, see their dashboard and appear on the leaderboard.
4. The admin gets a notification and sees the student under **Admin → Users**, tagged **cache**.
5. The account is also listed on the login page under "Accounts registered in this browser".

**See what is cached**
- Click the **Cache · N tables** chip in the top bar, or the footer link. It shows the stored collections, record counts compared with the seed data, sizes, accounts created in the cache and a log of recent writes.
- The panel also appears in **Student → Settings** and **Admin → Settings → Cache & reset**.

Uploaded files (notes, evidence, images) are saved as data URLs. Uploads are limited to about 2 MB because browsers allow roughly 5 MB of localStorage in total.

---

## 4. Folder structure

```
src/
  data/data.js                 ← ALL seed data (users, courses, notes, quizzes, events…)
  lib/
    storage.js                 ← Store: browser-cache data layer + cache inspection
    services.js                ← Auth (demo), Scoring (points/ranks/badges), Domain helpers, Permissions
    utils.js                   ← dates, files, formatting helpers
  context/
    AppDataContext.js          ← re-renders the UI when cached data changes
    AuthContext.js             ← login / logout / register, current user
    ThemeContext.js            ← light / dark / system theme
    UIContext.js               ← toasts, modals, confirm dialogs, form modals
  components/
    layout/AppShell.js         ← role guard, sidebar, top bar, search, notifications, breadcrumbs
    ui.js                      ← stat cards, tabs, tables, pagination, badges, charts…
    Form.js                    ← schema-driven forms with validation
    CacheInspector.js          ← browser-cache panel
  views/                       ← page components
    public.js                  ← landing, login, register, forgot password, 404
    shared.js                  ← material viewer, evidence viewer, report, messaging hooks
    student/*.js               ← 32 student pages
    faculty.js                 ← faculty portal + shared achievement review & announcements
    admin.js                   ← admin console
  app/                         ← Next.js routes (each page.js renders a view)
    student/…  faculty/…  admin/…  login/  register/  forgot-password/
```

---

## 5. Routes

- **Public:** `/`, `/login`, `/register`, `/forgot-password`.
- **Student (32):**
  - Overview: `dashboard`.
  - Learning: `learning`, `learning/courses/[courseId]`, `learning/notes`, `learning/notes/[noteId]`, `learning/upload`.
  - Recognition: `achievements`, `achievements/upload`, `achievements/badges`, `leaderboard`.
  - Exchange: `exchange`, `exchange/[itemId]`, `exchange/create`, `exchange/my-activity`.
  - Community: `community`, `community/[postId]`, `community/questions`, `community/groups`, `community/projects`.
  - Campus: `opportunities`, `events`, `lost-found`, `feedback`.
  - Tools: `ai-assistant`, `planner`, `quizzes`, `quizzes/[quizId]`, `quizzes/[quizId]/results`.
  - Account: `messages`, `notifications`, `profile`, `settings`.
- **Faculty (8):** `dashboard`, `courses`, `materials`, `achievements`, `quizzes`, `students`, `announcements`, `profile`.
- **Admin (14):** `dashboard`, `users`, `courses`, `materials`, `achievements`, `leaderboard`, `marketplace`, `community`, `opportunities`, `events`, `feedback`, `analytics`, `announcements`, `settings`.

Pages are protected by role. Opening another role's page redirects you to your own dashboard, and opening any portal page without logging in redirects you to the login page.

---

## 6. Simulated features (no backend)

- **Authentication** is demo-only. Passwords are stored in plain text in `data.js` and the cache, so it is **not secure**.
- **Forgot password** shows a simulated reset message. No email is sent.
- **The AI Study Assistant is rule-based.** It gives predefined answers, summarises notes and builds practice questions from the quiz bank.
- **Messages** get a simulated auto-reply.
- **Opportunity applications, downloads and email notifications** are simulated.
- **Analytics** combine seeded history (`adminStats`) with live counts from the cache.

---

## 7. Connecting a real backend later

1. Replace the methods in `src/lib/storage.js` (`all`, `find`, `add`, `update`, `remove`) with API calls (REST, Supabase, Firebase, Prisma…). Pages only use these methods, so their code stays the same.
2. Replace `Auth.login`, `Auth.register` and the session handling in `src/lib/services.js` with real authentication (for example NextAuth or Supabase Auth). Hash passwords on the server.
3. Move file uploads from data URLs to object storage (S3, Cloudinary…) and save the URLs instead.
4. Move `Scoring` to the server, or compute it in database views.
