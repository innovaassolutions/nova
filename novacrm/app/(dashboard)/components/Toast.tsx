'use client';

/**
 * Toast Component
 *
 * Toast notification with slide-in animation and auto-dismiss.
 * Story: 2.2 - Contact Creation Form
 */

import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`animate-slideInRight flex min-w-[300px] items-start gap-3 rounded-lg border p-4 shadow-lg ${
        type === 'success'
          ? 'border-green-500/20 bg-green-500/10'
          : 'border-red-500/20 bg-red-500/10'
      }`}
    >
      {type === 'success' ? (
        <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500" />
      ) : (
        <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
      )}

      <p className={`flex-1 text-sm ${
        type === 'success' ? 'text-green-100' : 'text-red-100'
      }`}>
        {message}
      </p>

      <button
        onClick={onClose}
        className={`flex-shrink-0 rounded p-0.5 transition-colors ${
          type === 'success'
            ? 'text-green-400 hover:bg-green-500/20'
            : 'text-red-400 hover:bg-red-500/20'
        }`}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
