/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Printer, Users, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RaporSheet } from '../components/RaporSheet';

export const PrintBatchRaporPage: React.FC = () => {
  const { classes, students, schoolProfile, updateSchoolProfile } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Banner (hidden in print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Copy className="w-5 h-5 text-indigo-600" />
            <span>Cetak Rapor Massal Satu Kelas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak buku rapor seluruh murid pada rombel terpilih sekaligus dengan pemisah halaman otomatis (Page-Break).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Semester Aktif
            </label>
            <select
              value={schoolProfile.semesterAktif}
              onChange={(e) => updateSchoolProfile({ semesterAktif: e.target.value as '1' | '2' })}
              className={`border rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                schoolProfile.semesterAktif === '2'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap) ★ Kenaikan</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Pilih Rombongan Belajar
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({students.filter((s) => s.classId === c.id).length} murid)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintAll}
            className="self-end bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Semua ({classStudents.length} Rapor)</span>
          </button>
        </div>
      </div>

      {/* Info notice (hidden in print) */}
      <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Setiap rapor murid dilengkapi jeda halaman otomatis (page-break). Header dan footer bawaan browser (URL & tanggal) otomatis dihilangkan saat mencetak atau memilih "Simpan ke PDF".
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full shrink-0">
          Margin 0mm Standar
        </span>
      </div>

      {/* Batch Sheets Container */}
      <div className="space-y-8 print:space-y-0">
        {classStudents.map((std, idx) => (
          <div key={std.id} className="print:page-break-after-always page-break-after-always">
            <div className="text-center font-bold text-xs text-slate-400 mb-2 print:hidden">
              —— Rapor Murid #{idx + 1}: {std.fullName} (NIS: {std.nis}) ——
            </div>
            <RaporSheet student={std} />
          </div>
        ))}
      </div>
    </div>
  );
};
