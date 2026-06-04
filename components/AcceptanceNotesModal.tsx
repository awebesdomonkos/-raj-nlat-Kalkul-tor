
import React, { useState } from 'react';
import { ClientNotes } from '../types';
import { XIcon } from './icons';

export type AcceptancePhase = 'quote' | 'figma';

interface AcceptanceNotesModalProps {
    isOpen: boolean;
    phase: AcceptancePhase;
    clientName: string;
    quoteId: string;
    onSaveOnly: (notes: ClientNotes) => void;
    onSaveAndStart: (notes: ClientNotes) => void;
    onCancel: () => void;
}

const PHASE_CONFIG = {
    quote: {
        title: 'Árajánlat elfogadva',
        subtitle: 'Volt-e megjegyzése az ügyfélnek az árajánlathoz?',
        changeLabel: 'Igen, volt változás / megjegyzés',
        sections: [
            { key: 'designNotes',  label: '🎨 Dizájn megjegyzések', placeholder: 'Pl. sötétebb szín, más hangvétel, referencia oldalak...' },
            { key: 'itemChanges',  label: '📋 Tétel változások',    placeholder: 'Pl. GYIK oldal kimarad, extra hírlevél szekció kell...' },
            { key: 'pageChanges',  label: '📄 Oldal változások',    placeholder: 'Pl. Rólunk oldal helyett Csapatunk legyen, extra GYIK aloldalak...' },
        ],
        saveLabel: '💾 Csak mentés',
        startLabel: '🎨 Figma tervezés elindítása',
        startHint: 'Menti a megjegyzéseket, majd JARVIS-nak jelezd hogy elindíthatja a Figma fázist.',
    },
    figma: {
        title: 'Figma design elfogadva',
        subtitle: 'Volt-e módosítási kérés az ügyfél részéről a designhoz?',
        changeLabel: 'Igen, kért módosítást',
        sections: [
            { key: 'designNotes',  label: '🎨 Design visszajelzés', placeholder: 'Pl. más gomb stílus, logo pozíció csere, szín módosítás...' },
            { key: 'itemChanges',  label: '📋 Tartalom változás',   placeholder: 'Pl. hero szöveg módosítás, kép csere, sorrend változtatás...' },
            { key: 'pageChanges',  label: '📄 Struktúra változás',  placeholder: 'Pl. új szekció kell a főoldalra, elrendezés módosítás...' },
        ],
        saveLabel: '💾 Csak mentés',
        startLabel: '🚀 Fejlesztés jóváhagyása',
        startHint: 'Menti a megjegyzéseket, majd JARVIS-nak jelezd hogy elindíthatja a fejlesztési fázist.',
    },
};

const emptyNotes = (): Omit<ClientNotes, 'submittedAt'> => ({
    hasChanges: false,
    designNotes: '',
    itemChanges: '',
    pageChanges: '',
    generalNotes: '',
});

const AcceptanceNotesModal: React.FC<AcceptanceNotesModalProps> = ({
    isOpen, phase, clientName, quoteId, onSaveOnly, onSaveAndStart, onCancel,
}) => {
    const [notes, setNotes] = useState(emptyNotes());
    const config = PHASE_CONFIG[phase];

    if (!isOpen) return null;

    const buildNotes = (): ClientNotes => ({ ...notes, submittedAt: Date.now() });

    const update = (field: keyof typeof notes, value: string | boolean) =>
        setNotes(prev => ({ ...prev, [field]: value }));

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4"
            onClick={onCancel}
        >
            <div
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-700 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">
                            {phase === 'quote' ? '🎉' : '✅'} {config.title}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            <span className="text-indigo-400 font-semibold">{clientName}</span>
                            {' · '}{quoteId}
                        </p>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white p-1 rounded-full">
                        <XIcon />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Has changes toggle */}
                    <div
                        onClick={() => update('hasChanges', !notes.hasChanges)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            notes.hasChanges
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                            notes.hasChanges ? 'bg-amber-500' : 'bg-slate-700'
                        }`}>
                            {notes.hasChanges && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm font-medium">{config.changeLabel}</span>
                    </div>

                    {/* Sectioned notes — shown if hasChanges */}
                    {notes.hasChanges && (
                        <div className="space-y-3">
                            {config.sections.map(section => (
                                <div key={section.key}>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                        {section.label}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={(notes as any)[section.key]}
                                        onChange={e => update(section.key as any, e.target.value)}
                                        placeholder={section.placeholder}
                                        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* General notes — always visible */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                            💬 Általános megjegyzés
                        </label>
                        <textarea
                            rows={3}
                            value={notes.generalNotes}
                            onChange={e => update('generalNotes', e.target.value)}
                            placeholder="Bármilyen egyéb megjegyzés, határidő, különleges kérés..."
                            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex-shrink-0">
                    <div className="flex gap-3 flex-wrap justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={() => onSaveOnly(buildNotes())}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                        >
                            {config.saveLabel}
                        </button>
                        <button
                            onClick={() => onSaveAndStart(buildNotes())}
                            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                        >
                            {config.startLabel}
                        </button>
                    </div>
                    <p className="text-slate-500 text-xs mt-3 text-right">{config.startHint}</p>
                </div>
            </div>
        </div>
    );
};

export default AcceptanceNotesModal;
