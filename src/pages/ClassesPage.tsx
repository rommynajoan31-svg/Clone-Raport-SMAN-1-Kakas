/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, Users, UserCheck, X, Download, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassRoom } from '../types';

export const ClassesPage: React.FC = () => {
  const { classes, teachers, students, addClass, updateClass, deleteClass, exportToExcel } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [viewingClassStudents, setViewingClassStudents] = useState<ClassRoom | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    grade: 10 as 10 | 11 | 12,
    phase: 'E' as 'E' | 'F',
    academicYear: '2026/2027',
    homeroomTeacherId: teachers[0]?.id || '',
  });

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      name: 'X-C (Fase E)',
      grade: 10,
      phase: 'E',
      academicYear: '2026/2027',
      homeroomTeacherId: teachers[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassRoom) => {
    setEditingClass(c);
    setFormData({
      name: c.name,
      grade: c.grade,
      phase: c.phase,
      academicYear: c.academicYear,
      homeroomTeacherId: c.homeroomTeacherId,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingClass) {
      updateClass(editingClass.id, formData);
    } else {
      addClass(formData);
    }
    setIsModalOpen(false);
  };

  const handleExportClasses = () => {
    const data = classes.map((c, idx) => {
      const homeroom = teachers.find((t) => t.id === c.homeroomTeacherId);
      const studentCount = students.filter((s) => s.classId === c.id).length;

      return {
        No: idx + 1,
        'Nama Rombel': c.name,
        'Tingkat Kelas': c.grade,
        Fase: c.phase,
        'Tahun Pelajaran': c.academicYear,
        'Wali Kelas': homeroom?.fullName || '-',
        'Jumlah Murid': studentCount,
      };
    });

    exportToExcel(data, 'Data_Rombongan_Belajar_SMAN1_Kakas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Rombongan Belajar (Rombel)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kelas Fase E (Kelas X) dan Fase F (Kelas XI, XII) beserta wali kelas pembina.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportClasses}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rombel</span>
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const homeroom = teachers.find((t) => t.id === cls.homeroomTeacherId);
          const classStudents = students.filter((s) => s.classId === cls.id);

          return (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 font-black flex items-center justify-center text-sm border border-blue-200">
                    {cls.grade}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      cls.phase === 'E'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    Fase {cls.phase}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-base">{cls.name}</h3>
                  <p className="text-xs text-slate-500">Tahun Pelajaran: {cls.academicYear}</p>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      Wali Kelas:{' '}
                      <strong className="text-slate-900">{homeroom?.fullName || '-'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Jumlah Murid: <strong className="text-slate-900">{classStudents.length}</strong> orang
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setViewingClassStudents(cls)}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Daftar Murid</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cls)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Rombel"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus rombel ${cls.name}?`)) {
                        deleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Rombel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingClass ? 'Edit Rombongan Belajar' : 'Tambah Rombel Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Rombongan Belajar</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: X-A (Fase E)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => {
                      const g = Number(e.target.value) as 10 | 11 | 12;
                      setFormData({
                        ...formData,
                        grade: g,
                        phase: g === 10 ? 'E' : 'F',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  >
                    <option value={10}>Kelas 10 (Fase E)</option>
                    <option value={11}>Kelas 11 (Fase F)</option>
                    <option value={12}>Kelas 12 (Fase F)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <input
                    type="text"
                    disabled
                    value={`Fase ${formData.phase}`}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Wali Kelas</label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Students Roster Modal */}
      {viewingClassStudents && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Daftar Murid: {viewingClassStudents.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Tingkat {viewingClassStudents.grade} (Fase {viewingClassStudents.phase}) •{' '}
                  {students.filter((s) => s.classId === viewingClassStudents.id).length} murid terdaftar
                </p>
              </div>
              <button
                onClick={() => setViewingClassStudents(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2 text-center w-10">No</th>
                    <th className="px-3 py-2">NIS / NISN</th>
                    <th className="px-3 py-2">Nama Lengkap</th>
                    <th className="px-3 py-2 text-center">JK</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter((s) => s.classId === viewingClassStudents.id).length > 0 ? (
                    students
                      .filter((s) => s.classId === viewingClassStudents.id)
                      .map((std, idx) => (
                        <tr key={std.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-mono text-[11px]">{std.nis}</td>
                          <td className="px-3 py-2 font-semibold text-slate-900">{std.fullName}</td>
                          <td className="px-3 py-2 text-center">{std.gender}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {std.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada murid yang didaftarkan pada rombel ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end mt-4">
              <button
                onClick={() => setViewingClassStudents(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
