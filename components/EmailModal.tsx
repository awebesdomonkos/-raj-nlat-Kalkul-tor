
import React, { useState, useEffect } from 'react';
import { QuoteDetailsType } from '../types';
import { EmailIcon, XIcon } from './icons';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteDetails: QuoteDetailsType;
  onSend: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, quoteDetails, onSend }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTo(quoteDetails.clientEmail || '');
      setSubject(quoteDetails.subject || `Árajánlat: ${quoteDetails.quoteId}`);
      setBody(`Kedves ${quoteDetails.clientName || 'Partnerünk'}!\n\nKöszönöm szépen árajánlat kérését, mellékletben csatolom Önnek a részletes árajánlatot a különböző tételek amiket előzetesen megbeszéltünk.\n\nAmennyiben bármi kérdése lenne, keressen bizalommal elérhetőségeim valamelyikén!\n\nÜdvözlettel,\nAwebes Csapata`);
    }
  }, [isOpen, quoteDetails]);

  if (!isOpen) {
    return null;
  }

  const handleSendClick = () => {
    onSend(); // Triggers PDF download
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 id="email-modal-title" className="text-xl font-bold text-slate-100 flex items-center gap-3">
            <EmailIcon />
            Árajánlat küldése e-mailben
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500">
            <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div className="p-4 bg-indigo-900/30 text-indigo-200 border border-indigo-700/50 rounded-lg text-sm">
                <strong>Fontos:</strong> A "Küldés" gomb letölti a PDF-et, majd megnyitja az alapértelmezett e-mail kliensét. Kérjük, <strong>manuálisan csatolja a letöltött PDF fájlt</strong> az e-mailhez.
            </div>
            <div>
                <label htmlFor="email-from" className="block text-sm font-medium text-slate-300 mb-1">Feladó:</label>
                <input
                    type="text"
                    id="email-from"
                    value="info@awebes.hu"
                    readOnly
                    className="w-full rounded-md bg-slate-900 border-slate-700 text-slate-400 shadow-sm sm:text-sm p-2 cursor-not-allowed"
                />
            </div>
            <div>
                <label htmlFor="email-to" className="block text-sm font-medium text-slate-300 mb-1">Címzett:</label>
                <input
                    type="email"
                    id="email-to"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                />
            </div>
            <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-slate-300 mb-1">Tárgy:</label>
                <input
                    type="text"
                    id="email-subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                />
            </div>
            <div>
                <label htmlFor="email-body" className="block text-sm font-medium text-slate-300 mb-1">Üzenet:</label>
                <textarea
                    id="email-body"
                    rows={8}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                />
            </div>
        </div>
        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700 flex justify-end items-center gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm font-semibold text-slate-300 bg-slate-600 hover:bg-slate-500 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
            >
                Mégse
            </button>
            <button
                onClick={handleSendClick}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 hover:-translate-y-0.5"
            >
                <EmailIcon />
                Küldés és PDF letöltése
            </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
