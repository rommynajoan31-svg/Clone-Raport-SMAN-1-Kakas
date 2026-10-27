/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import {
  SchoolProfile,
  AssessmentMethod,
  UserAccount,
  Teacher,
  ClassRoom,
  Subject,
  Student,
  StudentScore,
  AttendanceRecord,
  ExtracurricularRecord,
  CocurricularProject,
  HomeroomNote,
  AuditLogEntry,
  ScoreStatus,
} from '../types';
import {
  initialSchoolProfile,
  initialAssessmentMethod,
  initialAccounts,
  initialTeachers,
  initialClasses,
  initialSubjects,
  initialStudents,
  initialScores,
  initialAttendance,
  initialExtracurriculars,
  initialProjects,
  initialHomeroomNotes,
  initialAuditLogs,
} from '../data/initialData';

interface AppContextType {
  schoolProfile: SchoolProfile;
  assessmentMethod: AssessmentMethod;
  currentUser: UserAccount;
  accounts: UserAccount[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentScore[];
  attendance: AttendanceRecord[];
  extracurriculars: ExtracurricularRecord[];
  projects: CocurricularProject[];
  homeroomNotes: HomeroomNote[];
  auditLogs: AuditLogEntry[];

  // User & Profile
  setCurrentUser: (user: UserAccount) => void;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  updateAssessmentMethod: (method: Partial<AssessmentMethod>) => void;

  // Master Data
  addStudent: (data: Omit<Student, 'id'>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addTeacher: (data: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  addClass: (data: Omit<ClassRoom, 'id'>) => ClassRoom;
  updateClass: (id: string, data: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  addSubject: (data: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Scores & Assessment
  calculateFinalScore: (tpScores: Record<string, number>, sasScore?: number) => number;
  saveStudentScore: (scoreData: Partial<StudentScore> & { studentId: string; subjectId: string }) => StudentScore;
  batchSaveScores: (newScores: StudentScore[]) => void;
  updateScoreStatus: (scoreId: string, status: ScoreStatus) => void;

  // Attendance & Extracurriculars
  updateAttendance: (record: AttendanceRecord) => void;
  addExtracurricular: (data: Omit<ExtracurricularRecord, 'id'>) => void;
  deleteExtracurricular: (id: string) => void;
  saveHomeroomNote: (note: HomeroomNote) => void;
  saveProject: (project: CocurricularProject) => void;

  // AI & Automation
  requestAIDescription: (params: {
    studentName: string;
    subjectName: string;
    phase: string;
    grade: number;
    semester: string;
    finalScore: number;
    tpEvaluations: Array<{ tpCode: string; tpDesc: string; score: number }>;
    masteredStrengths: string;
    needsImprovement: string;
    teacherNotes?: string;
  }) => Promise<{
    deskripsi_tercapai: string;
    deskripsi_perlu_peningkatan: string;
    ringkasan_rapor: string;
    saran_tindak_lanjut: string;
    catatan_validasi?: string;
    source: string;
  }>;

  requestAIWaliNote: (params: {
    studentName: string;
    averageScore: number;
    attendance: { sakit: number; izin: number; alpa: number };
    extracurriculars: string;
    characterObservations?: string;
  }) => Promise<{ catatan_wali: string; source: string }>;

  // Audit, Import & Export
  logAudit: (action: string, details: string) => void;
  exportToExcel: (data: any[], fileName: string, sheetName?: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'RAPOR_KAKAS_AI_STORE_V1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or defaults
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_school`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialSchoolProfile,
          ...parsed,
          alamat: parsed.alamat?.includes('Jl. Raya Kakas - Kaweng') ? initialSchoolProfile.alamat : (parsed.alamat || initialSchoolProfile.alamat),
          kodePos: parsed.kodePos === '95681' ? initialSchoolProfile.kodePos : (parsed.kodePos || initialSchoolProfile.kodePos),
          email: parsed.email === 'info@sman1kakas.sch.id' ? initialSchoolProfile.email : (parsed.email || initialSchoolProfile.email),
          logoUrl: (!parsed.logoUrl || parsed.logoUrl.includes('a44ed99c')) ? initialSchoolProfile.logoUrl : parsed.logoUrl,
          logoProvinsiUrl: parsed.logoProvinsiUrl || initialSchoolProfile.logoProvinsiUrl,
        };
      }
      return initialSchoolProfile;
    } catch {
      return initialSchoolProfile;
    }
  });

  const [assessmentMethod, setAssessmentMethod] = useState<AssessmentMethod>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_method`);
      return saved ? JSON.parse(saved) : initialAssessmentMethod;
    } catch {
      return initialAssessmentMethod;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      return saved ? JSON.parse(saved) : initialAccounts[0];
    } catch {
      return initialAccounts[0]; // Admin by default
    }
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : initialAccounts;
    } catch {
      return initialAccounts;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_teachers`);
      return saved ? JSON.parse(saved) : initialTeachers;
    } catch {
      return initialTeachers;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      return saved ? JSON.parse(saved) : initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
      return saved ? JSON.parse(saved) : initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [scores, setScores] = useState<StudentScore[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_scores`);
      return saved ? JSON.parse(saved) : initialScores;
    } catch {
      return initialScores;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch {
      return initialAttendance;
    }
  });

  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_extracurriculars`);
      return saved ? JSON.parse(saved) : initialExtracurriculars;
    } catch {
      return initialExtracurriculars;
    }
  });

  const [projects, setProjects] = useState<CocurricularProject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [homeroomNotes, setHomeroomNotes] = useState<HomeroomNote[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_homeroomNotes`);
      return saved ? JSON.parse(saved) : initialHomeroomNotes;
    } catch {
      return initialHomeroomNotes;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
      return saved ? JSON.parse(saved) : initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_school`, JSON.stringify(schoolProfile));
      localStorage.setItem(`${STORAGE_KEY}_method`, JSON.stringify(assessmentMethod));
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_scores`, JSON.stringify(scores));
      localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
      localStorage.setItem(`${STORAGE_KEY}_extracurriculars`, JSON.stringify(extracurriculars));
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${STORAGE_KEY}_homeroomNotes`, JSON.stringify(homeroomNotes));
      localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [
    schoolProfile,
    assessmentMethod,
    currentUser,
    accounts,
    teachers,
    classes,
    subjects,
    students,
    scores,
    attendance,
    extracurriculars,
    projects,
    homeroomNotes,
    auditLogs,
  ]);

  const logAudit = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      role: currentUser.role,
      action,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  const updateSchoolProfile = (profile: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => {
      const updated = { ...prev, ...profile };
      logAudit('UPDATE_PROFILE_SEKOLAH', 'Memperbarui profil sekolah dan pengaturan semester.');
      return updated;
    });
  };

  const updateAssessmentMethod = (method: Partial<AssessmentMethod>) => {
    setAssessmentMethod((prev) => {
      const updated = { ...prev, ...method };
      logAudit('UPDATE_METODE_PENILAIAN', `Konfigurasi rumus asesmen diubah ke: ${updated.formula} (${updated.weightSummativeTP}% TP, ${updated.weightSAS}% SAS).`);
      return updated;
    });
  };

  // Student CRUD
  const addStudent = (data: Omit<Student, 'id'>) => {
    const id = `std_${Date.now()}`;
    const newStd: Student = { ...data, id };
    setStudents((prev) => [...prev, newStd]);
    logAudit('TAMBAH_MURID', `Menambahkan data murid baru: ${newStd.fullName} (NIS: ${newStd.nis}).`);
    return newStd;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logAudit('UBAH_MURID', `Memperbarui biodata murid ID: ${id}`);
  };

  const deleteStudent = (id: string) => {
    const std = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logAudit('HAPUS_MURID', `Menghapus murid: ${std?.fullName || id}`);
  };

  // Teacher CRUD
  const addTeacher = (data: Omit<Teacher, 'id'>) => {
    const id = `tch_${Date.now()}`;
    const newTch: Teacher = { ...data, id };
    setTeachers((prev) => [...prev, newTch]);
    logAudit('TAMBAH_GURU', `Menambahkan guru: ${newTch.fullName}`);
    return newTch;
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    logAudit('UBAH_GURU', `Memperbarui data guru ID: ${id}`);
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    logAudit('HAPUS_GURU', `Menghapus guru ID: ${id}`);
  };

  // Class CRUD
  const addClass = (data: Omit<ClassRoom, 'id'>) => {
    const id = `cls_${Date.now()}`;
    const newCls: ClassRoom = { ...data, id };
    setClasses((prev) => [...prev, newCls]);
    logAudit('TAMBAH_ROMBEL', `Menambahkan rombel: ${newCls.name}`);
    return newCls;
  };

  const updateClass = (id: string, data: Partial<ClassRoom>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    logAudit('UBAH_ROMBEL', `Memperbarui rombel ID: ${id}`);
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    logAudit('HAPUS_ROMBEL', `Menghapus rombel ID: ${id}`);
  };

  // Subject CRUD
  const addSubject = (data: Omit<Subject, 'id'>) => {
    const id = `sbj_${Date.now()}`;
    const newSbj: Subject = { ...data, id };
    setSubjects((prev) => [...prev, newSbj]);
    logAudit('TAMBAH_MAPEL', `Menambahkan mapel: ${newSbj.name}`);
    return newSbj;
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logAudit('UBAH_MAPEL', `Memperbarui mapel ID: ${id}`);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    logAudit('HAPUS_MAPEL', `Menghapus mapel ID: ${id}`);
  };

  // Assessment Calculation Formula based on PPA 2025
  const calculateFinalScore = (tpScores: Record<string, number>, sasScore?: number): number => {
    const scoresList = Object.values(tpScores).filter((val) => typeof val === 'number' && !isNaN(val));
    if (scoresList.length === 0) return sasScore ?? 0;

    const avgTP = scoresList.reduce((acc, curr) => acc + curr, 0) / scoresList.length;

    if (assessmentMethod.formula === 'AVERAGE_TP' || sasScore === undefined || sasScore === null) {
      return Math.round(avgTP);
    }

    // WEIGHTED_SUMMATIVE_SAS
    const weightTP = assessmentMethod.weightSummativeTP / 100;
    const weightSAS = assessmentMethod.weightSAS / 100;
    const finalVal = avgTP * weightTP + sasScore * weightSAS;
    return Math.round(finalVal);
  };

  // Save or update student score
  const saveStudentScore = (
    scoreData: Partial<StudentScore> & { studentId: string; subjectId: string }
  ): StudentScore => {
    const now = new Date().toISOString();
    const existing = scores.find(
      (s) =>
        s.studentId === scoreData.studentId &&
        s.subjectId === scoreData.subjectId &&
        s.semester === schoolProfile.semesterAktif &&
        s.academicYear === schoolProfile.tahunPelajaranAktif
    );

    let finalScore = scoreData.finalScore;
    if (finalScore === undefined && scoreData.tpScores) {
      finalScore = calculateFinalScore(scoreData.tpScores, scoreData.sasScore);
    }

    if (existing) {
      const updated: StudentScore = {
        ...existing,
        ...scoreData,
        finalScore: finalScore ?? existing.finalScore,
        updatedAt: now,
        updatedBy: currentUser.fullName,
      };
      setScores((prev) => prev.map((s) => (s.id === existing.id ? updated : s)));
      logAudit('UPDATE_NILAI', `Memperbarui nilai murid ID ${scoreData.studentId} pada mapel ID ${scoreData.subjectId}.`);
      return updated;
    } else {
      const newScore: StudentScore = {
        id: `scr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: scoreData.studentId,
        subjectId: scoreData.subjectId,
        academicYear: schoolProfile.tahunPelajaranAktif,
        semester: schoolProfile.semesterAktif,
        tpScores: scoreData.tpScores || {},
        sasScore: scoreData.sasScore,
        finalScore: finalScore ?? 0,
        masteredStrengths: scoreData.masteredStrengths || '',
        needsImprovement: scoreData.needsImprovement || '',
        competencyDescription: scoreData.competencyDescription || '',
        status: scoreData.status || 'DRAFT',
        updatedAt: now,
        updatedBy: currentUser.fullName,
      };
      setScores((prev) => [...prev, newScore]);
      logAudit('SIMPAN_NILAI', `Menyimpan nilai baru untuk murid ID ${scoreData.studentId} pada mapel ID ${scoreData.subjectId}.`);
      return newScore;
    }
  };

  const batchSaveScores = (newScores: StudentScore[]) => {
    setScores((prev) => {
      const map = new Map(prev.map((s) => [`${s.studentId}_${s.subjectId}`, s]));
      newScores.forEach((ns) => {
        map.set(`${ns.studentId}_${ns.subjectId}`, ns);
      });
      return Array.from(map.values());
    });
    logAudit('IMPORT_NILAI_MASSAL', `Menyimpan impor nilai massal sejumlah ${newScores.length} data.`);
  };

  const updateScoreStatus = (scoreId: string, status: ScoreStatus) => {
    setScores((prev) =>
      prev.map((s) => (s.id === scoreId ? { ...s, status, updatedAt: new Date().toISOString() } : s))
    );
    logAudit('UPDATE_STATUS_NILAI', `Mengubah status nilai ${scoreId} menjadi ${status}.`);
  };

  // Attendance
  const updateAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) =>
          !(
            a.studentId === record.studentId &&
            a.academicYear === record.academicYear &&
            a.semester === record.semester
          )
      );
      return [...filtered, record];
    });
    logAudit('UPDATE_PRESENSI', `Memperbarui presensi murid ID: ${record.studentId}`);
  };

  // Extracurriculars
  const addExtracurricular = (data: Omit<ExtracurricularRecord, 'id'>) => {
    const id = `ext_${Date.now()}`;
    const newExt: ExtracurricularRecord = { ...data, id };
    setExtracurriculars((prev) => [...prev, newExt]);
    logAudit('TAMBAH_EKSTRAKURIKULER', `Menambahkan kegiatan ekstrakurikuler ${newExt.activityName}`);
  };

  const deleteExtracurricular = (id: string) => {
    setExtracurriculars((prev) => prev.filter((e) => e.id !== id));
    logAudit('HAPUS_EKSTRAKURIKULER', `Menghapus ekstrakurikuler ID: ${id}`);
  };

  const saveHomeroomNote = (note: HomeroomNote) => {
    setHomeroomNotes((prev) => {
      const filtered = prev.filter(
        (n) =>
          !(
            n.studentId === note.studentId &&
            n.academicYear === note.academicYear &&
            n.semester === note.semester
          )
      );
      return [...filtered, note];
    });
    logAudit('SIMPAN_CATATAN_WALI', `Menyimpan catatan wali kelas untuk murid ID: ${note.studentId}`);
  };

  const saveProject = (project: CocurricularProject) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = project;
        return copy;
      }
      return [...prev, project];
    });
    logAudit('SIMPAN_PROJEK_P5', `Memperbarui data projek kokurikuler: ${project.title}`);
  };

  // AI Description Generator via server-side endpoint
  const requestAIDescription = async (params: {
    studentName: string;
    subjectName: string;
    phase: string;
    grade: number;
    semester: string;
    finalScore: number;
    tpEvaluations: Array<{ tpCode: string; tpDesc: string; score: number }>;
    masteredStrengths: string;
    needsImprovement: string;
    teacherNotes?: string;
  }) => {
    try {
      const res = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      logAudit(
        'AI_GENERATE_CAPAIAN',
        `Menghasilkan deskripsi AI (${json.source}) untuk ${params.studentName} - ${params.subjectName}.`
      );
      return {
        ...json.data,
        source: json.source,
      };
    } catch (err) {
      console.warn('API error, falling back to local heuristic', err);
      const fallbackStr = `Menunjukkan pemahaman sangat baik dalam ${params.masteredStrengths || 'tujuan pembelajaran materi utama'}${
        params.needsImprovement ? `, serta perlu penguatan berkelanjutan dalam ${params.needsImprovement}` : ' secara konsisten'
      }.`;

      return {
        deskripsi_tercapai: `Menunjukkan penguasaan optimal dalam ${params.masteredStrengths || 'pemahaman materi pokok'}.`,
        deskripsi_perlu_peningkatan: params.needsImprovement
          ? `Perlu pendampingan lebih lanjut dalam hal ${params.needsImprovement}.`
          : '',
        ringkasan_rapor: fallbackStr,
        saran_tindak_lanjut: 'Diberikan bimbingan kontekstual dan penugasan terstruktur.',
        catatan_validasi: 'Disusun oleh sistem asesmen cerdas PPA 2025.',
        source: 'local-heuristic',
      };
    }
  };

  // AI Wali Kelas Note
  const requestAIWaliNote = async (params: {
    studentName: string;
    averageScore: number;
    attendance: { sakit: number; izin: number; alpa: number };
    extracurriculars: string;
    characterObservations?: string;
  }) => {
    try {
      const res = await fetch('/api/gemini/generate-wali-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('API failed');
      const json = await res.json();
      return {
        catatan_wali: json.data?.catatan_wali,
        source: json.source,
      };
    } catch {
      return {
        catatan_wali: `Pertahankan semangat belajar dan terus kembangkan bakat serta kedisiplinan diri di semester berikutnya untuk meraih prestasi yang lebih tinggi.`,
        source: 'local-fallback',
      };
    }
  };

  // Export to Excel / CSV via XLSX library
  const exportToExcel = (data: any[], fileName: string, sheetName = 'Data') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    logAudit('EXPORT_EXCEL', `Mengekspor file Excel: ${fileName}.xlsx`);
  };

  // Reset all data to factory demo defaults
  const resetAllData = () => {
    localStorage.clear();
    setSchoolProfile(initialSchoolProfile);
    setAssessmentMethod(initialAssessmentMethod);
    setAccounts(initialAccounts);
    setCurrentUser(initialAccounts[0]);
    setTeachers(initialTeachers);
    setClasses(initialClasses);
    setSubjects(initialSubjects);
    setStudents(initialStudents);
    setScores(initialScores);
    setAttendance(initialAttendance);
    setExtracurriculars(initialExtracurriculars);
    setProjects(initialProjects);
    setHomeroomNotes(initialHomeroomNotes);
    setAuditLogs(initialAuditLogs);
    logAudit('RESET_DATA', 'Mereset seluruh data aplikasi ke kondisi awal pabrik.');
  };

  return (
    <AppContext.Provider
      value={{
        schoolProfile,
        assessmentMethod,
        currentUser,
        accounts,
        teachers,
        classes,
        subjects,
        students,
        scores,
        attendance,
        extracurriculars,
        projects,
        homeroomNotes,
        auditLogs,

        setCurrentUser,
        updateSchoolProfile,
        updateAssessmentMethod,

        addStudent,
        updateStudent,
        deleteStudent,

        addTeacher,
        updateTeacher,
        deleteTeacher,

        addClass,
        updateClass,
        deleteClass,

        addSubject,
        updateSubject,
        deleteSubject,

        calculateFinalScore,
        saveStudentScore,
        batchSaveScores,
        updateScoreStatus,

        updateAttendance,
        addExtracurricular,
        deleteExtracurricular,
        saveHomeroomNote,
        saveProject,

        requestAIDescription,
        requestAIWaliNote,

        logAudit,
        exportToExcel,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
