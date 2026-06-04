import React, { useState, useEffect, useCallback } from 'react';
import { formatDate, addCalendarDays } from '../utils';
import { QuoteDetailsType, PackageId } from '../types';

interface QuoteDetailsProps {
    details: QuoteDetailsType;
    issueDate: Date;
    expiryDate: Date;
    onDetailsChange: (field: keyof QuoteDetailsType, value: string | number) => void;
    selectedPackageId: PackageId | null;
}

const validityOptions = [
    { label: '30 nap', value: 30 },
    { label: '60 nap', value: 60 },
    { label: '90 nap', value: 90 },
];

const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">{children}</div>
);

const FormLabel: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="font-semibold text-slate-300">{children}</label>
);

const generateIdNumber = () => {
    // Generates a 3-digit number based on the current date and time to ensure high uniqueness.
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Create a unique seed for every second of the year.
    const seed = (month * 31 + day) * 86400 + (hour * 3600) + (minutes * 60) + seconds;
    
    // Map the seed to the 100-999 range.
    const idNumber = (seed % 900) + 100;
    
    return idNumber.toString();
};


export const QuoteDetails: React.FC<QuoteDetailsProps> = ({ details, issueDate, expiryDate, onDetailsChange, selectedPackageId }) => {
    const [clientHistory, setClientHistory] = useState<string[]>([]);
    const [subjectHistory, setSubjectHistory] = useState<string[]>([]);
    const [timeValue, setTimeValue] = useState('');

    useEffect(() => {
        try {
            const clients = localStorage.getItem('clientHistory');
            if (clients) setClientHistory(JSON.parse(clients));
            const subjects = localStorage.getItem('subjectHistory');
            if (subjects) setSubjectHistory(JSON.parse(subjects));
        } catch (error)
        {
            console.error("Failed to parse history from localStorage", error);
        }
    }, []);
    
    useEffect(() => {
        const timeMatch = details.estimatedTime.match(/^\d+/);
        setTimeValue(timeMatch ? timeMatch[0] : '');
    }, [details.estimatedTime]);

    const isMaintenancePackage = selectedPackageId === PackageId.MAINTENANCE || selectedPackageId === PackageId.CONTINUOUS_MAINTENANCE;
    
    useEffect(() => {
        if (!selectedPackageId) return;

        const currentPrefix = isMaintenancePackage ? 'MAIN' : 'DEV';
        
        const needsIdUpdate = 
            !details.quoteId || // If no ID exists
            (details.quoteId.includes('-MAIN-') && !isMaintenancePackage) || // Switched from maintenance to dev
            (details.quoteId.includes('-DEV-') && isMaintenancePackage); // Switched from dev to maintenance

        if (needsIdUpdate) {
            const year = new Date().getFullYear();
            const numberPart = generateIdNumber();
            onDetailsChange('quoteId', `${year}-${currentPrefix}-${numberPart}`);
        }
    }, [selectedPackageId, details.quoteId, isMaintenancePackage, onDetailsChange]);


    useEffect(() => {
        if (isMaintenancePackage) {
            setTimeValue('');
        }
    }, [isMaintenancePackage]);
    
    useEffect(() => {
        onDetailsChange('estimatedTime', timeValue ? `${timeValue} munkanap` : '');
    }, [timeValue, onDetailsChange]);

    const addToHistory = useCallback((key: 'clientHistory' | 'subjectHistory', value: string) => {
        if (!value?.trim()) return;
        const history = key === 'clientHistory' ? clientHistory : subjectHistory;
        const setHistory = key === 'clientHistory' ? setClientHistory : setSubjectHistory;
        
        if (!history.some(item => item.toLowerCase() === value.toLowerCase())) {
            const newHistory = [value, ...history].slice(0, 15); // Keep last 15 entries
            setHistory(newHistory);
            localStorage.setItem(key, JSON.stringify(newHistory));
        }
    }, [clientHistory, subjectHistory]);

    return (
        <div className="space-y-6 pt-2">
            <FormRow>
                <FormLabel htmlFor="clientName">Ügyfél neve</FormLabel>
                <div className="md:col-span-2">
                    <input
                        type="text"
                        id="clientName"
                        list="client-history"
                        value={details.clientName}
                        onChange={(e) => onDetailsChange('clientName', e.target.value)}
                        onBlur={(e) => addToHistory('clientHistory', e.target.value)}
                        className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                    />
                    <datalist id="client-history">
                        {clientHistory.map(client => <option key={client} value={client} />)}
                    </datalist>
                </div>
            </FormRow>
            <FormRow>
                <FormLabel htmlFor="clientEmail">Ügyfél e-mail címe</FormLabel>
                <div className="md:col-span-2">
                    <input
                        type="email"
                        id="clientEmail"
                        value={details.clientEmail}
                        onChange={(e) => onDetailsChange('clientEmail', e.target.value)}
                        className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                        placeholder="nev@email.com"
                    />
                </div>
            </FormRow>
            <FormRow>
                <FormLabel>Ajánlat azonosítója</FormLabel>
                <div className="md:col-span-2 bg-slate-700 rounded-md border border-slate-600 px-3 py-2 text-slate-300 flex items-baseline">
                    {details.quoteId ? (
                        <>
                            <span className="text-slate-400">{details.quoteId.substring(0, details.quoteId.lastIndexOf('-') + 1)}</span>
                            <span className="font-semibold">{details.quoteId.substring(details.quoteId.lastIndexOf('-') + 1)}</span>
                        </>
                    ) : (
                        <span>...</span>
                    )}
                </div>
            </FormRow>
            <FormRow>
                <FormLabel htmlFor="subject">Tárgy</FormLabel>
                 <div className="md:col-span-2">
                    <input
                        type="text"
                        id="subject"
                        list="subject-history"
                        value={details.subject}
                        onChange={(e) => onDetailsChange('subject', e.target.value)}
                        onBlur={(e) => addToHistory('subjectHistory', e.target.value)}
                        className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                    />
                     <datalist id="subject-history">
                        {subjectHistory.map(subj => <option key={subj} value={subj} />)}
                    </datalist>
                </div>
            </FormRow>
            {isMaintenancePackage && (
                <FormRow>
                    <FormLabel htmlFor="websiteUrl">Weboldal címe</FormLabel>
                    <div className="md:col-span-2">
                        <input
                            type="url"
                            id="websiteUrl"
                            value={details.websiteUrl}
                            onChange={(e) => onDetailsChange('websiteUrl', e.target.value)}
                            className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                            placeholder="https://pelda.hu"
                        />
                    </div>
                </FormRow>
            )}
            {!isMaintenancePackage && (
                <FormRow>
                    <FormLabel htmlFor="estimatedTime">Ráfordítandó idő</FormLabel>
                    <div className="md:col-span-2 relative">
                        <input
                            type="number"
                            id="estimatedTime"
                            value={timeValue}
                            min="0"
                            placeholder="4"
                            onChange={(e) => setTimeValue(e.target.value)}
                            className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 pr-24 transition-colors duration-200"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400 pointer-events-none">
                            munkanap
                        </span>
                    </div>
                </FormRow>
            )}
            {!isMaintenancePackage && (
                <>
                    <FormRow>
                        <FormLabel htmlFor="priorityMultiplier">
                            Sürgősségi felár
                            <p className="text-xs font-normal text-slate-400 mt-1">Sürgős projektek esetén alkalmazott prioritási szorzó.</p>
                        </FormLabel>
                        <div className="md:col-span-2 flex items-center gap-4 self-center">
                            <input
                                type="range"
                                id="priorityMultiplier"
                                min="1"
                                max="3"
                                step="0.1"
                                value={details.priorityMultiplier}
                                onChange={(e) => onDetailsChange('priorityMultiplier', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="font-bold text-indigo-400 text-lg w-24 text-center bg-slate-700/50 py-1 px-2 rounded-md">
                                x{details.priorityMultiplier.toFixed(1)}
                            </span>
                        </div>
                    </FormRow>
                    <hr className="my-4 border-slate-700" />
                </>
            )}
             <FormRow>
                <FormLabel>Kelt</FormLabel>
                <p className="md:col-span-2 text-slate-200 font-medium p-2">{formatDate(issueDate)}</p>
             </FormRow>
            {!isMaintenancePackage && (
                <FormRow>
                    <FormLabel>Érvényesség</FormLabel>
                    <div className="md:col-span-2 flex flex-wrap gap-x-4 gap-y-2">
                        {validityOptions.map(option => (
                            <div key={option.value} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`validity-${option.value}`}
                                    name="validity"
                                    value={option.value}
                                    checked={details.validityDays === option.value}
                                    onChange={(e) => onDetailsChange('validityDays', parseInt(e.target.value, 10))}
                                    className="h-4 w-4 text-indigo-600 bg-slate-700 border-slate-500 focus:ring-indigo-500 transition-all duration-150"
                                />
                                <label htmlFor={`validity-${option.value}`} className="ml-2 block text-sm text-slate-300">
                                    {option.label}
                                    <span className="text-slate-400 text-xs ml-2">({formatDate(addCalendarDays(issueDate, option.value))})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </FormRow>
            )}
        </div>
    );
};