
import React from 'react';
import { EliteExtension } from '../types';

interface EliteExtensionsProps {
  extensions: EliteExtension[];
  selectedExtensions: Record<string, boolean>;
  onToggle: (id: string, isSelected: boolean) => void;
  customElitePrices: Record<string, number>;
  onCustomPriceChange: (id: string, price: number) => void;
}

const EliteExtensions: React.FC<EliteExtensionsProps> = ({ extensions, selectedExtensions, onToggle, customElitePrices, onCustomPriceChange }) => {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800/80">
            <h3 className="font-bold text-lg text-slate-200">Elite Extensions szolgáltatások díjszabása:</h3>
            <p className="text-sm text-slate-400">A felsorolásban az Elite Extensions szolgáltatások díjszabását láthatod külön-külön lebontva.</p>
        </div>
        <div className="border-t border-slate-700">
            {/* Header */}
            <div className="hidden md:flex bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-400">
                <div className="flex-grow pl-9">Szolgáltatás</div>
                <div className="w-48 text-right pr-4">Egyszeri nettó ár</div>
                <div className="w-48 text-right pr-4">Havi nettó ár</div>
            </div>
            {extensions.map((ext) => {
                const isSelected = !!selectedExtensions[ext.id];
                const hasPriceRange = ext.priceMonthlyDisplay.includes('–');
                const showCustomPriceInput = isSelected && hasPriceRange;

                return (
                    <div key={ext.id} className={`p-4 transition-colors border-b border-slate-800 last:border-b-0 ${isSelected ? 'bg-slate-700/50' : 'bg-transparent hover:bg-slate-800/30'}`}>
                        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                            <div className="flex items-start gap-3 flex-grow">
                                <input
                                    type="checkbox"
                                    id={`elite-${ext.id}`}
                                    checked={isSelected}
                                    onChange={(e) => onToggle(ext.id, e.target.checked)}
                                    className="mt-1 h-5 w-5 rounded bg-slate-600 border-slate-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0 transition-all duration-150"
                                />
                                <div>
                                    <label htmlFor={`elite-${ext.id}`} className="text-slate-200 cursor-pointer font-semibold">{ext.name}</label>
                                    <p className="text-sm text-slate-400 mt-1 whitespace-pre-line">{ext.description}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 ml-auto md:ml-0 pl-8 md:pl-4 flex flex-col md:flex-row md:gap-4 text-left md:text-right">
                                <div className="w-full md:w-44 mb-2 md:mb-0">
                                    <span className="md:hidden text-xs text-slate-400">Egyszeri díj: </span>
                                    <p className="font-semibold text-slate-300">{ext.priceOneTimeDisplay}</p>
                                </div>
                                <div className="w-full md:w-44">
                                     <span className="md:hidden text-xs text-slate-400">Havi díj: </span>
                                    <p className="font-semibold text-slate-300">{ext.priceMonthlyDisplay}</p>
                                </div>
                            </div>
                        </div>
                        {showCustomPriceInput && (
                            <div className="mt-3 ml-8 flex items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-700">
                                <label htmlFor={`price-${ext.id}`} className="text-sm font-medium text-slate-400">
                                    Végleges havidíj:
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id={`price-${ext.id}`}
                                        value={customElitePrices[ext.id] ?? ''}
                                        min="0"
                                        step="500"
                                        placeholder={ext.priceMonthly.toString()}
                                        onChange={(e) => onCustomPriceChange(ext.id, parseInt(e.target.value) || 0)}
                                        className="w-32 rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 pr-12 transition-colors duration-200"
                                    />
                                     <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400">Ft / hó</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default EliteExtensions;
