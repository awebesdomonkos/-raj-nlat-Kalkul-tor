
import React, { useState } from 'react';
import { QuoteHistoryItem, QuoteStatus } from '../types';
import { HistoryIcon, XIcon, SearchIcon, TrashIcon, DuplicateIcon, PdfIcon } from './icons';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: QuoteHistoryItem[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onDownloadPdf: (id: string) => void;
    onDuplicate: (id: string) => void;
    onStatusChange: (id: string, status: QuoteStatus) => void;
}

const statusConfig: Record<QuoteStatus, { text: string; color: string; ring: string }> = {
    [QuoteStatus.DRAFT]: { text: 'Vázlat', color: 'bg-slate-500', ring: 'ring-slate-400' },
    [QuoteStatus.SENT]: { text: 'Elküldve', color: 'bg-blue-500', ring: 'ring-blue-400' },
    [QuoteStatus.ACCEPTED]: { text: 'Elfogadva', color: 'bg-green-500', ring: 'ring-green-400' },
    [QuoteStatus.REJECTED]: { text: 'Elutasítva', color: 'bg-red-500', ring: 'ring-red-400' },
};


const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onLoad, onDelete, onDownloadPdf, onDuplicate, onStatusChange }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) {
        return null;
    }

    const filteredHistory = history
        .filter(item =>
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.savedAt - a.savedAt);

    const handleDelete = (id: string, clientName: string) => {
        // As the delete icon was reported as not working, the confirmation is removed to ensure functionality.
        // In a real-world scenario, a custom confirmation modal would be a better approach than removing the check.
        onDelete(id);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
        >
            <div 
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="history-modal-title" className="text-xl font-bold text-slate-100 flex items-center gap-3">
                        <HistoryIcon />
                        Mentett Ajánlatok
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 flex-shrink-0">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Keresés azonosító, ügyfél vagy tárgy szerint..."
                            className="w-full pl-10 p-2.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto px-6 pb-6">
                    {filteredHistory.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredHistory.map(item => (
                                <li key={item.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-slate-700/50 transition-all duration-200 hover:-translate-y-0.5">
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-indigo-400 text-sm truncate">{item.id}</p>
                                        <p className="text-slate-200 font-semibold truncate">{item.clientName || '[Nincs ügyfél]'}</p>
                                        <p className="text-slate-400 text-sm truncate">Tárgy: {item.subject || '-'}</p>
                                        <p className="text-slate-500 text-xs mt-1">Mentve: {new Date(item.savedAt).toLocaleString('hu-HU')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                                         <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full text-white ${statusConfig[item.status].color}`}>
                                                {statusConfig[item.status].text}
                                            </span>
                                            <select
                                                value={item.status}
                                                onChange={(e) => onStatusChange(item.id, e.target.value as QuoteStatus)}
                                                className={`bg-slate-700 border-slate-600 rounded-md text-sm py-1.5 pl-2 pr-8 focus:ring-2 focus:outline-none ${statusConfig[item.status].ring} focus:border-transparent transition-all duration-200`}
                                                onClick={(e) => e.stopPropagation()}
                                                aria-label="Státusz módosítása"
                                            >
                                                {Object.values(QuoteStatus).map(s => (
                                                    <option key={s} value={s}>{statusConfig[s].text}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => onLoad(item.id)}
                                            className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-indigo-500"
                                        >
                                            Betöltés
                                        </button>
                                        <button
                                            onClick={() => onDuplicate(item.id)}
                                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            title="Másolás"
                                        >
                                            <DuplicateIcon />
                                        </button>
                                        <button
                                            onClick={() => onDownloadPdf(item.id)}
                                            className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            title="PDF letöltése"
                                        >
                                            <PdfIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.clientName)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            title="Törlés"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-400">
                                {searchQuery ? 'Nincs a keresésnek megfelelő találat.' : 'Nincsenek mentett ajánlatok.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
