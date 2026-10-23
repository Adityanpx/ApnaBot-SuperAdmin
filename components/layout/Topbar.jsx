// components/layout/Topbar.jsx
'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useSidebar } from '../../hooks/useSidebar';
import { NAV_ITEMS } from '../../lib/constants';

// Subtitles for the pages that have one (shown from `sm` up)
const PAGE_SUBTITLES = {
  '/dashboard':  'Platform overview and stats',
  '/businesses': 'Manage all registered businesses',
  '/plans':      'Subscription plan management',
};

function getPageInfo(pathname) {
  // Longest matching nav href wins (so /business-category-templates isn't read as /businesses…)
  const item = NAV_ITEMS
    .filter((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (!item) return { title: 'Dashboard', subtitle: '' };
  return { title: item.label, subtitle: PAGE_SUBTITLES[item.href] || '' };
}

export default function Topbar() {
  const pathname   = usePathname();
  const { title, subtitle } = getPageInfo(pathname);
  const { toggle } = useSidebar();

  return (
    <header className="
      sticky top-0 z-20 h-14 sm:h-16
      flex items-center justify-between gap-2
      px-2 sm:px-4 lg:px-6
      glass
    ">

      {/* Hamburger (below 1024px) + page title */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="
            lg:hidden w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-lg
            text-text-secondary hover:text-text-primary
            hover:bg-bg-subtle transition-colors
          "
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <p className="text-[17px] font-bold text-text-primary leading-tight tracking-tight truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-text-tertiary mt-0.5 hidden sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 flex-shrink-0 pr-2 lg:pr-0">
        <ThemeToggle />
      </div>
    </header>
  );
}
