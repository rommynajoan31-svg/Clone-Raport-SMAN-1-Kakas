/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Check, X, Target, Layers, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, LearningObjective } from '../types';

export const SubjectsPage: React.FC = () => {
  const { subjects, teachers, addSubject, updateSubject, deleteSubject, exportToExcel } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'E' | 'F' | 'MULOK'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects[0] || null);

  // Subject Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // TP Modal State
  const [isTPModalOpen, setIsTPModalOpen] = useState(false);
  const [editingTP, setEditingTP] = useState<LearningObjective | null>(null);

  // Form Subject State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    group: 'A_UMUM' as Subject['group'],
    phase: 'E' as 'E' | 'F',
    grades: [10],
    teacherId: teachers[0]?.id || '',
    status: 'AKTIF' as Subject['status'],
  });

  // Form TP State
  const [tpFormData, setTpFormData] = useState({
    code: 'TP.1',
    description: '',
    scopeOfMaterial: '',
    minimumScore: 75,
  });

  const filteredSubjects = subjects.filter((s) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'MULOK') return s.group === 'MULOK';
    return s.phase === activeTab;
  });

  const openAddSubject = () => {
    setEditingSubject(null);
    setFormData({
      code: 'MAPEL-01',
      name: '',
      group: 'A_UMUM',
      phase: 'E',
      grades: [10],
      teacherId: teachers[0]?.id || '',
      status: 'AKTIF',
    });
    setIsModalOpen(true);
  };

  const openEditSubject = (sbj: Subject) => {
    setEditingSubject(sbj);
    setFormData({
      code: sbj.code,
      name: sbj.name,
      group: sbj.group,
      phase: sbj.phase,
      grades: sbj.grades,
      teacherId: sbj.teacherId,
      status: sbj.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
      if (selectedSubject?.id === editingSubject.id) {
        setSelectedSubject({ ...selectedSubject, ...formData });
      }
    } else {
      const created = addSubject({
        ...formData,
        learningObjectives: [
          {
            id: `tp_${Date.now()}`,
            code: 'TP.1',
            description: `Memahami konsep dasar materi pokok ${formData.name}.`,
            scopeOfMaterial: 'Materi Pokok 1',
            minimumScore: 75,
          },
        ],
      });
      setSelectedSubject(created);
    }
    setIsModalOpen(false);
  };

  // Add or Edit TP for selectedSubject
  const openAddTP = () => {
    if (!selectedSubject) return;
    setEditingTP(null);
    const nextNum = (selectedSubject.learningObjectives?.length || 0) + 1;
    setTpFormData({
      code: `TP.${nextNum}`,
      description: '',
      scopeOfMaterial: '',
      minimumScore: 75,
    });
    setIsTPModalOpen(true);
  };

  const openEditTP = (tp: LearningObjective) => {
    setEditingTP(tp);
    setTpFormData({
      code: tp.code,
      description: tp.description,
      scopeOfMaterial: tp.scopeOfMaterial,
      minimumScore: tp.minimumScore || 75,
    });
    setIsTPModalOpen(true);
  };

  const handleSaveTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !tpFormData.description) return;

    let updatedTPs: LearningObjective[] = [];
    if (editingTP) {
      updatedTPs = (selectedSubject.learningObjectives || []).map((t) =>
        t.id === editingTP.id ? { ...t, ...tpFormData } : t
      );
    } else {
      const newTP: LearningObjective = {
        id: `tp_${Date.now()}`,
        ...tpFormData,
      };
      updatedTPs = [...(selectedSubject.learningObjectives || []), newTP];
    }

    updateSubject(selectedSubject.id, { learningObjectives: updatedTPs });
    setSelectedSubject({ ...selectedSubject, learningObjectives: updatedTPs });
    setIsTPModalOpen(false);
  };

  const handleDeleteTP = (tpId: string) => {
    if (!selectedSubject) return;
    if (confirm('Hapus Tujuan Pembelajaran ini?')) {
      const updatedTPs = (selectedSubject.learningObjectives || []).filter((t) => t.id !== tpId);
      updateSubject(selectedSubject.id, { learningObjectives: updatedTPs });
      setSelectedSubject({ ...selectedSubject, learningObjectives: updatedTPs });
    }
  };

  const handleExportSubjects = () => {
    const data: any[] = [];
    subjects.forEach((s) => {
      const teacher = teachers.find((t) => t.id === s.teacherId);
      if (s.learningObjectives && s.learningObjectives.length > 0) {
        s.learningObjectives.forEach((tp) => {
          data.push({
            'Kode Mapel': s.code,
            'Nama Mata Pelajaran': s.name,
            Fase: s.phase,
            Kelompok: s.group,
            'Guru Pengampu': teacher?.fullName || '-',
            'Kode TP': tp.code,
            'Lingkup Materi': tp.scopeOfMaterial,
            'Tujuan Pembelajaran': tp.description,
            'KKTP Minimum': tp.minimumScore || 75,
          });
        });
      } else {
        data.push({
          'Kode Mapel': s.code,
          'Nama Mata Pelajaran': s.name,
          Fase: s.phase,
          Kelompok: s.group,
          'Guru Pengampu': teacher?.fullName || '-',
          'Kode TP': '-',
          'Lingkup Materi': '-',
          'Tujuan Pembelajaran': 'Belum ada TP',
          'KKTP Minimum': 75,
        });
      }
    });

    exportToExcel(data, 'Struktur_Kurikulum_Mapel_TP_SMAN1_Kakas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Mata Pelajaran & Tujuan Pembelajaran (TP)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur kurikulum Fase E (Kelas X) & Fase F (Kelas XI, XII), pembagian kelompok umum/pilihan, serta lingkup materi TP.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportSubjects}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={openAddSubject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Mapel ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('E')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'E' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fase E (Kelas X)
        </button>
        <button
          onClick={() => setActiveTab('F')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'F' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fase F (Pilihan Kelas XI & XII)
        </button>
        <button
          onClick={() => setActiveTab('MULOK')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'MULOK' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Muatan Lokal Minahasa
        </button>
      </div>

      {/* 2-Column: Left (Subjects List), Right (TP Details & Objectives) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subjects List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Daftar Mata Pelajaran</span>
            <span className="text-[10px] text-slate-500">{filteredSubjects.length} mapel</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto p-2 space-y-1">
            {filteredSubjects.map((s) => {
              const isSelected = selectedSubject?.id === s.id;
              const teacher = teachers.find((t) => t.id === s.teacherId);

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSubject(s)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          {s.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            s.phase === 'E'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          Fase {s.phase}
                        </span>
                        {s.group === 'PILIHAN' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Pilihan
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{s.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Guru Pengampu: {teacher?.fullName || 'Belum ditugaskan'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditSubject(s);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit Mapel"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus mata pelajaran ${s.name}?`)) {
                            deleteSubject(s.id);
                            if (selectedSubject?.id === s.id) setSelectedSubject(null);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{s.learningObjectives?.length || 0} Tujuan Pembelajaran</span>
                    <span className="text-emerald-700 font-semibold">● {s.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Learning Objectives (TP) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {selectedSubject ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      [{selectedSubject.code}]
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      Fase {selectedSubject.phase}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{selectedSubject.name}</h3>
                  <p className="text-xs text-slate-500">
                    Tujuan Pembelajaran digunakan untuk penilaian sumatif lingkup materi dan dasar perumusan deskripsi rapor AI.
                  </p>
                </div>

                <button
                  onClick={openAddTP}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah TP</span>
                </button>
              </div>

              {/* TP List */}
              <div className="space-y-3">
                {selectedSubject.learningObjectives && selectedSubject.learningObjectives.length > 0 ? (
                  selectedSubject.learningObjectives.map((tp, idx) => (
                    <div
                      key={tp.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs font-mono">
                            {tp.code}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                              Lingkup Materi: {tp.scopeOfMaterial || 'Materi Pokok'}
                            </span>
                            <p className="text-xs text-slate-900 font-medium mt-1 leading-relaxed">
                              {tp.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditTP(tp)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Edit TP"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTP(tp.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Hapus TP"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Kriteria Minimal: KKTP ≥ {tp.minimumScore || 75}</span>
                        <span className="text-slate-400">Digunakan pada Asesmen Sumatif</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl">
                    Belum ada Tujuan Pembelajaran yang ditambahkan. Klik "Tambah TP" di atas untuk menambahkan.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Pilih salah satu mata pelajaran di sebelah kiri untuk melihat dan mengelola Tujuan Pembelajaran.
            </div>
          )}
        </div>
      </div>

      {/* Modal Subject */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: MAT-10"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={formData.phase}
                    onChange={(e) => {
                      const p = e.target.value as 'E' | 'F';
                      setFormData({
                        ...formData,
                        phase: p,
                        grades: p === 'E' ? [10] : [11, 12],
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="E">Fase E (Kelas X)</option>
                    <option value="F">Fase F (Kelas XI, XII)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Matematika Lanjut"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelompok Mapel</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="A_UMUM">Umum</option>
                    <option value="PILIHAN">Pilihan (Fase F)</option>
                    <option value="MULOK">Muatan Lokal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guru Pengampu Utama</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal TP */}
      {isTPModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTP ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran (TP)'}
              </h3>
              <button onClick={() => setIsTPModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTP} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode TP</label>
                  <input
                    type="text"
                    required
                    value={tpFormData.code}
                    onChange={(e) => setTpFormData({ ...tpFormData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KKTP Minimum</label>
                  <input
                    type="number"
                    value={tpFormData.minimumScore}
                    onChange={(e) => setTpFormData({ ...tpFormData, minimumScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lingkup Materi Pokok</label>
                <input
                  type="text"
                  required
                  value={tpFormData.scopeOfMaterial}
                  onChange={(e) => setTpFormData({ ...tpFormData, scopeOfMaterial: e.target.value })}
                  placeholder="Contoh: Eksponen dan Logaritma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rumusan Tujuan Pembelajaran (TP)</label>
                <textarea
                  rows={3}
                  required
                  value={tpFormData.description}
                  onChange={(e) => setTpFormData({ ...tpFormData, description: e.target.value })}
                  placeholder="Menjelaskan dan menerapkan konsep..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTPModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Simpan TP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
