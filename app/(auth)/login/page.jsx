// app/(auth)/login/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const router   = useRouter();
  const { loginSuccess, isLoggedIn } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (isLoggedIn) router.replace('/dashboard');
  }, [isLoggedIn, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post(API.LOGIN, {
        email:    data.email.trim().toLowerCase(),
        password: data.password,
      });

      const { user, accessToken, refreshToken } = res.data.data;

      // Confirm role before granting access
      if (user.role !== 'superadmin') {
        toast.error('Access denied. Superadmin only.');
        return;
      }

      loginSuccess(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      router.replace('/dashboard');

    } catch (err) {
      toast.error(err.userMessage || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Animation variants ──────────────────────────────────────────────────
  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">

      {/* Background subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs — decorative, matches Figma dark aesthetic */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="card p-8 md:p-10">

          {/* Logo + Title - Floating animation */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mb-10">
            {/* Floating animation on the logo */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand"
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                ApnaBot
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Superadmin Control Panel
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@apnabot.com"
                className={cn(
                  'input-field',
                  errors.email && 'border-danger-DEFAULT focus:border-danger-DEFAULT focus:shadow-none'
                )}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-danger-text mt-1">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Password field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'input-field pr-12',
                    errors.password && 'border-danger-DEFAULT'
                  )}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger-text mt-1">{errors.password.message}</p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full h-11 rounded-xl font-semibold text-sm text-white',
                  'bg-gradient-brand shadow-glow-brand',
                  'transition-all duration-200',
                  'hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.45)]',
                  'active:scale-[0.98]',
                  'disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100',
                  'flex items-center justify-center gap-2'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer note */}
          <motion.p
            variants={itemVariants}
            className="text-center text-xs text-text-tertiary mt-8"
          >
            Superadmin access only. Unauthorized access is prohibited.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
