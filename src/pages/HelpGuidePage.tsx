/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, BookOpen, CheckCircle, Sparkles, Award, Shield } from 'lucide-react';

export const HelpGuidePage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-blue-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-amber-300 text-xs font-bold border border-blue-400/30 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Panduan Asesmen SMA Kurikulum Merdeka</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Panduan Pembelajaran & Asesmen (PPA) Edisi Revisi 2025
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1 leading-relaxed">
          Acuan resmi bagi dewan guru dan pimpinan SMA Negeri 1 Kakas dalam mengolah nilai sumatif, merumuskan deskripsi capaian rapor dengan AI, dan pelaporan hasil belajar.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="space-y-4">
        {/* Card 1: Perbedaan Fase E & Fase F */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Award className="w-5 h-5 text-blue-600" />
            <span>1. Karakteristik Fase E (Kelas X) dan Fase F (Kelas XI & XII)</span>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              <strong>Fase E (Kelas X):</strong> Murid mempelajari seluruh rumpun mata pelajaran umum dan dasar sains/sosial secara holistik. Seluruh murid menempuh struktur kurikulum yang seragam untuk mempersiapkan eksplorasi bakat dan minat.
            </p>
            <p>
              <strong>Fase F (Kelas XI dan XII):</strong> Murid memilih kombinasi kelompok mata pelajaran pilihan (misalnya Matematika Tingkat Lanjut, Fisika, Biologi, Kimia, Ekonomi, Geografi, Sosiologi, Informatika) sesuai rencana studi lanjutan dan karier. Sistem rapor memvalidasi bahwa murid hanya memperoleh nilai pada mata pelajaran yang dipilih.
            </p>
          </div>
        </div>

        {/* Card 2: Pengolahan Nilai Sumatif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>2. Pengolahan Nilai Asesmen Sumatif (PPA 2025)</span>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              Sesuai PPA 2025, nilai rapor bersumber dari <strong>Asesmen Sumatif</strong> (Sumatif Lingkup Materi / per TP dan Sumatif Akhir Semester jika diselenggarakan). Asesmen formatif digunakan untuk umpan balik pembelajaran dan tidak dirata-ratakan langsung ke nilai rapor.
            </p>
            <p>
              Satuan pendidikan memiliki kewenangan memilih metode pengolahan:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Rerata Murni Sumatif TP:</strong> Menjumlahkan seluruh skor ketercapaian tujuan pembelajaran dan membaginya dengan jumlah TP.
              </li>
              <li>
                <strong>Pembobotan Terstruktur (Rekomendasi SMAN 1 Kakas):</strong> Bobot 60% untuk rata-rata Sumatif TP + 40% untuk Sumatif Akhir Semester (SAS).
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3: Prinsip Perumusan Deskripsi Rapor dengan AI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>3. Prinsip Perumusan Deskripsi Capaian Kompetensi Berbantuan AI</span>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              Fitur AI (Gemini 3.8 Flash) bertindak sebagai asisten cerdas guru dalam merangkum bukti capaian belajar murid. Aturan wajib yang diterapkan dalam sistem RAPOR KAKAS AI:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">Yang Dilakukan Sistem AI:</span>
                <ul className="list-disc pl-4 space-y-1 text-emerald-800 text-[11px]">
                  <li>Objektif berdasarkan bukti skor TP yang dimasukkan guru.</li>
                  <li>Menjelaskan kompetensi tertinggi yang dikuasai optimal.</li>
                  <li>Menyebutkan aspek yang membutuhkan penguatan/bimbingan santun.</li>
                  <li>Menggunakan bahasa positif dan memotivasi orang tua murid.</li>
                </ul>
              </div>

              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-900 block mb-1">Yang Dilarang Keras:</span>
                <ul className="list-disc pl-4 space-y-1 text-red-800 text-[11px]">
                  <li>Tidak mengarang kompetensi baru yang tidak diajarkan.</li>
                  <li>Tidak memberi label negatif atau membandingkan antar-murid.</li>
                  <li>Tidak membagikan data identitas pribadi sensitif ke luar sistem.</li>
                  <li>AI tidak boleh mengubah nilai numerik murid.</li>
                </ul>
              </div>
            </div>
            <p className="pt-2 text-slate-500 italic">
              *Setiap hasil draf AI wajib ditinjau dan disetujui oleh Guru Mata Pelajaran sebelum disahkan menjadi buku rapor resmi.
            </p>
          </div>
        </div>

        {/* Card 4: Alur Verifikasi & Pengesahan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>4. Alur Kerja Pengesahan & Penerbitan Rapor</span>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Guru Mata Pelajaran:</strong> Mengisi nilai sumatif TP, memicu AI generator deskripsi, mengoreksi, dan mengirim ke wali kelas.
              </li>
              <li>
                <strong>Wali Kelas:</strong> Memeriksa kelengkapan nilai semua mapel, mengisi presensi (S/I/A), mencatat kegiatan ekstrakurikuler, dan merumuskan Catatan Wali Kelas.
              </li>
              <li>
                <strong>Wakasek Kurikulum:</strong> Memverifikasi konsistensi penilaian antarkelas dan keselarasan kurikulum.
              </li>
              <li>
                <strong>Kepala Sekolah:</strong> Melakukan otorisasi pengesahan akhir rapor semester.
              </li>
              <li>
                <strong>Pencetakan Dokumen:</strong> Rapor dicetak pada format kertas A4 standar resmi untuk dibagikan kepada orang tua murid.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
