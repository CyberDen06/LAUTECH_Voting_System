import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './index.css';

type Student = {
  id: string;
  jupebNumber: string;
  fullName: string;
  authorized: boolean;
  hasVoted: boolean;
};

type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

type Candidate = {
  id: string;
  categoryId: string;
  fullName: string;
  jupebNumber: string;
  photoUrl: string;
  description: string;
  isActive: boolean;
};

type VoteRecord = {
  id: string;
  studentId: string;
  categoryId: string;
  candidateId: string;
  createdAt: string;
};

type ElectionStatus = 'open' | 'closed';

type StudentSession = {
  studentId: string;
  fullName: string;
};

type AdminSession = {
  email: string;
};

type CategoryDraft = {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

type CandidateDraft = {
  categoryId: string;
  fullName: string;
  jupebNumber: string;
  photoUrl: string;
  description: string;
  isActive: boolean;
};

type StudentDraft = {
  fullName: string;
  jupebNumber: string;
  authorized: boolean;
};

const STORAGE_KEYS = {
  students: 'lautech-students',
  categories: 'lautech-categories',
  candidates: 'lautech-candidates',
  votes: 'lautech-votes',
  election: 'lautech-election',
  studentSession: 'lautech-student-session',
  adminSession: 'lautech-admin-session',
  flash: 'lautech-flash'
};

const ADMIN_EMAIL = 'admin@lautech.edu.ng';
const ADMIN_PASSWORD = 'admin1234';

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const removeStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  }
};

const formatPercent = (votes: number, total: number) => {
  if (!total) {
    return '0.0%';
  }
  return `${((votes / total) * 100).toFixed(1)}%`;
};

const downloadCsv = (filename: string, rows: string[][]) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const initialStudents: Student[] = [];

const initialCategories: Category[] = [
  { id: createId(), name: 'Best Entrepreneur', description: 'Recognises a student with business and innovation drive.', imageUrl: '', isActive: true },
  { id: createId(), name: 'Most Influential Leader', description: 'For the student who inspires and leads others.', imageUrl: '', isActive: true },
  { id: createId(), name: 'Creative Innovator', description: 'Celebrates the imaginative problem-solver.', imageUrl: '', isActive: true }
];

const initialCandidates: Candidate[] = [
  { id: createId(), categoryId: initialCategories[0].id, fullName: 'Ada Okafor', jupebNumber: '260700002', photoUrl: '', description: 'Founder of a campus digital design studio.', isActive: true },
  { id: createId(), categoryId: initialCategories[0].id, fullName: 'Moses Ali', jupebNumber: '260700045', photoUrl: '', description: 'Built a mobile microfinance club for students.', isActive: true },
  { id: createId(), categoryId: initialCategories[1].id, fullName: 'Kemi Yusuf', jupebNumber: '260700089', photoUrl: '', description: 'Led a peer mentoring network across JUPEB classes.', isActive: true },
  { id: createId(), categoryId: initialCategories[2].id, fullName: 'Tunde Adekola', jupebNumber: '260700002', photoUrl: '', description: 'Introduced a student media innovation challenge.', isActive: true }
];

const initialElection: ElectionStatus = 'open';

