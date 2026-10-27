/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalendarCheck, Save, CheckCircle, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AttendancePage: React.FC = () => {
  const { classes, students, attendance, schoolProfile, updateAttendance } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Local draft state for attendance
  const [attDraft, setAttDraft] = useState<
    Record<string, { sakit: number; izin: number; alpa: number; verified: boolean }>
  >({});

  // Sync draft when class changes
  React.useEffect(() => {
    const draft: typeof attDraft = {};
    classStudents.forEach((std) => {
      const existing = attendance.find(
        (a) =>
          a.studentId === std.id &&
          a.semester === schoolProfile.semesterAktif &&
          a.academicYear === schoolProfile.tahunPelajaranAktif
      );
      draft[std.id] = {
        sakit: existing?.sakit || 0,
        izin: existing?.izin || 0,
        alpa: existing?.alpa || 0,
        verified: existing?.verified ?? true,
      };
    });
    setAttDraft(draft);
  }, [selectedClassId, schoolProfile, attendance]);

  const handleChange = (studentId: string, field: 'sakit' | 'izin' | 'alpa', val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setAttDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: num,
      },
    }));
  };

  const [saveSuccess, setSaveSuccess] = useState(false);
  const handleSaveAll = () => {
    classStudents.forEach((std) => {
      const row = attDraft[std.id];
      if (!row) return;

      updateAttendance({
        studentId: std.id,
        academicYear: schoolProfile.tahunPelajaranAktif,
        semester: schoolProfile.semesterAktif,
        sakit: row.sakit,
        izin: row.izin,
        alpa: row.alpa,
        verified: true,
      });
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>Presensi & Rekapitulasi Ketidakhadiran</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data absensi (Sakit, Izin, Tanpa Keterangan) yang akan dicetak pada buku rapor semester.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Presensi Kelas</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Rombongan Belajar:</label>
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

        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Presensi berhasil diperbarui!</span>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama Lengkap Murid</th>
                <th className="px-4 py-3 text-center">NIS</th>
                <th className="px-4 py-3 text-center w-28 bg-blue-50/50">Sakit (Hari)</th>
                <th className="px-4 py-3 text-center w-28 bg-amber-50/50">Izin (Hari)</th>
                <th className="px-4 py-3 text-center w-28 bg-red-50/50">Tanpa Keterangan (Hari)</th>
                <th className="px-4 py-3 text-center">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((std, idx) => {
                const row = attDraft[std.id] || { sakit: 0, izin: 0, alpa: 0, verified: true };
                return (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{std.fullName}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-500">{std.nis}</td>
                    <td className="px-4 py-3 text-center bg-blue-50/10">
                      <input
                        type="number"
                        min="0"
                        value={row.sakit}
                        onChange={(e) => handleChange(std.id, 'sakit', e.target.value)}
                        className="w-16 text-center py-1 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-center bg-amber-50/10">
                      <input
                        type="number"
                        min="0"
                        value={row.izin}
                        onChange={(e) => handleChange(std.id, 'izin', e.target.value)}
                        className="w-16 text-center py-1 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-center bg-red-50/10">
                      <input
                        type="number"
                        min="0"
                        value={row.alpa}
                        onChange={(e) => handleChange(std.id, 'alpa', e.target.value)}
                        className="w-16 text-center py-1 rounded-lg border border-red-300 bg-red-50/30 text-red-900 font-bold text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi
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
