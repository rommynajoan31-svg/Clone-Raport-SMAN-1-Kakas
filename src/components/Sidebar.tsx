/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  FileSpreadsheet,
  BarChart3,
  UserCheck,
  CalendarCheck,
  Palette,
  CheckCircle2,
  Printer,
  Copy,
  Settings,
  History,
  HelpCircle,
  FileText,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type PageId =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'subjects'
  | 'score-input'
  | 'ai-generator'
  | 'import-export'
  | 'recap'
  | 'homeroom'
  | 'attendance'
  | 'activities'
  | 'verification'
  | 'print-single'
  | 'print-batch'
  | 'settings'
  | 'audit-log'
  | 'help';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isOpen,
  onCloseMobile,
}) => {
  const { currentUser, scores } = useApp();

  // Pending verification count
  const pendingCount = scores.filter((s) => s.status === 'MENUNGGU_VERIFIKASI').length;

  const navGroups = [
    {
      label: 'MENU UTAMA',
      items: [
        { id: 'dashboard' as PageId, label: 'Dashboard Utama', icon: LayoutDashboard },
      ],
    },
    {
      label: 'DATA MASTER SEKOLAH',
      items: [
        { id: 'students' as PageId, label: 'Data Murid', icon: Users },
        { id: 'teachers' as PageId, label: 'Data Guru', icon: GraduationCap },
        { id: 'classes' as PageId, label: 'Rombongan Belajar', icon: Building },
        { id: 'subjects' as PageId, label: 'Mata Pelajaran & TP', icon: BookOpen },
      ],
    },
    {
      label: 'PENILAIAN & AI',
      items: [
        { id: 'score-input' as PageId, label: 'Input & Olah Nilai', icon: Award },
        {
          id: 'ai-generator' as PageId,
          label: 'AI Generator Deskripsi',
          icon: Sparkles,
          badge: 'Gemini',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        },
        { id: 'import-export' as PageId, label: 'Impor & Ekspor Excel', icon: FileSpreadsheet },
        { id: 'recap' as PageId, label: 'Rekapitulasi Nilai', icon: BarChart3 },
      ],
    },
    {
      label: 'WALI KELAS & KOKURIKULER',
      items: [
        { id: 'homeroom' as PageId, label: 'Monitoring Wali Kelas', icon: UserCheck },
        { id: 'attendance' as PageId, label: 'Presensi & Kehadiran', icon: CalendarCheck },
        { id: 'activities' as PageId, label: 'Kokurikuler & Ekskul', icon: Palette },
      ],
    },
    {
      label: 'PENGESAHAN & CETAK RAPOR',
      items: [
        {
          id: 'verification' as PageId,
          label: 'Pemeriksaan & Pengesahan',
          icon: CheckCircle2,
          badge: pendingCount > 0 ? `${pendingCount}` : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        { id: 'print-single' as PageId, label: 'Cetak Rapor Murid', icon: Printer },
        { id: 'print-batch' as PageId, label: 'Cetak Rapor Massal', icon: Copy },
      ],
    },
    {
      label: 'ADMINISTRASI & BANTUAN',
      items: [
        { id: 'settings' as PageId, label: 'Pengaturan & Rumus', icon: Settings },
        { id: 'audit-log' as PageId, label: 'Log Aktivitas (Audit)', icon: History },
        { id: 'help' as PageId, label: 'Panduan Asesmen PPA', icon: HelpCircle },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden print:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-[57px] bottom-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {group.label}
              </h4>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        if (window.innerWidth < 1024) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-amber-300' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Mode info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Mode Penyimpanan</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Demo Lokal Aktif
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Data tersimpan di peramban web ini dan dapat direset sewaktu-waktu.
          </p>
        </div>
      </aside>
    </>
  );
};