function App() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>(() =>
    readStorage(STORAGE_KEYS.students, initialStudents).map((s: Student) => ({ ...s, jupebNumber: String(s.jupebNumber ?? '') }))
  );
  const [categories, setCategories] = useState<Category[]>(() => readStorage(STORAGE_KEYS.categories, initialCategories));
  const [candidates, setCandidates] = useState<Candidate[]>(() => readStorage(STORAGE_KEYS.candidates, initialCandidates));
  const [votes, setVotes] = useState<VoteRecord[]>(() => readStorage(STORAGE_KEYS.votes, []));
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>(() => readStorage(STORAGE_KEYS.election, initialElection));
  const [studentSession, setStudentSession] = useState<StudentSession | null>(() => readStorage(STORAGE_KEYS.studentSession, null));
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => readStorage(STORAGE_KEYS.adminSession, null));
  const [flashMessage, setFlashMessage] = useState<string | null>(() => readStorage(STORAGE_KEYS.flash, null));

  useEffect(() => {
    writeStorage(STORAGE_KEYS.students, students);
  }, [students]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.candidates, candidates);
  }, [candidates]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.votes, votes);
  }, [votes]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.election, electionStatus);
  }, [electionStatus]);

  useEffect(() => {
    if (studentSession) {
      writeStorage(STORAGE_KEYS.studentSession, studentSession);
    } else {
      removeStorage(STORAGE_KEYS.studentSession);
    }
  }, [studentSession]);

  useEffect(() => {
    if (adminSession) {
      writeStorage(STORAGE_KEYS.adminSession, adminSession);
    } else {
      removeStorage(STORAGE_KEYS.adminSession);
    }
  }, [adminSession]);

  useEffect(() => {
    if (flashMessage) {
      writeStorage(STORAGE_KEYS.flash, flashMessage);
    } else {
      removeStorage(STORAGE_KEYS.flash);
    }
  }, [flashMessage]);

  useEffect(() => {
    if (!flashMessage) {
      return;
    }
    const timer = window.setTimeout(() => setFlashMessage(null), 3600);
    return () => window.clearTimeout(timer);
  }, [flashMessage]);

  const handleStudentLogin = (jupebNumber: string) => {
    const student = students.find((entry) => entry.jupebNumber.trim() === jupebNumber.trim());

    if (!student) {
      setFlashMessage('Access denied. This voting platform is restricted to registered LAUTECH JUPEB students.');
      return;
    }

    if (!student.authorized) {
      setFlashMessage('Access denied. This voting platform is restricted to registered LAUTECH JUPEB students.');
      return;
    }

    if (student.hasVoted) {
      setFlashMessage('You have already submitted your vote. Thank you for participating in the LAUTECH JUPEB Awards.');
      return;
    }

    if (electionStatus === 'closed') {
      setFlashMessage('Voting is currently closed. Please check back later.');
      return;
    }

    setStudentSession({ studentId: student.id, fullName: student.fullName });
    setFlashMessage(null);
    navigate('/vote');
  };

  const handleStudentLogout = () => {
    setStudentSession(null);
    navigate('/');
  };

  const handleAdminLogin = (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdminSession({ email });
      setFlashMessage('Welcome back, admin.');
      navigate('/admin/dashboard');
      return;
    }
    setFlashMessage('Invalid email or password.');
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    navigate('/admin/login');
  };

  const handleAddStudent = (payload: StudentDraft) => {
    const normalized = payload.jupebNumber.trim();
    const existing = students.some((entry) => entry.jupebNumber.toLowerCase() === normalized.toLowerCase());
    if (existing) {
      setFlashMessage('That JUPEB number already exists.');
      return;
    }

    setStudents((current) => [
      ...current,
      {
        id: createId(),
        jupebNumber: normalized,
        fullName: payload.fullName.trim(),
        authorized: payload.authorized,
        hasVoted: false
      }
    ]);
    setFlashMessage('Student added successfully.');
  };

  const handleImportStudents = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = file.name.toLowerCase().endsWith('.xlsx') ? undefined : await file.text();
    const data = file.name.toLowerCase().endsWith('.xlsx') ? await file.arrayBuffer() : text;
    const workbook = XLSX.read(data as any, { type: file.name.toLowerCase().endsWith('.xlsx') ? 'array' : 'string' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      setFlashMessage('The file has no sheets.');
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, raw: false, defval: '' });
    if (rows.length < 2) {
      setFlashMessage('Please upload a CSV or XLSX file with a header row.');
      return;
    }

    const normalizeHeader = (header: string) =>
      String(header)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    const headerRow = rows[0].map(normalizeHeader);
    const fullNameIndex = headerRow.findIndex((value) => ['full_name', 'fullname', 'name', 'student_name'].includes(value));
    const jupebIndex = headerRow.findIndex((value) => ['jupeb_number', 'jupebnumber', 'jupeb', 'number'].includes(value));

    if (fullNameIndex === -1 || jupebIndex === -1) {
      setFlashMessage('The file must include columns for full_name and jupeb_number.');
      return;
    }

    const imported: Student[] = [];
    const seen = new Set<string>();

    rows.slice(1).forEach((row) => {
      const fullName = String(row[fullNameIndex] ?? '').trim();
      const jupebNumber = String(row[jupebIndex] ?? '').trim();
      if (!fullName || !jupebNumber) {
        return;
      }
      const normalized = jupebNumber.toLowerCase();
      if (seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      imported.push({
        id: createId(),
        jupebNumber,
        fullName,
        authorized: true,
        hasVoted: false
      });
    });

    if (!imported.length) {
      setFlashMessage('No valid student rows were found.');
      return;
    }

    setStudents(imported);
    setFlashMessage(`Imported ${imported.length} students successfully. The existing student list has been replaced.`);
    event.target.value = '';
  };

  const handleClearStudents = () => {
    setStudents([]);
    setFlashMessage('Student list cleared. Import a CSV to load eligible voters.');
  };

  const handleExportStudents = () => {
    const rows = [
      ['full_name', 'jupeb_number', 'authorized', 'has_voted'],
      ...students.map((student) => [student.fullName, student.jupebNumber, student.authorized ? 'true' : 'false', student.hasVoted ? 'true' : 'false'])
    ];
    downloadCsv('students.csv', rows);
  };

  const handleCreateCategory = (payload: CategoryDraft) => {
    if (!payload.name.trim()) {
      setFlashMessage('Category name is required.');
      return;
    }
    setCategories((current) => [
      ...current,
      {
        id: createId(),
        name: payload.name.trim(),
        description: payload.description.trim(),
        imageUrl: payload.imageUrl.trim(),
        isActive: payload.isActive
      }
    ]);
    setFlashMessage('Category created.');
  };

  const handleToggleCategory = (id: string, next: boolean) => {
    setCategories((current) => current.map((entry) => (entry.id === id ? { ...entry, isActive: next } : entry)));
  };

  const handleDeleteCategory = (id: string) => {
    const hasCandidates = candidates.some((entry) => entry.categoryId === id);
    if (hasCandidates) {
      setFlashMessage('Deactivate the category instead of deleting it while candidates are linked.');
      return;
    }
    setCategories((current) => current.filter((entry) => entry.id !== id));
    setFlashMessage('Category removed.');
  };

  const handleCreateCandidate = (payload: CandidateDraft) => {
    if (!payload.fullName.trim()) {
      setFlashMessage('Candidate name is required.');
      return;
    }
    if (!payload.categoryId) {
      setFlashMessage('Choose a category for the candidate.');
      return;
    }
    setCandidates((current) => [
      ...current,
      {
        id: createId(),
        categoryId: payload.categoryId,
        fullName: payload.fullName.trim(),
        jupebNumber: payload.jupebNumber.trim(),
        photoUrl: payload.photoUrl.trim(),
        description: payload.description.trim(),
        isActive: payload.isActive
      }
    ]);
    setFlashMessage('Candidate added.');
  };

  const handleToggleCandidate = (id: string, next: boolean) => {
    setCandidates((current) => current.map((entry) => (entry.id === id ? { ...entry, isActive: next } : entry)));
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates((current) => current.filter((entry) => entry.id !== id));
    setFlashMessage('Candidate removed.');
  };

  const handleUpdateCandidatePhoto = (candidateId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const photoUrl = reader.result as string;
      setCandidates((current) => current.map((entry) => (entry.id === candidateId ? { ...entry, photoUrl } : entry)));
      setFlashMessage('Candidate photo saved.');
    };
    reader.readAsDataURL(file);
  };

  const handleOpenVoting = () => {
    setElectionStatus('open');
    setFlashMessage('Voting is now open.');
  };

  const handleCloseVoting = () => {
    setElectionStatus('closed');
    setFlashMessage('Voting is now closed.');
  };

  const handleSubmitBallot = (selections: Record<string, string>, studentId: string) => {
    const selectedCategories = categories.filter((category) => category.isActive && candidates.some((candidate) => candidate.categoryId === category.id && candidate.isActive));
    const entries = selectedCategories.map((category) => ({ categoryId: category.id, candidateId: selections[category.id] }));

    if (entries.some((entry) => !entry.candidateId)) {
      setFlashMessage('You must vote for every active category before submission.');
      return;
    }

    setVotes((current) => [
      ...current,
      ...entries.map((entry) => ({
        id: createId(),
        studentId,
        categoryId: entry.categoryId,
        candidateId: entry.candidateId,
        createdAt: new Date().toISOString()
      }))
    ]);

    setStudents((current) => current.map((studentEntry) => (studentEntry.id === studentId ? { ...studentEntry, hasVoted: true } : studentEntry)));
    setStudentSession(null);
    setFlashMessage('Your vote was submitted successfully.');
    navigate('/');
  };

  const stats = useMemo(() => {
    const registered = students.filter((student) => student.authorized).length;
    const voted = students.filter((student) => student.hasVoted).length;
    return {
      registered,
      voted,
      pending: registered - voted,
      activeCandidates: candidates.filter((candidate) => candidate.isActive).length,
      activeCategories: categories.filter((category) => category.isActive).length,
      participation: registered ? ((voted / registered) * 100).toFixed(1) : '0.0'
    };
  }, [students, candidates, categories]);

  const results = useMemo(() => {
    const categoriesWithResults = categories.map((category) => {
      const categoryCandidates = candidates.filter((candidate) => candidate.categoryId === category.id && candidate.isActive);
      const totalVotes = categoryCandidates.reduce((total, candidate) => {
        const count = votes.filter((vote) => vote.candidateId === candidate.id).length;
        return total + count;
      }, 0);

      const rows = categoryCandidates
        .map((candidate) => {
          const count = votes.filter((vote) => vote.candidateId === candidate.id).length;
          return {
            candidate,
            count,
            percentage: formatPercent(count, totalVotes)
          };
        })
        .sort((a, b) => b.count - a.count);

      return {
        category,
        totalVotes,
        rows
      };
    });

    return categoriesWithResults.filter((entry) => entry.category.isActive || entry.rows.length);
  }, [categories, candidates, votes]);

  return (
    <div className="container" style={{ padding: '1rem 0 3rem' }}>
      <Routes>
        <Route path="/" element={<HomePage flashMessage={flashMessage} onLogin={handleStudentLogin} />} />
        <Route path="/vote" element={studentSession ? <VotePage studentSession={studentSession} categories={categories} candidates={candidates} votes={votes} onSubmit={handleSubmitBallot} onLogout={handleStudentLogout} flashMessage={flashMessage} /> : <Navigate to="/" replace />} />
        <Route path="/admin/login" element={adminSession ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage onLogin={handleAdminLogin} flashMessage={flashMessage} />} />
        <Route path="/admin/dashboard" element={adminSession ? <AdminDashboardPage students={students} categories={categories} candidates={candidates} votes={votes} electionStatus={electionStatus} stats={stats} results={results} onAddStudent={handleAddStudent} onImportStudents={handleImportStudents} onExportStudents={handleExportStudents} onClearStudents={handleClearStudents} onCreateCategory={handleCreateCategory} onToggleCategory={handleToggleCategory} onDeleteCategory={handleDeleteCategory} onCreateCandidate={handleCreateCandidate} onToggleCandidate={handleToggleCandidate} onDeleteCandidate={handleDeleteCandidate} onUpdateCandidatePhoto={handleUpdateCandidatePhoto} onOpenVoting={handleOpenVoting} onCloseVoting={handleCloseVoting} onLogout={handleAdminLogout} flashMessage={flashMessage} /> : <Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

type ModalProps = {
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
};

function Modal({ title, children, onClose }: ModalProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title ? <h2 style={{ marginTop: 0 }}>{title}</h2> : <div />}
          {onClose ? <button className="secondary-btn" onClick={onClose}>Close</button> : null}
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}

type NavigationBarProps = {
  title?: string;
};

function NavigationBar({ title }: NavigationBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = window.history.length > 1;

  return (
    <div className="nav-bar">
      <button className="secondary-btn" type="button" onClick={() => navigate(-1)} disabled={!canGoBack}>
        Previous page
      </button>
      {title ? <div className="nav-title">{title}</div> : null}
      <div className="nav-location">{location.pathname}</div>
    </div>
  );
}

type HomePageProps = {
  flashMessage: string | null;
  onLogin: (jupebNumber: string) => void;
};

function HomePage({ flashMessage, onLogin }: HomePageProps) {
  const [jupebNumber, setJupebNumber] = useState('');
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(jupebNumber);
  };

  return (
    <>
      <NavigationBar title="Home" />
      <section className="hero surface" style={{ borderRadius: '1.7rem', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <img src="/image.jpg" alt="" style={{ height: '120px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p className="badge" style={{ fontSize: '0.95rem', fontWeight: 600 }}>LAUTECH JUPEB AWARDS</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', margin: '0.8rem 0 0', lineHeight: 1.2, fontWeight: 800, color: '#f4da8a' }}>Cast your vote with confidence.</h1>
          <p style={{ maxWidth: '600px', color: '#d7d7d7', marginTop: '1.2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>A secure and transparent voting platform where LAUTECH JUPEB students choose their preferred award nominees across multiple categories.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '200px' }}>
          <Link to="/admin/login" className="secondary-btn" style={{ textAlign: 'center', padding: '0.9rem 1.5rem' }}>Admin portal</Link>
          <p style={{ fontSize: '0.85rem', color: '#aaa', textAlign: 'center', margin: 0 }}>For election administrators</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '2.5rem', gap: '1.5rem' }}>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', boxShadow: '0 8px 24px rgba(212, 168, 67, 0.15)' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: 700 }}>Student voting access</h2>
            <p style={{ margin: 0, color: '#aaa', fontSize: '0.95rem' }}>Enter your JUPEB number to cast your votes</p>
          </div>
          <div>
            <label htmlFor="jupeb-number" style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 500, fontSize: '0.95rem' }}>Your JUPEB number</label>
            <input id="jupeb-number" className="input" value={jupebNumber} onChange={(event) => setJupebNumber(event.target.value)} placeholder="e.g. 260700002" style={{ fontSize: '1.05rem' }} />
          </div>
          <button className="gold-btn" type="submit" style={{ fontSize: '1.05rem', padding: '1rem 1.5rem', fontWeight: 600 }}>Continue to voting</button>
          {flashMessage ? <p className="gold" style={{ marginBottom: 0, fontSize: '0.95rem' }}>{flashMessage}</p> : null}
        </form>

        <div className="card" style={{ boxShadow: '0 8px 24px rgba(212, 168, 67, 0.1)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.3rem', fontWeight: 700 }}>How it works</h3>
          <ul style={{ margin: '1rem 0 0', paddingLeft: '1.3rem', color: '#ddd', lineHeight: 1.8 }}>
            <li style={{ marginBottom: '0.7rem' }}>Authenticate with your JUPEB number</li>
            <li style={{ marginBottom: '0.7rem' }}>Vote in each active award category</li>
            <li style={{ marginBottom: '0.7rem' }}>Review selections before submission</li>
            <li>One vote per student, tamper-proof</li>
          </ul>
        </div>
      </div>
    </section>
  </>
  );
}

