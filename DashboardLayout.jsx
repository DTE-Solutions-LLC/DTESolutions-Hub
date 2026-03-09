import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMobileMenu } from '../hooks/useMobileMenu';
import { menuGroups } from '../navigation/menuItems';
import NavLink from './ui/NavLink';
import logo from '../assets/Pulse_logo_v3.svg';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOpen: mobileMenuOpen, closeMenu, toggleMenu } = useMobileMenu();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full animate-in fade-in duration-500">

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 py-2">
        {menuGroups.map((group, idx) => (
          <div key={group.label} className={idx > 0 ? 'pt-2' : ''} style={{ animationDelay: `${idx * 100}ms` }}>
            {/* Section label */}
            <div className="flex items-center gap-2 px-2 mb-4 group/label">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.35em] text-[#30C476]/35 whitespace-nowrap group-hover/label:text-[#30C476] transition-colors">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#30C476]/12 to-transparent group-hover/label:from-[#30C476]/30 transition-all" />
            </div>

            {/* Nav items */}
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  onClick={isMobile ? closeMenu : undefined}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Streak card - Enhanced */}
        <div className="mx-1 mt-8 bg-[#30C476]/[0.04] border border-[#30C476]/[0.1] rounded-3xl p-5 transition-all hover:bg-[#30C476]/[0.08] hover:border-[#30C476]/25 group/streak cursor-default">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm group-hover/streak:scale-125 transition-transform duration-500">🔥</span>
            <span className="text-[9px] font-mono font-bold text-[#30C476]/60 uppercase tracking-[0.25em]">
              Daily Pulse
            </span>
          </div>
          <div className="text-4xl font-light text-[#FCF6EB] leading-none mb-1 group-hover/streak:text-[#30C476] transition-colors">14</div>
          <p className="text-[10px] text-[#FCF6EB]/30 font-medium leading-snug">
            Days of financial rhythm
          </p>
          <div className="h-[4px] bg-white/[0.04] rounded-full mt-5 overflow-hidden">
            <div className="h-full w-[68%] bg-gradient-to-r from-[#1A7A4A] to-[#30C476] rounded-full shadow-[0_0_12px_rgba(48,196,118,0.4)] transition-all duration-1000 group-hover:w-[72%]" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-4 mt-4 border-t border-white/[0.04] space-y-1.5">
        <NavLink
          to="/settings"
          icon={Settings}
          label="Settings"
          onClick={isMobile ? closeMenu : undefined}
        />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                     text-[#E05555]/50 hover:text-[#E05555] hover:bg-[#E05555]/[0.08]
                     transition-all duration-300 group text-[13px] font-bold uppercase tracking-wider"
        >
          <LogOut size={18} strokeWidth={2.5} className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
          <span>Exit Rhythm</span>
        </button>

        {/* User chip - Elevated */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-3 mt-4 rounded-[20px] bg-white/[0.02] border border-white/[0.03] hover:border-[#30C476]/20 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#30C476] to-[#1A7A4A] flex items-center justify-center text-[12px] font-black text-[#0A0907] shrink-0 shadow-[0_4px_12px_rgba(48,196,118,0.25)]">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#FCF6EB] truncate leading-tight">
                {user.name || 'User'}
              </p>
              <p className="text-[10px] text-[#30C476]/50 font-mono font-bold tracking-tighter truncate uppercase">Pulse Pro // Beta</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0907] text-[#FCF6EB] font-sans overflow-hidden selection:bg-[#30C476]/30">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-[#0D0E11] border-r border-white/[0.03] px-5 pt-8 pb-6 overflow-hidden">
        {/* Logo centerpiece */}
        <Link
          to="/dashboard"
          className="flex items-center gap-4 mb-10 px-1 group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#30C476]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img src={logo} alt="Pulse" className="relative w-9 h-9 shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(48,196,118,0.4)]" />
          </div>
          <span className="font-serif text-[17px] font-light tracking-[0.25em] uppercase text-[#FCF6EB] group-hover:text-[#30C476] transition-all duration-500">
            Pulse
          </span>
        </Link>

        <SidebarContent />
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between
                      px-6 py-4 bg-[#0D0E11]/90 backdrop-blur-2xl
                      border-b border-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="Pulse" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(48,196,118,0.3)]" />
          <span className="font-serif text-[15px] font-light tracking-[0.3em] uppercase">Pulse</span>
        </Link>

        <button
          onClick={toggleMenu}
          className={`p-2.5 rounded-2xl transition-all duration-300 ${
            mobileMenuOpen
              ? 'bg-[#30C476] text-[#12100D] shadow-[0_0_20px_rgba(48,196,118,0.4)]'
              : 'bg-white/[0.03] text-[#30C476] border border-[#30C476]/20 active:scale-90'
          }`}
        >
          {mobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
      </div>

      {/* ── MOBILE OVERLAY MENU ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-out
                    bg-[#0A0907]/99 backdrop-blur-3xl
                    ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="h-full flex flex-col pt-24 px-8 pb-12 overflow-y-auto">
          <SidebarContent isMobile />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pt-16 lg:pt-0 bg-radial-gradient from-[#1A1C20] via-[#0A0907] to-[#0A0907]">
        <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {children}
        </div>

        <footer className="shrink-0 px-10 py-6 border-t border-white/[0.02]
                           flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#FCF6EB]/10">
            © 2026 DTE Solutions LLC // Pulse V3.0.1
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FCF6EB]/15 hover:text-[#30C476] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FCF6EB]/15 hover:text-[#30C476] transition-colors">
              Terms
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
