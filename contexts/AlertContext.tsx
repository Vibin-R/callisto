'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (alert: Omit<Alert, 'id'>) => void;
  showConfirm: (alert: Omit<Alert, 'id'>) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    setAlerts(prev => [...prev, { ...alert, id }]);
  }, []);

  const showConfirm = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    setAlerts(prev => [...prev, { ...alert, id }]);
  }, []);

  const closeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleConfirm = useCallback((alert: Alert) => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    closeAlert(alert.id);
  }, [closeAlert]);

  const handleCancel = useCallback((alert: Alert) => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    closeAlert(alert.id);
  }, [closeAlert]);

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-emerald-500" />;
      case 'error':
        return <XCircle size={24} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={24} className="text-amber-500" />;
      case 'info':
        return <Info size={24} className="text-blue-500" />;
    }
  };

  const getBgColor = (type: AlertType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200 ${getBgColor(alert.type)}`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {alert.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {alert.message}
                </p>
              </div>
              {!alert.onConfirm && (
                <button
                  onClick={() => closeAlert(alert.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              {alert.onConfirm && (
                <>
                  <button
                    onClick={() => handleCancel(alert)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {alert.cancelText || 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleConfirm(alert)}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                      alert.type === 'error' 
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                        : alert.type === 'warning'
                        ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                    }`}
                  >
                    {alert.confirmText || 'Confirm'}
                  </button>
                </>
              )}
              {!alert.onConfirm && (
                <button
                  onClick={() => closeAlert(alert.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </AlertContext.Provider>
  );
};

