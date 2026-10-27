/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit,
  Save,
  Printer,
  ChevronRight,
  Calendar,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

interface HomeroomMonitoringProps {
  onSelectPrintStudent: (student: Student) => void;
}

export const HomeroomMonitoringPage: React.FC<HomeroomMonitoringProps> = ({
  onSelectPrintStudent,
}) => {
  const {
    classes,
    subjects,
    students,
    teachers,
    scores,
    attendance,
    homeroomNotes,
    extracurriculars,
    schoolProfile,
    saveHomeroomNote,
    requestAIWaliNote,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const homeroomTeacher = teachers.find((t) => t.id === selectedClass?.homeroomTeacherId);

  // Applicable subjects for this class
  const classSubjects = subjects.filter(
    (s) => selectedClass && s.phase === selectedClass.phase && s.grades.includes(selectedClass.grade)
  );

  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Note editor modal
  const [activeNoteStudent, setActiveNoteStudent] = useState<Student | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const openNoteEditor = (std: Student) => {
    setActiveNoteStudent(std);
    const existing = homeroomNotes.find(
      (n) =>
        n.studentId === std.id &&
        n.semester === schoolProfile.semesterAktif &&
        n.academicYear === schoolProfile.tahunPelajaranAktif
    );
    setNoteContent(existing?.note || '');
  };

  const handleGenerateAINote = async () => {
    if (!activeNoteStudent) return;
    setLoadingAI(true);
    try {
      const att = attendance.find((a) => a.studentId === activeNoteStudent.id) || {
        sakit: 0,
        izin: 0,
        alpa: 0,
      };
      const exts = extracurriculars
        .filter((e) => e.studentId === activeNoteStudent.id)
        .map((e) => e.activityName)
        .join(', ');

      const res = await requestAIWaliNote({
        studentName: activeNoteStudent.fullName,
        averageScore: 84,
        attendance: { sakit: att.sakit, izin: att.izin, alpa: att.alpa },
        extracurriculars: exts || 'Kegiatan Pramuka & Sekolah',
        characterObservations: 'Sopan, disiplin, dan rajin membantu teman',
      });

      setNoteContent(res.catatan_wali);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveNote = () => {
    if (!activeNoteStudent) return;

    saveHomeroomNote({
      studentId: activeNoteStudent.id,
      academicYear: schoolProfile.tahunPelajaranAktif,
      semester: schoolProfile.semesterAktif,
      note: noteContent,
      characterAppreciation: 'Sikap sangat terpuji',
      isFinalized: true,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveNoteStudent(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Monitoring Wali Kelas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Wali kelas: <strong>{homeroomTeacher?.fullName || 'Belum ditugaskan'}</strong> • Rombel:{' '}
            <strong>{selectedClass?.name}</strong>
          </p>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Pilih Kelas Binaan:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards in Rombel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classStudents.map((std) => {
          // Check completeness of student's scores
          const studentScores = scores.filter(
            (s) =>
              s.studentId === std.id &&
              s.semester === schoolProfile.semesterAktif &&
              s.academicYear === schoolProfile.tahunPelajaranAktif
          );

          const filledCount = studentScores.length;
          const totalSubjects = classSubjects.length;
          const isComplete = filledCount >= totalSubjects && totalSubjects > 0;

          const att = attendance.find((a) => a.studentId === std.id);
          const note = homeroomNotes.find((n) => n.studentId === std.id);

          return (
            <div
              key={std.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 font-bold flex items-center justify-center text-xs">
                    {std.fullName.charAt(0)}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isComplete
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isComplete ? 'Nilai Lengkap' : `${filledCount}/${totalSubjects} Mapel`}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{std.fullName}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    NIS: {std.nis} • NISN: {std.nisn}
                  </p>
                </div>

                {/* Presensi badge */}
                <div className="mt-3 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">Ketidakhadiran:</span>
                  <span className="font-semibold text-slate-800">
                    S: {att?.sakit || 0} • I: {att?.izin || 0} • A: {att?.alpa || 0}
                  </span>
                </div>

                {/* Catatan wali kelas snippet */}
                <div className="mt-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Catatan Wali Kelas
                  </span>
                  {note?.note ? (
                    <p className="text-slate-700 text-[11px] italic line-clamp-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      "{note.note}"
                    </p>
                  ) : (
                    <p className="text-slate-400 text-[11px] italic">Belum diisi catatan</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openNoteEditor(std)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>{note?.note ? 'Edit Catatan' : 'Isi Catatan'}</span>
                </button>

                <button
                  onClick={() => onSelectPrintStudent(std)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Rapor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Editor Modal with AI Generator */}
      {activeNoteStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Catatan Wali Kelas</h3>
                <p className="text-xs text-slate-500">
                  Murid: <strong>{activeNoteStudent.fullName}</strong> (NIS: {activeNoteStudent.nis})
                </p>
              </div>

              <button
                onClick={handleGenerateAINote}
                disabled={loadingAI}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingAI ? 'Menyusun...' : 'Bantuan AI Gemini'}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Tuliskan apresiasi perkembangan murid, motivasi kedisiplinan belajar, dan saran tindak lanjut untuk semester depan:
              </p>

              <textarea
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Contoh: Pertahankan prestasi akademik yang sangat memuaskan ini..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 text-xs leading-relaxed"
              />

              {saveSuccess && (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Catatan wali kelas tersimpan!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteStudent(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
