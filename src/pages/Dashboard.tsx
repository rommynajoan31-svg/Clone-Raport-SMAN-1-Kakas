/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageId } from '../components/Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    students,
    teachers,
    classes,
    subjects,
    scores,
    schoolProfile,
    assessmentMethod,
    currentUser,
  } = useApp();

  const [phaseFilter, setPhaseFilter] = useState<'ALL' | 'E' | 'F'>('ALL');

  // Filter students based on phase
  const filteredStudents = students.filter((s) => {
    if (phaseFilter === 'ALL') return true;
    return s.phase === phaseFilter;
  });

  const studentsFaseE = students.filter((s) => s.phase === 'E').length;
  const studentsFaseF = students.filter((s) => s.phase === 'F').length;

  const countKelasX = students.filter((s) => s.grade === 10).length;
  const countKelasXI = students.filter((s) => s.grade === 11).length;
  const countKelasXII = students.filter((s) => s.grade === 12).length;

  // Total possible scores (approximate: students * subjects appropriate for their phase)
  const totalExpectedScores = students.reduce((acc, std) => {
    const applicableSubjects = subjects.filter(
      (sbj) => sbj.phase === std.phase && sbj.grades.includes(std.grade)
    );
    return acc + applicableSubjects.length;
  }, 0);

  // Scores breakdown
  const currentSemesterScores = scores.filter(
    (s) =>
      s.semester === schoolProfile.semesterAktif &&
      s.academicYear === schoolProfile.tahunPelajaranAktif
  );

  const completedScores = currentSemesterScores.filter(
    (s) => s.status === 'FINAL' || s.status === 'DISETUJUI'
  ).length;

  const draftScores = currentSemesterScores.filter((s) => s.status === 'DRAFT').length;
  const pendingScores = currentSemesterScores.filter((s) => s.status === 'MENUNGGU_VERIFIKASI').length;
  const revisionScores = currentSemesterScores.filter((s) => s.status === 'PERLU_PERBAIKAN').length;

  const completionPercentage =
    totalExpectedScores > 0 ? Math.min(100, Math.round((completedScores / totalExpectedScores) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-amber-300 text-xs font-bold border border-blue-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PPA Edisi Revisi 2025 • Kurikulum Merdeka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di RAPOR KAKAS AI
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            Sistem pengolahan asesmen dan pelaporan hasil belajar murid {schoolProfile.namaSekolah}.
            Mendukung otomatisasi perumusan deskripsi capaian kompetensi menggunakan Google Gemini AI secara objektif dan akuntabel.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('score-input')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Input Nilai Asesmen</span>
            </button>
            <button
              onClick={() => onNavigate('ai-generator')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generator AI Capaian</span>
            </button>
            <button
              onClick={() => onNavigate('print-single')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>Pratinjau & Cetak Rapor</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Overview Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Statistik & Kelengkapan</h2>
          <p className="text-xs text-slate-500">
            Pemantauan pengisian nilai semester {schoolProfile.semesterAktif} TA {schoolProfile.tahunPelajaranAktif}
          </p>
        </div>

        {/* Phase Filter buttons */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setPhaseFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              phaseFilter === 'ALL' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Fase ({students.length})
          </button>
          <button
            onClick={() => setPhaseFilter('E')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              phaseFilter === 'E' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fase E: Kelas X ({studentsFaseE})
          </button>
          <button
            onClick={() => setPhaseFilter('F')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              phaseFilter === 'F' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fase F: Kelas XI & XII ({studentsFaseF})
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Murid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Murid Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{filteredStudents.length}</span>
            <span className="text-xs text-slate-500 ml-1">orang</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex gap-2">
            <span>Kelas X: {countKelasX}</span> • <span>XI: {countKelasXI}</span> • <span>XII: {countKelasXII}</span>
          </div>
        </div>

        {/* Guru & Rombel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guru & Rombel</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{teachers.length}</span>
            <span className="text-xs text-slate-500 ml-1">Guru</span>
            <span className="text-slate-300 mx-2">/</span>
            <span className="text-2xl font-black text-slate-900">{classes.length}</span>
            <span className="text-xs text-slate-500 ml-1">Rombel</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {subjects.length} Mata Pelajaran terkonfigurasi
          </p>
        </div>

        {/* Progres Pengisian Nilai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progres Nilai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{completionPercentage}%</span>
            <span className="text-xs text-emerald-600 font-semibold">{completedScores} tuntas</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Rapor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Verifikasi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">{pendingScores}</span>
            <span className="text-xs text-slate-500 ml-1">menunggu verifikasi</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex gap-2">
            <span>Draf: {draftScores}</span> • <span>Perbaikan: {revisionScores}</span>
          </div>
        </div>
      </div>

      {/* Rombel Completion Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Status Kelengkapan per Rombongan Belajar</h3>
            <p className="text-xs text-slate-500">
              Pantau progres nilai yang telah diinput dan disahkan untuk masing-masing kelas
            </p>
          </div>
          <button
            onClick={() => onNavigate('homeroom')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Buka Monitoring</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Nama Rombel</th>
                <th className="px-4 py-3">Tingkat / Fase</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3 text-center">Jumlah Murid</th>
                <th className="px-4 py-3 text-center">Status Nilai</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => {
                const homeroom = teachers.find((t) => t.id === cls.homeroomTeacherId);
                const classStudents = students.filter((s) => s.classId === cls.id);
                const classScores = scores.filter((s) =>
                  classStudents.some((std) => std.id === s.studentId)
                );
                const isComplete = classScores.some((s) => s.status === 'FINAL');

                return (
                  <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{cls.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      Kelas {cls.grade} (Fase {cls.phase})
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {homeroom?.fullName || 'Belum ditugaskan'}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {classStudents.length}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isComplete
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isComplete ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sebagian Tuntas
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" /> Proses Input
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('score-input')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-colors"
                      >
                        Periksa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Method Info & Guidelines Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assessment Formula Config */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Metode Pengolahan Nilai Aktif</span>
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              PPA 2025
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-medium text-slate-800">
              Formula:{' '}
              <span className="font-bold text-blue-700">
                {assessmentMethod.formula === 'WEIGHTED_SUMMATIVE_SAS'
                  ? `Pembobotan Terstruktur (${assessmentMethod.weightSummativeTP}% Sumatif TP + ${assessmentMethod.weightSAS}% SAS)`
                  : 'Rerata Murni Sumatif Lingkup Materi / TP'}
              </span>
            </p>
            <p>
              Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Minimum:{' '}
              <span className="font-bold text-slate-900">{assessmentMethod.kktpMinimum}</span>
            </p>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {assessmentMethod.notes}
            </p>
          </div>
        </div>

        {/* AI Generator Capability Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Asisten AI Capaian Kompetensi</span>
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            Merumuskan deskripsi rapor secara otomatis berdasarkan data bukti TP yang dimasukkan guru.
            Membedakan kompetensi yang tercapai optimal serta aspek yang membutuhkan bimbingan dengan bahasa santun.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
            <span className="text-amber-800 font-medium">Buku Panduan PPA 2025</span>
            <button
              onClick={() => onNavigate('ai-generator')}
              className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>Jalankan AI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
