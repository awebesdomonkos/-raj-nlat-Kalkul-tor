
import React, { useState } from 'react';
import { QuoteHistoryItem, QuoteStatus, PackageId, FigmaPhaseStatus, PriceType } from '../types';
import { HistoryIcon, XIcon, SearchIcon, TrashIcon, DuplicateIcon, PdfIcon, SitemapIcon, EyeIcon } from './icons';
import { BASE_PACKAGES, EXTRAS } from '../constants';
import HistoryDetailView from './HistoryDetailView';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: QuoteHistoryItem[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onDownloadPdf: (id: string) => void;
    onDownloadSitemapPdf: (id: string) => void;
    onDuplicate: (id: string) => void;
    onStatusChange: (id: string, status: QuoteStatus) => void;
    onFigmaApproval: (id: string) => void;
    onUpdateFigmaPhase: (id: string, phase: FigmaPhaseStatus, figmaFileUrl?: string) => void;
    onUpdateResearch: (id: string, content: string) => void;
}

const statusConfig: Record<QuoteStatus, { text: string; color: string; ring: string }> = {
    [QuoteStatus.DRAFT]:    { text: 'Vázlat',     color: 'bg-slate-500', ring: 'ring-slate-400' },
    [QuoteStatus.SENT]:     { text: 'Elküldve',   color: 'bg-blue-500',  ring: 'ring-blue-400'  },
    [QuoteStatus.ACCEPTED]: { text: 'Elfogadva',  color: 'bg-green-500', ring: 'ring-green-400' },
    [QuoteStatus.REJECTED]: { text: 'Elutasítva', color: 'bg-red-500',   ring: 'ring-red-400'   },
};

