// components/layout/Topbar.jsx
'use client';

import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useSidebar } from '../../hooks/useSidebar';

// Map pathnames to human-readable page titles
const PAGE_TITLES = {
  '/dashboard':  { title: 'Dashboard',  subtitle: 'Platform overview and stats' },
  '/shops':      { title: 'Shops',      subtitle: 'Manage all registered shops' },
  '/plans':      { title: 'Plans',      subtitle: 'Subscription plan management' },
  '/templates':  { title: 'Templates',  subtitle: 'Business type chatbot templates' },
};

function getPageInfo(pathname) {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Check for sub-paths (e.g. /shops/[id])
  const base = '/' + pathname.split('/')[1];
  return PAGE_TITLES[base] || { title: 'Dashboard', subtitle: '' };
}

export default function Topbar() {
  const pathname   = usePathname();
  const { title, subtitle } = getPageInfo(pathname);
  const { toggle } = useSidebar();

  return (
    <header className="
      sticky top-0 z-20 h-16
      flex items-center justify-between
      px-6
      glass
    ">

      {/* Page title */}
      <div>
        <h1 className="text-[17px] font-bold text-text-primary leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-text-tertiary mt-0.5 hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="
            md:hidden p-2 rounded-lg
            text-text-secondary hover:text-text-primary
            hover:bg-surface-hover transition-colors
          "
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
