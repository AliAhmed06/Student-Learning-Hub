/* ==========================================================================
   University Student Hub — src/data/data.js
   --------------------------------------------------------------------------
   CENTRAL SOURCE OF TRUTH for every piece of initial (seed) data.
   All pages read from this file through Store (js/core/store.js).
   localStorage only keeps collections the user has CHANGED; untouched
   collections are always read fresh from here.

   Dates are generated relative to "today" so the demo always looks current.
   ========================================================================== */

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  /** ISO datetime `days` from today at hh:mm local time */
  const at = (days, h = 10, m = 0) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, h, m).toISOString();
  /** YYYY-MM-DD `days` from today */
  const day = days => {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  };
  const monthLabel = back => {
    const t = new Date(now.getFullYear(), now.getMonth() - back, 1);
    return t.toLocaleString('en-US', { month: 'short' });
  };

  /* ------------------------------------------------------------------ */
  /* UNIVERSITY & PLATFORM                                               */
  /* ------------------------------------------------------------------ */
  const university = {
    name: 'Northfield University',
    short: 'NFU',
    platform: 'University Student Hub',
    tagline: 'Learn Together. Share Together. Grow Together.',
    email: 'hub@university.edu',
    phone: '+1 (555) 014-2200',
    address: '1200 College Avenue, Northfield',
    academicYear: '2026–2027',
    currentTerm: 'Fall 2026',
    founded: 1962
  };

  const platformSettings = {
    requireNoteApproval: false,
    allowAnonymousFeedback: true,
    currency: '$',
    welcomeMessage: 'Welcome to the Fall 2026 term! Explore notes, share achievements and connect with classmates.'
  };

  const demoCredentials = [
    { role: 'student', label: 'Student', email: 'student@university.edu', password: 'student123', icon: 'mortarboard' },
    { role: 'faculty', label: 'Faculty', email: 'faculty@university.edu', password: 'faculty123', icon: 'person-workspace' },
    { role: 'admin', label: 'Administrator', email: 'admin@university.edu', password: 'admin123', icon: 'shield-lock' }
  ];

  /* ------------------------------------------------------------------ */
  /* DEPARTMENTS & SEMESTERS                                             */
  /* ------------------------------------------------------------------ */
  const departments = [
    { id: 'cs', code: 'CS', name: 'Computer Science', building: 'Turing Hall', color: '#4f46e5' },
    { id: 'ee', code: 'EE', name: 'Electrical Engineering', building: 'Faraday Block', color: '#0891b2' },
    { id: 'bba', code: 'BBA', name: 'Business Administration', building: 'Commerce Centre', color: '#d97706' },
    { id: 'math', code: 'MATH', name: 'Mathematics', building: 'Euler Building', color: '#16a34a' },
    { id: 'me', code: 'ME', name: 'Mechanical Engineering', building: 'Watt Workshop', color: '#dc2626' }
  ];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: n, name: `Semester ${n}` }));

  /* ------------------------------------------------------------------ */
  /* USERS (students, faculty, administrators)                          */
  /* passwords are DEMO ONLY — never do this in production              */
  /* ------------------------------------------------------------------ */
  const defaultPrefs = { email: true, academic: true, community: true, exchange: true, events: true };
  const student = (id, name, email, studentId, department, semester, courses, color, bio, skills, extra = {}) => ({
    id, role: 'student', name, email, password: 'password123', studentId, department, semester, courses,
    avatarColor: color, avatar: null, phone: '', bio, skills, status: 'active', joined: at(-300 - semester * 20),
    privacy: { profile: 'public', showEmail: false, leaderboard: true }, notificationPrefs: { ...defaultPrefs }, ...extra
  });

  const users = [
    student('s1', 'Hajra Saif Ullah', 'student@university.edu', 'NFU-2024-0142', 'cs', 5, ['c2', 'c3', 'c4', 'c9'], '#4f46e5',
      'Computer Science junior interested in data systems, open source and peer teaching. Volunteer tutor for Data Structures.',
      ['Python', 'SQL', 'React', 'Data Analysis', 'Git'], { password: 'student123', phone: '+1 (555) 201-4412' }),
    student('s2', 'Daniel Okafor', 'daniel.okafor@university.edu', 'NFU-2024-0157', 'cs', 5, ['c2', 'c3', 'c4', 'c9'], '#0891b2',
      'Backend enthusiast. Captain of the NFU competitive programming team.', ['C++', 'Go', 'Algorithms', 'Docker']),
    student('s3', 'Mei Lin Chen', 'meilin.chen@university.edu', 'NFU-2025-0033', 'cs', 3, ['c1', 'c10'], '#db2777',
      'Second-year CS student who loves UI design and accessibility.', ['Figma', 'JavaScript', 'CSS', 'UX Research']),
    student('s4', 'Omar Siddiqui', 'omar.siddiqui@university.edu', 'NFU-2024-0210', 'ee', 5, ['c7', 'c9'], '#16a34a',
      'Embedded systems and robotics. IEEE student branch treasurer.', ['MATLAB', 'Arduino', 'C', 'PCB Design']),
    student('s5', 'Sofia Rossi', 'sofia.rossi@university.edu', 'NFU-2025-0088', 'bba', 3, ['c8', 'c10'], '#d97706',
      'Marketing major with a passion for social impact startups.', ['Canva', 'Market Research', 'Public Speaking']),
    student('s6', 'Hamza Raza', 'hamza.raza@university.edu', 'NFU-2024-0175', 'cs', 5, ['c2', 'c3', 'c4', 'c9'], '#7c3aed',
      'Full-stack developer and hackathon regular. Building tools for students.', ['Node.js', 'React', 'MongoDB', 'TypeScript']),
    student('s7', 'Priya Sharma', 'priya.sharma@university.edu', 'NFU-2025-0061', 'math', 3, ['c10', 'c9'], '#0d9488',
      'Mathematics student exploring statistics and data science.', ['R', 'Statistics', 'LaTeX', 'Python']),
    student('s8', 'Lucas Martin', 'lucas.martin@university.edu', 'NFU-2024-0233', 'me', 5, ['c12', 'c9'], '#ea580c',
      'Formula Student team member focusing on thermal systems.', ['SolidWorks', 'ANSYS', 'CAD', 'Thermodynamics']),
    student('s9', 'Fatima Noor', 'fatima.noor@university.edu', 'NFU-2023-0019', 'cs', 7, ['c5', 'c4'], '#be123c',
      'Final-year CS student researching NLP for low-resource languages.', ['PyTorch', 'NLP', 'Research', 'Python']),
    student('s10', 'Ethan Brooks', 'ethan.brooks@university.edu', 'NFU-2024-0244', 'bba', 5, ['c11', 'c8'], '#2563eb',
      'Finance club president. Interested in fintech and investing.', ['Excel', 'Financial Modelling', 'Power BI']),
    student('s11', 'Zara Ahmed', 'zara.ahmed@university.edu', 'NFU-2025-0102', 'ee', 3, ['c6', 'c10'], '#9333ea',
      'Electrical engineering sophomore and university debate team member.', ['Circuit Design', 'Multisim', 'Debate']),
    student('s12', 'Noah Kim', 'noah.kim@university.edu', 'NFU-2025-0117', 'cs', 3, ['c1', 'c10'], '#475569',
      'Game development hobbyist. Currently on academic leave.', ['Unity', 'C#', 'Blender'], { status: 'inactive' }),

    { id: 'f1', role: 'faculty', name: 'Dr. Sarah Mitchell', email: 'faculty@university.edu', password: 'faculty123', department: 'cs',
      designation: 'Associate Professor', office: 'Turing Hall 304', phone: '+1 (555) 014-2311', officeHours: 'Mon & Wed, 2:00–4:00 PM',
      bio: 'Researches database systems and data-intensive applications. 12 years of teaching experience.', avatarColor: '#7c3aed', avatar: null, status: 'active', joined: at(-2400) },
    { id: 'f2', role: 'faculty', name: 'Dr. Imran Qureshi', email: 'imran.qureshi@university.edu', password: 'password123', department: 'cs',
      designation: 'Professor', office: 'Turing Hall 310', phone: '+1 (555) 014-2318', officeHours: 'Tue & Thu, 11:00 AM–1:00 PM',
      bio: 'Operating systems, distributed computing and AI systems.', avatarColor: '#0f766e', avatar: null, status: 'active', joined: at(-3600) },
    { id: 'f3', role: 'faculty', name: 'Dr. Elena Petrova', email: 'elena.petrova@university.edu', password: 'password123', department: 'ee',
      designation: 'Assistant Professor', office: 'Faraday Block 112', phone: '+1 (555) 014-2402', officeHours: 'Wed, 10:00 AM–12:00 PM',
      bio: 'Signal processing and power electronics.', avatarColor: '#0369a1', avatar: null, status: 'active', joined: at(-1500) },
    { id: 'f4', role: 'faculty', name: 'Prof. James Walker', email: 'james.walker@university.edu', password: 'password123', department: 'bba',
      designation: 'Professor', office: 'Commerce Centre 220', phone: '+1 (555) 014-2510', officeHours: 'Mon, 1:00–3:00 PM',
      bio: 'Marketing strategy and corporate finance.', avatarColor: '#b45309', avatar: null, status: 'active', joined: at(-4100) },
    { id: 'f5', role: 'faculty', name: 'Dr. Aisha Rahman', email: 'aisha.rahman@university.edu', password: 'password123', department: 'math',
      designation: 'Associate Professor', office: 'Euler Building 015', phone: '+1 (555) 014-2633', officeHours: 'Thu, 2:00–4:00 PM',
      bio: 'Probability theory and applied statistics.', avatarColor: '#15803d', avatar: null, status: 'active', joined: at(-2900) },

    { id: 'a1', role: 'admin', name: 'Michael Grant', email: 'admin@university.edu', password: 'admin123', department: null,
      designation: 'Platform Administrator, Office of Digital Learning', office: 'Admin Block 101', phone: '+1 (555) 014-2000',
      bio: 'Manages the Student Hub platform and digital learning services.', avatarColor: '#1e293b', avatar: null, status: 'active', joined: at(-1800) }
  ];

  /* ------------------------------------------------------------------ */
  /* COURSES & MODULES                                                   */
  /* ------------------------------------------------------------------ */
  const courses = [
    { id: 'c1', code: 'CS-201', title: 'Data Structures & Algorithms', department: 'cs', semester: 3, facultyId: 'f1', credits: 4, category: 'Core', subject: 'Programming',
      description: 'Arrays, linked lists, stacks, queues, trees, heaps, hashing and graphs, with asymptotic analysis and classic algorithm design paradigms.' },
    { id: 'c2', code: 'CS-305', title: 'Database Systems', department: 'cs', semester: 5, facultyId: 'f1', credits: 3, category: 'Core', subject: 'Databases',
      description: 'Relational model, SQL, ER design, normalization, indexing, query processing, transactions and an introduction to NoSQL stores.' },
    { id: 'c3', code: 'CS-310', title: 'Operating Systems', department: 'cs', semester: 5, facultyId: 'f2', credits: 4, category: 'Core', subject: 'Systems',
      description: 'Processes, threads, CPU scheduling, synchronization, deadlocks, memory management, virtual memory and file systems.' },
    { id: 'c4', code: 'CS-320', title: 'Software Engineering', department: 'cs', semester: 5, facultyId: 'f1', credits: 3, category: 'Core', subject: 'Software Engineering',
      description: 'Requirements, agile processes, UML, design patterns, testing strategies and team-based project delivery.' },
    { id: 'c5', code: 'CS-410', title: 'Artificial Intelligence', department: 'cs', semester: 7, facultyId: 'f2', credits: 3, category: 'Elective', subject: 'AI',
      description: 'Search, knowledge representation, probabilistic reasoning, machine learning foundations and neural networks.' },
    { id: 'c6', code: 'EE-210', title: 'Circuit Analysis', department: 'ee', semester: 3, facultyId: 'f3', credits: 4, category: 'Core', subject: 'Electronics',
      description: 'Kirchhoff laws, nodal and mesh analysis, Thevenin/Norton equivalents, RC/RL transients and AC steady-state analysis.' },
    { id: 'c7', code: 'EE-330', title: 'Digital Signal Processing', department: 'ee', semester: 5, facultyId: 'f3', credits: 3, category: 'Core', subject: 'Signals',
      description: 'Discrete-time signals, Z-transform, DFT/FFT, FIR and IIR filter design with MATLAB labs.' },
    { id: 'c8', code: 'BBA-250', title: 'Principles of Marketing', department: 'bba', semester: 3, facultyId: 'f4', credits: 3, category: 'Core', subject: 'Marketing',
      description: 'Marketing mix, consumer behaviour, segmentation, targeting, positioning and digital marketing fundamentals.' },
    { id: 'c9', code: 'MATH-220', title: 'Probability & Statistics', department: 'math', semester: 5, facultyId: 'f5', credits: 3, category: 'General', subject: 'Mathematics',
      description: 'Probability axioms, random variables, distributions, estimation, hypothesis testing and regression.' },
    { id: 'c10', code: 'MATH-110', title: 'Linear Algebra', department: 'math', semester: 3, facultyId: 'f5', credits: 3, category: 'General', subject: 'Mathematics',
      description: 'Vectors, matrices, systems of equations, vector spaces, eigenvalues and applications in computing.' },
    { id: 'c11', code: 'BBA-340', title: 'Financial Management', department: 'bba', semester: 5, facultyId: 'f4', credits: 3, category: 'Core', subject: 'Finance',
      description: 'Time value of money, capital budgeting, risk and return, cost of capital and working capital management.' },
    { id: 'c12', code: 'ME-300', title: 'Engineering Thermodynamics', department: 'me', semester: 5, facultyId: 'f3', credits: 3, category: 'Lab', subject: 'Mechanical',
      description: 'Laws of thermodynamics, properties of pure substances, power and refrigeration cycles with lab experiments.' }
  ];

  const courseModules = [
    { id: 'm1', courseId: 'c1', order: 1, title: 'Complexity & Arrays', description: 'Big-O notation, amortized analysis, static and dynamic arrays.' },
    { id: 'm2', courseId: 'c1', order: 2, title: 'Linked Structures', description: 'Singly/doubly linked lists, stacks and queues.' },
    { id: 'm3', courseId: 'c1', order: 3, title: 'Trees & Graphs', description: 'BSTs, heaps, BFS, DFS and shortest paths.' },
    { id: 'm4', courseId: 'c2', order: 1, title: 'Relational Model & SQL', description: 'Relations, keys, relational algebra and SQL queries.' },
    { id: 'm5', courseId: 'c2', order: 2, title: 'Database Design', description: 'ER modelling, functional dependencies and normalization up to BCNF.' },
    { id: 'm6', courseId: 'c2', order: 3, title: 'Transactions & Indexing', description: 'ACID, concurrency control, B+ trees and hash indexes.' },
    { id: 'm7', courseId: 'c3', order: 1, title: 'Processes & Threads', description: 'Process lifecycle, PCB, context switching and threading models.' },
    { id: 'm8', courseId: 'c3', order: 2, title: 'Scheduling & Synchronization', description: 'FCFS, SJF, RR, priority scheduling; mutexes, semaphores, monitors.' },
    { id: 'm9', courseId: 'c3', order: 3, title: 'Memory Management', description: 'Paging, segmentation, TLBs, page replacement algorithms.' },
    { id: 'm10', courseId: 'c4', order: 1, title: 'Requirements & Agile', description: 'User stories, Scrum ceremonies and backlog management.' },
    { id: 'm11', courseId: 'c4', order: 2, title: 'Design & UML', description: 'Class, sequence and activity diagrams; SOLID and design patterns.' },
    { id: 'm12', courseId: 'c4', order: 3, title: 'Testing & Delivery', description: 'Unit/integration testing, CI/CD and code review practices.' },
    { id: 'm13', courseId: 'c5', order: 1, title: 'Search Strategies', description: 'Uninformed and heuristic search, A*, adversarial search.' },
    { id: 'm14', courseId: 'c5', order: 2, title: 'Machine Learning Basics', description: 'Regression, classification, evaluation metrics and overfitting.' },
    { id: 'm15', courseId: 'c6', order: 1, title: 'DC Circuit Laws', description: 'KCL, KVL, nodal and mesh analysis.' },
    { id: 'm16', courseId: 'c6', order: 2, title: 'Transients & AC', description: 'First-order circuits, phasors and impedance.' },
    { id: 'm17', courseId: 'c7', order: 1, title: 'Discrete-Time Signals', description: 'Sampling, LTI systems and convolution.' },
    { id: 'm18', courseId: 'c7', order: 2, title: 'Transforms & Filters', description: 'Z-transform, DFT/FFT, FIR and IIR filters.' },
    { id: 'm19', courseId: 'c8', order: 1, title: 'Marketing Fundamentals', description: 'The 4Ps, marketing environment and strategy.' },
    { id: 'm20', courseId: 'c8', order: 2, title: 'Consumers & Segmentation', description: 'Buyer behaviour, STP and brand positioning.' },
    { id: 'm21', courseId: 'c9', order: 1, title: 'Probability Foundations', description: 'Sample spaces, conditional probability and Bayes theorem.' },
    { id: 'm22', courseId: 'c9', order: 2, title: 'Random Variables & Distributions', description: 'Binomial, Poisson, Normal distributions and expectation.' },
    { id: 'm23', courseId: 'c9', order: 3, title: 'Statistical Inference', description: 'Confidence intervals, hypothesis tests and linear regression.' },
    { id: 'm24', courseId: 'c10', order: 1, title: 'Matrices & Systems', description: 'Gaussian elimination, matrix operations and inverses.' },
    { id: 'm25', courseId: 'c10', order: 2, title: 'Vector Spaces & Eigenvalues', description: 'Basis, dimension, eigenvalues and diagonalization.' },
    { id: 'm26', courseId: 'c11', order: 1, title: 'Time Value of Money', description: 'Present value, future value, annuities and perpetuities.' },
    { id: 'm27', courseId: 'c11', order: 2, title: 'Capital Budgeting', description: 'NPV, IRR, payback and project risk.' },
    { id: 'm28', courseId: 'c12', order: 1, title: 'First & Second Laws', description: 'Energy balance, entropy and reversibility.' },
    { id: 'm29', courseId: 'c12', order: 2, title: 'Thermodynamic Cycles', description: 'Rankine, Otto, Diesel and refrigeration cycles.' }
  ];

  /* ------------------------------------------------------------------ */
  /* STUDY MATERIALS (uploaded by faculty)                               */
  /* ------------------------------------------------------------------ */
  const studyMaterials = [
    { id: 'sm1', courseId: 'c2', moduleId: 'm4', title: 'Lecture 1 — Introduction to the Relational Model', type: 'Lecture', fileType: 'PDF', size: '1.2 MB', uploadedBy: 'f1', date: at(-60),
      description: 'Relations, tuples, attributes, domains and keys.', content: 'A relation is a set of tuples sharing the same attributes. Each attribute has a domain. A superkey uniquely identifies a tuple; a candidate key is a minimal superkey; the primary key is the chosen candidate key. Foreign keys enforce referential integrity between relations.' },
    { id: 'sm2', courseId: 'c2', moduleId: 'm4', title: 'SQL Joins Cheat Sheet', type: 'Reference', fileType: 'PDF', size: '420 KB', uploadedBy: 'f1', date: at(-55),
      description: 'Visual summary of INNER, LEFT, RIGHT, FULL and CROSS joins.', content: 'INNER JOIN returns matching rows only. LEFT JOIN keeps every row of the left table. RIGHT JOIN keeps every row of the right table. FULL OUTER JOIN keeps rows from both sides. CROSS JOIN returns the Cartesian product.' },
    { id: 'sm3', courseId: 'c2', moduleId: 'm5', title: 'Lecture 4 — Normalization (1NF to BCNF)', type: 'Presentation', fileType: 'PPTX', size: '3.4 MB', uploadedBy: 'f1', date: at(-40),
      description: 'Slides covering functional dependencies and normal forms.', content: 'Slide 1: Why normalize? Remove redundancy and update anomalies. Slide 2: Functional dependencies X → Y. Slide 3: 1NF atomic values. Slide 4: 2NF no partial dependency. Slide 5: 3NF no transitive dependency. Slide 6: BCNF every determinant is a candidate key.' },
    { id: 'sm4', courseId: 'c2', moduleId: 'm5', title: 'Assignment 2 — ER Design for a Library System', type: 'Assignment', fileType: 'DOCX', size: '96 KB', uploadedBy: 'f1', date: at(-20),
      description: 'Design an ER diagram and relational schema for a university library.', content: 'Model members, books, copies, loans and reservations. Identify keys, cardinalities and weak entities. Convert to a relational schema in 3NF. Submit diagram and SQL DDL.' },
    { id: 'sm5', courseId: 'c2', moduleId: 'm6', title: 'Lecture 7 — Transactions and Concurrency', type: 'Lecture', fileType: 'PDF', size: '1.8 MB', uploadedBy: 'f1', date: at(-8),
      description: 'ACID properties, schedules, serializability and two-phase locking.', content: 'A transaction is a unit of work that must be atomic, consistent, isolated and durable. Conflict-serializable schedules are equivalent to some serial order. Two-phase locking guarantees conflict serializability; strict 2PL also avoids cascading aborts.' },
    { id: 'sm6', courseId: 'c3', moduleId: 'm7', title: 'Lecture 2 — Processes and the PCB', type: 'Lecture', fileType: 'PDF', size: '980 KB', uploadedBy: 'f2', date: at(-58),
      description: 'Process states, PCB contents and context switching.', content: 'A process moves between new, ready, running, waiting and terminated states. The Process Control Block stores registers, program counter, scheduling info and memory maps. Context switches save and restore PCB state.' },
    { id: 'sm7', courseId: 'c3', moduleId: 'm8', title: 'CPU Scheduling Algorithms', type: 'Presentation', fileType: 'PPTX', size: '2.6 MB', uploadedBy: 'f2', date: at(-35),
      description: 'Gantt-chart walkthroughs of FCFS, SJF, Round Robin and Priority.', content: 'FCFS is simple but suffers convoy effect. SJF minimizes average waiting time but needs burst prediction. Round Robin uses a time quantum for fairness. Priority scheduling may starve low-priority jobs; aging fixes this.' },
    { id: 'sm8', courseId: 'c3', moduleId: 'm9', title: 'Lab 5 — Page Replacement Simulator', type: 'Assignment', fileType: 'PDF', size: '310 KB', uploadedBy: 'f2', date: at(-6),
      description: 'Implement FIFO, LRU and Optimal replacement and compare page faults.', content: 'Write a simulator that reads a reference string and frame count, then reports page faults for FIFO, LRU and OPT. Plot faults vs frames and explain Belady’s anomaly.' },
    { id: 'sm9', courseId: 'c3', moduleId: 'm9', title: 'Operating System Concepts — Chapter 9 Reading Guide', type: 'Reference', fileType: 'PDF', size: '540 KB', uploadedBy: 'f2', date: at(-12),
      description: 'Guided reading questions for virtual memory.', content: 'Focus on demand paging, copy-on-write, thrashing and working-set model. Answer the five reflection questions before the next lecture.' },
    { id: 'sm10', courseId: 'c4', moduleId: 'm10', title: 'Scrum in Practice', type: 'Presentation', fileType: 'PPTX', size: '2.1 MB', uploadedBy: 'f1', date: at(-50),
      description: 'Roles, artefacts and ceremonies of Scrum.', content: 'Roles: Product Owner, Scrum Master, Developers. Artefacts: Product Backlog, Sprint Backlog, Increment. Events: Sprint Planning, Daily Scrum, Review, Retrospective.' },
    { id: 'sm11', courseId: 'c4', moduleId: 'm11', title: 'Design Patterns Catalogue', type: 'Reference', fileType: 'PDF', size: '1.1 MB', uploadedBy: 'f1', date: at(-28),
      description: 'Creational, structural and behavioural patterns with examples.', content: 'Singleton ensures one instance. Factory Method defers instantiation. Adapter converts interfaces. Observer notifies dependents of state changes. Strategy swaps algorithms at runtime.' },
    { id: 'sm12', courseId: 'c4', moduleId: 'm12', title: 'Project Milestone 3 — Test Plan', type: 'Assignment', fileType: 'DOCX', size: '78 KB', uploadedBy: 'f1', date: at(-4),
      description: 'Write a test plan with unit and integration cases for your team project.', content: 'Include scope, test environment, at least 15 unit tests, 5 integration tests, coverage targets and a defect tracking process.' },
    { id: 'sm13', courseId: 'c9', moduleId: 'm21', title: 'Bayes Theorem Worked Examples', type: 'Lecture', fileType: 'PDF', size: '650 KB', uploadedBy: 'f5', date: at(-45),
      description: 'Medical testing and spam filtering examples.', content: 'P(A|B) = P(B|A)P(A) / P(B). Example: a test with 99% sensitivity and 95% specificity for a disease with 1% prevalence gives a positive predictive value of only about 16.7%.' },
    { id: 'sm14', courseId: 'c9', moduleId: 'm23', title: 'Hypothesis Testing Flowchart', type: 'Reference', fileType: 'PDF', size: '220 KB', uploadedBy: 'f5', date: at(-10),
      description: 'Choose the right test: z, t, chi-square or ANOVA.', content: 'Known population variance → z-test. Unknown variance, small sample → t-test. Categorical counts → chi-square. Comparing 3+ means → ANOVA.' },
    { id: 'sm15', courseId: 'c1', moduleId: 'm3', title: 'Graph Traversal Visual Guide', type: 'Lecture', fileType: 'PDF', size: '1.4 MB', uploadedBy: 'f1', date: at(-30),
      description: 'BFS and DFS step by step.', content: 'BFS explores level by level using a queue and finds shortest paths in unweighted graphs. DFS explores deeply using a stack or recursion and is used for topological sorting and cycle detection.' },
    { id: 'sm16', courseId: 'c7', moduleId: 'm18', title: 'FIR Filter Design Lab', type: 'Assignment', fileType: 'PDF', size: '480 KB', uploadedBy: 'f3', date: at(-9),
      description: 'Design a low-pass FIR filter using the window method in MATLAB.', content: 'Use Hamming and Blackman windows, compare transition widths and stop-band attenuation, and report your results with plots.' },
    { id: 'sm17', courseId: 'c11', moduleId: 'm27', title: 'NPV & IRR Spreadsheet Template', type: 'Reference', fileType: 'XLSX', size: '64 KB', uploadedBy: 'f4', date: at(-15),
      description: 'Template for capital budgeting calculations.', content: 'Enter cash flows per year and discount rate. The sheet computes NPV, IRR, payback period and profitability index.' },
    { id: 'sm18', courseId: 'c10', moduleId: 'm25', title: 'Eigenvalues Lecture Notes', type: 'Lecture', fileType: 'PDF', size: '890 KB', uploadedBy: 'f5', date: at(-18),
      description: 'Characteristic polynomial and diagonalization.', content: 'λ is an eigenvalue of A if det(A − λI) = 0. A matrix is diagonalizable if it has n linearly independent eigenvectors; then A = PDP⁻¹.' }
  ];

  /* ------------------------------------------------------------------ */
  /* STUDENT NOTES                                                       */
  /* ------------------------------------------------------------------ */
  const rating = (userId, score, review, d) => ({ userId, score, review, date: at(d) });
  const notes = [
    { id: 'n1', title: 'Complete Guide to Database Normalization', courseId: 'c2', semester: 5, subject: 'Databases', uploaderId: 's1', date: at(-22), fileType: 'PDF', size: '1.6 MB',
      description: 'Step-by-step normalization from UNF to BCNF with five solved examples and common exam traps.', downloads: 214, views: 680, status: 'approved', tags: ['normalization', 'BCNF', 'exam prep'],
      ratings: [rating('s2', 5, 'Best normalization notes I have seen. The solved examples are gold.', -20), rating('s6', 5, 'Saved me before the midterm!', -18), rating('s9', 4, 'Clear, maybe add 4NF next time.', -10)],
      content: '<h3>1. Why Normalize?</h3><p>Normalization organizes attributes into relations to <strong>minimize redundancy</strong> and avoid insertion, update and deletion anomalies.</p><h3>2. Functional Dependencies</h3><p>A functional dependency <code>X → Y</code> means the value of X determines the value of Y. Armstrong’s axioms (reflexivity, augmentation, transitivity) let us derive the closure F⁺.</p><h3>3. Normal Forms</h3><ul><li><strong>1NF:</strong> all attributes atomic; no repeating groups.</li><li><strong>2NF:</strong> 1NF + no partial dependency on part of a composite key.</li><li><strong>3NF:</strong> 2NF + no transitive dependency of non-key attributes.</li><li><strong>BCNF:</strong> for every FD X → Y, X is a superkey.</li></ul><h3>4. Worked Example</h3><p>Relation <code>Enrollment(StudentID, CourseID, StudentName, CourseTitle, Grade)</code> with key (StudentID, CourseID). StudentName depends only on StudentID (partial dependency) so we decompose into Student, Course and Enrollment tables.</p><h3>5. Exam Tips</h3><p>Always compute the candidate keys first, then check each FD against the definition of the normal form being tested.</p>' },
    { id: 'n2', title: 'SQL Query Practice — 40 Solved Problems', courseId: 'c2', semester: 5, subject: 'Databases', uploaderId: 's6', date: at(-15), fileType: 'PDF', size: '2.2 MB',
      description: 'Joins, subqueries, GROUP BY/HAVING and window functions on a sample university schema.', downloads: 187, views: 502, status: 'approved', tags: ['SQL', 'practice'],
      ratings: [rating('s1', 5, 'Window function section is excellent.', -14), rating('s2', 4, 'Great practice set.', -9)],
      content: '<h3>Schema</h3><p><code>Student(id, name, dept)</code>, <code>Course(id, title, credits)</code>, <code>Enroll(student_id, course_id, grade)</code>.</p><h3>Problem 1 — Students with no enrollments</h3><p><code>SELECT s.name FROM Student s LEFT JOIN Enroll e ON s.id = e.student_id WHERE e.student_id IS NULL;</code></p><h3>Problem 2 — Average grade per course above 3.0</h3><p><code>SELECT course_id, AVG(grade) FROM Enroll GROUP BY course_id HAVING AVG(grade) &gt; 3.0;</code></p><h3>Problem 3 — Rank students in each department</h3><p><code>SELECT name, dept, RANK() OVER (PARTITION BY dept ORDER BY gpa DESC) FROM Student;</code></p><p>The remaining 37 problems follow the same pattern with increasing difficulty.</p>' },
    { id: 'n3', title: 'CPU Scheduling — Gantt Chart Examples', courseId: 'c3', semester: 5, subject: 'Systems', uploaderId: 's2', date: at(-12), fileType: 'PDF', size: '980 KB',
      description: 'Worked FCFS, SJF, SRTF, RR and Priority examples with waiting and turnaround times.', downloads: 143, views: 390, status: 'approved', tags: ['scheduling', 'OS'],
      ratings: [rating('s1', 4, 'Very helpful for the numericals.', -10), rating('s6', 5, 'Clean diagrams.', -8)],
      content: '<h3>Key Formulas</h3><ul><li>Turnaround Time = Completion − Arrival</li><li>Waiting Time = Turnaround − Burst</li><li>Response Time = First Run − Arrival</li></ul><h3>Round Robin (q = 4)</h3><p>Processes P1(0,10), P2(1,4), P3(2,6). Gantt: P1 0–4, P2 4–8, P3 8–12, P1 12–16, P3 16–18, P1 18–20. Average waiting time = 7.67 ms.</p><h3>SRTF</h3><p>Pre-emptive SJF picks the process with the shortest remaining time whenever a new process arrives.</p>' },
    { id: 'n4', title: 'Deadlocks: Banker’s Algorithm Made Easy', courseId: 'c3', semester: 5, subject: 'Systems', uploaderId: 's1', date: at(-5), fileType: 'PDF', size: '760 KB',
      description: 'Safety algorithm and resource request algorithm with a fully traced example.', downloads: 96, views: 241, status: 'approved', tags: ['deadlock', 'banker'],
      ratings: [rating('s2', 5, 'Finally understood the safe sequence.', -4)],
      content: '<h3>Four Necessary Conditions</h3><p>Mutual exclusion, hold and wait, no pre-emption and circular wait.</p><h3>Banker’s Algorithm</h3><p>Need = Max − Allocation. The system is safe if there exists a sequence in which every process can obtain its remaining need from Available + resources released by earlier processes.</p><h3>Example</h3><p>With Available = (3,3,2), the safe sequence ⟨P1, P3, P4, P0, P2⟩ exists, so the state is safe.</p>' },
    { id: 'n5', title: 'UML Diagrams Quick Reference', courseId: 'c4', semester: 5, subject: 'Software Engineering', uploaderId: 's9', date: at(-30), fileType: 'PDF', size: '1.1 MB',
      description: 'Class, sequence, use-case and activity diagram notation in four pages.', downloads: 168, views: 455, status: 'approved', tags: ['UML', 'design'],
      ratings: [rating('s1', 4, 'Handy during the project.', -25), rating('s6', 4, 'Good summary.', -20)],
      content: '<h3>Class Diagrams</h3><p>Association (line), aggregation (hollow diamond), composition (filled diamond), inheritance (hollow triangle) and dependency (dashed arrow).</p><h3>Sequence Diagrams</h3><p>Lifelines, activation bars, synchronous messages (filled arrow) and return messages (dashed).</p><h3>Use-Case Diagrams</h3><p>Actors, use cases, include and extend relationships.</p>' },
    { id: 'n6', title: 'Agile vs Waterfall Comparison', courseId: 'c4', semester: 5, subject: 'Software Engineering', uploaderId: 's6', date: at(-9), fileType: 'DOCX', size: '210 KB',
      description: 'Side-by-side comparison with case studies and when to choose each.', downloads: 61, views: 170, status: 'approved', tags: ['agile', 'process'],
      ratings: [rating('s2', 4, 'Useful for the essay question.', -7)],
      content: '<h3>Waterfall</h3><p>Sequential phases; works well for stable, well-understood requirements and regulated domains.</p><h3>Agile</h3><p>Iterative delivery in short sprints with continuous feedback; ideal when requirements evolve.</p><h3>Case Study</h3><p>A banking compliance system used Waterfall for audit traceability while its customer app used Scrum.</p>' },
    { id: 'n7', title: 'Probability Distributions Summary Sheet', courseId: 'c9', semester: 5, subject: 'Mathematics', uploaderId: 's7', date: at(-18), fileType: 'PDF', size: '540 KB',
      description: 'PMF/PDF, mean and variance for all distributions in the syllabus.', downloads: 201, views: 610, status: 'approved', tags: ['statistics', 'formula sheet'],
      ratings: [rating('s1', 5, 'Printed this for the exam.', -15), rating('s4', 5, 'Perfect revision sheet.', -12), rating('s8', 4, 'Clear and compact.', -6)],
      content: '<h3>Discrete</h3><ul><li><strong>Binomial(n, p):</strong> mean np, variance np(1−p)</li><li><strong>Poisson(λ):</strong> mean λ, variance λ</li><li><strong>Geometric(p):</strong> mean 1/p</li></ul><h3>Continuous</h3><ul><li><strong>Uniform(a, b):</strong> mean (a+b)/2</li><li><strong>Exponential(λ):</strong> mean 1/λ</li><li><strong>Normal(μ, σ²):</strong> 68–95–99.7 rule</li></ul>' },
    { id: 'n8', title: 'Hypothesis Testing Step-by-Step', courseId: 'c9', semester: 5, subject: 'Mathematics', uploaderId: 's1', date: at(-2), fileType: 'PDF', size: '820 KB',
      description: 'Five-step framework with z, t and chi-square examples.', downloads: 38, views: 97, status: 'approved', tags: ['hypothesis', 'statistics'],
      ratings: [],
      content: '<h3>The Five Steps</h3><ol><li>State H₀ and H₁.</li><li>Choose significance level α.</li><li>Compute the test statistic.</li><li>Find the p-value or critical value.</li><li>Decide and interpret in context.</li></ol><h3>Example</h3><p>A sample of 36 students has mean study time 14.2 h with σ = 3. Testing H₀: μ = 13 gives z = 2.4, p ≈ 0.016, so we reject H₀ at α = 0.05.</p>' },
    { id: 'n9', title: 'Linked Lists & Stacks — Visual Notes', courseId: 'c1', semester: 3, subject: 'Programming', uploaderId: 's3', date: at(-25), fileType: 'PDF', size: '1.9 MB',
      description: 'Hand-drawn diagrams for insertion, deletion and reversal.', downloads: 132, views: 344, status: 'approved', tags: ['linked list', 'stack'],
      ratings: [rating('s12', 5, 'Diagrams make it click.', -20)],
      content: '<h3>Singly Linked List</h3><p>Each node stores data and a pointer to the next node. Insertion at head is O(1); search is O(n).</p><h3>Reversal</h3><p>Use three pointers: prev, curr, next. Iterate and flip <code>curr.next = prev</code>.</p><h3>Stack via Linked List</h3><p>Push and pop at the head for O(1) operations.</p>' },
    { id: 'n10', title: 'Thevenin & Norton Equivalents', courseId: 'c6', semester: 3, subject: 'Electronics', uploaderId: 's11', date: at(-16), fileType: 'PDF', size: '1.3 MB',
      description: 'Procedure plus six solved circuits with dependent sources.', downloads: 88, views: 230, status: 'approved', tags: ['circuits'],
      ratings: [rating('s4', 4, 'Dependent source examples are helpful.', -11)],
      content: '<h3>Thevenin Procedure</h3><ol><li>Remove the load.</li><li>Find V<sub>th</sub> as the open-circuit voltage.</li><li>Find R<sub>th</sub> by deactivating independent sources.</li></ol><h3>Norton</h3><p>I<sub>N</sub> = V<sub>th</sub> / R<sub>th</sub>, with R<sub>N</sub> = R<sub>th</sub>.</p>' },
    { id: 'n11', title: 'Marketing Mix Case Studies', courseId: 'c8', semester: 3, subject: 'Marketing', uploaderId: 's5', date: at(-11), fileType: 'PPTX', size: '4.2 MB',
      description: 'Real-world 4P analyses of three consumer brands.', downloads: 54, views: 150, status: 'approved', tags: ['4P', 'case study'],
      ratings: [rating('s10', 4, 'Nice examples.', -8)],
      content: '<h3>Product</h3><p>Core benefit, actual product and augmented product layers.</p><h3>Price</h3><p>Penetration vs skimming strategies with examples from the smartphone market.</p><h3>Place &amp; Promotion</h3><p>Omnichannel distribution and integrated marketing communication.</p>' },
    { id: 'n12', title: 'NPV and IRR Practice Problems', courseId: 'c11', semester: 5, subject: 'Finance', uploaderId: 's10', date: at(-7), fileType: 'PDF', size: '600 KB',
      description: 'Ten capital budgeting problems with full solutions.', downloads: 47, views: 122, status: 'approved', tags: ['finance', 'NPV'],
      ratings: [],
      content: '<h3>NPV</h3><p>NPV = Σ CF<sub>t</sub> / (1 + r)<sup>t</sup> − Initial Investment. Accept if NPV &gt; 0.</p><h3>IRR</h3><p>The discount rate that makes NPV = 0. Accept if IRR exceeds the cost of capital.</p>' },
    { id: 'n13', title: 'A* Search Explained with Examples', courseId: 'c5', semester: 7, subject: 'AI', uploaderId: 's9', date: at(-4), fileType: 'PDF', size: '1.0 MB',
      description: 'Admissible heuristics, consistency and a grid pathfinding walkthrough.', downloads: 73, views: 188, status: 'approved', tags: ['search', 'A*'],
      ratings: [rating('s2', 5, 'Great grid example.', -3)],
      content: '<h3>Evaluation Function</h3><p>f(n) = g(n) + h(n), where g is the path cost so far and h is the heuristic estimate to the goal.</p><h3>Admissibility</h3><p>If h never overestimates, A* is optimal. Manhattan distance is admissible on 4-connected grids.</p>' },
    { id: 'n14', title: 'Thermodynamic Cycles Summary', courseId: 'c12', semester: 5, subject: 'Mechanical', uploaderId: 's8', date: at(-1), fileType: 'PDF', size: '1.5 MB',
      description: 'Rankine, Otto and Diesel cycles with T-s diagrams.', downloads: 12, views: 40, status: 'pending', tags: ['cycles'],
      ratings: [],
      content: '<h3>Rankine Cycle</h3><p>Pump → boiler → turbine → condenser. Efficiency improves with superheat and reheat.</p><h3>Otto Cycle</h3><p>η = 1 − 1/r<sup>γ−1</sup>.</p>' }
  ];

  /* ------------------------------------------------------------------ */
  /* ACHIEVEMENTS, BADGES, LEADERBOARD                                   */
  /* ------------------------------------------------------------------ */
  const achievementCategories = [
    { id: 'Certificate', icon: 'patch-check', points: 20 },
    { id: 'Project', icon: 'kanban', points: 40 },
    { id: 'Award', icon: 'award', points: 50 },
    { id: 'Competition', icon: 'trophy', points: 60 },
    { id: 'Publication', icon: 'journal-richtext', points: 70 },
    { id: 'Volunteering', icon: 'heart', points: 25 }
  ];

  const ach = (id, studentId, title, category, d, status, points, description, details, reviewedBy = null, reviewNote = '') => ({
    id, studentId, title, category, date: day(d), submittedAt: at(d + 2), status, points: status === 'approved' ? points : 0,
    description, details, evidence: { name: title.replace(/[^a-z0-9]+/gi, '_') + '.pdf', type: 'application/pdf', dataUrl: null },
    reviewedBy, reviewNote, reviewedAt: status === 'pending' ? null : at(d + 5)
  });
  const achievements = [
    ach('ac1', 's1', 'AWS Certified Cloud Practitioner', 'Certificate', -90, 'approved', 20, 'Passed the AWS Cloud Practitioner exam with a score of 912/1000.', 'Issuer: Amazon Web Services · Credential ID: AWS-CCP-88213', 'f1', 'Verified via credential ID.'),
    ach('ac2', 's1', 'Campus Lost & Found Web App', 'Project', -40, 'approved', 40, 'Built a web app used by the student council to track lost items across campus.', 'Tech: React, Firebase · 300+ monthly users', 'a1', 'Great real-world impact.'),
    ach('ac3', 's1', 'NFU Hackathon 2026 — 2nd Place', 'Competition', -12, 'approved', 60, 'Team project: study-group matching app built in 36 hours.', 'Team of 4 · Judges’ choice for UX', 'f1', 'Confirmed with event organizers.'),
    ach('ac4', 's1', 'Peer Tutoring Volunteer (40 hours)', 'Volunteering', -3, 'pending', 25, 'Volunteered as a Data Structures peer tutor for first-year students.', 'Supervisor: Dr. Sarah Mitchell · 40 hours logged'),
    ach('ac5', 's2', 'ICPC Regional Finalist', 'Competition', -60, 'approved', 60, 'Qualified for the ICPC regional finals and ranked 14th.', 'Team: NFU Byte Knights', 'f2', 'Verified certificate.'),
    ach('ac6', 's2', 'Google Cloud Associate Engineer', 'Certificate', -20, 'approved', 20, 'Associate Cloud Engineer certification.', 'Credential ID GCP-ACE-1192', 'f1', ''),
    ach('ac7', 's6', 'Open Source Contributor — 25 merged PRs', 'Project', -30, 'approved', 40, 'Contributed to a popular open-source UI component library.', 'GitHub profile linked in evidence', 'a1', 'Impressive contribution history.'),
    ach('ac8', 's6', 'Smart Attendance System', 'Project', -2, 'pending', 40, 'QR-based attendance system prototype for lecture halls.', 'Tech: Node.js, React Native'),
    ach('ac9', 's9', 'Research Paper — Urdu Sentiment Analysis', 'Publication', -75, 'approved', 70, 'Co-authored a workshop paper on low-resource sentiment analysis.', 'Workshop on Asian NLP · 2nd author', 'f2', 'Peer-reviewed publication verified.'),
    ach('ac10', 's9', 'Dean’s List — Spring 2026', 'Award', -150, 'approved', 50, 'Awarded for GPA above 3.8.', 'Office of the Dean', 'a1', ''),
    ach('ac11', 's4', 'IEEE Robotics Challenge — Winner', 'Competition', -25, 'approved', 60, 'Line-following robot won first place at the regional IEEE challenge.', 'Team captain', 'f3', 'Verified with IEEE branch.'),
    ach('ac12', 's7', 'Data Science Bootcamp Certificate', 'Certificate', -14, 'approved', 20, 'Completed a 6-week data science bootcamp.', 'Issuer: NFU Continuing Education', 'f5', ''),
    ach('ac13', 's5', 'Social Impact Pitch Competition — 3rd Place', 'Competition', -8, 'pending', 60, 'Pitched a campus food-waste reduction startup.', 'Organized by NFU Entrepreneurship Society'),
    ach('ac14', 's10', 'CFA Investment Research Challenge', 'Competition', -50, 'rejected', 60, 'Participated in the local round.', 'Team of 3', 'a1', 'Participation only — please resubmit as a certificate.'),
    ach('ac15', 's3', 'Accessibility Audit for Library Website', 'Volunteering', -6, 'pending', 25, 'Performed a WCAG audit of the university library website.', '24 issues reported and 18 fixed'),
    ach('ac16', 's8', 'Formula Student — Best Thermal Design', 'Award', -35, 'approved', 50, 'Team received the best thermal design award.', 'Formula Student National', 'f3', ''),
    ach('ac17', 's11', 'National Debate Championship — Quarterfinalist', 'Competition', -19, 'approved', 60, 'Reached the quarterfinals representing NFU.', 'Partner: University Debate Society', 'a1', '')
  ];

  const badges = [
    { id: 'b1', name: 'First Upload', icon: 'cloud-arrow-up', color: '#4f46e5', description: 'Shared your first set of notes with the community.', metric: 'notes', min: 1 },
    { id: 'b2', name: 'Knowledge Sharer', icon: 'book-half', color: '#2563eb', description: 'Uploaded 5 approved notes.', metric: 'notes', min: 5 },
    { id: 'b3', name: 'Rising Star', icon: 'star', color: '#d97706', description: 'Earned 250 contribution points.', metric: 'points', min: 250 },
    { id: 'b4', name: 'Campus Legend', icon: 'stars', color: '#dc2626', description: 'Earned 1,000 contribution points.', metric: 'points', min: 1000 },
    { id: 'b5', name: 'Achiever', icon: 'trophy', color: '#16a34a', description: 'Had 3 achievements verified.', metric: 'achievements', min: 3 },
    { id: 'b6', name: 'Community Voice', icon: 'megaphone', color: '#7c3aed', description: 'Published 3 community posts.', metric: 'posts', min: 3 },
    { id: 'b7', name: 'Helping Hand', icon: 'life-preserver', color: '#0891b2', description: 'Answered 3 questions in Q&A.', metric: 'answers', min: 3 },
    { id: 'b8', name: 'Quiz Master', icon: 'lightning-charge', color: '#ca8a04', description: 'Passed 5 practice quizzes (60%+).', metric: 'quizzes', min: 5 },
    { id: 'b9', name: 'Green Trader', icon: 'recycle', color: '#15803d', description: 'Completed 2 exchanges in the marketplace.', metric: 'exchanges', min: 2 },
    { id: 'b10', name: 'Event Explorer', icon: 'calendar-heart', color: '#db2777', description: 'Registered for 3 university events.', metric: 'events', min: 3 }
  ];

  /** Baseline points earned before this demo's recorded activity (historic contributions). */
  const leaderboard = [
    { userId: 's1', base: { academic: 210, community: 95, achievements: 0, exchange: 20 }, monthly: { academic: 30, community: 15, achievements: 0, exchange: 0 }, annual: { academic: 150, community: 70, achievements: 0, exchange: 10 } },
    { userId: 's2', base: { academic: 260, community: 120, achievements: 0, exchange: 10 }, monthly: { academic: 35, community: 10, achievements: 0, exchange: 0 }, annual: { academic: 190, community: 85, achievements: 0, exchange: 10 } },
    { userId: 's3', base: { academic: 120, community: 60, achievements: 0, exchange: 15 }, monthly: { academic: 20, community: 10, achievements: 0, exchange: 5 }, annual: { academic: 90, community: 40, achievements: 0, exchange: 15 } },
    { userId: 's4', base: { academic: 140, community: 50, achievements: 0, exchange: 25 }, monthly: { academic: 15, community: 5, achievements: 0, exchange: 5 }, annual: { academic: 100, community: 35, achievements: 0, exchange: 20 } },
    { userId: 's5', base: { academic: 80, community: 110, achievements: 0, exchange: 30 }, monthly: { academic: 10, community: 25, achievements: 0, exchange: 5 }, annual: { academic: 60, community: 80, achievements: 0, exchange: 25 } },
    { userId: 's6', base: { academic: 230, community: 140, achievements: 0, exchange: 15 }, monthly: { academic: 25, community: 20, achievements: 0, exchange: 0 }, annual: { academic: 170, community: 100, achievements: 0, exchange: 15 } },
    { userId: 's7', base: { academic: 150, community: 45, achievements: 0, exchange: 5 }, monthly: { academic: 20, community: 5, achievements: 0, exchange: 0 }, annual: { academic: 110, community: 30, achievements: 0, exchange: 5 } },
    { userId: 's8', base: { academic: 110, community: 35, achievements: 0, exchange: 35 }, monthly: { academic: 10, community: 5, achievements: 0, exchange: 10 }, annual: { academic: 80, community: 25, achievements: 0, exchange: 30 } },
    { userId: 's9', base: { academic: 320, community: 90, achievements: 0, exchange: 0 }, monthly: { academic: 30, community: 10, achievements: 0, exchange: 0 }, annual: { academic: 210, community: 60, achievements: 0, exchange: 0 } },
    { userId: 's10', base: { academic: 90, community: 70, achievements: 0, exchange: 40 }, monthly: { academic: 5, community: 10, achievements: 0, exchange: 5 }, annual: { academic: 70, community: 50, achievements: 0, exchange: 30 } },
    { userId: 's11', base: { academic: 95, community: 85, achievements: 0, exchange: 10 }, monthly: { academic: 10, community: 15, achievements: 0, exchange: 0 }, annual: { academic: 70, community: 60, achievements: 0, exchange: 10 } },
    { userId: 's12', base: { academic: 60, community: 20, achievements: 0, exchange: 5 }, monthly: { academic: 0, community: 0, achievements: 0, exchange: 0 }, annual: { academic: 40, community: 10, achievements: 0, exchange: 5 } }
  ];

  const scoringRules = {
    noteUpload: 15, quizPass: 10, communityPost: 5, comment: 1, answer: 3, helpfulAnswer: 5, exchangeCompleted: 5, eventRegistration: 4
  };

  const annualAwards = [
    { id: 'aw1', title: 'Student of the Year', description: 'Highest weighted contribution score across all categories.', prize: 'Full-semester tuition waiver + gold medal', icon: 'gem' },
    { id: 'aw2', title: 'Top Knowledge Contributor', description: 'Most academic points from notes and quizzes.', prize: '$500 book voucher + certificate', icon: 'book' },
    { id: 'aw3', title: 'Community Champion', description: 'Most community points from posts, answers and events.', prize: 'Leadership retreat invitation + certificate', icon: 'people' },
    { id: 'aw4', title: 'Sustainability Hero', description: 'Most completed exchanges in the Student Exchange Corner.', prize: 'Eco-kit + certificate', icon: 'tree' }
  ];

  const studentOfYearCriteria = { academic: 35, achievements: 35, community: 20, exchange: 10, minimumPoints: 400 };

  /* ------------------------------------------------------------------ */
  /* MARKETPLACE                                                         */
  /* ------------------------------------------------------------------ */
  const marketplaceCategories = ['Books', 'Electronics', 'Lab Equipment', 'Stationery', 'Furniture', 'Clothing', 'Sports', 'Other'];
  const item = (id, title, category, price, condition, ownerId, status, d, description, icon, extra = {}) => ({
    id, title, category, price, isFree: price === 0, condition, ownerId, status, date: at(d), description, icon, images: [],
    featured: false, views: Math.round(20 + Math.abs(d) * 7), contactPref: ['Message', 'Email'], phone: '', reported: false, ...extra
  });
  const marketplaceItems = [
    item('i1', 'Database System Concepts (7th Ed.)', 'Books', 25, 'Good', 's2', 'Available', -6, 'Silberschatz textbook, lightly highlighted in chapters 1–8. Perfect for CS-305.', 'book', { featured: true }),
    item('i2', 'TI-84 Plus Graphing Calculator', 'Electronics', 45, 'Like New', 's7', 'Available', -3, 'Barely used, includes cover and USB cable. Approved for MATH exams.', 'calculator', { featured: true }),
    item('i3', 'Arduino Uno Starter Kit', 'Electronics', 30, 'Good', 's4', 'Reserved', -10, 'Uno board, breadboard, sensors, jumper wires and LEDs. Missing one servo.', 'cpu'),
    item('i4', 'Lab Coat (Size M)', 'Clothing', 0, 'Good', 's8', 'Available', -2, 'Clean white lab coat, free for anyone who needs it for chemistry or ME labs.', 'person-standing'),
    item('i5', 'Study Desk Lamp (LED)', 'Furniture', 12, 'Like New', 's5', 'Available', -1, 'Adjustable brightness with USB charging port.', 'lamp', { featured: true }),
    item('i6', 'Operating System Concepts (10th Ed.)', 'Books', 20, 'Fair', 's6', 'Available', -14, 'Some notes in margins. Good enough for CS-310 readings.', 'journal-bookmark'),
    item('i7', 'Engineering Drawing Set', 'Stationery', 8, 'Good', 's11', 'Available', -4, 'Compass, protractor, set squares and mechanical pencils.', 'rulers'),
    item('i8', 'Mini Fridge (Dorm Size)', 'Furniture', 60, 'Good', 's10', 'Sold', -30, '45 L mini fridge, works perfectly. Moving out of the dorm.', 'snow'),
    item('i9', 'Badminton Racket Pair', 'Sports', 15, 'Good', 's3', 'Available', -7, 'Two rackets and a tube of shuttlecocks.', 'dribbble'),
    item('i10', 'Clean Code by Robert C. Martin', 'Books', 0, 'Good', 's9', 'Available', -5, 'Free to a junior who wants to read it — please pass it on afterwards!', 'book-half'),
    item('i11', 'Multimeter (Digital)', 'Lab Equipment', 18, 'Like New', 's11', 'Available', -9, 'Auto-ranging multimeter, ideal for circuit labs.', 'speedometer'),
    item('i12', 'Scientific Calculator Casio fx-991', 'Electronics', 10, 'Fair', 's1', 'Exchanged', -45, 'Exchanged for a set of OS notes.', 'calculator'),
    item('i13', 'Noise-Cancelling Headphones', 'Electronics', 55, 'Good', 's1', 'Available', -4, 'Great for library study sessions. Battery lasts ~20 hours.', 'headphones')
  ];

  const itemRequests = [
    { id: 'r1', itemId: 'i3', requesterId: 's1', message: 'Hi Omar, I need this for my embedded side project. Can I pick it up Friday?', offer: 30, status: 'accepted', date: at(-8) },
    { id: 'r2', itemId: 'i1', requesterId: 's1', message: 'Is the book still available? I can meet at the library.', offer: 22, status: 'pending', date: at(-2) },
    { id: 'r3', itemId: 'i13', requesterId: 's6', message: 'Would you take $45 for the headphones?', offer: 45, status: 'pending', date: at(-1) },
    { id: 'r4', itemId: 'i13', requesterId: 's3', message: 'Interested! Are they Bluetooth?', offer: 55, status: 'pending', date: at(0, 9) },
    { id: 'r5', itemId: 'i8', requesterId: 's5', message: 'I can take the fridge this weekend.', offer: 60, status: 'accepted', date: at(-28) },
    { id: 'r6', itemId: 'i12', requesterId: 's3', message: 'Would you exchange for my OS notes binder?', offer: 0, status: 'accepted', date: at(-44) }
  ];

  /* ------------------------------------------------------------------ */
  /* COMMUNITY                                                           */
  /* ------------------------------------------------------------------ */
  const communityCategories = ['General', 'Academics', 'Tech', 'Career', 'Campus Life', 'Events'];
  const communityPosts = [
    { id: 'p1', authorId: 's6', category: 'Tech', title: 'Built a VS Code extension for CS-305 SQL labs', body: 'I got tired of switching between the lab PDF and the terminal, so I made a small extension that runs SQL snippets against a local SQLite copy of the lab schema. It also shows the expected output so you can self-check. Feedback welcome — happy to pair with anyone who wants to contribute!', date: at(-1, 14), likes: ['s1', 's2', 's9', 's3'], saves: ['s1'], shares: 6, tags: ['sql', 'tools'], status: 'visible' },
    { id: 'p2', authorId: 's9', category: 'Career', title: 'How I landed a research internship as an undergrad', body: 'A lot of you asked, so here is my timeline: (1) emailed three professors with a one-page summary of a paper I reproduced, (2) joined a reading group, (3) applied to two summer programs in January. The key was showing that I had already started. Ask me anything below.', date: at(-2, 18), likes: ['s1', 's2', 's6', 's7', 's4', 's11'], saves: ['s1', 's7'], shares: 14, tags: ['research', 'internship'], status: 'visible' },
    { id: 'p3', authorId: 's1', category: 'Academics', title: 'Database Systems midterm study session — Thursday 6 PM', body: 'Booking Library Room 204 for a group revision session on normalization and transactions. I will bring past paper questions. Reply if you are coming so I know how many printouts to make.', date: at(-3, 11), likes: ['s2', 's6'], saves: [], shares: 2, tags: ['study session'], status: 'visible' },
    { id: 'p4', authorId: 's5', category: 'Campus Life', title: 'Food waste drive — volunteers needed', body: 'The Entrepreneurship Society is partnering with the cafeteria to redistribute surplus meals. We need 10 volunteers for two-hour shifts next week. Volunteer hours count towards achievements!', date: at(-4, 9), likes: ['s1', 's10', 's11'], saves: ['s10'], shares: 5, tags: ['volunteering'], status: 'visible' },
    { id: 'p5', authorId: 's2', category: 'Tech', title: 'Competitive programming practice: weekly contest starts Saturday', body: 'The NFU Byte Knights are hosting a 2-hour weekly contest every Saturday at 4 PM. Problems range from beginner to ICPC level. All departments welcome.', date: at(-5, 16), likes: ['s6', 's9', 's12'], saves: ['s3'], shares: 8, tags: ['contest'], status: 'visible' },
    { id: 'p6', authorId: 's4', category: 'Events', title: 'IEEE Robotics workshop recap + slides', body: 'Thanks to everyone who attended! Slides and Arduino code are now in the IEEE shared folder. Next workshop will cover PID control for line followers.', date: at(-7, 13), likes: ['s11', 's8'], saves: [], shares: 3, tags: ['robotics'], status: 'visible' },
    { id: 'p7', authorId: 's7', category: 'Academics', title: 'Free R workshop for statistics students', body: 'The Math Society is running a beginner R workshop covering data frames, ggplot2 and t-tests. Bring your laptop with RStudio installed.', date: at(-9, 10), likes: ['s1', 's9'], saves: ['s1'], shares: 4, tags: ['R', 'workshop'], status: 'visible' },
    { id: 'p8', authorId: 's10', category: 'Career', title: 'Mock interviews with alumni from finance firms', body: 'Finance Club arranged 20 mock interview slots with alumni. Sign-up sheet closes Friday. Prepare one stock pitch and your CV.', date: at(-11, 15), likes: ['s5'], saves: [], shares: 2, tags: ['interviews'], status: 'visible' },
    { id: 'p9', authorId: 's12', category: 'General', title: 'Selling exam answers — DM me', body: 'Have leaked answers for upcoming finals. Cheap.', date: at(-6, 23), likes: [], saves: [], shares: 0, tags: [], status: 'visible' }
  ];

  const comments = [
    { id: 'cm1', postId: 'p1', authorId: 's1', parentId: null, text: 'This is super useful! Does it support the transaction labs too?', date: at(-1, 15), likes: ['s6'] },
    { id: 'cm2', postId: 'p1', authorId: 's6', parentId: 'cm1', text: 'Not yet, but adding BEGIN/COMMIT support this weekend.', date: at(-1, 16), likes: ['s1'] },
    { id: 'cm3', postId: 'p1', authorId: 's2', parentId: null, text: 'Starred the repo. Happy to help with tests.', date: at(-1, 17), likes: [] },
    { id: 'cm4', postId: 'p2', authorId: 's1', parentId: null, text: 'How long did it take to hear back from the professors?', date: at(-2, 19), likes: ['s9'] },
    { id: 'cm5', postId: 'p2', authorId: 's9', parentId: 'cm4', text: 'About a week for two of them; the third replied after I followed up.', date: at(-2, 20), likes: ['s1', 's7'] },
    { id: 'cm6', postId: 'p2', authorId: 's7', parentId: null, text: 'Does this work for maths research too?', date: at(-1, 9), likes: [] },
    { id: 'cm7', postId: 'p3', authorId: 's2', parentId: null, text: 'Count me in! I will bring snacks.', date: at(-3, 12), likes: ['s1'] },
    { id: 'cm8', postId: 'p3', authorId: 's6', parentId: null, text: 'Coming. Can we also cover indexing?', date: at(-3, 13), likes: [] },
    { id: 'cm9', postId: 'p4', authorId: 's10', parentId: null, text: 'Signed up for Tuesday!', date: at(-4, 10), likes: ['s5'] },
    { id: 'cm10', postId: 'p5', authorId: 's12', parentId: null, text: 'Is there a beginner division?', date: at(-5, 17), likes: [] },
    { id: 'cm11', postId: 'p5', authorId: 's2', parentId: 'cm10', text: 'Yes — Division 2 is for first and second years.', date: at(-5, 18), likes: ['s12'] },
    { id: 'cm12', postId: 'p6', authorId: 's8', parentId: null, text: 'Thanks for sharing the code!', date: at(-7, 14), likes: [] },
    { id: 'cm13', postId: 'p7', authorId: 's1', parentId: null, text: 'Will this be recorded?', date: at(-9, 11), likes: [] }
  ];

  const questions = [
    { id: 'q1', authorId: 's3', category: 'Programming', title: 'Why is quicksort O(n²) in the worst case?', body: 'If quicksort is usually fast, what input makes it degrade to quadratic time and how do we avoid it?', date: at(-3, 10),
      answers: [{ id: 'qa1', authorId: 's2', text: 'When the pivot is always the smallest or largest element (e.g. already sorted input with first-element pivot), each partition removes only one element, giving n + (n−1) + … = O(n²). Use a random pivot or median-of-three.', date: at(-3, 12), helpful: true, votes: 7 }] },
    { id: 'q2', authorId: 's1', category: 'Databases', title: 'Difference between 3NF and BCNF in simple terms?', body: 'I understand the definitions but can someone give an example of a relation in 3NF but not BCNF?', date: at(-2, 9),
      answers: [{ id: 'qa2', authorId: 's9', text: 'Classic example: R(Student, Course, Instructor) where each instructor teaches one course (Instructor → Course) and (Student, Course) → Instructor. It is 3NF because Course is prime, but not BCNF because Instructor is not a superkey.', date: at(-2, 11), helpful: false, votes: 4 }] },
    { id: 'q3', authorId: 's11', category: 'Electronics', title: 'How do I handle dependent sources when finding Rth?', body: 'My professor said we cannot just short voltage sources when there is a dependent source. What is the method?', date: at(-1, 16), answers: [] },
    { id: 'q4', authorId: 's5', category: 'Marketing', title: 'Good examples of repositioning a brand?', body: 'Need examples for a presentation on brand repositioning.', date: at(-4, 13),
      answers: [{ id: 'qa3', authorId: 's10', text: 'Look at how several fast-food chains repositioned towards healthier menus, or how some outdoor clothing brands moved from technical gear to everyday fashion.', date: at(-4, 15), helpful: true, votes: 3 }] },
    { id: 'q5', authorId: 's8', category: 'Mathematics', title: 'When to use a t-test vs z-test?', body: 'The flowchart in class confused me for small samples.', date: at(0, 8), answers: [] },
    { id: 'q6', authorId: 's12', category: 'Programming', title: 'Recursion vs iteration for tree traversal?', body: 'Which is preferred in interviews?', date: at(-6, 20),
      answers: [{ id: 'qa4', authorId: 's1', text: 'Recursion is cleaner to write; iteration with an explicit stack avoids stack overflow on very deep trees. In interviews, write recursive first and mention the iterative alternative.', date: at(-6, 21), helpful: false, votes: 2 }] }
  ];
  const questionCategories = ['Programming', 'Databases', 'Systems', 'Electronics', 'Mathematics', 'Marketing', 'Finance', 'General'];

  const studyGroups = [
    { id: 'g1', name: 'DB Systems Midterm Crew', courseId: 'c2', subject: 'Databases', description: 'Weekly problem-solving sessions for normalization, SQL and transactions.', members: ['s1', 's2', 's6'], creatorId: 's1', maxMembers: 8, meeting: 'Thursdays 6:00 PM · Library Room 204', mode: 'In person', date: at(-20) },
    { id: 'g2', name: 'OS Concepts Deep Dive', courseId: 'c3', subject: 'Systems', description: 'Working through scheduling numericals and the page replacement lab together.', members: ['s2', 's6'], creatorId: 's2', maxMembers: 6, meeting: 'Tuesdays 5:00 PM · Turing Hall Lab 2', mode: 'In person', date: at(-15) },
    { id: 'g3', name: 'Stats with R', courseId: 'c9', subject: 'Mathematics', description: 'Practising probability problems and R exercises for MATH-220.', members: ['s7', 's4', 's8'], creatorId: 's7', maxMembers: 10, meeting: 'Saturdays 11:00 AM · Online (Meet)', mode: 'Online', date: at(-25) },
    { id: 'g4', name: 'DSA Beginners', courseId: 'c1', subject: 'Programming', description: 'For second-years who want to strengthen fundamentals before interviews.', members: ['s3', 's12'], creatorId: 's3', maxMembers: 12, meeting: 'Mondays 4:00 PM · Online', mode: 'Online', date: at(-10) },
    { id: 'g5', name: 'Marketing Case Club', courseId: 'c8', subject: 'Marketing', description: 'Analyse one real brand case each week and practise presentations.', members: ['s5', 's10'], creatorId: 's5', maxMembers: 8, meeting: 'Wednesdays 3:00 PM · Commerce Centre 105', mode: 'In person', date: at(-12) },
    { id: 'g6', name: 'AI Paper Reading Group', courseId: 'c5', subject: 'AI', description: 'Read and discuss one ML paper every two weeks.', members: ['s9', 's2', 's6', 's1'], creatorId: 's9', maxMembers: 10, meeting: 'Every other Friday 5:00 PM · Turing Hall 210', mode: 'Hybrid', date: at(-40) }
  ];

  const projects = [
    { id: 'pr1', title: 'Campus Navigation App', description: 'Indoor and outdoor navigation for NFU with accessible routes and class locations.', skills: ['React Native', 'Maps API', 'UX Design'], teamSize: 4, creatorId: 's6', members: ['s6', 's3'], requests: [{ userId: 's12', message: 'I can help with the UI.', status: 'pending', date: at(-2) }], status: 'Open', category: 'Mobile App', date: at(-6) },
    { id: 'pr2', title: 'Urdu–English Lecture Transcriber', description: 'Speech-to-text pipeline that creates bilingual lecture transcripts for accessibility.', skills: ['Python', 'PyTorch', 'NLP'], teamSize: 3, creatorId: 's9', members: ['s9'], requests: [], status: 'Open', category: 'Research', date: at(-4) },
    { id: 'pr3', title: 'Solar-Powered Charging Bench', description: 'Prototype a bench with solar panels and USB charging for the main quad.', skills: ['Power Electronics', 'CAD', 'Arduino'], teamSize: 5, creatorId: 's4', members: ['s4', 's8', 's11'], requests: [], status: 'Open', category: 'Hardware', date: at(-14) },
    { id: 'pr4', title: 'Student Budget Tracker', description: 'A simple budgeting app tailored for students with shared expense splitting.', skills: ['Flutter', 'Firebase', 'Finance'], teamSize: 3, creatorId: 's10', members: ['s10', 's5', 's1'], requests: [], status: 'Full', category: 'Mobile App', date: at(-30) },
    { id: 'pr5', title: 'Library Seat Availability Dashboard', description: 'IoT sensors + dashboard showing free library seats in real time.', skills: ['IoT', 'Node.js', 'Dashboards'], teamSize: 4, creatorId: 's1', members: ['s1', 's2'], requests: [{ userId: 's4', message: 'I have experience with ESP32 sensors.', status: 'pending', date: at(-1) }], status: 'Open', category: 'IoT', date: at(-3) }
  ];

  /* ------------------------------------------------------------------ */
  /* OPPORTUNITIES & EVENTS                                              */
  /* ------------------------------------------------------------------ */
  const opportunityTypes = ['Internship', 'Scholarship', 'Job', 'Competition', 'Workshop', 'Seminar'];
  const opportunities = [
    { id: 'o1', type: 'Internship', title: 'Software Engineering Intern (Summer)', organization: 'Brightline Software', location: 'Northfield', mode: 'Hybrid', deadline: day(21), stipend: '$1,800 / month', description: 'Work with a product team on web services and internal tooling for 10 weeks.', eligibility: 'CS/SE students in semester 5 or above with JavaScript or Python experience.', link: 'careers.brightline.example/interns', tags: ['software', 'web'], postedBy: 'a1', date: at(-5) },
    { id: 'o2', type: 'Internship', title: 'Data Analyst Intern', organization: 'Northfield City Council', location: 'Northfield', mode: 'On-site', deadline: day(10), stipend: '$1,200 / month', description: 'Analyse transport and housing datasets and build public dashboards.', eligibility: 'Students with SQL and statistics coursework.', link: 'jobs.northfield.example/data-intern', tags: ['data', 'public sector'], postedBy: 'a1', date: at(-8) },
    { id: 'o3', type: 'Scholarship', title: 'Women in STEM Scholarship', organization: 'NFU Alumni Foundation', location: 'Northfield University', mode: 'On-site', deadline: day(30), stipend: '50% tuition for one year', description: 'Supports outstanding women in science, technology, engineering and mathematics.', eligibility: 'Female students in STEM with CGPA 3.3+.', link: 'alumni.university.edu/scholarships', tags: ['STEM', 'merit'], postedBy: 'a1', date: at(-12) },
    { id: 'o4', type: 'Scholarship', title: 'Need-Based Financial Aid 2027', organization: 'Office of Financial Aid', location: 'Northfield University', mode: 'On-site', deadline: day(45), stipend: 'Up to 100% tuition', description: 'Financial assistance for students facing economic hardship.', eligibility: 'All enrolled undergraduate students.', link: 'finaid.university.edu', tags: ['financial aid'], postedBy: 'a1', date: at(-20) },
    { id: 'o5', type: 'Job', title: 'Part-time Lab Assistant — Turing Hall', organization: 'Department of Computer Science', location: 'Turing Hall', mode: 'On-site', deadline: day(7), stipend: '$15 / hour', description: 'Assist in first-year programming labs, 10 hours per week.', eligibility: 'CS students who completed CS-201 with grade B+ or above.', link: 'cs.university.edu/jobs', tags: ['campus job', 'teaching'], postedBy: 'f1', date: at(-3) },
    { id: 'o6', type: 'Job', title: 'Junior Marketing Associate (Part-time)', organization: 'GreenLeaf Foods', location: 'Remote', mode: 'Remote', deadline: day(14), stipend: '$18 / hour', description: 'Support social media campaigns and market research.', eligibility: 'BBA students, semester 3+.', link: 'greenleaf.example/careers', tags: ['marketing'], postedBy: 'a1', date: at(-6) },
    { id: 'o7', type: 'Competition', title: 'National Collegiate Hackathon 2026', organization: 'TechBridge Foundation', location: 'Online', mode: 'Remote', deadline: day(12), stipend: 'Prize pool $10,000', description: '48-hour hackathon on climate and education technology.', eligibility: 'Teams of 2–4 university students.', link: 'hack.techbridge.example', tags: ['hackathon'], postedBy: 'a1', date: at(-9) },
    { id: 'o8', type: 'Competition', title: 'Inter-University Business Case Competition', organization: 'NFU Business School', location: 'Commerce Centre', mode: 'On-site', deadline: day(18), stipend: 'Trophy + $2,000', description: 'Solve a live case from a regional retailer and pitch to judges.', eligibility: 'Teams of 3 from any department.', link: 'business.university.edu/case', tags: ['business'], postedBy: 'f4', date: at(-4) },
    { id: 'o9', type: 'Workshop', title: 'Git & GitHub for Teams', organization: 'NFU Developer Club', location: 'Turing Hall 101', mode: 'On-site', deadline: day(5), stipend: 'Free', description: 'Branching strategies, pull requests and code review workflow.', eligibility: 'Open to all students.', link: 'devclub.university.edu', tags: ['git'], postedBy: 'a1', date: at(-2) },
    { id: 'o10', type: 'Workshop', title: 'CV & LinkedIn Clinic', organization: 'Career Services', location: 'Student Centre', mode: 'On-site', deadline: day(9), stipend: 'Free', description: 'One-to-one CV reviews with career advisors.', eligibility: 'All students.', link: 'careers.university.edu', tags: ['career'], postedBy: 'a1', date: at(-1) },
    { id: 'o11', type: 'Seminar', title: 'Responsible AI in Education', organization: 'School of Computing', location: 'Main Auditorium', mode: 'Hybrid', deadline: day(15), stipend: 'Free', description: 'Panel discussion with faculty and industry experts.', eligibility: 'Open to all.', link: 'computing.university.edu/seminars', tags: ['AI', 'ethics'], postedBy: 'f2', date: at(-7) },
    { id: 'o12', type: 'Internship', title: 'Embedded Systems Intern', organization: 'Voltix Robotics', location: 'Riverside', mode: 'On-site', deadline: day(-3), stipend: '$1,500 / month', description: 'Firmware development for warehouse robots.', eligibility: 'EE/CS students with C and microcontroller experience.', link: 'voltix.example/careers', tags: ['embedded'], postedBy: 'a1', date: at(-30) }
  ];

  const eventCategories = ['Workshop', 'Seminar', 'Career', 'Hackathon', 'Cultural', 'Sports'];
  const events = [
    { id: 'e1', title: 'Fall Career Fair 2026', category: 'Career', date: at(3, 10), endTime: '16:00', location: 'Student Centre Main Hall', organizer: 'Career Services', capacity: 600, registrations: ['s1', 's2', 's9', 's10'], description: 'Meet 45+ employers offering internships and graduate roles. Bring printed CVs.', icon: 'briefcase' },
    { id: 'e2', title: 'Hack the Campus 24h', category: 'Hackathon', date: at(9, 9), endTime: '09:00 (+1)', location: 'Turing Hall', organizer: 'NFU Developer Club', capacity: 120, registrations: ['s2', 's6'], description: 'Build solutions for campus life problems. Meals, mentors and prizes included.', icon: 'code-slash' },
    { id: 'e3', title: 'Research Methods Seminar', category: 'Seminar', date: at(5, 14), endTime: '16:00', location: 'Euler Building Room 015', organizer: 'Department of Mathematics', capacity: 80, registrations: ['s7'], description: 'How to design a research question, review literature and choose methods.', icon: 'mic' },
    { id: 'e4', title: 'Intro to Machine Learning Workshop', category: 'Workshop', date: at(7, 15), endTime: '17:30', location: 'Turing Hall Lab 3', organizer: 'AI Society', capacity: 40, registrations: ['s1', 's9', 's6'], description: 'Hands-on workshop with scikit-learn: regression, classification and evaluation.', icon: 'cpu' },
    { id: 'e5', title: 'International Food Festival', category: 'Cultural', date: at(12, 12), endTime: '18:00', location: 'Central Quad', organizer: 'Student Council', capacity: 1000, registrations: ['s5', 's11'], description: 'Food stalls from 20+ countries, music and performances.', icon: 'cup-hot' },
    { id: 'e6', title: 'Inter-Department Football Final', category: 'Sports', date: at(15, 16), endTime: '18:00', location: 'NFU Sports Ground', organizer: 'Sports Office', capacity: 500, registrations: ['s8'], description: 'CS vs ME — come support your department!', icon: 'trophy' },
    { id: 'e7', title: 'Women in Tech Panel', category: 'Seminar', date: at(20, 17), endTime: '19:00', location: 'Main Auditorium', organizer: 'School of Computing', capacity: 300, registrations: [], description: 'Alumni share career journeys in software, research and entrepreneurship.', icon: 'people' },
    { id: 'e8', title: 'Public Speaking Bootcamp', category: 'Workshop', date: at(26, 10), endTime: '13:00', location: 'Commerce Centre 105', organizer: 'Debate Society', capacity: 30, registrations: ['s11', 's5'], description: 'Practical techniques for presentations, viva exams and interviews.', icon: 'megaphone' },
    { id: 'e9', title: 'Orientation Volunteers Meetup', category: 'Cultural', date: at(-10, 15), endTime: '17:00', location: 'Student Centre', organizer: 'Student Council', capacity: 60, registrations: ['s1', 's5'], description: 'Debrief and celebration for orientation week volunteers.', icon: 'balloon' }
  ];

  /* ------------------------------------------------------------------ */
  /* NOTIFICATIONS, MESSAGES, ANNOUNCEMENTS                             */
  /* ------------------------------------------------------------------ */
  const notifications = [
    { id: 'nt1', recipientId: 's1', category: 'Achievement', title: 'Achievement verified', message: 'Your achievement “NFU Hackathon 2026 — 2nd Place” was approved. +60 points!', date: at(-7, 9), read: false, link: '/student/achievements' },
    { id: 'nt2', recipientId: 's1', category: 'Academic', title: 'New material in Database Systems', message: 'Dr. Sarah Mitchell uploaded “Lecture 7 — Transactions and Concurrency”.', date: at(-8, 12), read: false, link: '/student/learning/courses/c2' },
    { id: 'nt3', recipientId: 's1', category: 'Exchange', title: 'New request for your listing', message: 'Hamza Raza sent a request for “Noise-Cancelling Headphones”.', date: at(-1, 15), read: false, link: '/student/exchange/my-activity' },
    { id: 'nt4', recipientId: 's1', category: 'Community', title: 'New comment on your post', message: 'Daniel Okafor commented on “Database Systems midterm study session”.', date: at(-3, 12), read: true, link: '/student/community/p3' },
    { id: 'nt5', recipientId: 's1', category: 'Event', title: 'Event reminder', message: 'Fall Career Fair 2026 starts in 3 days. Don’t forget your CV!', date: at(0, 8), read: false, link: '/student/events' },
    { id: 'nt6', recipientId: 's1', category: 'Academic', title: 'Assignment due soon', message: 'Project Milestone 3 — Test Plan is due in 4 days.', date: at(-1, 8), read: true, link: '/student/planner' },
    { id: 'nt7', recipientId: 's1', category: 'System', title: 'Welcome to Fall 2026', message: 'Your semester 5 courses are now available in the Learning Hub.', date: at(-60, 9), read: true, link: '/student/learning' },
    { id: 'nt8', recipientId: 's1', category: 'Community', title: 'Your answer was liked', message: 'Your answer on “Recursion vs iteration for tree traversal?” received upvotes.', date: at(-5, 19), read: true, link: '/student/community/questions' },
    { id: 'nt9', recipientId: 'f1', category: 'Achievement', title: 'Achievement awaiting review', message: 'Hajra Saif Ullah submitted “Peer Tutoring Volunteer (40 hours)”.', date: at(-1, 10), read: false, link: '/faculty/achievements' },
    { id: 'nt10', recipientId: 'f1', category: 'Academic', title: 'New student note in CS-305', message: 'Hamza Raza uploaded “SQL Query Practice — 40 Solved Problems”.', date: at(-15, 11), read: true, link: '/faculty/courses' },
    { id: 'nt11', recipientId: 'f1', category: 'System', title: 'Grade submission window', message: 'Midterm grade submission closes in 5 days.', date: at(-2, 9), read: false, link: '/faculty/dashboard' },
    { id: 'nt12', recipientId: 'a1', category: 'System', title: 'Reported content', message: 'A community post was reported for academic dishonesty.', date: at(-5, 8), read: false, link: '/admin/community' },
    { id: 'nt13', recipientId: 'a1', category: 'Achievement', title: 'Pending achievements', message: '4 achievement submissions are waiting for verification.', date: at(-1, 9), read: false, link: '/admin/achievements' },
    { id: 'nt14', recipientId: 'a1', category: 'System', title: 'New feedback received', message: 'A student submitted feedback about Wi-Fi in the library.', date: at(-2, 16), read: true, link: '/admin/feedback' }
  ];

  const conversations = [
    { id: 'cv1', participants: ['s1', 's2'], messages: [
      { id: 'mg1', senderId: 's2', text: 'Hey Hajra! Are you still coming to the DB study session Thursday?', date: at(-1, 18, 5), read: true },
      { id: 'mg2', senderId: 's1', text: 'Yes! I’m bringing the past papers. Can you cover transactions?', date: at(-1, 18, 12), read: true },
      { id: 'mg3', senderId: 's2', text: 'Sure, I’ll prepare a few 2PL examples.', date: at(-1, 18, 20), read: true },
      { id: 'mg4', senderId: 's2', text: 'Also — is the textbook request still on? I can meet at the library tomorrow.', date: at(0, 9, 40), read: false }] },
    { id: 'cv2', participants: ['s1', 's6'], messages: [
      { id: 'mg5', senderId: 's6', text: 'Hi! Would you take $45 for the headphones?', date: at(-1, 15, 2), read: false },
      { id: 'mg6', senderId: 's6', text: 'I can pick them up after class today.', date: at(-1, 15, 4), read: false }] },
    { id: 'cv3', participants: ['s1', 's9'], messages: [
      { id: 'mg7', senderId: 's1', text: 'Thanks for the research internship post — super helpful!', date: at(-2, 21), read: true },
      { id: 'mg8', senderId: 's9', text: 'Glad it helped! Happy to review your email to professors if you want.', date: at(-2, 21, 30), read: true }] },
    { id: 'cv4', participants: ['s1', 's4'], messages: [
      { id: 'mg9', senderId: 's4', text: 'Your request for the Arduino kit is accepted. Friday 3 PM at Faraday Block?', date: at(-8, 10), read: true },
      { id: 'mg10', senderId: 's1', text: 'Perfect, see you then!', date: at(-8, 10, 15), read: true }] },
    { id: 'cv5', participants: ['s1', 's7'], messages: [
      { id: 'mg11', senderId: 's7', text: 'Are you joining the Stats with R group this Saturday?', date: at(-4, 12), read: true }] }
  ];

  const announcements = [
    { id: 'an1', title: 'Midterm Examination Schedule Published', body: 'The Fall 2026 midterm schedule is now available. Please check the exam section of your planner and report clashes to the registrar by Friday.', authorId: 'a1', audience: 'students', departmentId: null, courseIds: [], studentIds: [], date: at(-3, 9), priority: 'high' },
    { id: 'an2', title: 'Library Extended Hours', body: 'The main library will stay open until midnight during the exam period starting next week.', authorId: 'a1', audience: 'all', departmentId: null, courseIds: [], studentIds: [], date: at(-2, 10), priority: 'normal' },
    { id: 'an3', title: 'CS-305: Quiz 2 moved to Monday', body: 'Due to the career fair, Database Systems Quiz 2 has been moved to Monday. Coverage remains normalization and SQL.', authorId: 'f1', audience: 'course', departmentId: null, courseIds: ['c2'], studentIds: [], date: at(-1, 11), priority: 'high' },
    { id: 'an4', title: 'Faculty Workshop: Designing Effective Quizzes', body: 'All faculty are invited to a workshop on using the Student Hub quiz builder and analytics.', authorId: 'a1', audience: 'faculty', departmentId: null, courseIds: [], studentIds: [], date: at(-4, 14), priority: 'normal' },
    { id: 'an5', title: 'CS-320: Team project groups finalized', body: 'Team allocations for the semester project are final. Meet your team before the next lab.', authorId: 'f1', audience: 'course', departmentId: null, courseIds: ['c4'], studentIds: [], date: at(-6, 9), priority: 'normal' }
  ];

  /* ------------------------------------------------------------------ */
  /* PLANNER: TIMETABLE, ASSIGNMENTS, EXAMS, TASKS                       */
  /* ------------------------------------------------------------------ */
  const timetable = [
    { id: 't1', courseId: 'c2', day: 'Mon', start: '09:00', end: '10:30', room: 'Turing Hall 201', type: 'Lecture' },
    { id: 't2', courseId: 'c3', day: 'Mon', start: '11:00', end: '12:30', room: 'Turing Hall 105', type: 'Lecture' },
    { id: 't3', courseId: 'c9', day: 'Tue', start: '10:00', end: '11:30', room: 'Euler Building 020', type: 'Lecture' },
    { id: 't4', courseId: 'c4', day: 'Tue', start: '14:00', end: '15:30', room: 'Turing Hall 301', type: 'Lecture' },
    { id: 't5', courseId: 'c2', day: 'Wed', start: '09:00', end: '10:30', room: 'Turing Hall 201', type: 'Lecture' },
    { id: 't6', courseId: 'c3', day: 'Wed', start: '13:00', end: '15:00', room: 'Turing Hall Lab 2', type: 'Lab' },
    { id: 't7', courseId: 'c9', day: 'Thu', start: '10:00', end: '11:30', room: 'Euler Building 020', type: 'Lecture' },
    { id: 't8', courseId: 'c4', day: 'Thu', start: '14:00', end: '16:00', room: 'Turing Hall Lab 1', type: 'Lab' },
    { id: 't9', courseId: 'c2', day: 'Fri', start: '11:00', end: '13:00', room: 'Turing Hall Lab 3', type: 'Lab' },
    { id: 't10', courseId: 'c1', day: 'Mon', start: '14:00', end: '15:30', room: 'Turing Hall 110', type: 'Lecture' },
    { id: 't11', courseId: 'c10', day: 'Wed', start: '11:00', end: '12:30', room: 'Euler Building 012', type: 'Lecture' },
    { id: 't12', courseId: 'c8', day: 'Tue', start: '09:00', end: '10:30', room: 'Commerce Centre 201', type: 'Lecture' }
  ];

  const assignments = [
    { id: 'as1', courseId: 'c2', title: 'Assignment 2 — ER Design for a Library System', description: 'ER diagram and 3NF relational schema.', dueDate: at(2, 23, 59), maxMarks: 20 },
    { id: 'as2', courseId: 'c3', title: 'Lab 5 — Page Replacement Simulator', description: 'Implement FIFO, LRU and OPT; compare page faults.', dueDate: at(6, 23, 59), maxMarks: 25 },
    { id: 'as3', courseId: 'c4', title: 'Project Milestone 3 — Test Plan', description: 'Test plan with unit and integration cases.', dueDate: at(4, 17), maxMarks: 30 },
    { id: 'as4', courseId: 'c9', title: 'Problem Set 6 — Hypothesis Testing', description: 'Ten problems on z, t and chi-square tests.', dueDate: at(9, 23, 59), maxMarks: 15 },
    { id: 'as5', courseId: 'c2', title: 'SQL Lab 4 — Window Functions', description: 'Ranking and running totals on the sales schema.', dueDate: at(-3, 23, 59), maxMarks: 10 },
    { id: 'as6', courseId: 'c1', title: 'Assignment 4 — Graph Algorithms', description: 'Implement BFS, DFS and Dijkstra.', dueDate: at(5, 23, 59), maxMarks: 25 },
    { id: 'as7', courseId: 'c7', title: 'FIR Filter Design Report', description: 'Window method comparison with plots.', dueDate: at(8, 23, 59), maxMarks: 20 }
  ];

  const exams = [
    { id: 'ex1', courseId: 'c2', type: 'Midterm', date: at(11, 9), duration: '2 hours', room: 'Exam Hall A', syllabus: 'Modules 1–2: relational model, SQL, ER design, normalization.' },
    { id: 'ex2', courseId: 'c3', type: 'Midterm', date: at(13, 9), duration: '2 hours', room: 'Exam Hall B', syllabus: 'Processes, threads, scheduling and synchronization.' },
    { id: 'ex3', courseId: 'c9', type: 'Quiz', date: at(5, 10), duration: '45 minutes', room: 'Euler Building 020', syllabus: 'Random variables and distributions.' },
    { id: 'ex4', courseId: 'c4', type: 'Midterm', date: at(16, 14), duration: '2 hours', room: 'Exam Hall A', syllabus: 'Agile, UML and design patterns.' },
    { id: 'ex5', courseId: 'c1', type: 'Midterm', date: at(12, 9), duration: '2 hours', room: 'Exam Hall C', syllabus: 'Arrays, linked lists, stacks, queues and trees.' }
  ];

  const tasks = [
    { id: 'tk1', userId: 's1', title: 'Finish ER diagram for Assignment 2', date: day(1), time: '20:00', priority: 'High', category: 'Assignment', done: false, notes: 'Use draw.io; export as PNG.' },
    { id: 'tk2', userId: 's1', title: 'Revise CPU scheduling numericals', date: day(0), time: '18:00', priority: 'Medium', category: 'Study', done: false, notes: 'Use Daniel’s Gantt notes.' },
    { id: 'tk3', userId: 's1', title: 'Read OS Chapter 9', date: day(2), time: '21:00', priority: 'Low', category: 'Reading', done: false, notes: '' },
    { id: 'tk4', userId: 's1', title: 'Team standup for SE project', date: day(0), time: '13:00', priority: 'Medium', category: 'Meeting', done: true, notes: 'Discuss test plan owners.' },
    { id: 'tk5', userId: 's1', title: 'Practice quiz: Probability basics', date: day(-1), time: '19:00', priority: 'Medium', category: 'Study', done: true, notes: '' },
    { id: 'tk6', userId: 's1', title: 'Prepare CV for Career Fair', date: day(2), time: '17:00', priority: 'High', category: 'Personal', done: false, notes: 'Ask Fatima to review.' },
    { id: 'tk7', userId: 's1', title: 'Submit SQL Lab 4', date: day(-3), time: '23:00', priority: 'High', category: 'Assignment', done: true, notes: '' }
  ];

  /* ------------------------------------------------------------------ */
  /* QUIZZES                                                             */
  /* ------------------------------------------------------------------ */
  const quizzes = [
    { id: 'qz1', courseId: 'c2', title: 'SQL & Relational Model Basics', subject: 'Databases', difficulty: 'Easy', duration: 8, createdBy: 'f1', published: true, date: at(-30) },
    { id: 'qz2', courseId: 'c2', title: 'Normalization Challenge', subject: 'Databases', difficulty: 'Medium', duration: 10, createdBy: 'f1', published: true, date: at(-20) },
    { id: 'qz3', courseId: 'c3', title: 'CPU Scheduling & Processes', subject: 'Systems', difficulty: 'Medium', duration: 10, createdBy: 'f2', published: true, date: at(-18) },
    { id: 'qz4', courseId: 'c9', title: 'Probability Fundamentals', subject: 'Mathematics', difficulty: 'Easy', duration: 8, createdBy: 'f5', published: true, date: at(-25) },
    { id: 'qz5', courseId: 'c4', title: 'Design Patterns & UML', subject: 'Software Engineering', difficulty: 'Hard', duration: 12, createdBy: 'f1', published: true, date: at(-10) },
    { id: 'qz6', courseId: 'c1', title: 'Data Structures Warm-up', subject: 'Programming', difficulty: 'Easy', duration: 8, createdBy: 'f1', published: true, date: at(-14) },
    { id: 'qz7', courseId: 'c2', title: 'Transactions (Draft)', subject: 'Databases', difficulty: 'Hard', duration: 10, createdBy: 'f1', published: false, date: at(-1) }
  ];

  const qq = (id, quizId, text, options, answer, explanation) => ({ id, quizId, text, options, answer, explanation });
  const quizQuestions = [
    qq('qq1', 'qz1', 'Which SQL clause filters groups after aggregation?', ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'], 1, 'HAVING filters groups produced by GROUP BY; WHERE filters rows before grouping.'),
    qq('qq2', 'qz1', 'A minimal superkey is called a…', ['Foreign key', 'Candidate key', 'Composite key', 'Surrogate key'], 1, 'A candidate key is a superkey with no redundant attributes.'),
    qq('qq3', 'qz1', 'Which join returns all rows from the left table?', ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'], 2, 'LEFT JOIN keeps every row of the left table, filling NULLs where no match exists.'),
    qq('qq4', 'qz1', 'Which relational algebra operator selects rows?', ['π (projection)', 'σ (selection)', '⋈ (join)', '∪ (union)'], 1, 'Selection σ filters tuples; projection π chooses columns.'),
    qq('qq5', 'qz1', 'Which constraint enforces referential integrity?', ['UNIQUE', 'CHECK', 'FOREIGN KEY', 'DEFAULT'], 2, 'FOREIGN KEY ensures values exist in the referenced table.'),
    qq('qq6', 'qz2', 'A relation is in 2NF if it is in 1NF and has no…', ['Transitive dependencies', 'Partial dependencies', 'Multivalued dependencies', 'Null values'], 1, '2NF removes partial dependencies of non-prime attributes on part of a composite key.'),
    qq('qq7', 'qz2', 'BCNF requires that for every FD X → Y…', ['Y is prime', 'X is a superkey', 'X is a foreign key', 'Y is atomic'], 1, 'In BCNF every determinant must be a superkey.'),
    qq('qq8', 'qz2', 'Which anomaly occurs when deleting a row removes unrelated facts?', ['Insertion anomaly', 'Update anomaly', 'Deletion anomaly', 'Join anomaly'], 2, 'Deletion anomalies lose information unintentionally.'),
    qq('qq9', 'qz2', 'A → B and B → C implies A → C by…', ['Reflexivity', 'Augmentation', 'Transitivity', 'Union'], 2, 'Armstrong’s transitivity axiom.'),
    qq('qq10', 'qz2', '3NF removes which type of dependency?', ['Partial', 'Transitive', 'Trivial', 'Join'], 1, '3NF eliminates transitive dependencies of non-prime attributes on keys.'),
    qq('qq11', 'qz3', 'Which algorithm can cause the convoy effect?', ['Round Robin', 'FCFS', 'SRTF', 'Priority with aging'], 1, 'In FCFS, short processes wait behind a long one.'),
    qq('qq12', 'qz3', 'Round Robin primarily improves…', ['Throughput', 'Response time fairness', 'CPU temperature', 'Memory usage'], 1, 'Time slicing gives every process regular CPU access.'),
    qq('qq13', 'qz3', 'What is stored in the PCB?', ['Only the program code', 'Process state and registers', 'The file system', 'The page table of all processes'], 1, 'The PCB stores state, registers, PC, scheduling and memory info.'),
    qq('qq14', 'qz3', 'Starvation in priority scheduling is solved by…', ['Paging', 'Aging', 'Swapping', 'Thrashing'], 1, 'Aging gradually raises the priority of waiting processes.'),
    qq('qq15', 'qz3', 'Turnaround time equals…', ['Burst − Arrival', 'Completion − Arrival', 'Waiting + Arrival', 'Completion − Burst'], 1, 'Turnaround = Completion − Arrival.'),
    qq('qq16', 'qz4', 'P(A|B) is calculated as…', ['P(A)P(B)', 'P(A∩B)/P(B)', 'P(A)+P(B)', 'P(B|A)/P(A)'], 1, 'Definition of conditional probability.'),
    qq('qq17', 'qz4', 'The mean of a Poisson(λ) distribution is…', ['λ²', '1/λ', 'λ', '√λ'], 2, 'For Poisson, both mean and variance equal λ.'),
    qq('qq18', 'qz4', 'About what % of a normal distribution lies within 2σ?', ['68%', '90%', '95%', '99.7%'], 2, 'The 68–95–99.7 rule.'),
    qq('qq19', 'qz4', 'Two events are independent if…', ['P(A∩B)=0', 'P(A∩B)=P(A)P(B)', 'P(A)=P(B)', 'P(A∪B)=1'], 1, 'Independence means the joint probability is the product.'),
    qq('qq20', 'qz4', 'Variance of Binomial(n, p) is…', ['np', 'np(1−p)', 'n(1−p)', 'p(1−p)'], 1, 'Var = np(1−p).'),
    qq('qq21', 'qz5', 'Which pattern defines a one-to-many dependency so dependents are notified of changes?', ['Adapter', 'Observer', 'Singleton', 'Decorator'], 1, 'Observer notifies subscribers automatically.'),
    qq('qq22', 'qz5', 'A filled diamond in UML represents…', ['Aggregation', 'Composition', 'Inheritance', 'Dependency'], 1, 'Composition: the part cannot exist without the whole.'),
    qq('qq23', 'qz5', 'Which SOLID principle says classes should be open for extension but closed for modification?', ['SRP', 'OCP', 'LSP', 'DIP'], 1, 'Open/Closed Principle.'),
    qq('qq24', 'qz5', 'Which pattern converts one interface into another?', ['Adapter', 'Facade', 'Proxy', 'Strategy'], 0, 'Adapter wraps an incompatible interface.'),
    qq('qq25', 'qz5', 'Sequence diagrams primarily show…', ['Class structure', 'Object interactions over time', 'Deployment nodes', 'State transitions'], 1, 'They model message order between lifelines.'),
    qq('qq26', 'qz6', 'Accessing an array element by index takes…', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 0, 'Arrays support constant-time random access.'),
    qq('qq27', 'qz6', 'Which structure is LIFO?', ['Queue', 'Stack', 'Heap', 'Graph'], 1, 'Stacks are Last-In-First-Out.'),
    qq('qq28', 'qz6', 'BFS uses which data structure?', ['Stack', 'Queue', 'Priority queue', 'Hash table'], 1, 'BFS processes nodes level by level with a queue.'),
    qq('qq29', 'qz6', 'Average search time in a balanced BST is…', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 1, 'Height of a balanced BST is log n.'),
    qq('qq30', 'qz6', 'A min-heap’s root contains…', ['The largest element', 'The smallest element', 'The median', 'A random element'], 1, 'In a min-heap the parent is ≤ its children.'),
    qq('qq31', 'qz7', 'Which property ensures committed changes survive crashes?', ['Atomicity', 'Consistency', 'Isolation', 'Durability'], 3, 'Durability.'),
    qq('qq32', 'qz7', 'Two-phase locking has a growing phase and a…', ['Shrinking phase', 'Commit phase', 'Abort phase', 'Locking phase'], 0, 'Locks are released only in the shrinking phase.')
  ];

  const quizAttempts = [
    { id: 'at1', quizId: 'qz1', userId: 's1', score: 4, total: 5, answers: [1, 1, 2, 0, 2], date: at(-20, 19), timeTaken: 312 },
    { id: 'at2', quizId: 'qz4', userId: 's1', score: 3, total: 5, answers: [1, 2, 1, 1, 0], date: at(-15, 20), timeTaken: 401 },
    { id: 'at3', quizId: 'qz3', userId: 's1', score: 4, total: 5, answers: [1, 1, 1, 1, 0], date: at(-9, 18), timeTaken: 455 },
    { id: 'at4', quizId: 'qz2', userId: 's1', score: 5, total: 5, answers: [1, 1, 2, 2, 1], date: at(-4, 21), timeTaken: 380 },
    { id: 'at5', quizId: 'qz4', userId: 's1', score: 5, total: 5, answers: [1, 2, 2, 1, 1], date: at(-1, 19), timeTaken: 290 },
    { id: 'at6', quizId: 'qz1', userId: 's2', score: 5, total: 5, answers: [1, 1, 2, 1, 2], date: at(-18, 19), timeTaken: 250 },
    { id: 'at7', quizId: 'qz2', userId: 's6', score: 3, total: 5, answers: [1, 0, 2, 2, 0], date: at(-6, 19), timeTaken: 520 },
    { id: 'at8', quizId: 'qz3', userId: 's2', score: 5, total: 5, answers: [1, 1, 1, 1, 1], date: at(-7, 16), timeTaken: 330 },
    { id: 'at9', quizId: 'qz4', userId: 's7', score: 5, total: 5, answers: [1, 2, 2, 1, 1], date: at(-10, 10), timeTaken: 200 },
    { id: 'at10', quizId: 'qz6', userId: 's3', score: 4, total: 5, answers: [0, 1, 1, 1, 0], date: at(-5, 15), timeTaken: 260 }
  ];

  /* ------------------------------------------------------------------ */
  /* LOST & FOUND, FEEDBACK, REPORTS                                     */
  /* ------------------------------------------------------------------ */
  const lostFoundCategories = ['Electronics', 'ID Cards', 'Books', 'Bags', 'Keys', 'Clothing', 'Other'];
  const lostFoundItems = [
    { id: 'lf1', type: 'lost', title: 'Blue HP laptop charger', category: 'Electronics', description: '65W charger with a sticker of a cat on the brick.', location: 'Library 2nd floor', date: day(-1), posterId: 's2', status: 'open', icon: 'plug', image: null },
    { id: 'lf2', type: 'found', title: 'Student ID card — S. Rossi', category: 'ID Cards', description: 'Found near the cafeteria entrance.', location: 'Main Cafeteria', date: day(-2), posterId: 's1', status: 'open', icon: 'person-vcard', image: null },
    { id: 'lf3', type: 'lost', title: 'Black backpack with laptop sleeve', category: 'Bags', description: 'Contains a Linear Algebra notebook and a water bottle.', location: 'Euler Building 012', date: day(-3), posterId: 's7', status: 'open', icon: 'backpack', image: null },
    { id: 'lf4', type: 'found', title: 'Set of keys with red keychain', category: 'Keys', description: 'Three keys and a small red climbing carabiner.', location: 'Sports Ground bleachers', date: day(-4), posterId: 's8', status: 'open', icon: 'key', image: null },
    { id: 'lf5', type: 'lost', title: 'Grey NFU hoodie (L)', category: 'Clothing', description: 'Left in Turing Hall Lab 2 after the OS lab.', location: 'Turing Hall Lab 2', date: day(-6), posterId: 's1', status: 'recovered', icon: 'person-standing-dress', image: null },
    { id: 'lf6', type: 'found', title: 'Casio scientific calculator', category: 'Electronics', description: 'fx-991 found after the stats quiz.', location: 'Euler Building 020', date: day(-5), posterId: 's4', status: 'open', icon: 'calculator', image: null },
    { id: 'lf7', type: 'lost', title: 'Clean Architecture textbook', category: 'Books', description: 'Has my name written inside the cover.', location: 'Student Centre lounge', date: day(-8), posterId: 's6', status: 'open', icon: 'book', image: null }
  ];

  const feedbackCategories = ['Academics', 'Facilities', 'IT & Wi-Fi', 'Platform', 'Transport', 'Other'];
  const feedback = [
    { id: 'fb1', userId: 's1', category: 'IT & Wi-Fi', title: 'Wi-Fi drops in Library 3rd floor', description: 'The connection drops every 10–15 minutes in the quiet study area, especially in the evening.', anonymous: false, date: at(-10, 14), status: 'Resolved',
      history: [{ status: 'Submitted', date: at(-10, 14) }, { status: 'In Review', date: at(-8, 9) }, { status: 'Resolved', date: at(-5, 11) }], response: { text: 'IT Services installed two additional access points on the 3rd floor. Please let us know if issues continue.', by: 'a1', date: at(-5, 11) } },
    { id: 'fb2', userId: 's1', category: 'Platform', title: 'Add dark mode to Student Hub', description: 'Would love a dark theme for late-night studying.', anonymous: false, date: at(-6, 22), status: 'Resolved',
      history: [{ status: 'Submitted', date: at(-6, 22) }, { status: 'Resolved', date: at(-2, 10) }], response: { text: 'Great suggestion — dark mode is now available in Settings → Theme.', by: 'a1', date: at(-2, 10) } },
    { id: 'fb3', userId: 's1', category: 'Facilities', title: 'More charging points in lecture halls', description: 'Turing Hall 201 has only two working sockets.', anonymous: true, date: at(-2, 12), status: 'In Review',
      history: [{ status: 'Submitted', date: at(-2, 12) }, { status: 'In Review', date: at(-1, 9) }], response: null },
    { id: 'fb4', userId: 's5', category: 'Transport', title: 'Late evening shuttle', description: 'Please add a 10 PM shuttle on weekdays during exams.', anonymous: false, date: at(-4, 18), status: 'Submitted', history: [{ status: 'Submitted', date: at(-4, 18) }], response: null },
    { id: 'fb5', userId: 's2', category: 'Academics', title: 'Release past papers earlier', description: 'Past papers for CS-310 were uploaded only two days before the midterm.', anonymous: false, date: at(-15, 10), status: 'Closed',
      history: [{ status: 'Submitted', date: at(-15, 10) }, { status: 'In Review', date: at(-14, 9) }, { status: 'Closed', date: at(-12, 9) }], response: { text: 'Forwarded to the CS department. Past papers will be uploaded at the start of each term.', by: 'a1', date: at(-12, 9) } },
    { id: 'fb6', userId: 's11', category: 'Facilities', title: 'Broken oscilloscope in Lab 4', description: 'Station 6 oscilloscope does not power on.', anonymous: false, date: at(-1, 15), status: 'Submitted', history: [{ status: 'Submitted', date: at(-1, 15) }], response: null }
  ];

  const reports = [
    { id: 'rp1', targetType: 'post', targetId: 'p9', reporterId: 's2', reason: 'Academic dishonesty — offering leaked exam answers.', date: at(-5, 8), status: 'open' },
    { id: 'rp2', targetType: 'listing', targetId: 'i6', reporterId: 's3', reason: 'Price seems misleading — book is an older edition.', date: at(-3, 10), status: 'open' },
    { id: 'rp3', targetType: 'note', targetId: 'n6', reporterId: 's9', reason: 'Some sections appear copied from a textbook.', date: at(-2, 15), status: 'open' },
    { id: 'rp4', targetType: 'comment', targetId: 'cm10', reporterId: 's6', reason: 'Spam', date: at(-4, 9), status: 'dismissed' }
  ];

  /* ------------------------------------------------------------------ */
  /* PER-USER STATE (bookmarks, saved items, progress…)                  */
  /* ------------------------------------------------------------------ */
  const userState = {
    s1: {
      bookmarks: ['n2', 'n7', 'n3'],
      savedResources: ['sm2', 'sm11', 'sm14'],
      savedOpportunities: ['o1', 'o3'],
      appliedOpportunities: [{ id: 'o5', date: at(-1, 12) }],
      completedModules: ['m4', 'm5', 'm7', 'm10', 'm11', 'm21', 'm22'],
      submittedAssignments: ['as5'],
      aiChat: [],
      weeklyActivity: [3.5, 2, 4, 5.5, 3, 6, 1.5]
    }
  };

  /* ------------------------------------------------------------------ */
  /* AI STUDY ASSISTANT (rule-based demo knowledge)                      */
  /* ------------------------------------------------------------------ */
  const aiKnowledge = [
    { keywords: ['normalization', 'normal form', '3nf', 'bcnf', '2nf', '1nf'], answer: '**Normalization** organizes a database to reduce redundancy.\n\n- **1NF** – atomic values, no repeating groups\n- **2NF** – no partial dependency on part of a composite key\n- **3NF** – no transitive dependency on the key\n- **BCNF** – every determinant is a superkey\n\nTip: always find candidate keys first, then test each functional dependency.' },
    { keywords: ['deadlock', 'banker'], answer: 'A **deadlock** happens when processes wait on each other forever. The four Coffman conditions are:\n\n1. Mutual exclusion\n2. Hold and wait\n3. No pre-emption\n4. Circular wait\n\nThe **Banker’s algorithm** avoids deadlock by granting requests only if the system stays in a safe state (Need = Max − Allocation).' },
    { keywords: ['scheduling', 'round robin', 'fcfs', 'sjf', 'cpu'], answer: '**CPU scheduling** decides which ready process runs next.\n\n- **FCFS** – simple, suffers convoy effect\n- **SJF/SRTF** – optimal average waiting time, needs burst estimates\n- **Round Robin** – time quantum gives fairness and good response time\n- **Priority** – risk of starvation, solved with aging\n\nRemember: Turnaround = Completion − Arrival, Waiting = Turnaround − Burst.' },
    { keywords: ['bayes', 'conditional probability'], answer: '**Bayes’ theorem:** P(A|B) = P(B|A)·P(A) / P(B).\n\nExample: a test is 99% sensitive and 95% specific for a disease with 1% prevalence. A positive result means only about a **16.7%** chance of having the disease, because false positives dominate when the disease is rare.' },
    { keywords: ['big o', 'complexity', 'time complexity'], answer: '**Big-O** describes how running time grows with input size.\n\n- O(1) constant – array index\n- O(log n) – binary search\n- O(n) – linear scan\n- O(n log n) – merge sort\n- O(n²) – nested loops, bubble sort\n\nDrop constants and lower-order terms when simplifying.' },
    { keywords: ['sql', 'join', 'query'], answer: '**SQL joins** combine rows from tables:\n\n- **INNER JOIN** – only matching rows\n- **LEFT JOIN** – all left rows + matches\n- **RIGHT JOIN** – all right rows + matches\n- **FULL OUTER JOIN** – everything from both\n\nUse `WHERE` to filter rows and `HAVING` to filter groups after `GROUP BY`.' },
    { keywords: ['design pattern', 'observer', 'singleton', 'factory'], answer: '**Design patterns** are reusable solutions:\n\n- **Creational:** Singleton, Factory Method, Builder\n- **Structural:** Adapter, Facade, Decorator\n- **Behavioural:** Observer, Strategy, Command\n\nPick a pattern only when it solves a real problem in your design.' },
    { keywords: ['study tips', 'how to study', 'exam', 'prepare'], answer: 'Here is an evidence-based study plan:\n\n1. **Active recall** – test yourself with practice quizzes instead of re-reading.\n2. **Spaced repetition** – review topics after 1, 3 and 7 days.\n3. **Interleaving** – mix problem types in a session.\n4. **Pomodoro** – 25 minutes focus, 5 minutes break.\n5. Use the **Study Planner** to schedule revision before each exam.' },
    { keywords: ['hypothesis', 't-test', 'z-test', 'p-value'], answer: '**Hypothesis testing** in five steps:\n\n1. State H₀ and H₁\n2. Choose α (e.g. 0.05)\n3. Compute the test statistic\n4. Find the p-value\n5. Reject H₀ if p < α\n\nUse a **z-test** when σ is known or n is large; a **t-test** when σ is unknown and the sample is small.' },
    { keywords: ['eigen', 'eigenvalue', 'eigenvector'], answer: 'An **eigenvector** v of matrix A satisfies Av = λv, where λ is the **eigenvalue**.\n\nFind eigenvalues by solving det(A − λI) = 0, then solve (A − λI)v = 0 for each λ. A matrix with n independent eigenvectors can be diagonalized as A = PDP⁻¹.' }
  ];

  const aiSuggestions = [
    'Explain database normalization',
    'What causes a deadlock?',
    'Compare CPU scheduling algorithms',
    'Explain Bayes theorem with an example',
    'Give me study tips for exams',
    'When should I use a t-test?'
  ];

  /* ------------------------------------------------------------------ */
  /* ANALYTICS / ADMIN STATISTICS                                        */
  /* ------------------------------------------------------------------ */
  const months = [5, 4, 3, 2, 1, 0].map(monthLabel);
  const adminStats = {
    months,
    monthlyActivity: { logins: [1840, 2120, 2390, 2980, 3410, 3620], uploads: [64, 71, 88, 120, 142, 96], posts: [110, 132, 150, 188, 214, 170] },
    userGrowth: { students: [2410, 2480, 2620, 2890, 3010, 3065], faculty: [168, 170, 172, 181, 184, 186] },
    activeUsers: { daily: [620, 710, 840, 990, 1120, 1180], weekly: [1650, 1820, 2010, 2390, 2610, 2700] },
    registrations: [42, 51, 96, 210, 98, 37],
    marketplace: { listed: [38, 44, 52, 70, 81, 66], completed: [22, 29, 35, 48, 57, 40] },
    community: { posts: [110, 132, 150, 188, 214, 170], comments: [420, 488, 530, 702, 815, 640] },
    totals: { students: 3065, faculty: 186, courses: 248 }
  };

  /* ------------------------------------------------------------------ */
  /* EXPORT                                                              */
  /* ------------------------------------------------------------------ */
const DATA = {
    university, platformSettings, demoCredentials, departments, semesters, users,
    courses, courseModules, studyMaterials, notes, achievementCategories, achievements, badges,
    leaderboard, scoringRules, annualAwards, studentOfYearCriteria,
    marketplaceCategories, marketplaceItems, itemRequests,
    communityCategories, communityPosts, comments, questions, questionCategories, studyGroups, projects,
    opportunityTypes, opportunities, eventCategories, events,
    notifications, conversations, announcements,
    timetable, assignments, exams, tasks,
    quizzes, quizQuestions, quizAttempts,
    lostFoundCategories, lostFoundItems, feedbackCategories, feedback, reports,
    userState, aiKnowledge, aiSuggestions, adminStats
};

export default DATA;
