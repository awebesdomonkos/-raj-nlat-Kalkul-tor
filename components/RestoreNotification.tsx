
import React from 'react';
import { HistoryIcon, XIcon } from './icons';

interface RestoreNotificationProps {
  onRestore: () => void;
  onDismiss: () => void;
}

const RestoreNotification: React.FC<RestoreNotificationProps> = ({ onRestore, onDismiss }) => {
  return (
    <div
      className="fixed bottom-8 left-8 z-50 flex items-start gap-4 p-4 rounded-lg shadow-2xl bg-slate-700 border border-slate-600 text-white max-w-sm animate-fade-in-up"
      role="alert"
      aria-live="polite"
    >
      <HistoryIcon className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
      <div className="flex-grow">
        <h4 className="font-bold">Munkamenet visszaállítása</h4>
        <p className="text-sm text-slate-300 mt-1 mb-3">
          Úgy tűnik, van egy befejezetlen árajánlatod. Szeretnéd folytatni a szerkesztést?
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onRestore}
            className="px-3 py-1.5 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-indigo-500"
          >
            Visszaállítás
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-md text-sm font-semibold text-slate-300 bg-slate-600 hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-slate-500"
          >
            Elvetés
          </button>
        </div>
      </div>
      <button onClick={onDismiss} className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-slate-500" title="Bezárás">
        <XIcon />
      </button>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RestoreNotification;
