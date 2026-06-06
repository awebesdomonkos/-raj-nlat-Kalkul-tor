
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface ResearchUploadModalProps {
    isOpen: boolean;
    clientName: string;
    quoteId: string;
    existingContent: string;
    onSave: (content: string) => void;
    onCancel: () => void;
}

const ResearchUploadModal: React.FC<ResearchUploadModalProps> = ({
    isOpen, clientName, quoteId, existingContent, onSave, onCancel,
}) => {
    const [content, setContent] = useState(existingContent);

    useEffect(() => {
        if (isOpen) setContent(existingContent);
    }, [isOpen, existingContent]);

    if (!isOpen) return null;

    const isEditing = !!existingContent;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4"
            onClick={onCancel}
        >
            <div
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col border border-slate-700 max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">
                            {isEditing ? '✏️ Research dokumentum szerkesztése' : '📋 Research dokumentum feltöltése'}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {clientName} — <span className="text-indigo-400 font-mono">{quoteId}</span>
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-3">
                    <p className="text-xs text-slate-400">
                        Illeszd be a JARVIS által generált markdown dokumentumot. Támogatott: <code className="text-indigo-300"># ## ###</code> fejlécek, <code className="text-indigo-300">| táblázat |</code>, <code className="text-indigo-300">- lista</code>, <code className="text-indigo-300">**félkövér**</code>, <code className="text-indigo-300">&gt; idézet</code>
                    </p>
                    <textarea
                        className="w-full bg-slate-900 text-slate-100 text-sm font-mono rounded-lg border border-slate-600 focus:border-indigo-500 focus:outline-none p-4 resize-none flex-1"
                        style={{ minHeight: '340px' }}
                        placeholder="# Cég neve — Piacelemzés&#10;&#10;## Összefoglaló&#10;> Rövid piaci helyzet...&#10;&#10;## Versenytárs elemzés&#10;| Versenytárs | Weboldal | Erősség | Gyengeség |&#10;|---|---|---|---|&#10;..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        autoFocus
                    />
                    <p className="text-xs text-slate-500 text-right">
                        {content.length} karakter
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        Mégsem
                    </button>
                    <button
                        onClick={() => onSave(content.trim())}
                        disabled={!content.trim()}
                        className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        💾 Mentés
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResearchUploadModal;
