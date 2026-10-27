import React, { useState, useRef } from 'react';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useApp } from '../context/AppContext';
import { RaporSheet } from '../components/RaporSheet';
import { Student } from '../types';

interface PrintSingleRaporProps {
  initialStudentId?: string;
}

export const PrintSingleRaporPage: React.FC<PrintSingleRaporProps> = ({ initialStudentId }) => {
  const { classes, students, schoolProfile } = useApp();
  const raporRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || classStudents[0]?.id || students[0]?.id || ''
  );

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || classStudents[0] || students[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!raporRef.current || !selectedStudent) return;
    setIsGeneratingPdf(true);

    try {
      const element = raporRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Rapor_${selectedStudent.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_NIS${selectedStudent.nis}_Sem${schoolProfile.semesterAktif}.pdf`;
      pdf.save(fileName);
    } catch (err: any) {
      console.error('PDF generation error', err);
      alert('Gagal menghasilkan file PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const currentIndex = classStudents.findIndex((s) => s.id === selectedStudent?.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(classStudents[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (hidden in print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <span>Cetak & Unduh Rapor Individual (A4 PPA 2025)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi rapor SMA Negeri 1 Kakas Kurikulum Merdeka. Dapat langsung dicetak atau diunduh sebagai dokumen PDF.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Select */}
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const firstInClass = students.find((s) => s.classId === e.target.value);
              if (firstInClass) setSelectedStudentId(firstInClass.id);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Student Select */}
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 max-w-[200px] truncate"
          >
            {classStudents.map((std) => (
              <option key={std.id} value={std.id}>
                {std.fullName} ({std.nis})
              </option>
            ))}
          </select>

          {/* Prev / Next buttons */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              title="Murid Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= classStudents.length - 1}
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              title="Murid Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !selectedStudent}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </>
            )}
          </button>

          {/* Main Print Button */}
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Rapor Sheet Container */}
      <div className="flex justify-center py-2 print:p-0">
        {selectedStudent ? (
          <div ref={raporRef} className="w-full max-w-[210mm]">
            <RaporSheet student={selectedStudent} />
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            Pilih murid terlebih dahulu untuk menampilkan lembar rapor.
          </div>
        )}
      </div>
    </div>
  );
};
