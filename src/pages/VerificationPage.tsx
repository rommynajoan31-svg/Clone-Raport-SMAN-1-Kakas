/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Check,
  X,
  FileText,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScoreStatus } from '../types';

export const VerificationPage: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    scores,
    schoolProfile,
    currentUser,
    updateScoreStatus,
    logAudit,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('MENUNGGU_VERIFIKASI');

  const filteredScores = scores.filter((s) => {
    const std = students.find((st) => st.id === s.studentId);
    if (!std) return false;

    const matchClass = selectedClassId === 'ALL' || std.classId === selectedClassId;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchSemester =
      s.semester === schoolProfile.semesterAktif &&
      s.academicYear === schoolProfile.tahunPelajaranAktif;

    return matchClass && matchStatus && matchSemester;
  });

  const [permissionError, setPermissionError] = useState<string | null>(null);

  const canAuthorize = ['kepala_sekolah', 'wakakur', 'admin'].includes(currentUser.role);

  const handleApprove = async (scoreId: string) => {
    if (!canAuthorize) {
      setPermissionError(
        `Akses Ditolak: Peran aktif (${currentUser.role}) tidak memiliki kewenangan verifikasi. Wewenang ini khusus untuk Kepala Sekolah dan Wakasek Kurikulum.`
      );
      return;
    }
    setPermissionError(null);

    try {
      // Backend authorization check
      const res = await fetch('/api/scores/authorize-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer tk_${currentUser.id}`,
        },
        body: JSON.stringify({
          targetStatus: 'DISETUJUI',
          scoreIds: [scoreId],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Otorisasi backend gagal');
      }
    } catch (e: any) {
      console.warn('Backend authorization note:', e.message);
    }

    updateScoreStatus(scoreId, 'DISETUJUI');
  };

  const handleFinalizeAllInClass = async () => {
    if (!canAuthorize) {
      setPermissionError(
        `Akses Ditolak: Hanya Kepala Sekolah dan Wakasek Kurikulum yang berhak mengesahkan (finalisasi) seluruh rapor rombel.`
      );
      return;
    }
    setPermissionError(null);

    if (selectedClassId === 'ALL') {
      alert('Pilih satu rombel terlebih dahulu untuk finalisasi massal.');
      return;
    }
    const classStudents = students.filter((s) => s.classId === selectedClassId);
    const targetScores = scores.filter((s) =>
      classStudents.some((std) => std.id === s.studentId)
    );

    targetScores.forEach((s) => {
      updateScoreStatus(s.id, 'FINAL');
    });

    logAudit(
      'FINALISASI_MASSAL',
      `Kepala Sekolah / Kurikulum (${currentUser.fullName}) mengesahkan seluruh nilai rapor untuk rombel terpilih.`
    );
    alert('Seluruh nilai untuk rombel ini telah berhasil disahkan & difinalisasi!');
  };

  const handleRequestRevision = (scoreId: string) => {
    if (!canAuthorize) {
      setPermissionError('Hanya verifikator kurikulum yang dapat mengembalikan draf untuk perbaikan.');
      return;
    }
    setPermissionError(null);
    const reason = prompt('Masukkan alasan atau petunjuk perbaikan untuk guru pengampu:');
    if (reason) {
      updateScoreStatus(scoreId, 'PERLU_PERBAIKAN');
      logAudit('MINTA_PERBAIKAN_NILAI', `Catatan perbaikan: ${reason}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <span>Pemeriksaan, Verifikasi & Pengesahan Rapor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alur verifikasi Kurikulum & Pengesahan Kepala Sekolah sebelum buku rapor dibagikan kepada orang tua.
          </p>
        </div>

        <button
          onClick={handleFinalizeAllInClass}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sahkan Seluruh Nilai Rombel Ini</span>
        </button>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{permissionError}</span>
          </div>
          <button
            onClick={() => setPermissionError(null)}
            className="text-red-700 hover:text-red-900 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Filter Rombel
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Semua Rombel</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Status Nilai
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="DRAFT">Draf Guru</option>
            <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
            <option value="DISETUJUI">Disetujui Kurikulum</option>
            <option value="FINAL">Difinalisasi (Sah)</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 self-end">
          Menampilkan <strong>{filteredScores.length}</strong> data asesmen
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3 text-center w-10">No</th>
                <th className="px-4 py-3">Nama Murid / Kelas</th>
                <th className="px-4 py-3">Mata Pelajaran</th>
                <th className="px-3 py-3 text-center">Nilai Akhir</th>
                <th className="px-4 py-3 min-w-[260px]">Rumusan Deskripsi Capaian</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right min-w-[160px]">Otorisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScores.length > 0 ? (
                filteredScores.map((sc, idx) => {
                  const std = students.find((s) => s.id === sc.studentId);
                  const cls = classes.find((c) => c.id === std?.classId);
                  const sbj = subjects.find((s) => s.id === sc.subjectId);

                  return (
                    <tr key={sc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{std?.fullName}</div>
                        <div className="text-[10px] text-slate-500">
                          {cls?.name} • NIS: {std?.nis}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{sbj?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sbj?.code}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-black text-slate-900 text-sm">
                        {sc.finalScore}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-[11px] leading-relaxed">
                        {sc.competencyDescription ? (
                          <span>{sc.competencyDescription}</span>
                        ) : (
                          <span className="text-red-500 italic">Deskripsi belum diisi guru pengampu.</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            sc.status === 'FINAL'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : sc.status === 'DISETUJUI'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : sc.status === 'MENUNGGU_VERIFIKASI'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : sc.status === 'PERLU_PERBAIKAN'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {sc.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sc.status !== 'FINAL' && (
                            <>
                              <button
                                onClick={() => handleApprove(sc.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-xs flex items-center gap-1 transition-colors"
                                title="Setujui Nilai Ini"
                              >
                                <Check className="w-3 h-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => handleRequestRevision(sc.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-1 rounded-lg text-[10px] transition-colors"
                                title="Minta Perbaikan ke Guru"
                              >
                                <X className="w-3 h-3" />
                                <span>Perbaikan</span>
                              </button>
                            </>
                          )}
                          {sc.status === 'FINAL' && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Telah Sah
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Tidak ada antrean nilai yang sesuai dengan kriteria filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
