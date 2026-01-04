'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme as useAppTheme } from './ThemeContext';

export const MUIThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: appTheme } = useAppTheme();
  
  const isDark = appTheme === 'dark' || (appTheme === 'system' && 
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#4f46e5', // indigo-600
        light: '#818cf8', // indigo-400
        dark: '#4338ca', // indigo-700
      },
      background: {
        default: isDark ? '#111827' : '#f9fafb',
        paper: isDark ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#111827',
        secondary: isDark ? '#9ca3af' : '#6b7280',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiSelect: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            backgroundColor: isDark ? '#374151' : '#f9fafb',
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: isDark ? '#4b5563' : '#f3f4f6',
              borderColor: isDark ? '#6b7280' : '#d1d5db',
            },
            '&.Mui-focused': {
              borderColor: '#4f46e5',
              boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: isDark ? '#374151' : '#f9fafb',
            borderRadius: '0.5rem',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#6b7280' : '#d1d5db',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4f46e5',
              borderWidth: '2px',
            },
          },
          notchedOutline: {
            borderColor: isDark ? '#4b5563' : '#e5e7eb',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 600,
          },
        },
      },
    },
  });

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

