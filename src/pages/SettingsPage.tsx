/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, Check, School, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const {
    schoolProfile,
    assessmentMethod,
    updateSchoolProfile,
    updateAssessmentMethod,
    resetAllData,
  } = useApp();

  const [profileForm, setProfileForm] = useState({ ...schoolProfile });
  const [methodForm, setMethodForm] = useState({ ...assessmentMethod });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify weights sum to 100% if weighted formula
    if (methodForm.formula === 'WEIGHTED_SUMMATIVE_SAS') {
      const sum = Number(methodForm.weightSummativeTP) + Number(methodForm.weightSAS);
      if (sum !== 100) {
        alert(`Jumlah bobot harus bernilai 100%. Saat ini: ${sum}%. Harap sesuaikan.`);
        return;
      }
    }

    updateSchoolProfile(profileForm);
    updateAssessmentMethod(methodForm);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Pengaturan Sekolah & Metode Penilaian</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas satuan pendidikan, kepala sekolah, tanggal penerbitan rapor, serta rumus asesmen PPA 2025.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Identitas Sekolah */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-blue-900 font-bold text-sm">
            <School className="w-4 h-4 text-blue-600" />
            <span>Identitas Satuan Pendidikan & Kop Rapor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                required
                value={profileForm.namaSekolah}
                onChange={(e) => setProfileForm({ ...profileForm, namaSekolah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NPSN</label>
              <input
                type="text"
                required
                value={profileForm.npsn}
                onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={profileForm.alamat}
                onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={profileForm.kecamatan}
                onChange={(e) => setProfileForm({ ...profileForm, kecamatan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={profileForm.kabupaten}
                onChange={(e) => setProfileForm({ ...profileForm, kabupaten: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={profileForm.provinsi}
                onChange={(e) => setProfileForm({ ...profileForm, provinsi: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={profileForm.kodePos}
                onChange={(e) => setProfileForm({ ...profileForm, kodePos: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website Resmi</label>
              <input
                type="text"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          {/* Logo Kop Rapor */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs mb-3">Logo Kop Rapor Resmi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src={profileForm.logoProvinsiUrl || '/assets/aistudio/logo_provinsi-removebg-preview_d8eb1c16.png'}
                    alt="Logo Provinsi"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 text-[11px] mb-0.5">Logo Kiri: Provinsi Sulawesi Utara</label>
                  <input
                    type="text"
                    value={profileForm.logoProvinsiUrl || '/assets/aistudio/logo_provinsi-removebg-preview_d8eb1c16.png'}
                    onChange={(e) => setProfileForm({ ...profileForm, logoProvinsiUrl: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src={profileForm.logoUrl || '/assets/aistudio/WhatsApp_Image_2025-11-20_at_12.29.19-removebg-preview__1__c9a0a08a.png'}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 text-[11px] mb-0.5">Logo Kanan: SMA Negeri 1 Kakas</label>
                  <input
                    type="text"
                    value={profileForm.logoUrl || '/assets/aistudio/WhatsApp_Image_2025-11-20_at_12.29.19-removebg-preview__1__c9a0a08a.png'}
                    onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kepala Sekolah & Penandatanganan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-blue-900 font-bold text-sm">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Pejabat Penandatangan & Titimangsa Rapor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah & Gelar</label>
              <input
                type="text"
                required
                value={profileForm.namaKepalaSekolah}
                onChange={(e) => setProfileForm({ ...profileForm, namaKepalaSekolah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={profileForm.nipKepalaSekolah}
                onChange={(e) => setProfileForm({ ...profileForm, nipKepalaSekolah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tempat Penerbitan Rapor</label>
              <input
                type="text"
                value={profileForm.tempatPenerbitan}
                onChange={(e) => setProfileForm({ ...profileForm, tempatPenerbitan: e.target.value })}
                placeholder="Kakas"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Penerbitan Rapor</label>
              <input
                type="text"
                value={profileForm.tanggalRapor}
                onChange={(e) => setProfileForm({ ...profileForm, tanggalRapor: e.target.value })}
                placeholder="19 Desember 2026"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran Aktif</label>
              <input
                type="text"
                value={profileForm.tahunPelajaranAktif}
                onChange={(e) => setProfileForm({ ...profileForm, tahunPelajaranAktif: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester Aktif</label>
              <select
                value={profileForm.semesterAktif}
                onChange={(e) => setProfileForm({ ...profileForm, semesterAktif: e.target.value as '1' | '2' })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              >
                <option value="1">Semester 1 (Ganjil)</option>
                <option value="2">Semester 2 (Genap)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metode Pengolahan Nilai PPA 2025 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-blue-900 font-bold text-sm">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Metode Pengolahan Nilai Asesmen (PPA Revisi 2025)</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Formula Perhitungan Nilai Akhir</label>
              <select
                value={methodForm.formula}
                onChange={(e) => setMethodForm({ ...methodForm, formula: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              >
                <option value="WEIGHTED_SUMMATIVE_SAS">
                  Pembobotan Terstruktur (Bobot Nilai Sumatif TP + Bobot Sumatif Akhir SAS)
                </option>
                <option value="AVERAGE_TP">
                  Rerata Murni Nilai Sumatif Lingkup Materi / Tujuan Pembelajaran (TP)
                </option>
              </select>
            </div>

            {methodForm.formula === 'WEIGHTED_SUMMATIVE_SAS' && (
              <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot Sumatif TP (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={methodForm.weightSummativeTP}
                    onChange={(e) =>
                      setMethodForm({ ...methodForm, weightSummativeTP: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bobot Sumatif Akhir SAS (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={methodForm.weightSAS}
                    onChange={(e) =>
                      setMethodForm({ ...methodForm, weightSAS: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-center"
                  />
                </div>
                <div className="col-span-2 text-[11px] text-slate-500 text-center font-medium">
                  Total Bobot: {Number(methodForm.weightSummativeTP) + Number(methodForm.weightSAS)}% (Wajib 100%)
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Minimum
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={methodForm.kktpMinimum}
                onChange={(e) => setMethodForm({ ...methodForm, kktpMinimum: Number(e.target.value) })}
                className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
              />
              <span className="text-[11px] text-slate-500 ml-2">Standar SMA: 75</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Kebijakan Asesmen Sekolah</label>
              <textarea
                rows={2}
                value={methodForm.notes}
                onChange={(e) => setMethodForm({ ...methodForm, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
