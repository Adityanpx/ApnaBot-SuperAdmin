// app/not-found.jsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand mb-8">
          <Bot className="w-8 h-8 text-white" />
        </div>

        {/* 404 number */}
        <h1 className="text-8xl font-black gradient-text leading-none mb-4">
          404
        </h1>

        <h2 className="text-xl font-bold text-text-primary mb-3">
          Page not found
        </h2>
        <p className="text-sm text-text-tertiary leading-relaxed mb-8">
          This page doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>

        <Link href="/dashboard">
          <Button variant="primary" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
