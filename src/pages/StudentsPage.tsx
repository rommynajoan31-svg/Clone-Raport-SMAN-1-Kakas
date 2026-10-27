/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, Subject } from '../types';

export const StudentsPage: React.FC = () => {
  const { students, classes, subjects, addStudent, updateStudent, deleteStudent, exportToExcel } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterPhase, setFilterPhase] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Bulk Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<
    Array<{
      nis: string;
      nisn: string;
      fullName: string;
      gender: 'L' | 'P';
      className: string;
      birthPlace: string;
      birthDate: string;
      address: string;
      parentName: string;
      parentPhone: string;
      isValid: boolean;
      errorMessage?: string;
    }>
  >([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    fullName: '',
    gender: 'L' as 'L' | 'P',
    birthPlace: 'Kakas',
    birthDate: '2010-01-01',
    address: 'Kec. Kakas, Kab. Minahasa',
    parentName: '',
    parentPhone: '',
    admissionYear: '2026',
    status: 'AKTIF' as 'AKTIF' | 'MUTASI' | 'LULUS',
    classId: classes[0]?.id || '',
    phase: 'E' as 'E' | 'F',
    grade: 10 as 10 | 11 | 12,
    electiveSubjectIds: [] as string[],
  });

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        s.nisn.includes(searchTerm);
      const matchClass = filterClass === 'ALL' || s.classId === filterClass;
      const matchPhase = filterPhase === 'ALL' || s.phase === filterPhase;
      return matchSearch && matchClass && matchPhase;
    });
  }, [students, searchTerm, filterClass, filterPhase]);

  // Available elective subjects for Fase F
  const electiveSubjects = useMemo(() => {
    return subjects.filter((s) => s.phase === 'F' && s.group === 'PILIHAN');
  }, [subjects]);

  const openAddModal = () => {
    setEditingStudent(null);
    const initialClass = classes[0];
    setFormData({
      nis: `${26000 + students.length + 1}`,
      nisn: `00812345${String(students.length + 1).padStart(2, '0')}`,
      fullName: '',
      gender: 'L',
      birthPlace: 'Kakas',
      birthDate: '2010-01-01',
      address: 'Kec. Kakas, Minahasa',
      parentName: '',
      parentPhone: '',
      admissionYear: '2026',
      status: 'AKTIF',
      classId: initialClass?.id || '',
      phase: initialClass?.phase || 'E',
      grade: initialClass?.grade || 10,
      electiveSubjectIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      fullName: student.fullName,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      admissionYear: student.admissionYear,
      status: student.status,
      classId: student.classId,
      phase: student.phase,
      grade: student.grade,
      electiveSubjectIds: student.electiveSubjectIds || [],
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.nis) return;

    // Automatically set phase and grade based on selected class
    const cls = classes.find((c) => c.id === formData.classId);
    const resolvedPhase = cls?.phase || formData.phase;
    const resolvedGrade = cls?.grade || formData.grade;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        ...formData,
        phase: resolvedPhase,
        grade: resolvedGrade,
      });
    } else {
      addStudent({
        ...formData,
        phase: resolvedPhase,
        grade: resolvedGrade,
      });
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const data = filteredStudents.map((s, idx) => {
      const cls = classes.find((c) => c.id === s.classId);
      const chosenElectives = subjects
        .filter((sbj) => s.electiveSubjectIds?.includes(sbj.id))
        .map((sbj) => sbj.name)
        .join(', ');

      return {
        No: idx + 1,
        NIS: s.nis,
        NISN: s.nisn,
        'Nama Lengkap': s.fullName,
        'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': s.birthPlace,
        'Tanggal Lahir': s.birthDate,
        Rombel: cls?.name || '-',
        Fase: s.phase,
        'Mapel Pilihan (Fase F)': chosenElectives || '-',
        Alamat: s.address,
        'Nama Orang Tua / Wali': s.parentName,
        'No Kontak': s.parentPhone,
        Status: s.status,
      };
    });
    exportToExcel(data, `Data_Murid_SMAN1_Kakas`);
  };

  // Download template for student import
  const handleDownloadStudentTemplate = () => {
    const template = [
      {
        NIS: '26110',
        NISN: '0081234520',
        'Nama Lengkap': 'Andre Victor Wowor',
        'Jenis Kelamin': 'L',
        Rombel: 'X-A',
        'Tempat Lahir': 'Kakas',
        'Tanggal Lahir': '2010-06-15',
        Alamat: 'Desa Kaweng, Kakas',
        'Nama Orang Tua': 'Jerry Wowor',
        'Kontak Orang Tua': '081245678910',
      },
      {
        NIS: '26111',
        NISN: '0081234521',
        'Nama Lengkap': 'Kezia Stevany Senduk',
        'Jenis Kelamin': 'P',
        Rombel: 'X-A',
        'Tempat Lahir': 'Sendangan',
        'Tanggal Lahir': '2010-09-22',
        Alamat: 'Desa Sendangan, Kakas',
        'Nama Orang Tua': 'Arthur Senduk',
        'Kontak Orang Tua': '081245678911',
      },
    ];
    exportToExcel(template, 'Template_Impor_Murid_SMAN1_Kakas');
  };

  // Upload student spreadsheet handler
  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const existingNisSet = new Set(students.map((s) => s.nis));

        const parsed = data.map((row: any) => {
          const nis = String(row['NIS'] || row['nis'] || '').trim();
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const fullName = String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || '').trim();
          const genderRaw = String(row['Jenis Kelamin'] || row['JK'] || 'L').toUpperCase();
          const gender: 'L' | 'P' = genderRaw.startsWith('P') ? 'P' : 'L';
          const className = String(row['Rombel'] || row['Kelas'] || '').trim();
          const birthPlace = String(row['Tempat Lahir'] || 'Kakas').trim();
          const birthDate = String(row['Tanggal Lahir'] || '2010-01-01').trim();
          const address = String(row['Alamat'] || 'Kakas, Minahasa').trim();
          const parentName = String(row['Nama Orang Tua'] || '').trim();
          const parentPhone = String(row['Kontak Orang Tua'] || '').trim();

          let isValid = true;
          let errorMessage = '';

          if (!nis) {
            isValid = false;
            errorMessage = 'NIS wajib diisi';
          } else if (existingNisSet.has(nis)) {
            isValid = false;
            errorMessage = `NIS ${nis} sudah ada di database`;
          }

          if (!fullName) {
            isValid = false;
            errorMessage = 'Nama lengkap wajib diisi';
          }

          return {
            nis,
            nisn,
            fullName,
            gender,
            className,
            birthPlace,
            birthDate,
            address,
            parentName,
            parentPhone,
            isValid,
            errorMessage,
          };
        });

        setParsedImportRows(parsed);
      } catch (err: any) {
        alert('Gagal membaca berkas: ' + err.message);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit valid imported students
  const handleCommitStudentImport = () => {
    const validRows = parsedImportRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    validRows.forEach((r) => {
      // Find matching class or default to first class
      const targetClass =
        classes.find((c) => c.name.toLowerCase().includes(r.className.toLowerCase())) || classes[0];

      addStudent({
        nis: r.nis,
        nisn: r.nisn || `008${r.nis}`,
        fullName: r.fullName,
        gender: r.gender,
        birthPlace: r.birthPlace,
        birthDate: r.birthDate,
        address: r.address,
        parentName: r.parentName,
        parentPhone: r.parentPhone,
        admissionYear: '2026',
        status: 'AKTIF',
        classId: targetClass.id,
        phase: targetClass.phase,
        grade: targetClass.grade,
      });
    });

    setImportSuccessMsg(true);
    setTimeout(() => {
      setImportSuccessMsg(false);
      setIsImportModalOpen(false);
      setParsedImportRows([]);
      setImportFileName('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Manajemen Data Murid</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data induk peserta didik Fase E (Kelas X) dan Fase F (Kelas XI, XII) SMA Negeri 1 Kakas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Impor Excel</span>
          </button>
          <button
            onClick={handleExport}
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
            <span>Tambah Murid</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIS, atau NISN murid..."
            className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Semua Rombel</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Phase Filter */}
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Semua Fase</option>
            <option value="E">Fase E (Kelas X)</option>
            <option value="F">Fase F (Kelas XI, XII)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">NIS / NISN</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-3 py-3 text-center">JK</th>
                <th className="px-4 py-3">Kelas / Fase</th>
                <th className="px-4 py-3">Mapel Pilihan (Fase F)</th>
                <th className="px-4 py-3">Nama Orang Tua</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((std, idx) => {
                  const cls = classes.find((c) => c.id === std.classId);
                  const chosenElectives = subjects.filter((s) =>
                    std.electiveSubjectIds?.includes(s.id)
                  );

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        <div>{std.nis}</div>
                        <div className="text-[10px] text-slate-400">{std.nisn}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{std.fullName}</div>
                        <div className="text-[10px] text-slate-500">{std.address}</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            std.gender === 'L'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {std.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">
                          {cls?.name || `Kelas ${std.grade}`}
                        </span>
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Fase {std.phase}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {std.phase === 'F' ? (
                          chosenElectives.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {chosenElectives.map((e) => (
                                <span
                                  key={e.id}
                                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200"
                                >
                                  {e.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Belum ditentukan
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Semua Wajib (Fase E)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{std.parentName || '-'}</div>
                        <div className="text-[10px] text-slate-400">{std.parentPhone || ''}</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {std.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(std)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Data Murid"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data murid ${std.fullName}?`)) {
                                deleteStudent(std.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Murid"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    Tidak ada data murid yang sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Murid</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Christian Bryan Rondonuwu"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombongan Belajar</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const c = classes.find((cls) => cls.id === e.target.value);
                      setFormData({
                        ...formData,
                        classId: e.target.value,
                        phase: c?.phase || 'E',
                        grade: c?.grade || 10,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Fase {c.phase})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Elective subjects picker for Fase F */}
              {formData.phase === 'F' && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Mata Pelajaran Pilihan Murid (Fase F)</span>
                  </div>
                  <p className="text-[10px] text-purple-700 mb-2">
                    Centang mata pelajaran pilihan yang benar-benar diikuti oleh peserta didik ini:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {electiveSubjects.map((s) => {
                      const isSelected = formData.electiveSubjectIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 text-slate-800 text-[11px] p-1 bg-white rounded border border-purple-100 hover:bg-purple-100/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  electiveSubjectIds: [...formData.electiveSubjectIds, s.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  electiveSubjectIds: formData.electiveSubjectIds.filter(
                                    (id) => id !== s.id
                                  ),
                                });
                              }
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span>
                            {s.name} ({s.code})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Desa Kaweng, Kec. Kakas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Kontak / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="0812..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
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
                  Simpan Data Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Impor Data Murid (Excel / CSV)</h3>
                <p className="text-xs text-slate-500">
                  Unggah file data induk murid dari format Excel/CSV untuk didaftarkan secara massal.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Belum memiliki format berkas?</span>
                <button
                  onClick={handleDownloadStudentTemplate}
                  className="bg-white hover:bg-slate-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Unduh Template Excel</span>
                </button>
              </div>

              {/* Upload Input */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 p-6 rounded-xl text-center">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-slate-900">Pilih berkas Excel (.xlsx / .csv)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pastikan kolom NIS, Nama Lengkap, dan Rombel telah terisi.
                </p>
                <label className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm">
                  <span>Pilih Berkas</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleStudentFileUpload}
                    className="hidden"
                  />
                </label>
                {importFileName && (
                  <p className="mt-2 text-xs font-mono text-blue-700">Berkas: {importFileName}</p>
                )}
              </div>

              {/* Preview Table */}
              {parsedImportRows.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      Pratinjau ({parsedImportRows.filter((r) => r.isValid).length} valid dari{' '}
                      {parsedImportRows.length} baris)
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-1.5">NIS</th>
                          <th className="px-2 py-1.5">Nama Murid</th>
                          <th className="px-2 py-1.5">JK</th>
                          <th className="px-2 py-1.5">Rombel</th>
                          <th className="px-2 py-1.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportRows.map((r, idx) => (
                          <tr key={idx} className={r.isValid ? '' : 'bg-red-50 text-red-900'}>
                            <td className="px-2 py-1 font-mono">{r.nis}</td>
                            <td className="px-2 py-1 font-semibold">{r.fullName}</td>
                            <td className="px-2 py-1 text-center">{r.gender}</td>
                            <td className="px-2 py-1">{r.className}</td>
                            <td className="px-2 py-1 text-center">
                              {r.isValid ? (
                                <span className="text-emerald-700 font-bold">Valid</span>
                              ) : (
                                <span className="text-red-600 font-bold" title={r.errorMessage}>
                                  {r.errorMessage}
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

              {importSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Data murid berhasil diimpor ke sistem!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedImportRows.filter((r) => r.isValid).length === 0}
                  onClick={handleCommitStudentImport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-md disabled:opacity-50"
                >
                  Daftarkan {parsedImportRows.filter((r) => r.isValid).length} Murid Valid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
