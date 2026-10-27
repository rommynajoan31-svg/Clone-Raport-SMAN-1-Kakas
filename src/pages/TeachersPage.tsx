/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Plus, Edit, Trash2, Check, X, Shield, BookOpen, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Teacher, UserRole } from '../types';

export const TeachersPage: React.FC = () => {
  const { teachers, classes, subjects, addTeacher, updateTeacher, deleteTeacher, exportToExcel } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    nip: '',
    fullName: '',
    degree: 'S.Pd.',
    role: 'guru' as UserRole,
    isHomeroom: false,
    homeroomClassId: '',
    status: 'AKTIF' as Teacher['status'],
    assignedSubjects: [] as string[],
    assignedClasses: [] as string[],
  });

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      nip: `198${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      fullName: '',
      degree: 'S.Pd.',
      role: 'guru',
      isHomeroom: false,
      homeroomClassId: '',
      status: 'AKTIF',
      assignedSubjects: [],
      assignedClasses: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      nip: t.nip,
      fullName: t.fullName,
      degree: t.degree,
      role: t.role,
      isHomeroom: t.isHomeroom,
      homeroomClassId: t.homeroomClassId || '',
      status: t.status,
      assignedSubjects: t.assignedSubjects || [],
      assignedClasses: t.assignedClasses || [],
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
    } else {
      addTeacher(formData);
    }
    setIsModalOpen(false);
  };

  const handleExportTeachers = () => {
    const data = teachers.map((t, idx) => {
      const homeroomClass = classes.find((c) => c.id === t.homeroomClassId);
      const teacherSubjects = subjects
        .filter((s) => t.assignedSubjects?.includes(s.id))
        .map((s) => s.name)
        .join(', ');

      return {
        No: idx + 1,
        NIP: t.nip,
        'Nama Lengkap': t.fullName,
        Gelar: t.degree,
        Peran: t.role,
        'Wali Kelas': homeroomClass?.name || 'Bukan Wali Kelas',
        'Mapel Diampu': teacherSubjects || '-',
        Status: t.status,
      };
    });

    exportToExcel(data, 'Data_Guru_SMAN1_Kakas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span>Manajemen Data Guru & Penugasan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar dewan guru SMA Negeri 1 Kakas, pemetaan mata pelajaran yang diampu, dan penugasan wali kelas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportTeachers}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((t) => {
          const homeroomClass = classes.find((c) => c.id === t.homeroomClassId);
          const teacherSubjects = subjects.filter((s) => t.assignedSubjects?.includes(s.id));

          return (
            <div
              key={t.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200">
                    {t.fullName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                    {t.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm">{t.fullName}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">NIP. {t.nip}</p>
                </div>

                {/* Homeroom badge if assigned */}
                {t.isHomeroom && (
                  <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span>Wali Kelas: {homeroomClass?.name || 'Belum dihubungkan'}</span>
                  </div>
                )}

                {/* Assigned Subjects */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Mata Pelajaran Ampu
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {teacherSubjects.length > 0 ? (
                      teacherSubjects.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium"
                        >
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Belum ada penugasan</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600">● {t.status}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Edit Data Guru"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus data guru ${t.fullName}?`)) {
                        deleteTeacher(t.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Guru"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Meyke Supit, S.Pd."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran Aplikasi</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="guru">Guru Mapel</option>
                    <option value="walikelas">Wali Kelas</option>
                    <option value="wakakur">Wakasek Kurikulum</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              {/* Homeroom Assignment */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isHomeroom}
                    onChange={(e) => setFormData({ ...formData, isHomeroom: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Ditugaskan Sebagai Wali Kelas</span>
                </label>

                {formData.isHomeroom && (
                  <div className="mt-2 pl-5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Pilih Kelas Binaan
                    </label>
                    <select
                      value={formData.homeroomClassId}
                      onChange={(e) => setFormData({ ...formData, homeroomClassId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                    >
                      <option value="">-- Pilih Rombel --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Subject Assignment Multi-Check */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran yang Diampu</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
                  {subjects.map((sbj) => {
                    const isChecked = formData.assignedSubjects.includes(sbj.id);
                    return (
                      <label
                        key={sbj.id}
                        className="flex items-center gap-2 p-1 text-slate-800 hover:bg-white rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedSubjects: [...formData.assignedSubjects, sbj.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedSubjects: formData.assignedSubjects.filter((id) => id !== sbj.id),
                              });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px] font-medium">
                          {sbj.name} (Fase {sbj.phase})
                        </span>
                      </label>
                    );
                  })}
                </div>
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
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
