/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { Award, CheckCircle, ShieldCheck } from 'lucide-react';

interface RaporSheetProps {
  student: Student;
  showWatermark?: boolean;
}

export const RaporSheet: React.FC<RaporSheetProps> = ({ student, showWatermark = false }) => {
  const {
    schoolProfile,
    classes,
    subjects,
    teachers,
    scores,
    attendance,
    extracurriculars,
    projects,
    homeroomNotes,
    updateStudent,
  } = useApp();

  const studentClass = classes.find((c) => c.id === student.classId);
  const homeroomTeacher = teachers.find((t) => t.id === studentClass?.homeroomTeacherId);

  // Filter subjects for this student
  // In Fase F, respect elective subjects if defined
  const enrolledSubjects = subjects.filter((s) => {
    if (student.phase === 'E') {
      return s.phase === 'E' && s.grades.includes(student.grade);
    }
    // Fase F: Include common subjects + electives chosen by student
    if (s.phase === 'F' && s.grades.includes(student.grade)) {
      if (s.group === 'PILIHAN' && student.electiveSubjectIds) {
        return student.electiveSubjectIds.includes(s.id);
      }
      return true;
    }
    return false;
  });

  // Group enrolled subjects
  const umumSubjects = enrolledSubjects.filter((s) => s.group === 'A_UMUM');
  const pilihanSubjects = enrolledSubjects.filter((s) => s.group === 'PILIHAN' || s.group === 'B_KEJURUAN_PEMINATAN');
  const mulokSubjects = enrolledSubjects.filter((s) => s.group === 'MULOK');

  // Student scores for this semester
  const studentScoresMap = new Map(
    scores
      .filter(
        (sc) =>
          sc.studentId === student.id &&
          sc.semester === schoolProfile.semesterAktif &&
          sc.academicYear === schoolProfile.tahunPelajaranAktif
      )
      .map((sc) => [sc.subjectId, sc])
  );

  // Student Attendance
  const studentAtt = attendance.find(
    (a) =>
      a.studentId === student.id &&
      a.semester === schoolProfile.semesterAktif &&
      a.academicYear === schoolProfile.tahunPelajaranAktif
  );

  // Student Extracurriculars
  const studentExts = extracurriculars.filter((e) => e.studentId === student.id);

  // Student Cocurricular Projects
  const classProjects = projects.filter((p) => p.classId === student.classId);

  // Homeroom Note
  const studentNote = homeroomNotes.find(
    (n) =>
      n.studentId === student.id &&
      n.semester === schoolProfile.semesterAktif &&
      n.academicYear === schoolProfile.tahunPelajaranAktif
  );

  // Check if all scores are final
  const allFinalized = enrolledSubjects.every((sbj) => {
    const sc = studentScoresMap.get(sbj.id);
    return sc && (sc.status === 'FINAL' || sc.status === 'DISETUJUI');
  });

  // Default promotion decision calculation for Semester Genap
  const getDefaultPromotion = () => {
    if (student.grade === 10) return 'NAIK KE KELAS XI (SEBELAS)';
    if (student.grade === 11) return 'NAIK KE KELAS XII (DUA BELAS)';
    if (student.grade === 12) return 'LULUS DARI SATUAN PENDIDIKAN SMA NEGERI 1 KAKAS';
    return 'NAIK KELAS';
  };

  const currentPromotion = student.promotionDecision || getDefaultPromotion();

  const handleUpdatePromotion = (decision: string) => {
    updateStudent(student.id, { promotionDecision: decision });
  };

  return (
    <div className="bg-white text-slate-900 font-sans p-6 sm:p-10 max-w-[210mm] mx-auto shadow-xl border border-slate-200 rounded-lg print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-xs leading-relaxed relative">
      {/* Official Kop Rapor SMA Negeri 1 Kakas */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center relative">
        <div className="flex items-center justify-between">
          {/* Logo Kiri: Logo Provinsi Sulawesi Utara */}
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            <img
              src={schoolProfile.logoProvinsiUrl || '/assets/aistudio/logo_provinsi-removebg-preview_d8eb1c16.png'}
              alt="Logo Provinsi Sulawesi Utara"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Header Text */}
          <div className="flex-1 px-4 text-center">
            <h4 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Pemerintah Provinsi Sulawesi Utara
            </h4>
            <h4 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
              Dinas Pendidikan Daerah
            </h4>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase my-0.5 font-serif">
              {schoolProfile.namaSekolah}
            </h1>
            <p className="text-[9.5px] text-slate-800 font-medium leading-tight">
              Alamat : Jln. Kakas - Langowan, Kode Pos : 95682, email : smanegeri1kakas1983@gmail.com
            </p>
            <p className="text-[9px] text-slate-600">
              NPSN: {schoolProfile.npsn} • Website: {schoolProfile.website}
            </p>
          </div>

          {/* Logo Kanan: Logo Sekolah SMA Negeri 1 Kakas */}
          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            <img
              src={schoolProfile.logoUrl || '/assets/aistudio/WhatsApp_Image_2025-11-20_at_12.29.19-removebg-preview__1__c9a0a08a.png'}
              alt="Logo SMA Negeri 1 Kakas"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
        <div className="w-full border-b border-slate-900 mt-2"></div>
      </div>

      {/* Rapor Title & Subtitle */}
      <div className="text-center mb-4">
        <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-900 underline decoration-1">
          Laporan Hasil Belajar Murid (Rapor)
        </h2>
        <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
          Kurikulum Merdeka — Berdasarkan Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2025
        </p>
      </div>

      {/* Bagian 1: Identitas Murid & Sekolah */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4 bg-slate-50/80 p-3 rounded border border-slate-300 text-[11px]">
        <div className="space-y-1">
          <div className="flex">
            <span className="w-32 text-slate-600">Nama Peserta Didik</span>
            <span className="w-3">:</span>
            <span className="font-bold text-slate-900 uppercase">{student.fullName}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">NIS / NISN</span>
            <span className="w-3">:</span>
            <span className="font-medium text-slate-800">{student.nis} / {student.nisn}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Sekolah</span>
            <span className="w-3">:</span>
            <span className="font-medium text-slate-800">{schoolProfile.namaSekolah}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Alamat Sekolah</span>
            <span className="w-3">:</span>
            <span className="font-medium text-slate-800">
              {schoolProfile.alamat}, Kode Pos : {schoolProfile.kodePos}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex">
            <span className="w-32 text-slate-600">Kelas / Fase</span>
            <span className="w-3">:</span>
            <span className="font-bold text-slate-900">
              {studentClass?.name || student.grade} / Fase {student.phase}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Semester</span>
            <span className="w-3">:</span>
            <span className="font-medium text-slate-800">
              {schoolProfile.semesterAktif} ({schoolProfile.semesterAktif === '1' ? 'Ganjil' : 'Genap'})
            </span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">Tahun Pelajaran</span>
            <span className="w-3">:</span>
            <span className="font-medium text-slate-800">{schoolProfile.tahunPelajaranAktif}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-600">
              {schoolProfile.semesterAktif === '2' ? 'Keputusan Akhir' : 'Status Belajar'}
            </span>
            <span className="w-3">:</span>
            <span className="font-semibold text-emerald-700">
              {schoolProfile.semesterAktif === '2'
                ? currentPromotion
                : 'Aktif Mengikuti Pembelajaran'}
            </span>
          </div>
        </div>
      </div>

      {/* Bagian 2: Hasil Belajar Intrakurikuler */}
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center justify-between">
          <span>A. Nilai Hasil Belajar Intrakurikuler</span>
          <span className="text-[10px] font-normal text-slate-500 italic">
            Rentang Nilai: 0 - 100 • KKTP: 75
          </span>
        </h3>

        <table className="w-full border-collapse border border-slate-900 text-[10.5px]">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
              <th className="border border-slate-900 px-2 py-1.5 text-center w-8">No</th>
              <th className="border border-slate-900 px-2 py-1.5 text-left w-48">Mata Pelajaran</th>
              <th className="border border-slate-900 px-2 py-1.5 text-center w-14">Nilai Akhir</th>
              <th className="border border-slate-900 px-2 py-1.5 text-left">Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            {/* Kelompok A: Umum */}
            <tr className="bg-slate-50 font-semibold text-slate-800 border-b border-slate-900">
              <td colSpan={4} className="border border-slate-900 px-2 py-1 text-slate-700 bg-slate-200/60">
                Kelompok Mata Pelajaran Umum
              </td>
            </tr>
            {umumSubjects.map((sbj, idx) => {
              const scoreObj = studentScoresMap.get(sbj.id);
              return (
                <tr key={sbj.id} className="border-b border-slate-400">
                  <td className="border border-slate-900 px-2 py-1.5 text-center align-top">{idx + 1}</td>
                  <td className="border border-slate-900 px-2 py-1.5 font-medium align-top">
                    {sbj.name}
                  </td>
                  <td className="border border-slate-900 px-2 py-1.5 text-center font-bold text-slate-900 align-top">
                    {scoreObj?.finalScore !== undefined ? scoreObj.finalScore : '-'}
                  </td>
                  <td className="border border-slate-900 px-2.5 py-1.5 text-justify align-top leading-normal">
                    {scoreObj?.competencyDescription || (
                      <span className="text-slate-400 italic">Deskripsi capaian belum difinalisasi oleh guru pengampu.</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Kelompok Pilihan / Peminatan jika ada */}
            {pilihanSubjects.length > 0 && (
              <>
                <tr className="bg-slate-50 font-semibold text-slate-800 border-b border-slate-900">
                  <td colSpan={4} className="border border-slate-900 px-2 py-1 text-slate-700 bg-slate-200/60">
                    Kelompok Mata Pelajaran Pilihan (Fase F)
                  </td>
                </tr>
                {pilihanSubjects.map((sbj, idx) => {
                  const scoreObj = studentScoresMap.get(sbj.id);
                  return (
                    <tr key={sbj.id} className="border-b border-slate-400">
                      <td className="border border-slate-900 px-2 py-1.5 text-center align-top">{idx + 1}</td>
                      <td className="border border-slate-900 px-2 py-1.5 font-medium align-top">
                        {sbj.name}
                      </td>
                      <td className="border border-slate-900 px-2 py-1.5 text-center font-bold text-slate-900 align-top">
                        {scoreObj?.finalScore !== undefined ? scoreObj.finalScore : '-'}
                      </td>
                      <td className="border border-slate-900 px-2.5 py-1.5 text-justify align-top leading-normal">
                        {scoreObj?.competencyDescription || (
                          <span className="text-slate-400 italic">Deskripsi capaian belum difinalisasi.</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}

            {/* Muatan Lokal */}
            {mulokSubjects.length > 0 && (
              <>
                <tr className="bg-slate-50 font-semibold text-slate-800 border-b border-slate-900">
                  <td colSpan={4} className="border border-slate-900 px-2 py-1 text-slate-700 bg-slate-200/60">
                    Muatan Lokal Daerah
                  </td>
                </tr>
                {mulokSubjects.map((sbj, idx) => {
                  const scoreObj = studentScoresMap.get(sbj.id);
                  return (
                    <tr key={sbj.id} className="border-b border-slate-400">
                      <td className="border border-slate-900 px-2 py-1.5 text-center align-top">{idx + 1}</td>
                      <td className="border border-slate-900 px-2 py-1.5 font-medium align-top">
                        {sbj.name}
                      </td>
                      <td className="border border-slate-900 px-2 py-1.5 text-center font-bold text-slate-900 align-top">
                        {scoreObj?.finalScore !== undefined ? scoreObj.finalScore : '-'}
                      </td>
                      <td className="border border-slate-900 px-2.5 py-1.5 text-justify align-top leading-normal">
                        {scoreObj?.competencyDescription || (
                          <span className="text-slate-400 italic">Deskripsi capaian belum difinalisasi.</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Bagian B: Kegiatan Kokurikuler */}
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center justify-between">
          <span>B. Kegiatan Kokurikuler</span>
          <span className="text-[10px] font-normal text-slate-500 italic">
            Penguatan Karakter, Kolaborasi & Praktik Pembelajaran Nyata
          </span>
        </h3>
        {classProjects.length > 0 ? (
          <table className="w-full border-collapse border border-slate-900 text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900">
                <th className="border border-slate-900 px-2 py-1.5 text-center w-8">No</th>
                <th className="border border-slate-900 px-2 py-1.5 text-left w-56">Kegiatan Kokurikuler</th>
                <th className="border border-slate-900 px-2 py-1.5 text-left">Deskripsi Keterlibatan & Capaian Murid</th>
              </tr>
            </thead>
            <tbody>
              {classProjects.map((prj, idx) => {
                const note = prj.studentNotes?.[student.id] || prj.description;
                return (
                  <tr key={prj.id} className="border-b border-slate-400">
                    <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-medium">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-900 px-2 py-1.5 align-top">
                      <div className="font-bold text-slate-900 leading-snug">{prj.title}</div>
                      <div className="text-[9.5px] text-blue-900 font-medium mt-0.5">
                        Fokus: {prj.theme}
                      </div>
                    </td>
                    <td className="border border-slate-900 px-2.5 py-1.5 text-justify align-top leading-normal">
                      {note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-[10.5px] text-slate-500 italic border border-slate-300 p-2 rounded">
            Kegiatan kokurikuler dicatat secara berkala sesuai kalender akademik satuan pendidikan.
          </p>
        )}
      </div>

      {/* Bagian 4: Ekstrakurikuler & Bagian 5: Ketidakhadiran dalam 2 Kolom Sejajar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Ekstrakurikuler */}
        <div>
          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5">
            C. Ekstrakurikuler
          </h3>
          <table className="w-full border-collapse border border-slate-900 text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900">
                <th className="border border-slate-900 px-2 py-1 text-center w-8">No</th>
                <th className="border border-slate-900 px-2 py-1 text-left">Kegiatan</th>
                <th className="border border-slate-900 px-2 py-1 text-center w-20">Predikat</th>
                <th className="border border-slate-900 px-2 py-1 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {studentExts.length > 0 ? (
                studentExts.map((ext, idx) => (
                  <tr key={ext.id}>
                    <td className="border border-slate-900 px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border border-slate-900 px-2 py-1 font-medium">{ext.activityName}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-semibold text-slate-800">
                      {ext.score.replace('_', ' ')}
                    </td>
                    <td className="border border-slate-900 px-2 py-1">{ext.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-slate-900 px-2 py-2 text-center text-slate-500 italic">
                    Tidak ada kegiatan ekstrakurikuler yang dicatat pada semester ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ketidakhadiran */}
        <div>
          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5">
            D. Ketidakhadiran (Presensi)
          </h3>
          <table className="w-full border-collapse border border-slate-900 text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-900">
                <th className="border border-slate-900 px-3 py-1 text-left">Keterangan</th>
                <th className="border border-slate-900 px-3 py-1 text-center w-24">Jumlah Hari</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-900 px-3 py-1">Sakit</td>
                <td className="border border-slate-900 px-3 py-1 text-center font-bold">
                  {studentAtt?.sakit ?? 0} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 px-3 py-1">Izin</td>
                <td className="border border-slate-900 px-3 py-1 text-center font-bold">
                  {studentAtt?.izin ?? 0} hari
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 px-3 py-1">Tanpa Keterangan</td>
                <td className="border border-slate-900 px-3 py-1 text-center font-bold">
                  {studentAtt?.alpa ?? 0} hari
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian 6: Catatan Wali Kelas */}
      <div className="mb-6">
        <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5">
          E. Catatan Wali Kelas
        </h3>
        <div className="border border-slate-900 p-3 rounded text-[11px] leading-relaxed bg-slate-50/50">
          {studentNote?.note ? (
            <p className="italic text-slate-900 font-serif">
              "{studentNote.note}"
            </p>
          ) : (
            <p className="text-slate-400 italic">
              Belum ada catatan wali kelas yang diisi untuk peserta didik ini.
            </p>
          )}
        </div>
      </div>

      {/* Bagian F: Keterangan Kenaikan Kelas / Kelulusan (Khusus Semester Genap) */}
      {schoolProfile.semesterAktif === '2' && (
        <div className="mb-5 page-break-inside-avoid">
          <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center justify-between">
            <span>F. Keterangan Kenaikan Kelas / Kelulusan</span>
            <span className="text-[10px] font-normal text-slate-500 italic">
              Semester 2 (Genap) Tahun Pelajaran {schoolProfile.tahunPelajaranAktif}
            </span>
          </h3>

          <div className="border-2 border-slate-900 p-3.5 rounded bg-slate-50/70 text-[11px] leading-relaxed">
            {/* Quick interactive selector in preview (hidden in print) */}
            <div className="print:hidden mb-2.5 pb-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                Pilih Keputusan Kenaikan / Kelulusan:
              </span>
              <div className="flex items-center gap-1.5">
                {student.grade === 10 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromotion('NAIK KE KELAS XI (SEBELAS)')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all ${
                        currentPromotion === 'NAIK KE KELAS XI (SEBELAS)'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Naik ke Kelas XI (Sebelas)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromotion('TINGGAL DI KELAS X (SEPULUH)')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all ${
                        currentPromotion === 'TINGGAL DI KELAS X (SEPULUH)'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✗ Tinggal di Kelas X (Sepuluh)
                    </button>
                  </>
                )}
                {student.grade === 11 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromotion('NAIK KE KELAS XII (DUA BELAS)')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all ${
                        currentPromotion === 'NAIK KE KELAS XII (DUA BELAS)'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Naik ke Kelas XII (Dua Belas)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromotion('TINGGAL DI KELAS XI (SEBELAS)')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all ${
                        currentPromotion === 'TINGGAL DI KELAS XI (SEBELAS)'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✗ Tinggal di Kelas XI (Sebelas)
                    </button>
                  </>
                )}
                {student.grade === 12 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromotion('LULUS DARI SATUAN PENDIDIKAN SMA NEGERI 1 KAKAS')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all ${
                        !currentPromotion.startsWith('TIDAK')
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Lulus dari Satuan Pendidikan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromotion('TIDAK LULUS DARI SATUAN PENDIDIKAN SMA NEGERI 1 KAKAS')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all ${
                        currentPromotion.startsWith('TIDAK')
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ✗ Tidak Lulus
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Official Kemendikbudristek Statement */}
            <p className="text-slate-800 font-medium">
              Berdasarkan hasil pembelajaran yang dicapai pada Semester Ganjil dan Semester Genap Tahun Pelajaran {schoolProfile.tahunPelajaranAktif}, serta kriteria kelulusan/kenaikan kelas yang ditetapkan oleh Satuan Pendidikan:
            </p>

            <div className="my-2.5 p-3.5 border border-slate-900 bg-white text-center rounded shadow-xs">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                Keputusan Resmi:
              </span>
              <span className="text-sm font-black tracking-wider text-slate-900 uppercase">
                {currentPromotion}
              </span>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-500 italic pt-0.5">
              <span>* Dicantumkan resmi pada laporan hasil belajar akhir tahun pelajaran (Semester Genap).</span>
              <span>SMA Negeri 1 Kakas</span>
            </div>
          </div>
        </div>
      )}

      {/* Bagian 7: Pengesahan dan Tanda Tangan */}
      <div className="pt-2 text-[11px] page-break-inside-avoid">
        <div className="flex justify-end mb-4 pr-6">
          <p className="font-medium text-slate-800">
            {schoolProfile.tempatPenerbitan}, {schoolProfile.tanggalRapor}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Kolom 1: Orang Tua / Wali */}
          <div className="flex flex-col justify-between h-28">
            <p className="font-medium text-slate-800">Mengetahui,<br />Orang Tua / Wali Murid,</p>
            <div className="border-b border-slate-900 w-36 mx-auto mt-12"></div>
            <p className="text-[10px] text-slate-600">(...........................................)</p>
          </div>

          {/* Kolom 2: Wali Kelas */}
          <div className="flex flex-col justify-between h-28">
            <p className="font-medium text-slate-800">
              Wali Kelas {studentClass?.name || ''},
            </p>
            <div className="mt-12">
              <p className="font-bold underline text-slate-900 uppercase">
                {homeroomTeacher?.fullName || 'Wali Kelas'}
              </p>
              <p className="text-[10px] text-slate-600">
                NIP. {homeroomTeacher?.nip || '-'}
              </p>
            </div>
          </div>

          {/* Kolom 3: Kepala Sekolah */}
          <div className="flex flex-col justify-between h-28">
            <p className="font-medium text-slate-800">
              Kepala SMA Negeri 1 Kakas,
            </p>
            <div className="mt-12">
              <p className="font-bold underline text-slate-900 uppercase">
                {schoolProfile.namaKepalaSekolah}
              </p>
              <p className="text-[10px] text-slate-600">
                NIP. {schoolProfile.nipKepalaSekolah}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer validation stamp */}
      <div className="mt-8 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
        <span>Dokumen Resmi Rapor SMA Negeri 1 Kakas • Kurikulum Merdeka PPA 2025</span>
        <span className="flex items-center gap-1 font-semibold text-blue-900">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Status Data: {allFinalized ? 'Telah Difinalisasi & Sah' : 'Draf Verifikasi'}
        </span>
      </div>
    </div>
  );
};
