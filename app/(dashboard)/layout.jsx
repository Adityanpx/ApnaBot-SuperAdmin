// app/(dashboard)/layout.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Spinner from '@/components/ui/Spinner';
import useAuthStore from '@/store/authStore';

export default function DashboardLayout({ children }) {
  const router     = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check auth on every dashboard navigation
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [isLoggedIn, router]);

  // Show full-page spinner while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">

      {/* Sidebar — fixed, 260px wide */}
      <Sidebar />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="md:pl-sidebar min-h-screen flex flex-col">

        {/* Sticky topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