type VotePageProps = {
  studentSession: StudentSession;
  categories: Category[];
  candidates: Candidate[];
  votes: VoteRecord[];
  onSubmit: (selections: Record<string, string>, studentId: string) => void;
  onLogout: () => void;
  flashMessage: string | null;
};

function VotePage({ studentSession, categories, candidates, votes, onSubmit, onLogout, flashMessage }: VotePageProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);

  const activeCategories = useMemo(() => categories.filter((category) => category.isActive && candidates.some((candidate) => candidate.categoryId === category.id && candidate.isActive)), [categories, candidates]);

  const voteCounts = useMemo(() => {
    const m = new Map<string, number>();
    votes.forEach((v) => m.set(v.candidateId, (m.get(v.candidateId) ?? 0) + 1));
    return m;
  }, [votes]);

  const completed = activeCategories.every((category) => selections[category.id]);

  const handleSelect = (categoryId: string, candidateId: string) => {
    setSelections((current) => ({ ...current, [categoryId]: candidateId }));
  };

  const handleSubmit = () => {
    if (!completed) {
      setShowReview(false);
      return;
    }
    onSubmit(selections, studentSession.studentId);
  };

  return (
    <>
      <NavigationBar title="Vote" />
      <section className="surface" style={{ borderRadius: '1.7rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div>
          <p className="badge">Voting portal</p>
          <h1 style={{ margin: '0.35rem 0 0.3rem' }}>Hello, {studentSession.fullName}</h1>
          <p style={{ margin: 0, color: '#ddd' }}>Choose one candidate per active category.</p>
        </div>
        <button className="secondary-btn" onClick={onLogout}>Log out</button>
      </div>

      <div style={{ marginTop: '1.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        <button className="gold-btn" disabled={!completed} onClick={() => setShowReview(true)}>
          Review & submit
        </button>
        {flashMessage ? <p className="gold">{flashMessage}</p> : null}
      </div>

      <div className="grid-2" style={{ marginTop: '1.4rem' }}>
        {activeCategories.map((category) => {
          const categoryCandidates = candidates.filter((candidate) => candidate.categoryId === category.id && candidate.isActive);
          return (
            <div key={category.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{category.name}</h3>
                <span className="badge">{categoryCandidates.length} candidates</span>
              </div>
              <p style={{ color: '#d0d0d0', marginBottom: '1rem' }}>{category.description}</p>
              <div className="grid-2">
                {categoryCandidates.map((candidate) => (
                  <button key={candidate.id} type="button" className={`candidate-card ${selections[category.id] === candidate.id ? 'selected' : ''}`} onClick={() => handleSelect(category.id, candidate.id)}>
                    <div className="thumb">
                      {candidate.photoUrl ? <img src={candidate.photoUrl} alt={candidate.fullName} /> : <span style={{ color: '#f4da8a' }}>No photo</span>}
                    </div>
                    <strong>{candidate.fullName}</strong>
                    <span style={{ textAlign: 'center', color: '#d0d0d0' }}>{candidate.description}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="badge">Vote</span>
                      <span className="badge" style={{ background: '#444' }}>{String(voteCounts.get(candidate.id) ?? 0)} votes</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showReview ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 style={{ marginTop: 0 }}>Review your selections</h2>
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              {activeCategories.map((category) => {
                const candidate = candidates.find((entry) => entry.id === selections[category.id]);
                return (
                  <div key={category.id} className="card" style={{ padding: '0.8rem 1rem' }}>
                    <strong>{category.name}</strong>
                    <div>{candidate ? candidate.fullName : 'No selection'}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="secondary-btn" onClick={() => setShowReview(false)}>Back</button>
              <button className="gold-btn" onClick={handleSubmit}>Submit ballot</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  </>
  );
}

type AdminLoginPageProps = {
  onLogin: (email: string, password: string) => void;
  flashMessage: string | null;
};

function AdminLoginPage({ onLogin, flashMessage }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(email, password);
  };

  return (
    <>
      <NavigationBar title="Admin login" />
      <section className="hero surface" style={{ borderRadius: '1.7rem', padding: '2rem' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <p className="badge">Administrator access</p>
        <h1 style={{ margin: '0.35rem 0 0.5rem' }}>Secure admin portal</h1>
        <p style={{ color: '#d0d0d0' }}>Use the seeded admin account to manage categories, candidates, students and results.</p>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.2rem' }}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@lautech.edu.ng" />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin1234" />
          <button className="gold-btn" type="submit">Log in</button>
          {flashMessage ? <p className="gold">{flashMessage}</p> : null}
        </form>
      </div>
    </section>
  </>
  );
}

type AdminDashboardPageProps = {
  students: Student[];
  categories: Category[];
  candidates: Candidate[];
  votes: VoteRecord[];
  electionStatus: ElectionStatus;
  stats: {
    registered: number;
    voted: number;
    pending: number;
    activeCandidates: number;
    activeCategories: number;
    participation: string;
  };
  results: Array<{
    category: Category;
    totalVotes: number;
    rows: Array<{ candidate: Candidate; count: number; percentage: string }>;
  }>;
  onAddStudent: (payload: StudentDraft) => void;
  onImportStudents: (event: ChangeEvent<HTMLInputElement>) => void;
  onExportStudents: () => void;
  onClearStudents: () => void;
  onCreateCategory: (payload: CategoryDraft) => void;
  onToggleCategory: (id: string, next: boolean) => void;
  onDeleteCategory: (id: string) => void;
  onCreateCandidate: (payload: CandidateDraft) => void;
  onToggleCandidate: (id: string, next: boolean) => void;
  onDeleteCandidate: (id: string) => void;
  onUpdateCandidatePhoto: (candidateId: string, file: File) => void;
  onOpenVoting: () => void;
  onCloseVoting: () => void;
  onLogout: () => void;
  flashMessage: string | null;
};

function AdminDashboardPage({
  students,
  categories,
  candidates,
  votes,
  electionStatus,
  stats,
  results,
  onAddStudent,
  onImportStudents,
  onExportStudents,
  onClearStudents,
  onCreateCategory,
  onToggleCategory,
  onDeleteCategory,
  onCreateCandidate,
  onToggleCandidate,
  onDeleteCandidate,
  onUpdateCandidatePhoto,
  onOpenVoting,
  onCloseVoting,
  onLogout,
  flashMessage
}: AdminDashboardPageProps) {
  const voteCounts = useMemo(() => {
    const map: Record<string, number> = {};
    votes.forEach((v) => {
      map[v.candidateId] = (map[v.candidateId] ?? 0) + 1;
    });
    return map;
  }, [votes]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentForm, setStudentForm] = useState<StudentDraft>({ fullName: '', jupebNumber: '', authorized: true });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryDraft>({ name: '', description: '', imageUrl: '', isActive: true });
  const [candidateForm, setCandidateForm] = useState<CandidateDraft>({ categoryId: categories[0]?.id ?? '', fullName: '', jupebNumber: '', photoUrl: '', description: '', isActive: true });

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) {
      return students;
    }
    return students.filter((student) => student.fullName.toLowerCase().includes(query) || student.jupebNumber.toLowerCase().includes(query));
  }, [students, studentSearch]);

  const handleStudentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddStudent(studentForm);
    setStudentForm({ fullName: '', jupebNumber: '', authorized: true });
  };

  const handleCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreateCategory(categoryForm);
    setCategoryForm({ name: '', description: '', imageUrl: '', isActive: true });
  };

  const handleCandidateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreateCandidate(candidateForm);
    setCandidateForm({ categoryId: categories[0]?.id ?? '', fullName: '', jupebNumber: '', photoUrl: '', description: '', isActive: true });
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const exportResults = () => {
    const rows = [
      ['Category', 'Candidate', 'JUPEB Number', 'Votes', 'Percentage']
    ];
    results.forEach((entry) => {
      entry.rows.forEach((row) => {
        rows.push([entry.category.name, row.candidate.fullName, row.candidate.jupebNumber, String(row.count), row.percentage]);
      });
    });
    downloadCsv('results.csv', rows);
  };

  return (
    <>
      <NavigationBar title="Admin dashboard" />
      <section className="surface" style={{ borderRadius: '1.7rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="badge">Admin dashboard</p>
          <h1 style={{ margin: '0.35rem 0 0.25rem' }}>Election control centre</h1>
          <p style={{ margin: 0, color: '#ddd' }}>Monitor participation and keep the awards running smoothly.</p>
        </div>
        <button className="secondary-btn" onClick={onLogout}>Sign out</button>
      </div>

      <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        <button className="gold-btn" onClick={electionStatus === 'open' ? onCloseVoting : onOpenVoting}>{electionStatus === 'open' ? 'Close voting' : 'Open voting'}</button>
        <button className="secondary-btn" onClick={onExportStudents}>Export students</button>
        <button className="secondary-btn" onClick={exportResults}>Export results</button>
      </div>

      {flashMessage ? <p className="gold" style={{ marginTop: '1rem' }}>{flashMessage}</p> : null}

      <div className="grid-3" style={{ marginTop: '1.3rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Registered students</h3>
          <p style={{ fontSize: '1.8rem', margin: 0 }}>{stats.registered}</p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Votes cast</h3>
          <p style={{ fontSize: '1.8rem', margin: 0 }}>{stats.voted}</p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Participation</h3>
          <p style={{ fontSize: '1.8rem', margin: 0 }}>{stats.participation}%</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1.3rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ marginTop: 0 }}>Student management</h3>
              <p style={{ margin: '0.4rem 0 0', color: '#d0d0d0' }}>Search by student name or JUPEB number to confirm voting status quickly.</p>
            </div>
            <button type="button" className="secondary-btn" onClick={() => setStudentSearch('')}>Clear search</button>
          </div>
          <input className="input" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Type name or JUPEB number" style={{ marginTop: '0.8rem' }} />
          <p style={{ margin: '0.45rem 0 0', color: '#d0d0d0' }}>{filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'} found.</p>
          <form onSubmit={handleStudentSubmit} style={{ display: 'grid', gap: '0.7rem', marginTop: '0.8rem' }}>
            <input className="input" value={studentForm.fullName} onChange={(event) => setStudentForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" />
            <input className="input" value={studentForm.jupebNumber} onChange={(event) => setStudentForm((current) => ({ ...current, jupebNumber: event.target.value }))} placeholder="JUPEB number" />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={studentForm.authorized} onChange={(event) => setStudentForm((current) => ({ ...current, authorized: event.target.checked }))} />
              Authorized to vote
            </label>
            <button className="gold-btn" type="submit">Add student</button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>Import students CSV / XLSX</span>
              <input type="file" accept=".csv,.xlsx" onChange={onImportStudents} />
            </label>
            <button type="button" className="secondary-btn" onClick={() => setShowClearConfirm(true)}>Clear student list</button>
          </div>
          {showClearConfirm ? (
            <Modal title="Confirm clear student list" onClose={() => setShowClearConfirm(false)}>
              <p>Are you sure you want to clear the student list? This action cannot be undone.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="secondary-btn" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                <button className="gold-btn" onClick={() => { onClearStudents(); setShowClearConfirm(false); }}>Confirm clear</button>
              </div>
            </Modal>
          ) : null}
          <div className="table-wrap" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>JUPEB</th>
                  <th>Authorized</th>
                  <th>Voted</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#ccc', padding: '1rem' }}>
                      No matching student found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{`${student.jupebNumber} - ${student.fullName}`}</td>
                      <td>{student.jupebNumber}</td>
                      <td>{student.authorized ? 'Yes' : 'No'}</td>
                      <td>{student.hasVoted ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Category management</h3>
          <form onSubmit={handleCategorySubmit} style={{ display: 'grid', gap: '0.7rem' }}>
            <input className="input" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" />
            <textarea className="input" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={3} />
            <input className="input" value={categoryForm.imageUrl} onChange={(event) => setCategoryForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Image URL (optional)" />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm((current) => ({ ...current, isActive: event.target.checked }))} />
              Active
            </label>
            <button className="gold-btn" type="submit">Create category</button>
          </form>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.7rem' }}>
            {categories.map((category) => (
              <div key={category.id} className="card" style={{ padding: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{category.name}</strong>
                  <span className="badge">{category.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ color: '#d0d0d0', marginBottom: '0.7rem' }}>{category.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="secondary-btn" onClick={() => onToggleCategory(category.id, !category.isActive)}>{category.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button className="secondary-btn" onClick={() => onDeleteCategory(category.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.3rem' }}>
        <h3 style={{ marginTop: 0 }}>Candidate management</h3>
        <form onSubmit={handleCandidateSubmit} style={{ display: 'grid', gap: '0.7rem' }}>
          <select className="input" value={candidateForm.categoryId} onChange={(event) => setCandidateForm((current) => ({ ...current, categoryId: event.target.value }))}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input className="input" value={candidateForm.fullName} onChange={(event) => setCandidateForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Candidate full name" />
          <input className="input" value={candidateForm.jupebNumber} onChange={(event) => setCandidateForm((current) => ({ ...current, jupebNumber: event.target.value }))} placeholder="JUPEB number (optional)" />
          <textarea className="input" value={candidateForm.description} onChange={(event) => setCandidateForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" rows={3} />
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span>Candidate photo (optional)</span>
            <input type="file" accept="image/*" onChange={(event) => handlePhotoUpload(event, (value) => setCandidateForm((current) => ({ ...current, photoUrl: value })))} />
          </label>
          {candidateForm.photoUrl ? (
            <div style={{ maxWidth: '240px', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.4rem', color: '#d0d0d0' }}>Preview</p>
              <div className="thumb" style={{ width: '100%', height: 'auto' }}>
                <img src={candidateForm.photoUrl} alt="Candidate preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          ) : null}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={candidateForm.isActive} onChange={(event) => setCandidateForm((current) => ({ ...current, isActive: event.target.checked }))} />
            Active
          </label>
          <button className="gold-btn" type="submit">Add candidate</button>
        </form>
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.8rem' }}>
          {candidates.map((candidate) => (
            <div key={candidate.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className="thumb" style={{ width: '64px', borderRadius: '0.8rem' }}>
                  {candidate.photoUrl ? <img src={candidate.photoUrl} alt={candidate.fullName} /> : <span>No photo</span>}
                </div>
                <div>
                  <strong>{candidate.fullName}</strong>
                  <div style={{ color: '#ddd' }}>{categories.find((category) => category.id === candidate.categoryId)?.name}</div>
                  <div style={{ color: '#d0d0d0' }}>{String(voteCounts[candidate.id] ?? 0)} vote{(voteCounts[candidate.id] ?? 0) === 1 ? '' : 's'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="secondary-btn" onClick={() => onToggleCandidate(candidate.id, !candidate.isActive)}>{candidate.isActive ? 'Deactivate' : 'Activate'}</button>
                <button className="secondary-btn" onClick={() => onDeleteCandidate(candidate.id)}>Delete</button>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <span className="secondary-btn" style={{ padding: '0.55rem 0.9rem' }}>Upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        onUpdateCandidatePhoto(candidate.id, file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.3rem' }}>
        <h3 style={{ marginTop: 0 }}>Results dashboard</h3>
        {results.map((entry) => (
          <div key={entry.category.id} style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0 }}>{entry.category.name}</h4>
              <span className="badge">{entry.totalVotes} total votes</span>
            </div>
            <div className="table-wrap" style={{ marginTop: '0.7rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Votes</th>
                    <th>Percentage</th>
                    <th>Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.rows.map((row, index) => (
                    <tr key={row.candidate.id}>
                      <td>{row.candidate.fullName}</td>
                      <td>{row.count}</td>
                      <td>{row.percentage}</td>
                      <td>{index + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  </>
  );
}

export default App;
