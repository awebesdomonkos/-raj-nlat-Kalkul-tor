
import React from 'react';
import { CalculatorIcon, HistoryIcon } from './icons';

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-lg text-white">
              <CalculatorIcon />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Árajánlat Kalkulátor</h1>
              <p className="text-sm text-slate-400">Készítse el előzetes árajánlatát egyszerűen és gyorsan!</p>
            </div>
        </div>
        <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 transition-all duration-200 hover:-translate-y-0.5 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            title="Előzmények megtekintése"
        >
            <HistoryIcon className="h-5 w-5" />
            Előzmények
        </button>
      </div>
    </header>
  );
};
