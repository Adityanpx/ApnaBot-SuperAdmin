// app/layout.jsx
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'ApnaBot — Superadmin',
  description: 'ApnaBot platform control panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="apnabot-theme"
        >
          {children}

          {/* Sonner toaster — positioned top-right, styled for both themes */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}