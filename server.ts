import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent as required by AI Studio guidelines
const rawApiKey = process.env.GEMINI_API_KEY || '';
const apiKey = rawApiKey !== 'MY_GEMINI_API_KEY' && rawApiKey.trim().length > 15 ? rawApiKey.trim() : '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Timeout wrapper to ensure instant responsiveness under all network conditions
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 7000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// User accounts database with credentials and roles (SMA Negeri 1 Kakas)
interface UserRecord {
  id: string;
  username: string;
  passwordHash: string; // Plaintext for demo simulation
  fullName: string;
  role: 'admin' | 'kepala_sekolah' | 'wakakur' | 'guru' | 'walikelas';
  nip?: string;
  email: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  homeroomClassId?: string;
}

const USERS: UserRecord[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    passwordHash: 'admin123',
    fullName: 'Staf Operator Rapor (Admin)',
    role: 'admin',
    nip: '19850615 201001 1 012',
    email: 'operator@sman1kakas.sch.id',
  },
  {
    id: 'usr_kepsek',
    username: 'kepsek',
    passwordHash: 'kepsek123',
    fullName: 'Drs. Ronald Rondonuwu, M.Pd.',
    role: 'kepala_sekolah',
    nip: '19710412 199802 1 003',
    email: 'kepsek@sman1kakas.sch.id',
  },
  {
    id: 'usr_wakakur',
    username: 'wakakur',
    passwordHash: 'kurikulum123',
    fullName: 'Dra. Hetty Lumowa, M.Si.',
    role: 'wakakur',
    nip: '19750821 200212 2 004',
    email: 'kurikulum@sman1kakas.sch.id',
  },
  {
    id: 'usr_guru_meyke',
    username: 'guru_matematika',
    passwordHash: 'guru123',
    fullName: 'Meyke Supit, S.Pd.',
    role: 'guru',
    nip: '19820310 200604 2 015',
    email: 'meyke.supit@guru.sma.belajar.id',
    assignedClasses: ['cls_xa', 'cls_xb', 'cls_xi_1'],
    assignedSubjects: ['sbj_mat_e', 'sbj_mat_f'],
  },
  {
    id: 'usr_walikelas_jerry',
    username: 'wali_xa',
    passwordHash: 'wali123',
    fullName: 'Drs. Jerry Senduk, M.Pd.',
    role: 'walikelas',
    nip: '19740518 199903 1 007',
    email: 'jerry.senduk@guru.sma.belajar.id',
    assignedClasses: ['cls_xa'],
    assignedSubjects: ['sbj_bio_e'],
    homeroomClassId: 'cls_xa',
  },
];

// In-memory active tokens map: token -> UserRecord
const ACTIVE_SESSIONS = new Map<string, { user: UserRecord; expiresAt: number }>();

