/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle,
  Edit3,
  RefreshCw,
  Send,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AiDescriptionPage: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    scores,
    schoolProfile,
    assessmentMethod,
    requestAIDescription,
    saveStudentScore,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const availableSubjects = subjects.filter(
    (s) => selectedClass && s.phase === selectedClass.phase && s.grades.includes(selectedClass.grade)
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id || subjects[0]?.id || ''
  );

  // Sync if class changes
  React.useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(availableSubjects[0].id);
    }
  }, [selectedClassId, availableSubjects]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Selected student to generate/review
  const [activeStudentId, setActiveStudentId] = useState<string>(classStudents[0]?.id || '');

  React.useEffect(() => {
    if (classStudents.length > 0 && !classStudents.some((s) => s.id === activeStudentId)) {
      setActiveStudentId(classStudents[0].id);
    }
  }, [classStudents]);

  const activeStudent = students.find((s) => s.id === activeStudentId);

  // Score record for this active student and subject
  const currentScoreRecord = scores.find(
    (s) =>
      s.studentId === activeStudentId &&
      s.subjectId === selectedSubjectId &&
      s.semester === schoolProfile.semesterAktif &&
      s.academicYear === schoolProfile.tahunPelajaranAktif
  );

  // AI draft state for active student
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    deskripsi_tercapai: string;
    deskripsi_perlu_peningkatan: string;
    ringkasan_rapor: string;
    saran_tindak_lanjut: string;
    catatan_validasi?: string;
    source?: string;
  } | null>(null);

  const [editableSummary, setEditableSummary] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When active student changes, reset or populate
  React.useEffect(() => {
    if (currentScoreRecord) {
      setEditableSummary(currentScoreRecord.competencyDescription || '');
      setAiResult({
        deskripsi_tercapai: currentScoreRecord.masteredStrengths || '',
        deskripsi_perlu_peningkatan: currentScoreRecord.needsImprovement || '',
        ringkasan_rapor: currentScoreRecord.competencyDescription || '',
        saran_tindak_lanjut: currentScoreRecord.aiActionPlan || '',
        source: 'database',
      });
    } else {
      setEditableSummary('');
      setAiResult(null);
    }
  }, [activeStudentId, selectedSubjectId]);

  // Run AI generation for single student
  const handleGenerateSingle = async () => {
    if (!activeStudent || !activeSubject) return;

    setIsLoading(true);
    try {
      const tpScores = currentScoreRecord?.tpScores || {};
      const tps = activeSubject.learningObjectives || [];

      const tpEvaluations = tps.map((tp) => ({
        tpCode: tp.code,
        tpDesc: tp.description,
        score: tpScores[tp.id] ?? 80,
      }));

      const strongTPs = tps
        .filter((tp) => (tpScores[tp.id] ?? 80) >= assessmentMethod.kktpMinimum + 5)
        .map((tp) => tp.scopeOfMaterial || tp.code);
      const weakTPs = tps
        .filter((tp) => (tpScores[tp.id] ?? 80) < assessmentMethod.kktpMinimum)
        .map((tp) => tp.scopeOfMaterial || tp.code);

      const res = await requestAIDescription({
        studentName: activeStudent.fullName,
        subjectName: activeSubject.name,
        phase: activeStudent.phase,
        grade: activeStudent.grade,
        semester: schoolProfile.semesterAktif,
        finalScore: currentScoreRecord?.finalScore || 80,
        tpEvaluations,
        masteredStrengths: strongTPs.join(', ') || 'pemahaman konsep materi pokok',
        needsImprovement: weakTPs.join(', '),
        teacherNotes: '',
      });

      setAiResult(res);
      setEditableSummary(res.ringkasan_rapor);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Batch Generation for all students in class
  const handleBatchGenerate = async () => {
    if (!activeSubject) return;
    setBatchLoading(true);
    setBatchProgress({ current: 0, total: classStudents.length });

    for (let i = 0; i < classStudents.length; i++) {
      const std = classStudents[i];
      setBatchProgress({ current: i + 1, total: classStudents.length });

      const existing = scores.find(
        (s) =>
          s.studentId === std.id &&
          s.subjectId === selectedSubjectId &&
          s.semester === schoolProfile.semesterAktif &&
          s.academicYear === schoolProfile.tahunPelajaranAktif
      );

      const tpScores = existing?.tpScores || {};
      const tps = activeSubject.learningObjectives || [];

      const tpEvaluations = tps.map((tp) => ({
        tpCode: tp.code,
        tpDesc: tp.description,
        score: tpScores[tp.id] ?? 80,
      }));

      const strongTPs = tps
        .filter((tp) => (tpScores[tp.id] ?? 80) >= assessmentMethod.kktpMinimum + 5)
        .map((tp) => tp.scopeOfMaterial || tp.code);
      const weakTPs = tps
        .filter((tp) => (tpScores[tp.id] ?? 80) < assessmentMethod.kktpMinimum)
        .map((tp) => tp.scopeOfMaterial || tp.code);

      try {
        const res = await requestAIDescription({
          studentName: std.fullName,
          subjectName: activeSubject.name,
          phase: std.phase,
          grade: std.grade,
          semester: schoolProfile.semesterAktif,
          finalScore: existing?.finalScore || 80,
          tpEvaluations,
          masteredStrengths: strongTPs.join(', ') || 'materi pokok',
          needsImprovement: weakTPs.join(', '),
        });

        // Save generated description
        saveStudentScore({
          studentId: std.id,
          subjectId: activeSubject.id,
          finalScore: existing?.finalScore || 80,
          tpScores: existing?.tpScores || {},
          sasScore: existing?.sasScore,
          competencyDescription: res.ringkasan_rapor,
          masteredStrengths: res.deskripsi_tercapai,
          needsImprovement: res.deskripsi_perlu_peningkatan,
          status: 'DRAFT',
        });
      } catch (err) {
        console.warn('Batch AI item error', err);
      }
    }

    setBatchLoading(false);
    setBatchProgress(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Save approved description
  const handleApproveAndSave = () => {
    if (!activeStudent || !activeSubject) return;

    saveStudentScore({
      studentId: activeStudent.id,
      subjectId: activeSubject.id,
      finalScore: currentScoreRecord?.finalScore || 80,
      tpScores: currentScoreRecord?.tpScores || {},
      sasScore: currentScoreRecord?.sasScore,
      competencyDescription: editableSummary,
      masteredStrengths: aiResult?.deskripsi_tercapai || '',
      needsImprovement: aiResult?.deskripsi_perlu_peningkatan || '',
      aiActionPlan: aiResult?.saran_tindak_lanjut || '',
      status: 'MENUNGGU_VERIFIKASI',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Didukung Google Gemini 3.8 Flash • PPA Revisi 2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI Generator Deskripsi Capaian Kompetensi
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              Membantu guru merumuskan deskripsi rapor yang spesifik, objektif, dan membangun berdasarkan data bukti TP yang sesungguhnya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchGenerate}
              disabled={batchLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>
                {batchLoading
                  ? `Memproses (${batchProgress?.current}/${batchProgress?.total})...`
                  : 'Generate Seluruh Kelas'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Rombongan Belajar
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Mata Pelajaran
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {savedSuccess && (
          <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Deskripsi berhasil disetujui & disimpan ke buku rapor!</span>
          </div>
        )}
      </div>

      {/* 2-Column Layout: Left (Student List), Right (AI Review & Synthesis Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Students Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Daftar Murid</span>
            <span className="text-[10px] text-slate-500">{classStudents.length} siswa</span>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {classStudents.map((std, idx) => {
              const isSelected = std.id === activeStudentId;
              const sc = scores.find(
                (s) =>
                  s.studentId === std.id &&
                  s.subjectId === selectedSubjectId &&
                  s.semester === schoolProfile.semesterAktif
              );
              const hasDesc = Boolean(sc?.competencyDescription);

              return (
                <button
                  key={std.id}
                  onClick={() => setActiveStudentId(std.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{std.fullName}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Nilai Akhir: {sc?.finalScore ?? '-'} • {std.nis}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {hasDesc ? (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        Ada Draf
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        Kosong
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: AI Synthesis & Editor Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {activeStudent && activeSubject ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeStudent.fullName}</h3>
                  <p className="text-xs text-slate-500">
                    {activeSubject.name} • Nilai Akhir:{' '}
                    <strong className="text-blue-700">
                      {currentScoreRecord?.finalScore ?? 80}
                    </strong>{' '}
                    (KKTP: {assessmentMethod.kktpMinimum})
                  </p>
                </div>

                <button
                  onClick={handleGenerateSingle}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isLoading ? 'Sedang Menganalisis...' : 'Generate AI Capaian'}</span>
                </button>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Optimal Strengths */}
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Capaian Sangat Optimal</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {aiResult?.deskripsi_tercapai ||
                      'Klik "Generate AI Capaian" untuk mengevaluasi kompetensi yang telah dikuasai dengan baik berdasarkan bukti TP.'}
                  </p>
                </div>

                {/* Needs Improvement */}
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Perlu Bimbingan / Penguatan</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {aiResult?.deskripsi_perlu_peningkatan ||
                      'Kompetensi yang masih perlu pendampingan lebih lanjut jika terdapat bukti TP yang belum tuntas.'}
                  </p>
                </div>
              </div>

              {/* Action plan if present */}
              {aiResult?.saran_tindak_lanjut && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900">
                  <strong>Rekomendasi Tindak Lanjut Guru:</strong> {aiResult.saran_tindak_lanjut}
                </div>
              )}

              {/* Editable Report Card Summary (Siap Rapor) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>Redaksi Ringkas untuk Buku Rapor Murid (Dapat Diedit Guru)</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Prinsip PPA 2025: Objektif, santun, positif
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={editableSummary}
                  onChange={(e) => setEditableSummary(e.target.value)}
                  placeholder="Deskripsi akhir yang akan dicetak pada kolom Capaian Kompetensi buku rapor..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-sans leading-relaxed text-slate-900"
                />
              </div>

              {/* Approval Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Sumber AI:{' '}
                  <strong className="text-slate-800">
                    {aiResult?.source || 'Belum di-generate'}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApproveAndSave}
                    disabled={!editableSummary}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Simpan ke Rapor</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              Pilih rombel dan murid untuk memulai perumusan deskripsi capaian dengan AI.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
