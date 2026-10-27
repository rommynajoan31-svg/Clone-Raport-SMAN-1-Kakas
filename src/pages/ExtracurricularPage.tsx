/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Palette, Award, Plus, Trash2, Edit, Check, X, Users, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CocurricularProject, ExtracurricularRecord } from '../types';

export const ExtracurricularPage: React.FC = () => {
  const {
    classes,
    students,
    projects,
    extracurriculars,
    saveProject,
    addExtracurricular,
    deleteExtracurricular,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'KOKURIKULER' | 'EKSKUL'>('KOKURIKULER');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Kokurikuler Modal
  const [isKokurikulerModalOpen, setIsKokurikulerModalOpen] = useState(false);
  const [kokurikulerFormData, setKokurikulerFormData] = useState({
    title: '',
    theme: 'Kearifan Lokal Minahasa',
    dimensions: ['Gotong Royong', 'Bernalar Kritis'],
    description: '',
  });

  // Ekskul Modal
  const [isEkskulModalOpen, setIsEkskulModalOpen] = useState(false);
  const [ekskulFormData, setEkskulFormData] = useState({
    studentId: classStudents[0]?.id || '',
    activityName: 'Praja Muda Karana (Pramuka)',
    score: 'SANGAT_BAIK' as const,
    description: 'Aktif dan menunjukkan kedisiplinan tinggi dalam kegiatan rutin.',
  });

  const classProjects = projects.filter((p) => p.classId === selectedClassId);

  const handleSaveKokurikuler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kokurikulerFormData.title) return;

    saveProject({
      id: `prj_${Date.now()}`,
      classId: selectedClassId,
      title: kokurikulerFormData.title,
      theme: kokurikulerFormData.theme,
      dimensions: kokurikulerFormData.dimensions,
      description: kokurikulerFormData.description,
      studentNotes: {},
    });

    setIsKokurikulerModalOpen(false);
    setKokurikulerFormData({
      title: '',
      theme: 'Kearifan Lokal Minahasa',
      dimensions: ['Gotong Royong', 'Bernalar Kritis'],
      description: '',
    });
  };

  const handleSaveEkskul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ekskulFormData.activityName) return;

    addExtracurricular(ekskulFormData);
    setIsEkskulModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <span>Kegiatan Kokurikuler & Ekstrakurikuler</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelaporan kegiatan kokurikuler dan pencapaian kegiatan ekstrakurikuler murid SMA Negeri 1 Kakas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'KOKURIKULER' ? (
            <button
              onClick={() => setIsKokurikulerModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan Kokurikuler</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEkskulModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Ekstrakurikuler</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Class filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('KOKURIKULER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'KOKURIKULER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Kegiatan Kokurikuler
          </button>
          <button
            onClick={() => setActiveTab('EKSKUL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'EKSKUL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Ekstrakurikuler Murid
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Pilih Rombel:</label>
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

      {/* Tab Content 1: Kokurikuler */}
      {activeTab === 'KOKURIKULER' && (
        <div className="space-y-4">
          {classProjects.length > 0 ? (
            classProjects.map((prj) => (
              <div
                key={prj.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                      Fokus / Tema: {prj.theme}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{prj.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{prj.description}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1 self-center">
                    Fokus Pengembangan Karakter:
                  </span>
                  {prj.dimensions.map((dim, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              Belum ada kegiatan kokurikuler yang dicatat untuk rombel ini. Klik tombol di atas untuk menambahkan.
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Ekskul */}
      {activeTab === 'EKSKUL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3">Nama Murid</th>
                  <th className="px-4 py-3">Nama Kegiatan Ekstrakurikuler</th>
                  <th className="px-4 py-3 text-center w-28">Predikat</th>
                  <th className="px-4 py-3">Keterangan / Capaian</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((std, idx) => {
                  const studentExts = extracurriculars.filter((e) => e.studentId === std.id);

                  if (studentExts.length === 0) {
                    return (
                      <tr key={std.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{std.fullName}</td>
                        <td colSpan={3} className="px-4 py-3 text-slate-400 italic">
                          Belum ada catatan kegiatan ekstrakurikuler
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setEkskulFormData({ ...ekskulFormData, studentId: std.id });
                              setIsEkskulModalOpen(true);
                            }}
                            className="text-xs text-blue-600 font-semibold hover:underline"
                          >
                            + Tambah
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return studentExts.map((ext, extIdx) => (
                    <tr key={ext.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-center text-slate-400 font-medium">
                        {extIdx === 0 ? idx + 1 : ''}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {extIdx === 0 ? std.fullName : ''}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{ext.activityName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ext.score.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ext.description}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteExtracurricular(ext.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kokurikuler Modal */}
      {isKokurikulerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Tambah Kegiatan Kokurikuler</h3>
              <button onClick={() => setIsKokurikulerModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKokurikuler} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fokus / Tema Pembelajaran Kokurikuler</label>
                <select
                  value={kokurikulerFormData.theme}
                  onChange={(e) => setKokurikulerFormData({ ...kokurikulerFormData, theme: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="Kearifan Lokal Minahasa">Kearifan Lokal Minahasa</option>
                  <option value="Gaya Hidup Berkelanjutan">Gaya Hidup Berkelanjutan</option>
                  <option value="Suara Demokrasi">Suara Demokrasi</option>
                  <option value="Kewirausahaan">Kewirausahaan</option>
                  <option value="Bangunlah Jiwa dan Raganya">Bangunlah Jiwa dan Raganya</option>
                  <option value="Rekayasa dan Teknologi">Rekayasa dan Teknologi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Kegiatan Kokurikuler</label>
                <input
                  type="text"
                  required
                  value={kokurikulerFormData.title}
                  onChange={(e) => setKokurikulerFormData({ ...kokurikulerFormData, title: e.target.value })}
                  placeholder="Contoh: Pengolahan Eceng Gondok Danau Tondano"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi & Tujuan Kegiatan</label>
                <textarea
                  rows={3}
                  value={kokurikulerFormData.description}
                  onChange={(e) => setKokurikulerFormData({ ...kokurikulerFormData, description: e.target.value })}
                  placeholder="Penjelasan ringkas aktivitas kokurikuler yang dilakukan murid..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKokurikulerModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Simpan Kegiatan Kokurikuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ekskul Modal */}
      {isEkskulModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Catat Kegiatan Ekstrakurikuler</h3>
              <button onClick={() => setIsEkskulModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEkskul} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Murid</label>
                <select
                  value={ekskulFormData.studentId}
                  onChange={(e) => setEkskulFormData({ ...ekskulFormData, studentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  {classStudents.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.fullName} ({std.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan Ekstrakurikuler</label>
                <input
                  type="text"
                  required
                  value={ekskulFormData.activityName}
                  onChange={(e) => setEkskulFormData({ ...ekskulFormData, activityName: e.target.value })}
                  placeholder="Contoh: Praja Muda Karana (Pramuka)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Predikat / Nilai</label>
                <select
                  value={ekskulFormData.score}
                  onChange={(e) => setEkskulFormData({ ...ekskulFormData, score: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="SANGAT_BAIK">Sangat Baik</option>
                  <option value="BAIK">Baik</option>
                  <option value="CUKUP">Cukup</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Deskripsi Capaian</label>
                <textarea
                  rows={3}
                  value={ekskulFormData.description}
                  onChange={(e) => setEkskulFormData({ ...ekskulFormData, description: e.target.value })}
                  placeholder="Aktif dan menunjukkan kedisiplinan serta kepemimpinan tinggi..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEkskulModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Simpan Ekstrakurikuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
