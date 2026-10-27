/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudentScore } from '../types';

export const ScoreImportExportPage: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    scores,
    schoolProfile,
    assessmentMethod,
    batchSaveScores,
    exportToExcel,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const availableSubjects = subjects.filter(
    (s) => selectedClass && s.phase === selectedClass.phase && s.grades.includes(selectedClass.grade)
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id || subjects[0]?.id || ''
  );

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Parsed imported rows state
  const [importedRows, setImportedRows] = useState<
    Array<{
      nis: string;
      nisn?: string;
      name: string;
      tpScores: Record<string, number>;
      sasScore?: number;
      finalScore: number;
      description?: string;
      isValid: boolean;
      errorMessage?: string;
    }>
  >([]);

  const [uploadFileName, setUploadFileName] = useState('');
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Generate and download template Excel
  const handleDownloadTemplate = () => {
    if (!selectedClass || !activeSubject) return;

    const classStudents = students.filter((s) => s.classId === selectedClassId);
    const tps = activeSubject.learningObjectives || [];

    const templateData = classStudents.map((std, idx) => {
      const row: any = {
        No: idx + 1,
        NIS: std.nis,
        NISN: std.nisn,
        'Nama Murid': std.fullName,
      };

      tps.forEach((tp) => {
        row[tp.code] = 85; // Example score
      });

      row['SAS'] = 82;
      row['Deskripsi Capaian'] = 'Menunjukkan pemahaman yang sangat baik dalam materi pokok.';

      return row;
    });

    exportToExcel(
      templateData,
      `Template_Nilai_${activeSubject.code}_${selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_')}`
    );
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const tps = activeSubject?.learningObjectives || [];
        const parsed = data.map((row: any) => {
          const nis = String(row['NIS'] || row['nis'] || '').trim();
          const name = String(row['Nama Murid'] || row['Nama'] || row['nama'] || '').trim();

          const matchingStudent = students.find((s) => s.nis === nis);
          let isValid = true;
          let errorMessage = '';

          if (!nis) {
            isValid = false;
            errorMessage = 'NIS kosong';
          } else if (!matchingStudent) {
            isValid = false;
            errorMessage = `Murid dengan NIS ${nis} tidak terdaftar di sistem.`;
          }

          // Read TP scores
          const tpScores: Record<string, number> = {};
          let tpSum = 0;
          let tpCount = 0;

          tps.forEach((tp) => {
            const rawVal = row[tp.code] || row[tp.code.toLowerCase()];
            const val = Number(rawVal);
            if (!isNaN(val) && val >= 0 && val <= 100) {
              tpScores[tp.id] = val;
              tpSum += val;
              tpCount++;
            } else if (rawVal !== undefined) {
              isValid = false;
              errorMessage = `Nilai ${tp.code} di luar rentang valid (0-100).`;
            }
          });

          // SAS score
          const rawSAS = row['SAS'] || row['sas'] || row['Sumatif Akhir'];
          const sasScore = rawSAS !== undefined && !isNaN(Number(rawSAS)) ? Number(rawSAS) : undefined;
          if (sasScore !== undefined && (sasScore < 0 || sasScore > 100)) {
            isValid = false;
            errorMessage = 'Nilai SAS di luar rentang valid (0-100).';
          }

          // Calculate final score
          let finalScore = 0;
          if (tpCount > 0) {
            const avgTP = tpSum / tpCount;
            if (assessmentMethod.formula === 'WEIGHTED_SUMMATIVE_SAS' && sasScore !== undefined) {
              finalScore = Math.round(
                avgTP * (assessmentMethod.weightSummativeTP / 100) +
                  sasScore * (assessmentMethod.weightSAS / 100)
              );
            } else {
              finalScore = Math.round(avgTP);
            }
          }

          const desc = row['Deskripsi Capaian'] || row['Deskripsi'] || '';

          return {
            nis,
            name: matchingStudent?.fullName || name,
            tpScores,
            sasScore,
            finalScore,
            description: desc,
            isValid,
            errorMessage,
          };
        });

        setImportedRows(parsed);
      } catch (err: any) {
        alert('Gagal membaca file spreadsheet: ' + err.message);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit valid imported rows
  const handleCommitImport = () => {
    if (!activeSubject) return;

    const validRows = importedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const now = new Date().toISOString();
    const newScoresToSave: StudentScore[] = validRows.map((r) => {
      const std = students.find((s) => s.nis === r.nis)!;
      return {
        id: `scr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: std.id,
        subjectId: activeSubject.id,
        academicYear: schoolProfile.tahunPelajaranAktif,
        semester: schoolProfile.semesterAktif,
        tpScores: r.tpScores,
        sasScore: r.sasScore,
        finalScore: r.finalScore,
        masteredStrengths: 'Sesuai data impor spreadsheet',
        needsImprovement: '',
        competencyDescription: r.description || `Menunjukkan pemahaman yang baik dalam mata pelajaran ${activeSubject.name}.`,
        status: 'DRAFT',
        updatedAt: now,
        updatedBy: 'Impor Excel Massal',
      };
    });

    batchSaveScores(newScoresToSave);
    setCommitSuccess(true);
    setTimeout(() => {
      setCommitSuccess(false);
      setImportedRows([]);
      setUploadFileName('');
    }, 3000);
  };

  const validCount = importedRows.filter((r) => r.isValid).length;
  const invalidCount = importedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Impor & Ekspor Nilai Spreadsheet (Excel / CSV)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah berkas nilai massal dari spreadsheet dengan validasi ketat dan pratinjau sebelum disimpan.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Template Excel</span>
        </button>
      </div>

      {/* Target Class and Subject Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Target Rombongan Belajar
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Target Mata Pelajaran
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 transition-colors text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-sm">Pilih Berkas Spreadsheet untuk Diimpor</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Mendukung format file <strong>.xlsx, .xls, atau .csv</strong>. Sistem akan memeriksa kesesuaian NIS dan rentang skor (0 - 100) secara otomatis.
        </p>

        <label className="mt-4 inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md transition-all">
          <span>Pilih Berkas dari Komputer</span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {uploadFileName && (
          <p className="mt-2 text-xs font-mono text-emerald-700">
            Berkas terpilih: <strong>{uploadFileName}</strong>
          </p>
        )}
      </div>

      {/* Validation Summary & Preview Table */}
      {importedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hasil Pemeriksaan Berkas Impor</h3>
              <p className="text-xs text-slate-500">
                Total baris dibaca: {importedRows.length} • Valid:{' '}
                <strong className="text-emerald-600">{validCount}</strong> • Bermasalah:{' '}
                <strong className="text-red-600">{invalidCount}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setImportedRows([])}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Batalkan
              </button>
              <button
                onClick={handleCommitImport}
                disabled={validCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan {validCount} Nilai Valid ke Rapor</span>
              </button>
            </div>
          </div>

          {commitSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Data nilai berhasil disimpan ke sistem!</span>
            </div>
          )}

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2 text-center w-10">No</th>
                  <th className="px-3 py-2">NIS</th>
                  <th className="px-4 py-2">Nama Murid</th>
                  <th className="px-3 py-2 text-center">Nilai TP</th>
                  <th className="px-3 py-2 text-center">SAS</th>
                  <th className="px-3 py-2 text-center font-bold text-slate-900">Nilai Akhir</th>
                  <th className="px-4 py-2">Deskripsi Capaian</th>
                  <th className="px-3 py-2 text-center">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {importedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/40 text-red-900'}
                  >
                    <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono text-[11px] font-bold">{row.nis}</td>
                    <td className="px-4 py-2 font-semibold">{row.name}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="font-mono text-[11px]">
                        {Object.values(row.tpScores).join(', ') || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono">{row.sasScore ?? '-'}</td>
                    <td className="px-3 py-2 text-center font-bold">{row.finalScore}</td>
                    <td className="px-4 py-2 text-slate-600 max-w-xs truncate">
                      {row.description || '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Siap Simpan
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-300"
                          title={row.errorMessage}
                        >
                          <AlertTriangle className="w-3 h-3 text-red-600" /> {row.errorMessage}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
