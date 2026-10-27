/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Award,
  Sparkles,
  Save,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  Check,
  RefreshCw,
  Eye,
  Info,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudentScore, ScoreStatus } from '../types';

export const ScoreInputPage: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    scores,
    schoolProfile,
    assessmentMethod,
    calculateFinalScore,
    saveStudentScore,
    requestAIDescription,
    exportToExcel,
    currentUser,
  } = useApp();

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  
  // Available subjects for selected class
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    return subjects.filter((s) => s.phase === selectedClass.phase && s.grades.includes(selectedClass.grade));
  }, [selectedClass, subjects]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id || subjects[0]?.id || ''
  );

  // Sync subject selection if class changes and subject not applicable
  React.useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(availableSubjects[0].id);
    }
  }, [selectedClassId, availableSubjects]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const learningObjectives = activeSubject?.learningObjectives || [];

  // Filter classes if user is teacher
  const filteredClasses = useMemo(() => {
    if (currentUser.role === 'guru' && currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
      return classes.filter((c) => currentUser.assignedClasses!.includes(c.id));
    }
    return classes;
  }, [classes, currentUser]);

  // Students in selected class (filtered by elective enrollment if subject is PILIHAN in Fase F)
  const classStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.classId !== selectedClassId) return false;
      // If subject is PILIHAN in Fase F, ensure student enrolled
      if (activeSubject?.group === 'PILIHAN' && s.phase === 'F') {
        if (s.electiveSubjectIds && s.electiveSubjectIds.length > 0) {
          return s.electiveSubjectIds.includes(activeSubject.id);
        }
      }
      return true;
    });
  }, [students, selectedClassId, activeSubject]);

  // Local draft state for the worksheet
  // Map studentId -> { tpScores: {}, sasScore: number, desc: string, status: ScoreStatus, loadingAI: boolean }
  const [worksheetData, setWorksheetData] = useState<
    Record<
      string,
      {
        tpScores: Record<string, number>;
        sasScore?: number;
        finalScore: number;
        competencyDescription: string;
        masteredStrengths: string;
        needsImprovement: string;
        status: ScoreStatus;
        loadingAI?: boolean;
      }
    >
  >({});

  // Populate worksheet from existing scores when class/subject changes
  React.useEffect(() => {
    const newDraft: typeof worksheetData = {};
    classStudents.forEach((std) => {
      const existing = scores.find(
        (s) =>
          s.studentId === std.id &&
          s.subjectId === selectedSubjectId &&
          s.semester === schoolProfile.semesterAktif &&
          s.academicYear === schoolProfile.tahunPelajaranAktif
      );

      if (existing) {
        newDraft[std.id] = {
          tpScores: { ...existing.tpScores },
          sasScore: existing.sasScore,
          finalScore: existing.finalScore,
          competencyDescription: existing.competencyDescription,
          masteredStrengths: existing.masteredStrengths || '',
          needsImprovement: existing.needsImprovement || '',
          status: existing.status,
          loadingAI: false,
        };
      } else {
        // Default blank template with learning objectives
        const defaultTPs: Record<string, number> = {};
        learningObjectives.forEach((tp) => {
          defaultTPs[tp.id] = 80; // Reasonable baseline
        });
        const initialFinal = calculateFinalScore(defaultTPs, 80);
        newDraft[std.id] = {
          tpScores: defaultTPs,
          sasScore: 80,
          finalScore: initialFinal,
          competencyDescription: '',
          masteredStrengths: '',
          needsImprovement: '',
          status: 'DRAFT',
          loadingAI: false,
        };
      }
    });
    setWorksheetData(newDraft);
  }, [selectedClassId, selectedSubjectId, schoolProfile]);

  // Handle score change
  const handleTPChange = (studentId: string, tpId: string, value: string) => {
    const num = value === '' ? 0 : Math.min(100, Math.max(0, Number(value) || 0));
    setWorksheetData((prev) => {
      const current = prev[studentId] || {
        tpScores: {},
        finalScore: 0,
        competencyDescription: '',
        masteredStrengths: '',
        needsImprovement: '',
        status: 'DRAFT',
      };
      const updatedTPs = { ...current.tpScores, [tpId]: num };
      const newFinal = calculateFinalScore(updatedTPs, current.sasScore);

      return {
        ...prev,
        [studentId]: {
          ...current,
          tpScores: updatedTPs,
          finalScore: newFinal,
        },
      };
    });
  };

  const handleSASChange = (studentId: string, value: string) => {
    const num = value === '' ? 0 : Math.min(100, Math.max(0, Number(value) || 0));
    setWorksheetData((prev) => {
      const current = prev[studentId] || {
        tpScores: {},
        finalScore: 0,
        competencyDescription: '',
        masteredStrengths: '',
        needsImprovement: '',
        status: 'DRAFT',
      };
      const newFinal = calculateFinalScore(current.tpScores, num);

      return {
        ...prev,
        [studentId]: {
          ...current,
          sasScore: num,
          finalScore: newFinal,
        },
      };
    });
  };

  const handleDescChange = (studentId: string, text: string) => {
    setWorksheetData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        competencyDescription: text,
      },
    }));
  };

  // Generate single AI description
  const handleGenerateAI = async (studentId: string) => {
    const row = worksheetData[studentId];
    const std = students.find((s) => s.id === studentId);
    if (!row || !std || !activeSubject) return;

    setWorksheetData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], loadingAI: true },
    }));

    try {
      const tpEvaluations = learningObjectives.map((tp) => ({
        tpCode: tp.code,
        tpDesc: tp.description,
        score: row.tpScores[tp.id] ?? 0,
      }));

      // Detect strong TPs and weak TPs
      const strongTPs = learningObjectives
        .filter((tp) => (row.tpScores[tp.id] ?? 0) >= assessmentMethod.kktpMinimum + 5)
        .map((tp) => tp.scopeOfMaterial || tp.code);
      const weakTPs = learningObjectives
        .filter((tp) => (row.tpScores[tp.id] ?? 0) < assessmentMethod.kktpMinimum)
        .map((tp) => tp.scopeOfMaterial || tp.code);

      const res = await requestAIDescription({
        studentName: std.fullName,
        subjectName: activeSubject.name,
        phase: std.phase,
        grade: std.grade,
        semester: schoolProfile.semesterAktif,
        finalScore: row.finalScore,
        tpEvaluations,
        masteredStrengths: strongTPs.join(', ') || 'pemahaman materi pokok',
        needsImprovement: weakTPs.join(', '),
        teacherNotes: '',
      });

      setWorksheetData((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          competencyDescription: res.ringkasan_rapor,
          masteredStrengths: res.deskripsi_tercapai,
          needsImprovement: res.deskripsi_perlu_peningkatan,
          loadingAI: false,
        },
      }));
    } catch (e) {
      console.error(e);
      setWorksheetData((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], loadingAI: false },
      }));
    }
  };

  // Save all rows
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const handleSaveAll = (targetStatus?: ScoreStatus) => {
    if (!activeSubject) return;

    classStudents.forEach((std) => {
      const row = worksheetData[std.id];
      if (!row) return;

      saveStudentScore({
        studentId: std.id,
        subjectId: activeSubject.id,
        tpScores: row.tpScores,
        sasScore: row.sasScore,
        finalScore: row.finalScore,
        competencyDescription: row.competencyDescription,
        masteredStrengths: row.masteredStrengths,
        needsImprovement: row.needsImprovement,
        status: targetStatus || row.status || 'DRAFT',
      });
    });

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Export to Excel
  const handleExportSpreadsheet = () => {
    if (!activeSubject || !selectedClass) return;

    const data = classStudents.map((std, idx) => {
      const row = worksheetData[std.id];
      const entry: any = {
        No: idx + 1,
        NIS: std.nis,
        NISN: std.nisn,
        'Nama Murid': std.fullName,
      };

      learningObjectives.forEach((tp) => {
        entry[`${tp.code} (${tp.scopeOfMaterial})`] = row?.tpScores[tp.id] ?? '';
      });

      entry['Sumatif Akhir (SAS)'] = row?.sasScore ?? '';
      entry['Nilai Akhir'] = row?.finalScore ?? '';
      entry['Deskripsi Capaian Kompetensi'] = row?.competencyDescription ?? '';
      entry['Status'] = row?.status ?? 'DRAFT';

      return entry;
    });

    exportToExcel(
      data,
      `Nilai_${activeSubject.code}_${selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_')}_Sem${schoolProfile.semesterAktif}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Lembar Asesmen Sumatif Kurikulum Merdeka</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Input & Pengolahan Nilai Asesmen
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola nilai sumatif tujuan pembelajaran (TP), sumatif akhir semester (SAS), dan deskripsi capaian rapor.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Rombel Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Rombongan Belajar
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {filteredClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Kelas {c.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Mata Pelajaran
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Export button */}
            <div className="self-end">
              <button
                onClick={handleExportSpreadsheet}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Ekspor ke Excel"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Formula Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Metode Penilaian:{' '}
              <strong className="text-slate-900">
                {assessmentMethod.formula === 'WEIGHTED_SUMMATIVE_SAS'
                  ? `Pembobotan (${assessmentMethod.weightSummativeTP}% Rata-rata TP + ${assessmentMethod.weightSAS}% SAS)`
                  : 'Rerata Murni Sumatif TP'}
              </strong>
              {' '}| KKTP: <strong className="text-blue-700">{assessmentMethod.kktpMinimum}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveAll('DRAFT')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Draf</span>
            </button>
            <button
              onClick={() => handleSaveAll('MENUNGGU_VERIFIKASI')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim ke Wali Kelas</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Seluruh data nilai dan deskripsi berhasil disimpan ke sistem!</span>
          </div>
        )}
      </div>

      {/* Main Interactive Worksheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Daftar Nilai Murid ({classStudents.length} peserta didik terdaftar)
          </span>
          <span className="text-[11px] text-slate-500">
            {learningObjectives.length} Tujuan Pembelajaran (TP) terdaftar untuk mapel ini
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold text-[11px]">
              <tr>
                <th className="px-3 py-3 text-center w-10">No</th>
                <th className="px-4 py-3 min-w-[180px]">Nama Murid</th>
                {learningObjectives.map((tp) => (
                  <th key={tp.id} className="px-3 py-3 text-center min-w-[90px]" title={tp.description}>
                    <div className="font-bold text-slate-900">{tp.code}</div>
                    <div className="text-[9px] text-slate-500 font-normal truncate max-w-[80px]">
                      {tp.scopeOfMaterial}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center min-w-[80px] bg-blue-50/50">
                  <div className="text-blue-900 font-bold">SAS</div>
                  <div className="text-[9px] text-blue-700 font-normal">Sumatif Akhir</div>
                </th>
                <th className="px-3 py-3 text-center min-w-[80px] bg-amber-50/50">
                  <div className="text-amber-900 font-bold">Nilai Akhir</div>
                  <div className="text-[9px] text-amber-700 font-normal">PPA 2025</div>
                </th>
                <th className="px-4 py-3 min-w-[280px]">Deskripsi Capaian Kompetensi (Rapor)</th>
                <th className="px-3 py-3 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classStudents.map((std, idx) => {
                const row = worksheetData[std.id] || {
                  tpScores: {},
                  finalScore: 0,
                  competencyDescription: '',
                  masteredStrengths: '',
                  needsImprovement: '',
                  status: 'DRAFT',
                };

                const isBelowKktp = row.finalScore < assessmentMethod.kktpMinimum && row.finalScore > 0;

                return (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-3 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{std.fullName}</div>
                      <div className="text-[10px] text-slate-500">
                        NIS: {std.nis} • NISN: {std.nisn}
                      </div>
                    </td>

                    {/* TP Score inputs */}
                    {learningObjectives.map((tp) => {
                      const val = row.tpScores[tp.id] !== undefined ? row.tpScores[tp.id] : '';
                      return (
                        <td key={tp.id} className="px-2 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={val}
                            onChange={(e) => handleTPChange(std.id, tp.id, e.target.value)}
                            className={`w-14 text-center py-1 rounded-lg border font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${
                              Number(val) < assessmentMethod.kktpMinimum
                                ? 'border-amber-400 bg-amber-50/50 text-amber-900'
                                : 'border-slate-300 bg-white text-slate-900'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* SAS Score */}
                    <td className="px-2 py-3 text-center bg-blue-50/20">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.sasScore !== undefined ? row.sasScore : ''}
                        onChange={(e) => handleSASChange(std.id, e.target.value)}
                        className="w-14 text-center py-1 rounded-lg border border-blue-300 bg-white font-bold text-xs text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </td>

                    {/* Final Score */}
                    <td className="px-3 py-3 text-center bg-amber-50/20">
                      <div
                        className={`text-sm font-black ${
                          isBelowKktp ? 'text-red-600' : 'text-slate-900'
                        }`}
                      >
                        {row.finalScore}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {isBelowKktp ? 'Perlu bimbingan' : 'Tuntas'}
                      </div>
                    </td>

                    {/* Competency Description & AI Sparkle */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={row.competencyDescription}
                          onChange={(e) => handleDescChange(std.id, e.target.value)}
                          placeholder="Ketik deskripsi atau klik tombol AI untuk merumuskan otomatis..."
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none font-sans text-slate-800 leading-normal"
                        />
                        <button
                          type="button"
                          onClick={() => handleGenerateAI(std.id)}
                          disabled={row.loadingAI}
                          className="absolute right-2 bottom-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded-lg text-[10px] shadow-xs flex items-center gap-1 transition-all disabled:opacity-50"
                          title="Generate Deskripsi Capaian dengan Gemini AI"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{row.loadingAI ? 'Menyusun...' : 'AI Gemini'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          row.status === 'FINAL'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : row.status === 'MENUNGGU_VERIFIKASI'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : row.status === 'PERLU_PERBAIKAN'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