function generateToken(user: UserRecord): string {
  const token = `tk_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  ACTIVE_SESSIONS.set(token, {
    user,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return token;
}

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Autentikasi gagal: Token sesi tidak ditemukan. Silakan login terlebih dahulu.',
    });
  }

  const token = authHeader.split(' ')[1];
  const session = ACTIVE_SESSIONS.get(token);

  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({
      error: 'Sesi telah kedaluwarsa atau tidak valid. Harap login kembali.',
    });
  }

  req.user = session.user;
  next();
}

function requireRole(allowedRoles: Array<UserRecord['role']>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Pengguna belum terautentikasi.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Akses Ditolak: Peran "${req.user.role}" tidak memiliki izin untuk operasi ini. Hak akses yang diwajibkan: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
}

// --- Auth Routes ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username wajib diisi.' });
  }

  const user = USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Nama pengguna tidak terdaftar dalam sistem.' });
  }

  // In demo mode, if password provided check matches, or allow demo pass
  if (password && user.passwordHash !== password && password !== 'demo') {
    return res.status(401).json({ error: 'Kata sandi tidak sesuai.' });
  }

  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user;

  res.json({
    success: true,
    token,
    user: safeUser,
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Sesi tidak ditemukan.' });
  const { passwordHash, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  const safeUsers = USERS.map(({ passwordHash, ...u }) => u);
  res.json({ success: true, users: safeUsers });
});

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'RAPOR KAKAS AI',
    school: 'SMA Negeri 1 Kakas',
    npsn: '40100895',
    hasGeminiKey: Boolean(apiKey),
    activeSessionsCount: ACTIVE_SESSIONS.size,
  });
});

// Backend Assessment Calculation & Validation
app.post('/api/scores/validate', (req: Request, res: Response) => {
  const { formula, weightSummativeTP, weightSAS, tpScores, sasScore, kktpMinimum } = req.body;

  const validScores: number[] = [];
  const errors: string[] = [];

  if (tpScores && typeof tpScores === 'object') {
    Object.entries(tpScores).forEach(([key, val]) => {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push(`Skor ${key} bernilai ${val}, di luar rentang valid 0 - 100.`);
      } else {
        validScores.push(num);
      }
    });
  }

  if (sasScore !== undefined && sasScore !== null) {
    const num = Number(sasScore);
    if (isNaN(num) || num < 0 || num > 100) {
      errors.push(`Skor SAS bernilai ${sasScore}, di luar rentang valid 0 - 100.`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ valid: false, errors });
  }

  let finalScore = 0;
  if (validScores.length > 0) {
    const avgTP = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    if (formula === 'WEIGHTED_SUMMATIVE_SAS' && sasScore !== undefined) {
      const wTP = (weightSummativeTP || 60) / 100;
      const wSAS = (weightSAS || 40) / 100;
      finalScore = Math.round(avgTP * wTP + Number(sasScore) * wSAS);
    } else {
      finalScore = Math.round(avgTP);
    }
  } else if (sasScore !== undefined) {
    finalScore = Math.round(Number(sasScore));
  }

  const kktp = kktpMinimum || 75;
  const isPassing = finalScore >= kktp;

  res.json({
    valid: true,
    finalScore,
    isPassing,
    kktp,
    details: {
      tpCount: validScores.length,
      avgTP: validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 0,
      sasScore: sasScore ?? null,
    },
  });
});

// Protected: Finalize / Approve Scores (Only Kepala Sekolah, Wakakur, or Admin)
app.post(
  '/api/scores/authorize-status',
  requireAuth,
  requireRole(['kepala_sekolah', 'wakakur', 'admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { targetStatus, scoreIds } = req.body;

    if (!['DISETUJUI', 'FINAL', 'PERLU_PERBAIKAN'].includes(targetStatus)) {
      return res.status(400).json({ error: 'Status target otorisasi tidak valid.' });
    }

    res.json({
      success: true,
      authorizedBy: req.user?.fullName,
      role: req.user?.role,
      newStatus: targetStatus,
      affectedScoresCount: Array.isArray(scoreIds) ? scoreIds.length : 1,
      timestamp: new Date().toISOString(),
    });
  }
);

// Bulk Validate Students for Excel/CSV Import
app.post('/api/students/bulk-validate', (req: Request, res: Response) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Data murid harus berupa array.' });
  }

  const validated: any[] = [];
  const existingNis = new Set<string>();

  students.forEach((row, idx) => {
    const nis = String(row.nis || '').trim();
    const fullName = String(row.fullName || row['Nama Lengkap'] || '').trim();
    const errors: string[] = [];

    if (!nis) errors.push('NIS tidak boleh kosong');
    if (existingNis.has(nis)) errors.push(`NIS ${nis} duplikat di dalam berkas impor`);
    existingNis.add(nis);

    if (!fullName) errors.push('Nama murid tidak boleh kosong');

    const gender = String(row.gender || row['Jenis Kelamin'] || 'L').toUpperCase();
    if (!['L', 'P'].includes(gender)) errors.push('Jenis Kelamin harus L atau P');

    validated.push({
      index: idx + 1,
      nis,
      fullName,
      gender: gender === 'P' ? 'P' : 'L',
      isValid: errors.length === 0,
      errors,
    });
  });

  res.json({
    total: students.length,
    validCount: validated.filter((v) => v.isValid).length,
    invalidCount: validated.filter((v) => !v.isValid).length,
    results: validated,
  });
});

// API: Generate Competency Achievement Description (Deskripsi Capaian Kompetensi PPA 2025)
app.post('/api/gemini/generate-description', async (req: Request, res: Response) => {
  try {
    const {
      studentName,
      subjectName,
      phase,
      grade,
      semester,
      finalScore,
      tpEvaluations,
      masteredStrengths,
      needsImprovement,
      teacherNotes,
    } = req.body;

    if (!subjectName) {
      return res.status(400).json({ error: 'Mata pelajaran wajib ditentukan.' });
    }

    if (aiClient) {
      const prompt = `
Anda bertindak sebagai asisten ahli asesmen pendidikan Kurikulum Merdeka SMA di Indonesia berdasarkan Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi Tahun 2025 untuk SMA Negeri 1 Kakas.

Tugas Anda:
Susun draf deskripsi capaian kompetensi untuk rapor murid pada mata pelajaran ${subjectName} (${phase}, Kelas ${grade}, Semester ${semester}).

Data murid & asesmen:
- Nama Siswa: ${studentName || 'Murid'}
- Nilai Akhir Asesmen: ${finalScore ?? 'Belum ada'}
- Bukti Ketercapaian Tujuan Pembelajaran (TP):
${JSON.stringify(tpEvaluations || [], null, 2)}
- Kompetensi yang dikuasai dengan sangat baik menurut guru: ${masteredStrengths || 'Sesuai bukti TP yang tinggi'}
- Aspek/TP yang masih perlu bimbingan/penguatan: ${needsImprovement || 'Sesuai bukti TP yang belum tuntas'}
- Catatan khusus guru: ${teacherNotes || 'Tidak ada catatan tambahan'}

Aturan Ketat PPA 2025:
1. Deskripsi harus objektif berdasarkan data bukti TP yang diberikan.
2. Jelaskan capaian kompetensi yang telah ditunjukkan dengan optimal (misal "Menunjukkan penguasaan yang sangat baik dalam hal...").
3. Jika terdapat bukti TP yang belum optimal atau butuh penguatan, cantumkan secara konstruktif ("namun perlu bimbingan/penguatan lebih lanjut dalam hal...").
4. Jangan menghakimi kepribadian atau membuat generalisasi negatif.
5. Gunakan bahasa Indonesia baku, santun, positif, dan mudah dipahami orang tua murid.
6. Berikan versi ringkas yang pas untuk 2-3 kalimat dalam kolom rapor.

Kembalikan jawaban HANYA dalam format JSON valid tanpa tag markdown lain, dengan skema:
{
  "deskripsi_tercapai": "string penjelasan kompetensi yang telah dicapai dengan optimal",
  "deskripsi_perlu_peningkatan": "string kompetensi yang perlu ditingkatkan (kosongkan jika semua tuntas)",
  "ringkasan_rapor": "string 2-3 kalimat gabungan yang siap dicetak di buku rapor murid",
  "saran_tindak_lanjut": "string rekomendasi konkret pendampingan guru/orang tua",
  "catatan_validasi": "string konfirmasi keselarasan bukti atau rekomendasi pelengkap bagi guru"
}
`;

      try {
        const response = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
          6000
        );

        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          data: parsed,
        });
      } catch (geminiErr) {
        console.warn('Gemini call timed out or failed, falling back to rule engine:', geminiErr);
      }
    }

    // Heuristic deterministic fallback when Gemini API key is absent
    const strengths = masteredStrengths || 'pemahaman konsep materi pokok secara umum';
    const improvements = needsImprovement ? `serta membutuhkan pendampingan berkelanjutan dalam ${needsImprovement}` : 'dengan konsistensi belajar yang sangat baik';
    const fallbackDesc = `Menunjukkan pemahaman yang sangat baik dalam ${strengths}, ${improvements}.`;

    return res.json({
      success: true,
      source: 'rule-based-engine',
      data: {
        deskripsi_tercapai: `Menunjukkan penguasaan optimal dalam kompetensi ${strengths}.`,
        deskripsi_perlu_peningkatan: needsImprovement ? `Perlu penguatan dalam aspek ${needsImprovement}.` : '',
        ringkasan_rapor: fallbackDesc,
        saran_tindak_lanjut: 'Diberikan latihan kontekstual mandiri dan pengayaan materi berkelanjutan.',
        catatan_validasi: 'Dihasilkan oleh mesin aturan otomatis asesmen PPA 2025.',
      },
    });
  } catch (error: any) {
    console.error('Error generating description:', error);
    return res.status(500).json({
      error: 'Gagal menyusun deskripsi kompetensi.',
      details: error?.message || 'Unknown error',
    });
  }
});

// API: Generate Wali Kelas Note (Catatan Wali Kelas)
app.post('/api/gemini/generate-wali-note', async (req: Request, res: Response) => {
  try {
    const { studentName, attendance, averageScore, extracurriculars, characterObservations } = req.body;

    if (aiClient) {
      const prompt = `
Sebagai Wali Kelas di SMA Negeri 1 Kakas (Kurikulum Merdeka PPA 2025), rumuskan sebuah "Catatan Wali Kelas" untuk murid ${studentName || 'ini'}.
Data murid:
- Rata-rata nilai rapor: ${averageScore || 'Baik'}
- Ketidakhadiran: Sakit: ${attendance?.sakit || 0}, Izin: ${attendance?.izin || 0}, Tanpa Keterangan: ${attendance?.alpa || 0}
- Ekstrakurikuler: ${extracurriculars || 'Aktif kegiatan sekolah'}
- Catatan pengamatan karakter: ${characterObservations || 'Disiplin dan bertanggung jawab'}

Buat 1 paragraf (3-4 kalimat) yang berisi apresiasi perkembangan belajar, motivasi peningkatan kompetensi dan kehadiran, serta doa/harapan untuk semester depan. Bahasa santun, membina, dan hangat.
Kembalikan jawaban HANYA JSON:
{
  "catatan_wali": "string catatan wali kelas yang hangat dan memotivasi"
}
`;
      try {
        const response = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.5,
            },
          }),
          6000
        );
        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
      } catch (geminiErr) {
        console.warn('Gemini call for wali note timed out or failed, falling back:', geminiErr);
      }
    }

    const note = `Pertahankan motivasi belajar dan semangat berprestasi yang telah ditunjukkan dengan baik selama semester ini. Terus kembangkan potensi diri, kedisiplinan, dan aktif dalam kegiatan positif sekolah untuk meraih cita-cita yang gemilang.`;
    return res.json({
      success: true,
      source: 'rule-based-engine',
      data: { catatan_wali: note },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal membuat catatan wali kelas', details: err?.message });
  }
});

// Setup dev server with Vite middleware or serve static in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`RAPOR KAKAS AI Server running on port ${PORT}`);
  });
}

startServer();
