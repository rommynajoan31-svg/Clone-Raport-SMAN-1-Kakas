/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'kepala_sekolah' | 'wakakur' | 'guru' | 'walikelas';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  nip?: string;
  email?: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  isDemo?: boolean;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  alamat: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  logoUrl: string;
  logoProvinsiUrl?: string;
  tempatPenerbitan: string;
  tanggalRapor: string;
  tahunPelajaranAktif: string;
  semesterAktif: '1' | '2';
}

export interface AssessmentMethod {
  formula: 'AVERAGE_TP' | 'WEIGHTED_SUMMATIVE_SAS';
  weightSummativeTP: number; // default 60%
  weightSAS: number;         // default 40%
  kktpMinimum: number;       // default 75
  isLocked: boolean;
  notes: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  admissionYear: string;
  status: 'AKTIF' | 'MUTASI' | 'LULUS';
  classId: string;
  phase: 'E' | 'F';
  grade: 10 | 11 | 12;
  electiveSubjectIds?: string[]; // Mata pelajaran pilihan untuk Fase F
}

export interface Teacher {
  id: string;
  nip: string;
  fullName: string;
  degree: string;
  assignedSubjects: string[];
  assignedClasses: string[];
  isHomeroom: boolean;
  homeroomClassId?: string;
  role: UserRole;
  status: 'AKTIF' | 'NONAKTIF';
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "X-A", "X-B", "XI-1 (Fase F)", "XII-1 (Fase F)"
  grade: 10 | 11 | 12;
  phase: 'E' | 'F';
  academicYear: string;
  homeroomTeacherId: string;
}

export interface LearningObjective {
  id: string;
  code: string; // e.g., "TP.1"
  description: string;
  scopeOfMaterial: string;
  minimumScore?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  group: 'A_UMUM' | 'B_KEJURUAN_PEMINATAN' | 'PILIHAN' | 'MULOK';
  phase: 'E' | 'F';
  grades: number[]; // [10], [11, 12]
  teacherId: string;
  status: 'AKTIF' | 'NONAKTIF';
  learningObjectives: LearningObjective[];
}

export type ScoreStatus = 
  | 'BELUM_DIMULAI'
  | 'DRAFT'
  | 'PERLU_PERBAIKAN'
  | 'MENUNGGU_VERIFIKASI'
  | 'DISETUJUI'
  | 'FINAL';

export interface StudentScore {
  id: string;
  studentId: string;
  subjectId: string;
  academicYear: string;
  semester: '1' | '2';
  tpScores: { [tpId: string]: number };
  sasScore?: number;
  finalScore: number;
  masteredStrengths: string;
  needsImprovement: string;
  competencyDescription: string;
  aiGeneratedDesc?: string;
  aiSuggestedImprovements?: string;
  aiActionPlan?: string;
  teacherNotes?: string;
  status: ScoreStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface AttendanceRecord {
  studentId: string;
  academicYear: string;
  semester: '1' | '2';
  sakit: number;
  izin: number;
  alpa: number;
  verified: boolean;
}

export interface ExtracurricularRecord {
  id: string;
  studentId: string;
  activityName: string;
  score: 'SANGAT_BAIK' | 'BAIK' | 'CUKUP';
  description: string;
}

export interface CocurricularProject {
  id: string;
  classId: string;
  title: string;
  theme: string; // e.g., "Kearifan Lokal Minahasa", "Suara Demokrasi", "Gaya Hidup Berkelanjutan"
  dimensions: string[]; // ["Beriman, Bertakwa...", "Gotong Royong", "Mandiri", "Bernalar Kritis"]
  description: string;
  studentNotes?: { [studentId: string]: string };
}

export interface HomeroomNote {
  studentId: string;
  academicYear: string;
  semester: '1' | '2';
  note: string;
  characterAppreciation?: string;
  followUpAdvice?: string;
  isFinalized: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
}
