/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BarChart3, Download, Filter, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RecapScorePage: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    scores,
    attendance,
    schoolProfile,
    assessmentMethod,
    exportToExcel,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Applicable subjects for this class
  const classSubjects = subjects.filter(
    (s) => selectedClass && s.phase === selectedClass.phase && s.grades.includes(selectedClass.grade)
  );

  // Students in class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Scores map
  const scoresMap = new Map(
    scores
      .filter(
        (s) =>
          s.semester === schoolProfile.semesterAktif &&
          s.academicYear === schoolProfile.tahunPelajaranAktif
      )
      .map((s) => [`${s.studentId}_${s.subjectId}`, s])
  );

  // Export Leger to Excel
  const handleExportLeger = () => {
    if (!selectedClass) return;

    const data = classStudents.map((std, idx) => {
      const row: any = {
        No: idx + 1,
        NIS: std.nis,
        NISN: std.nisn,
        'Nama Murid': std.fullName,
      };

      let totalScore = 0;
      let count = 0;

      classSubjects.forEach((sbj) => {
        const sc = scoresMap.get(`${std.id}_${sbj.id}`);
        if (sc?.finalScore !== undefined) {
          row[sbj.name] = sc.finalScore;
          totalScore += sc.finalScore;
          count++;
        } else {
          row[sbj.name] = '-';
        }
      });

      const avg = count > 0 ? (totalScore / count).toFixed(1) : '-';
      row['Rata-rata Nilai'] = avg;

      const att = attendance.find((a) => a.studentId === std.id);
      row['Sakit'] = att?.sakit || 0;
      row['Izin'] = att?.izin || 0;
      row['Alpa'] = att?.alpa || 0;

      return row;
    });

    exportToExcel(
      data,
      `Leger_Nilai_${selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_')}_Sem${schoolProfile.semesterAktif}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Rekapitulasi & Leger Nilai Rapor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriks nilai akhir seluruh mata pelajaran per rombel, rekapitulasi rata-rata dan presensi kehadiran.
          </p>
        </div>

        <button
          onClick={handleExportLeger}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Leger Excel</span>
        </button>
      </div>

      {/* Filter Rombel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700">Pilih Rombongan Belajar:</label>
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

        <span className="text-xs text-slate-500 ml-auto hidden sm:block">
          KKTP Minimum: <strong className="text-blue-700">{assessmentMethod.kktpMinimum}</strong>
        </span>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3 text-center w-10">No</th>
                <th className="px-4 py-3 min-w-[180px]">Nama Murid</th>
                {classSubjects.map((sbj) => (
                  <th
                    key={sbj.id}
                    className="px-2 py-3 text-center min-w-[70px]"
                    title={sbj.name}
                  >
                    <div className="font-mono text-slate-900">{sbj.code}</div>
                    <div className="text-[9px] text-slate-400 font-normal truncate max-w-[65px]">
                      {sbj.name}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center bg-blue-50/60 text-blue-900 min-w-[75px]">
                  Rerata
                </th>
                <th className="px-2 py-3 text-center w-10 text-slate-500" title="Sakit">S</th>
                <th className="px-2 py-3 text-center w-10 text-slate-500" title="Izin">I</th>
                <th className="px-2 py-3 text-center w-10 text-slate-500" title="Alpa / Tanpa Keterangan">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((std, idx) => {
                let totalScore = 0;
                let scoreCount = 0;

                const att = attendance.find(
                  (a) =>
                    a.studentId === std.id &&
                    a.semester === schoolProfile.semesterAktif &&
                    a.academicYear === schoolProfile.tahunPelajaranAktif
                );

                return (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{std.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {std.nis}</div>
                    </td>

                    {classSubjects.map((sbj) => {
                      const sc = scoresMap.get(`${std.id}_${sbj.id}`);
                      const val = sc?.finalScore;
                      if (val !== undefined) {
                        totalScore += val;
                        scoreCount++;
                      }
                      const isLow = val !== undefined && val < assessmentMethod.kktpMinimum;

                      return (
                        <td
                          key={sbj.id}
                          className={`px-2 py-2.5 text-center font-bold text-xs ${
                            val === undefined
                              ? 'text-slate-300'
                              : isLow
                              ? 'text-red-600 bg-red-50/30'
                              : 'text-slate-800'
                          }`}
                        >
                          {val !== undefined ? val : '-'}
                        </td>
                      );
                    })}

                    {/* Average */}
                    <td className="px-3 py-2.5 text-center bg-blue-50/20 font-black text-blue-900">
                      {scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '-'}
                    </td>

                    {/* Attendance S/I/A */}
                    <td className="px-2 py-2.5 text-center font-medium text-slate-600">
                      {att?.sakit ?? 0}
                    </td>
                    <td className="px-2 py-2.5 text-center font-medium text-slate-600">
                      {att?.izin ?? 0}
                    </td>
                    <td className="px-2 py-2.5 text-center font-bold text-red-600">
                      {att?.alpa ?? 0}
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
