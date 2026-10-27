/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  School,
  UserCheck,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  Bell,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { schoolProfile, currentUser, accounts, setCurrentUser, resetAllData } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const roleLabels: Record<UserRole, { title: string; color: string; badge: string }> = {
    admin: { title: 'Administrator', color: 'bg-red-500/10 text-red-700 border-red-200', badge: 'Admin' },
    kepala_sekolah: { title: 'Kepala Sekolah', color: 'bg-amber-500/10 text-amber-800 border-amber-300', badge: 'Kepsek' },
    wakakur: { title: 'Wakasek Kurikulum', color: 'bg-purple-500/10 text-purple-700 border-purple-200', badge: 'Wakakur' },
    guru: { title: 'Guru Mata Pelajaran', color: 'bg-blue-500/10 text-blue-700 border-blue-200', badge: 'Guru' },
    walikelas: { title: 'Wali Kelas', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', badge: 'Wali Kelas' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs print:hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Hamburger & School info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Buka/Tutup Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs border border-slate-200 overflow-hidden shrink-0">
              {schoolProfile.logoUrl ? (
                <img src={schoolProfile.logoUrl} alt="Logo SMAN 1 Kakas" className="w-full h-full object-contain" />
              ) : (
                <School className="w-5 h-5 text-blue-900" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                  RAPOR KAKAS AI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" /> PPA 2025
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {schoolProfile.namaSekolah} • NPSN: {schoolProfile.npsn}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Semester & TP badge */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/80 text-xs text-slate-700">
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> TP {schoolProfile.tahunPelajaranAktif}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 font-semibold text-blue-700">
            <Layers className="w-3.5 h-3.5" /> Semester {schoolProfile.semesterAktif === '1' ? 'Ganjil' : 'Genap'}
          </span>
        </div>

        {/* Right: Role Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Reset Button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
            title="Reset data ke bawaan demo"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-left transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span
                    className={`inline-block px-1 py-0.2 rounded border text-[9px] font-semibold ${
                      roleLabels[currentUser.role]?.color
                    }`}
                  >
                    {roleLabels[currentUser.role]?.badge}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ganti Peran Pengguna (Simulasi)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pilih akun untuk menguji wewenang peran yang berbeda:
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {accounts.map((acc) => {
                    const isSelected = acc.id === currentUser.id;
                    const meta = roleLabels[acc.role];
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setCurrentUser(acc);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{acc.fullName}</p>
                          <p className="text-[11px] text-slate-500">
                            {meta?.title} • @{acc.username}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${meta?.color}`}>
                          {meta?.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-2 px-3">
                  <button
                    onClick={() => {
                      setShowConfirmReset(true);
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Seluruh Data ke Bawaan Demo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Reset Data</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Tindakan ini akan mengembalikan seluruh data murid, nilai, capaian, dan catatan wali kelas ke kondisi sintetis awal demo SMA Negeri 1 Kakas. Perubahan kustom yang belum diekspor akan hilang.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
