/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesPage } from './pages/ClassesPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { ScoreInputPage } from './pages/ScoreInputPage';
import { AiDescriptionPage } from './pages/AiDescriptionPage';
import { ScoreImportExportPage } from './pages/ScoreImportExportPage';
import { RecapScorePage } from './pages/RecapScorePage';
import { HomeroomMonitoringPage } from './pages/HomeroomMonitoringPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExtracurricularPage } from './pages/ExtracurricularPage';
import { VerificationPage } from './pages/VerificationPage';
import { PrintSingleRaporPage } from './pages/PrintSingleRaporPage';
import { PrintBatchRaporPage } from './pages/PrintBatchRaporPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { HelpGuidePage } from './pages/HelpGuidePage';
import { Student } from './types';

const MainApp: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<string | undefined>(undefined);

  const handleSelectPrintStudent = (student: Student) => {
    setSelectedStudentForPrint(student.id);
    setActivePage('print-single');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 transition-all duration-200 lg:pl-64 p-4 sm:p-6 max-w-7xl mx-auto w-full print:p-0 print:m-0 print:max-w-none print:pl-0">
          {activePage === 'dashboard' && <Dashboard onNavigate={setActivePage} />}
          {activePage === 'students' && <StudentsPage />}
          {activePage === 'teachers' && <TeachersPage />}
          {activePage === 'classes' && <ClassesPage />}
          {activePage === 'subjects' && <SubjectsPage />}
          {activePage === 'score-input' && <ScoreInputPage />}
          {activePage === 'ai-generator' && <AiDescriptionPage />}
          {activePage === 'import-export' && <ScoreImportExportPage />}
          {activePage === 'recap' && <RecapScorePage />}
          {activePage === 'homeroom' && (
            <HomeroomMonitoringPage onSelectPrintStudent={handleSelectPrintStudent} />
          )}
          {activePage === 'attendance' && <AttendancePage />}
          {activePage === 'activities' && <ExtracurricularPage />}
          {activePage === 'verification' && <VerificationPage />}
          {activePage === 'print-single' && (
            <PrintSingleRaporPage initialStudentId={selectedStudentForPrint} />
          )}
          {activePage === 'print-batch' && <PrintBatchRaporPage />}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'audit-log' && <AuditLogPage />}
          {activePage === 'help' && <HelpGuidePage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
