// components/layout/Sidebar.jsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard, Store, CreditCard,
  FileText, LogOut, Bot, X, Car, Workflow, IndianRupee, FolderKanban, Library, Tag, MessageSquareCode, ClipboardList,
  SlidersHorizontal, HardDrive, Smartphone, Gift, Inbox, Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { performLogout } from '@/lib/api';
import useAuthStore  from '@/store/authStore';
import useSidebar    from '@/hooks/useSidebar';
import { useNewRequestCount } from '@/hooks/useNewRequestCount';

const ICON_MAP = { LayoutDashboard, Store, CreditCard, FileText, Car, Workflow, IndianRupee, FolderKanban, Library, Tag, MessageSquareCode, ClipboardList, SlidersHorizontal, HardDrive, Smartphone, Gift, Inbox, Stethoscope };

export default function Sidebar() {
  const pathname              = usePathname();
  const router                = useRouter();
  const { user, logout }      = useAuthStore();
  const { isOpen, close }     = useSidebar();
  const newRequests           = useNewRequestCount();
  const badges                = { newRequests };

  // Close drawer on route change (mobile)
  useEffect(() => { close(); }, [pathname]);

  // Lock page scroll behind the open drawer; close it if the window grows to desktop width
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => { if (e.matches) close(); };
    mql.addEventListener('change', onChange);
    return () => {
      document.body.style.overflow = previous;
      mql.removeEventListener('change', onChange);
    };
  }, [isOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Server call is best effort (3s timeout, errors swallowed); the local
  // clear and redirect always run afterwards
  const handleLogout = () =>
    performLogout(() => {
      logout();
      toast.success('Logged out successfully');
      router.replace('/login');
    });

  const renderContent = (showClose) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ApnaBot" className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div>
            <p className="text-[15px] font-bold text-text-primary leading-tight tracking-tight">
              ApnaBot
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Superadmin
            </p>
          </div>
          {showClose && (
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="icon-btn ml-auto -mr-3 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto relative">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const IconComponent = ICON_MAP[item.icon];
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={cn('nav-item relative', isActive && 'active')}
                >
                  {IconComponent && (
                    <IconComponent className={cn(
                      'w-[18px] h-[18px] flex-shrink-0',
                      isActive ? 'text-info-text' : 'text-text-tertiary'
                    )} />
                  )}
                  <span className="text-sm">{item.label}</span>
                  {item.badge && badges[item.badge] > 0 && (
                    <span
                      className="ml-auto min-w-[20px] px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-semibold text-center leading-none"
                      aria-label={`${badges[item.badge]} new`}
                    >
                      {badges[item.badge] > 99 ? '99+' : badges[item.badge]}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId={showClose ? 'active-nav-indicator-drawer' : 'active-nav-indicator'}
                      className="absolute left-0 w-[3px] h-6 bg-brand-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom — user info + logout */}
      <div className="px-3 pb-5 border-t border-sidebar-border pt-4 space-y-2">
        {/* User info card */}
        <div className="px-3 py-3 rounded-xl bg-bg-subtle flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-brand text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-text-tertiary truncate">{user?.email || ''}</p>
          </div>
        </div>

        {/* Logout button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="
            w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium text-text-secondary
            hover:text-danger-text hover:bg-danger-bg
            transition-colors duration-150
          "
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: fixed sidebar ── */}
      <aside className="
        hidden lg:flex flex-col
        fixed left-0 top-0 h-screen w-sidebar z-30
        bg-sidebar-bg border-r border-sidebar-border
      ">
        {renderContent(false)}
      </aside>

      {/* ── Mobile: drawer + backdrop ──
          Always mounted and slid with CSS (not AnimatePresence): an exiting drawer was left in the
          DOM after a route change. `invisible` when closed keeps its links out of the tab order. */}
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />
      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label="Navigation"
        className={cn(
          'lg:hidden fixed left-0 top-0 h-[100dvh] w-[280px] max-w-[85vw] z-50',
          'bg-sidebar-bg border-r border-sidebar-border flex flex-col',
          'transition-[transform,visibility] duration-300 ease-out',
          isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        )}
      >
        {renderContent(true)}
      </aside>
    </>
  );
}