const isMaintenance = (pkgId: PackageId | null) =>
    pkgId === PackageId.MAINTENANCE || pkgId === PackageId.CONTINUOUS_MAINTENANCE;

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount);

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen, onClose, history, onLoad, onDelete,
    onDownloadPdf, onDownloadSitemapPdf, onDuplicate, onStatusChange,
    onFigmaApproval, onUpdateFigmaPhase, onUpdateResearch,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [detailItemId, setDetailItemId] = useState<string | null>(null);

    if (!isOpen) return null;

    const detailItem = detailItemId ? history.find(h => h.id === detailItemId) ?? null : null;

    const filteredHistory = history
        .filter(item =>
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => b.savedAt - a.savedAt);

    const handleClose = () => {
        setDetailItemId(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
        >
            <div
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                {detailItem ? (
                    /* ── Detail view ── */
                    <HistoryDetailView
                        item={detailItem}
                        onBack={() => setDetailItemId(null)}
                        onDownloadQuotePdf={onDownloadPdf}
                        onDownloadSitemapPdf={onDownloadSitemapPdf}
                        onFigmaApproval={onFigmaApproval}
                        onUpdateFigmaPhase={onUpdateFigmaPhase}
                        onUpdateResearch={onUpdateResearch}
                    />
                ) : (
                    /* ── List view ── */
                    <>
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                            <h2 id="history-modal-title" className="text-xl font-bold text-slate-100 flex items-center gap-3">
                                <HistoryIcon />
                                Mentett Ajánlatok
                            </h2>
                            <button onClick={handleClose} className="text-slate-400 hover:text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500">
                                <XIcon />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 sm:p-6 flex-shrink-0">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Keresés azonosító, ügyfél vagy tárgy szerint..."
                                    className="w-full pl-10 p-2.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-grow overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
                            {filteredHistory.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredHistory.map(item => {
                                        const pkg = BASE_PACKAGES.find(p => p.id === item.state.selectedPackageId);
                                        const hasSitemap = !isMaintenance(item.state.selectedPackageId);
                                        const total = item.state.selectedPackageId === PackageId.CONTINUOUS_MAINTENANCE
                                            ? null
                                            : item.state.selectedPackageId === PackageId.MAINTENANCE
                                            ? pkg?.price ?? null
                                            : (() => {
                                                let t = pkg?.price ?? 0;
                                                Object.values(item.state.customInstances ?? {}).forEach(instances => {
                                                    (instances as any[]).forEach(i => { t += i.price ?? 0; });
                                                });
                                                EXTRAS.filter(e => item.state.selectedExtras?.[e.id]).forEach(extra => {
                                                    if (extra.isInstantiable) return;
                                                    const price = item.state.customPrices?.[extra.id] ?? (extra.type === PriceType.HOURLY ? 0 : extra.price);
                                                    t += price;
                                                });
                                                (item.state.customSections ?? []).forEach((s: any) => { t += s.price ?? 0; });
                                                t *= (item.state.quoteDetails?.priorityMultiplier ?? 1);
                                                const disc = item.state.discountPercentage ?? 0;
                                                if (disc > 0) t = t * (1 - disc / 100);
                                                return t;
                                            })();

                                        return (
                                            <li
                                                key={item.id}
                                                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-all duration-200 hover:-translate-y-0.5"
                                            >
                                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                                    {/* Info */}
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-indigo-400 text-sm">{item.id}</p>
                                                            {pkg && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                                                    {pkg.name}
                                                                </span>
                                                            )}
                                                            {item.researchContent && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                                    Research
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-100 font-semibold mt-1 truncate">
                                                            {item.clientName || '[Nincs ügyfél neve]'}
                                                        </p>
                                                        <p className="text-slate-400 text-sm truncate">
                                                            {item.subject || '—'}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-1.5">
                                                            <p className="text-slate-500 text-xs">
                                                                Mentve: {new Date(item.savedAt).toLocaleString('hu-HU')}
                                                            </p>
                                                            {total !== null && (
                                                                <p className="text-indigo-400 text-xs font-semibold">
                                                                    {formatCurrency(total)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                                                        {/* Status badge */}
                                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full text-white ${statusConfig[item.status].color}`}>
                                                            {statusConfig[item.status].text}
                                                        </span>
                                                        <select
                                                            value={item.status}
                                                            onChange={e => onStatusChange(item.id, e.target.value as QuoteStatus)}
                                                            className={`bg-slate-700 border-slate-600 rounded-md text-sm py-1.5 pl-2 pr-8 focus:ring-2 focus:outline-none ${statusConfig[item.status].ring} focus:border-transparent transition-all duration-200`}
                                                            onClick={e => e.stopPropagation()}
                                                            aria-label="Státusz módosítása"
                                                        >
                                                            {Object.values(QuoteStatus).map(s => (
                                                                <option key={s} value={s}>{statusConfig[s].text}</option>
                                                            ))}
                                                        </select>

                                                        {/* View details */}
                                                        <button
                                                            onClick={() => setDetailItemId(item.id)}
                                                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            title="Részletek megtekintése"
                                                        >
                                                            <EyeIcon />
                                                        </button>

                                                        {/* Load */}
                                                        <button
                                                            onClick={() => onLoad(item.id)}
                                                            className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-indigo-500"
                                                        >
                                                            Betöltés
                                                        </button>

                                                        {/* Duplicate */}
                                                        <button
                                                            onClick={() => onDuplicate(item.id)}
                                                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            title="Másolás"
                                                        >
                                                            <DuplicateIcon />
                                                        </button>

                                                        {/* Quote PDF */}
                                                        <button
                                                            onClick={() => onDownloadPdf(item.id)}
                                                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            title="Árajánlat PDF letöltése"
                                                        >
                                                            <PdfIcon />
                                                        </button>

                                                        {/* Site Map PDF */}
                                                        {hasSitemap && (
                                                            <button
                                                                onClick={() => onDownloadSitemapPdf(item.id)}
                                                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                title="Site Map PDF letöltése"
                                                            >
                                                                <SitemapIcon />
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => onDelete(item.id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                            title="Törlés"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400">
                                        {searchQuery ? 'Nincs a keresésnek megfelelő találat.' : 'Nincsenek mentett ajánlatok.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryModal;
