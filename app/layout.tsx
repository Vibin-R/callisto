import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AlertProvider } from '../contexts/AlertContext';
import { MUIThemeProvider } from '../contexts/MUIThemeProvider';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Callisto - A Not So Intelligent Progress Tracker',
  description: 'Track your learning journey and stay motivated',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <MUIThemeProvider>
            <AuthProvider>
              <AlertProvider>
                {children}
              </AlertProvider>
            </AuthProvider>
          </MUIThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

