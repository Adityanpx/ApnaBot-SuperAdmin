// components/layout/Sidebar.jsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard, Store, CreditCard,
  FileText, LogOut, Bot, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, API } from '@/lib/constants';
import api from '@/lib/api';
import useAuthStore  from '@/store/authStore';
import useSidebar    from '@/hooks/useSidebar';

const ICON_MAP = { LayoutDashboard, Store, CreditCard, FileText };

export default function Sidebar() {
  const pathname              = usePathname();
  const router                = useRouter();
  const { user, logout }      = useAuthStore();
  const { isOpen, close }     = useSidebar();

  // Close drawer on route change (mobile)
  useEffect(() => { close(); }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      const { getRefreshToken } = await import('@/lib/auth');
      await api.post(API.LOGOUT, { refreshToken: getRefreshToken() });
    } catch { /* silent */ }
    logout();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-text-primary leading-tight tracking-tight">
              ApnaBot
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Superadmin
            </p>
          </div>
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
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
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
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
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
        <SidebarContent />
      </aside>

      {/* ── Mobile: drawer + backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="
                lg:hidden fixed left-0 top-0 h-screen w-[280px] z-50
                bg-sidebar-bg border-r border-sidebar-border
                flex flex-col
              "
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
