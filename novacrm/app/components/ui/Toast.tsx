'use client';

/**
 * Toast Notification Component
 *
 * Provides temporary notification messages for user feedback.
 * Features Catppuccin Mocha dark theme with auto-dismiss and animations.
 *
 * Usage:
 * import { showToast } from '@/app/components/ui/Toast';
 *
 * showToast('Success message', 'success');
 * showToast('Error message', 'error');
 * showToast('Info message', 'info');
 *
 * Design: Catppuccin Mocha color palette
 * - Background: #181825 (Mocha Mantle)
 * - Text: #cdd6f4 (Mocha Text)
 * - Error border: #f38ba8 (Mocha Red)
 * - Success border: #a6e3a1 (Mocha Green)
 * - Info border: #89b4fa (Mocha Blue)
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastListener: ((message: string, type: ToastType) => void) | null = null;

// Global function to trigger toast from anywhere
export function showToast(message: string, type: ToastType = 'info') {
  if (toastListener) {
    toastListener(message, type);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    toastListener = addToast;
    return () => {
      toastListener = null;
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    const baseStyles =
      'rounded-lg border-2 bg-[#181825] text-[#cdd6f4] shadow-lg';

    switch (type) {
      case 'error':
        return `${baseStyles} border-[#f38ba8]`;
      case 'success':
        return `${baseStyles} border-[#a6e3a1]`;
      case 'info':
        return `${baseStyles} border-[#89b4fa]`;
      default:
        return `${baseStyles} border-[#89b4fa]`;
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(
            toast.type
          )} pointer-events-auto animate-fade-in-up px-4 py-3 text-sm font-medium transition-all duration-300 hover:opacity-90`}
          onClick={() => removeToast(toast.id)}
          role="alert"
          aria-live="assertive"
        >
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
