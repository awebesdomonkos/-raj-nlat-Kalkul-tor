
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PackageId, Extra, PriceType, CustomInstance, EditableContentItem, QuoteDetailsType, MaintenancePlan, EliteExtension, QuoteState, QuoteHistoryItem, QuoteStatus, ClientNotes, FigmaPhaseStatus, PexelsPhoto } from './types';
import { BASE_PACKAGES, EXTRAS, BONUS_PAGES, PACKAGE_FEATURES, MAINTENANCE_PLANS, ELITE_EXTENSIONS } from './constants';
import PackageSelector from './components/PackageSelector';
import ExtrasAccordion from './components/ExtrasAccordion';
import Summary from './components/Summary';
import { Header } from './components/Header';
import { QuoteDetails } from './components/QuoteDetails';
import { ResetIcon, SearchIcon } from './components/icons';
// FIX: Removed unused 'debounce' import.
import { addCalendarDays } from './utils';
import LandingPageExtras from './components/LandingPageExtras';
import Notification from './components/Notification';
import ContinuousMaintenanceSelector from './components/ContinuousMaintenanceSelector';
import EliteExtensions from './components/EliteExtensions';
import HistoryModal from './components/HistoryModal';
import AcceptanceNotesModal, { AcceptancePhase } from './components/AcceptanceNotesModal';
import { generateQuotePDF, generateSitemapPDF, PdfQuoteData } from './pdfGenerator';
import RestoreNotification from './components/RestoreNotification';
import SitemapView from './components/SitemapView';

// --- START OF MIGRATION & STATE INITIALIZATION LOGIC ---

const initialQuoteDetails: QuoteDetailsType = {
    clientName: '',
    clientEmail: '',
    quoteId: '',
    subject: '',
    estimatedTime: '',
    validityDays: 30,
    priorityMultiplier: 1,
    websiteUrl: '',
};

const initialEditablePackageContents: { pages: EditableContentItem[]; features: EditableContentItem[] } = {
    pages: [],
    features: []
};

/**
 * Provides a complete, default QuoteState object. This is used for resetting the
 * calculator and as a base for migrating older saved states.
 */
const getInitialQuoteState = (): QuoteState => ({
    selectedPackageId: null,
    selectedExtras: {},
    customPrices: {},
    customSections: [],
    customInstances: {},
    quoteDetails: { ...initialQuoteDetails },
    editablePackageContents: { ...initialEditablePackageContents },
    selectedPlanId: null,
    selectedEliteExtensions: {},
    customElitePrices: {},
    status: QuoteStatus.DRAFT,
    discountPercentage: 0,
});

/**
 * Migrates a potentially outdated quote state from localStorage to the latest structure.
 * It ensures all properties are present with sane default values, preventing data loss
 * or errors when the application's data structure evolves.
 * @param oldState The potentially incomplete state object loaded from storage.
 * @returns A complete and safe QuoteState object that matches the current application version.
 */
const migrateQuoteState = (oldState: Partial<QuoteState>): QuoteState => {
    const defaultState = getInitialQuoteState();
    
    // Merge nested objects carefully to ensure all their sub-properties exist.
    const quoteDetails = { ...defaultState.quoteDetails, ...(oldState.quoteDetails || {}) };
    const editablePackageContents = { ...defaultState.editablePackageContents, ...(oldState.editablePackageContents || {}) };

    // Ensure properties that should be arrays are initialized as such if missing.
    if (!Array.isArray(editablePackageContents.pages)) editablePackageContents.pages = [];
    if (!Array.isArray(editablePackageContents.features)) editablePackageContents.features = [];
    
    // Combine the default state with the old state, ensuring new properties are added.
    const migratedState: QuoteState = {
        ...defaultState,
        ...oldState,
        quoteDetails,
        editablePackageContents,
        status: oldState.status || QuoteStatus.DRAFT,
        discountPercentage: oldState.discountPercentage || 0,
    };
    
    return migratedState;
};

/**
 * Migrates an entire history array from localStorage. It iterates through each saved quote,
 * validates its basic structure, and applies the state migration to it.
 * @param data The raw data array parsed from localStorage.
 * @returns A clean, migrated array of QuoteHistoryItem.
 */
const migrateQuoteHistory = (data: any): QuoteHistoryItem[] => {
    if (!Array.isArray(data)) {
        console.warn("Stored history is not an array, resetting.", data);
        return [];
    }

    return data
        .map((item: any) => {
            // Basic validation of the history item structure. Skip corrupted items.
            if (!item || typeof item.id !== 'string' || typeof item.state !== 'object' || item.state === null) {
                return null;
            }
            const migratedState = migrateQuoteState(item.state);
            return {
                ...item,
                state: migratedState, // Apply migration to the state object
                status: item.status || migratedState.status,
            };
        })
        .filter((item): item is QuoteHistoryItem => item !== null); // Filter out any null (corrupted) items
};

// --- END OF MIGRATION & STATE INITIALIZATION LOGIC ---

const App: React.FC = () => {
    const [selectedPackageId, setSelectedPackageId] = useState<PackageId | null>(null);
    const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
    const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
    const [customSections, setCustomSections] = useState<{ id: string; name: string; price: number }[]>([]);
    const [customInstances, setCustomInstances] = useState<Record<string, CustomInstance[]>>({});
    const [extrasSearchQuery, setExtrasSearchQuery] = useState('');
    const [editablePackageContents, setEditablePackageContents] = useState<{ pages: EditableContentItem[]; features: EditableContentItem[] }>(initialEditablePackageContents);
    const [notification, setNotification] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<'smart' | 'pro' | null>(null);
    const [selectedEliteExtensions, setSelectedEliteExtensions] = useState<Record<string, boolean>>({});
    const [customElitePrices, setCustomElitePrices] = useState<Record<string, number>>({});
    // FIX: Moved quoteDetails state initialization before its usage in useEffect to fix a 'used before declaration' error.
    const [quoteDetails, setQuoteDetails] = useState<QuoteDetailsType>(initialQuoteDetails);
    const [status, setStatus] = useState<QuoteStatus>(QuoteStatus.DRAFT);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [sessionToRestore, setSessionToRestore] = useState<QuoteState | null>(null);
    // FIX: Explicitly initialize useRef with `undefined` to satisfy older/stricter type checkers that may not support the no-argument overload.
    const timerRef = React.useRef<number | undefined>(undefined);
    // FIX: Explicitly initialize useRef with `undefined` to satisfy older/stricter type checkers that may not support the no-argument overload.
    const debounceTimerRef = React.useRef<number | undefined>(undefined);
    const sessionSaveTimerRef = React.useRef<number | undefined>(undefined);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [quoteHistory, setQuoteHistory] = useState<QuoteHistoryItem[]>([]);
    const [acceptanceModal, setAcceptanceModal] = useState<{
        phase: AcceptancePhase;
        quoteId: string;
    } | null>(null);

    // On mount: fetch JARVIS-generated quotes from the server-side JSON
    // and merge them into history (JARVIS pushes new quotes here via git).
    // Respects 'deletedJarvisIds' in localStorage so user-deleted entries stay deleted.
    useEffect(() => {
        fetch(`/jarvis-quotes.json?v=${Date.now()}`)
            .then(r => {
                console.log('[JARVIS] jarvis-quotes.json status:', r.status, r.ok);
                return r.ok ? r.json() : [];
            })
            .then((serverQuotes: any[]) => {
                console.log('[JARVIS] server quotes loaded:', serverQuotes.length, serverQuotes.map((q: any) => q.id));
                if (!serverQuotes.length) return;
                const deletedIds: string[] = JSON.parse(localStorage.getItem('deletedJarvisIds') || '[]');
                setQuoteHistory(prev => {
                    const merged = [...prev];
                    for (const raw of serverQuotes) {
                        if (deletedIds.includes(raw.id)) continue;
                        try {
                            const migratedState = migrateQuoteState(raw.state);
                            const item: QuoteHistoryItem = { ...raw, state: migratedState };
                            const idx = merged.findIndex(q => q.id === item.id);
                            if (idx === -1) merged.unshift(item);
                            else if (merged[idx].savedAt < item.savedAt) merged[idx] = item;
                        } catch (e) {
                            console.warn('[JARVIS] failed to migrate quote:', (raw as any)?.id, e);
                        }
                    }
                    return merged;
                });
            })
            .catch(err => console.error('[JARVIS] failed to load jarvis-quotes.json:', err));
    }, []);

    // On mount: fetch JARVIS-generated research documents and inject into matching quotes.
    // JARVIS writes to public/research.json and pushes — Vercel deploys automatically.
    useEffect(() => {
        fetch(`/research.json?v=${Date.now()}`, { cache: 'no-store' })
            .then(r => r.ok ? r.json() : {})
            .then((researchMap: Record<string, string>) => {
                const entries = Object.entries(researchMap);
                if (!entries.length) return;
                setQuoteHistory(prev => {
                    const base = prev.length > 0 ? prev : (() => {
                        try {
                            const stored = localStorage.getItem('quoteHistory');
                            return stored ? migrateQuoteHistory(JSON.parse(stored)) : [];
                        } catch { return []; }
                    })();
                    const updated = base.map((item: QuoteHistoryItem) => {
                        const content = researchMap[item.id];
                        return content ? { ...item, researchContent: content } : item;
                    });
                    try { localStorage.setItem('quoteHistory', JSON.stringify(updated)); } catch {}
                    return updated;
                });
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const STORAGE_WIPE_VERSION = 'wipe_v2';
        if (localStorage.getItem('storageWipeVersion') !== STORAGE_WIPE_VERSION) {
            localStorage.removeItem('quoteHistory');
            localStorage.removeItem('unsavedQuoteSession');
            localStorage.removeItem('deletedJarvisIds');
            localStorage.setItem('storageWipeVersion', STORAGE_WIPE_VERSION);
        }
    }, []);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('quoteHistory');
            if (storedHistory) {
                const parsedData = JSON.parse(storedHistory);
                const migratedHistory = migrateQuoteHistory(parsedData);
                setQuoteHistory(migratedHistory);
            }

            // URL import: ?save=<base64-encoded-QuoteHistoryItem>
            // Directly saves the quote to history so it appears in the modal immediately.
            const params = new URLSearchParams(window.location.search);
            const saveParam = params.get('save');
            if (saveParam) {
                try {
                    const decoded: QuoteHistoryItem = JSON.parse(atob(saveParam));
                    const migratedState = migrateQuoteState(decoded.state);
                    const item: QuoteHistoryItem = { ...decoded, state: migratedState };
                    const existing: QuoteHistoryItem[] = (() => {
                        try { return migrateQuoteHistory(JSON.parse(localStorage.getItem('quoteHistory') || '[]')); }
                        catch { return []; }
                    })();
                    const idx = existing.findIndex(q => q.id === item.id);
                    const updated = idx > -1
                        ? existing.map((q, i) => i === idx ? item : q)
                        : [item, ...existing];
                    localStorage.setItem('quoteHistory', JSON.stringify(updated));
                    setQuoteHistory(updated);
                    window.history.replaceState({}, '', window.location.pathname);
                    showNotification(`Árajánlat importálva az előzményekbe: ${decoded.id}`);
                } catch {
                    console.warn('Invalid ?save= param, ignoring.');
                }
                return;
            }

            // URL import: ?research=<quoteId>&content=<encodeURIComponent(markdown)>
            // Injects research content into an existing quote by ID.
            const researchId = params.get('research');
            const researchContent = params.get('content');
            if (researchId && researchContent) {
                try {
                    const decoded = decodeURIComponent(researchContent);
                    const existing: QuoteHistoryItem[] = (() => {
                        try { return migrateQuoteHistory(JSON.parse(localStorage.getItem('quoteHistory') || '[]')); }
                        catch { return []; }
                    })();
                    const idx = existing.findIndex(q => q.id === researchId);
                    if (idx > -1) {
                        const updated = existing.map((q, i) => i === idx ? { ...q, researchContent: decoded } : q);
                        localStorage.setItem('quoteHistory', JSON.stringify(updated));
                        setQuoteHistory(updated);
                        window.history.replaceState({}, '', window.location.pathname);
                        showNotification(`✅ Research importálva: ${researchId}`);
                    } else {
                        showNotification(`⚠️ Nem található árajánlat: ${researchId}`);
                    }
                } catch {
                    console.warn('Invalid ?research= param, ignoring.');
                }
                return;
            }

            // Check for unsaved session
            const storedSession = localStorage.getItem('unsavedQuoteSession');
            if (storedSession) {
                const parsedSession = JSON.parse(storedSession);
                const migratedSession = migrateQuoteState(parsedSession);
                setSessionToRestore(migratedSession);
            }
        } catch (e) {
            console.error("Failed to load or migrate data from localStorage", e);
            setQuoteHistory([]);
            localStorage.removeItem('unsavedQuoteSession');
        }
    }, []);

    // Effect to save current state to localStorage for session restoration
    useEffect(() => {
        // Don't save if there's a session waiting to be restored, or if no package is selected
        if (sessionToRestore || !selectedPackageId) {
            return;
        }

        const currentState: QuoteState = {
            selectedPackageId,
            selectedExtras,
            customPrices,
            customSections,
            customInstances,
            quoteDetails,
            editablePackageContents,
            selectedPlanId,
            selectedEliteExtensions,
            customElitePrices,
            status,
            discountPercentage,
        };

        // Debounce saving to localStorage
        clearTimeout(sessionSaveTimerRef.current);
        sessionSaveTimerRef.current = window.setTimeout(() => {
            try {
                localStorage.setItem('unsavedQuoteSession', JSON.stringify(currentState));
            } catch (e) {
                console.error("Failed to save session to localStorage", e);
            }
        }, 1500);

        // Cleanup on unmount
        return () => {
            clearTimeout(sessionSaveTimerRef.current);
        };
    }, [
        selectedPackageId, selectedExtras, customPrices, customSections,
        customInstances, quoteDetails, editablePackageContents, selectedPlanId,
        selectedEliteExtensions, customElitePrices, status, discountPercentage, sessionToRestore
    ]);

    const showNotification = useCallback((message: string) => {
        clearTimeout(timerRef.current);
        setNotification(message);
        timerRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 3000);
    }, []);

    const handleHideNotification = useCallback(() => {
        clearTimeout(timerRef.current);
        setNotification(null);
    }, []);

    // FIX: Replaced useMemo with debounce utility with a direct implementation using useCallback and useRef.
    // This avoids potential subtle typing issues with the generic debounce helper.
    const debouncedShowNotification = useCallback(() => {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = window.setTimeout(() => {
            showNotification('Módosítások mentve');
        }, 1000);
    }, [showNotification]);


    const issueDate = useMemo(() => new Date(), []);
    const expiryDate = useMemo(() => addCalendarDays(issueDate, quoteDetails.validityDays), [issueDate, quoteDetails.validityDays]);

    const handleDetailsChange = useCallback((field: keyof QuoteDetailsType, value: string | number) => {
        setQuoteDetails(prev => ({ ...prev, [field]: value }));
        debouncedShowNotification();
    }, [debouncedShowNotification]);
    
    const clearUnsavedSession = useCallback(() => {
        localStorage.removeItem('unsavedQuoteSession');
        clearTimeout(sessionSaveTimerRef.current);
    }, []);

    const handlePackageChange = useCallback((packageId: PackageId) => {
        setSelectedPackageId(packageId);
        setSelectedExtras({});
        setCustomPrices({});
        setCustomInstances({});
        setCustomSections([]);
        setSelectedEliteExtensions({});
        setCustomElitePrices({});
        setExtrasSearchQuery('');
        setStatus(QuoteStatus.DRAFT);
        
        const pkgDetails = PACKAGE_FEATURES[packageId];
        const pkg = BASE_PACKAGES.find(p => p.id === packageId);
        if (pkg) {
            showNotification(`"${pkg.name}" csomag kiválasztva`);
        }

        if (pkgDetails) {
            setEditablePackageContents({
                pages: (pkgDetails.pages || []).map(text => ({ text, isNew: false })),
                features: pkgDetails.features.map(text => ({ text, isNew: false })),
            });
        } else {
            setEditablePackageContents({ pages: [], features: [] });
        }

        if (packageId === PackageId.CONTINUOUS_MAINTENANCE) {
            if (!selectedPlanId) {
                setSelectedPlanId('smart');
            }
        } else {
            setSelectedPlanId(null);
        }

        if (packageId === PackageId.MAINTENANCE || packageId === PackageId.CONTINUOUS_MAINTENANCE) {
            setQuoteDetails(prev => ({ ...prev, validityDays: 0, priorityMultiplier: 1 }));
        }

    }, [showNotification, selectedPlanId]);

    const handleExtraChange = useCallback((extraId: string, isSelected: boolean) => {
        const extra = EXTRAS.find(e => e.id === extraId);
        if (!extra) return;

        showNotification(isSelected ? `"${extra.name}" hozzáadva` : `"${extra.name}" eltávolítva`);

        if (extra.isInstantiable) {
            if (isSelected) {
                if (!customInstances[extraId] || customInstances[extraId].length === 0) {
                    const newInstance: CustomInstance = { id: crypto.randomUUID(), name: extra.name, description: extra.description || '', price: extra.price };
                    setCustomInstances(prev => ({...prev, [extraId]: [newInstance]}));
                }
            } else {
                setCustomInstances(prev => {
                    const newInstances = {...prev};
                    delete newInstances[extraId];
                    return newInstances;
                });
                // Also update selectedExtras to ensure the checkbox unchecks correctly
                setSelectedExtras(prev => ({ ...prev, [extraId]: false }));
            }
        } else {
            setSelectedExtras(prev => ({ ...prev, [extraId]: isSelected }));
            if (!isSelected) {
                setCustomPrices(prev => {
                    const newValues = { ...prev };
                    delete newValues[extraId];
                    return newValues;
                });
            }
        }
    }, [customInstances, showNotification]);

    const handleEliteExtensionToggle = useCallback((extensionId: string, isSelected: boolean) => {
        const extension = ELITE_EXTENSIONS.find(e => e.id === extensionId);
        if (!extension) return;

        showNotification(isSelected ? `"${extension.name}" hozzáadva` : `"${extension.name}" eltávolítva`);
        setSelectedEliteExtensions(prev => ({ ...prev, [extensionId]: isSelected }));

        if (!isSelected) {
            setCustomElitePrices(prev => {
                const newPrices = { ...prev };
                delete newPrices[extensionId];
                return newPrices;
            });
        }
    }, [showNotification]);
    
    const handleCustomElitePriceChange = useCallback((extensionId: string, price: number) => {
        setCustomElitePrices(prev => ({ ...prev, [extensionId]: price }));
        debouncedShowNotification();
    }, [debouncedShowNotification]);

    const handleCustomPriceChange = useCallback((extraId: string, price: number) => {
        setCustomPrices(prev => ({ ...prev, [extraId]: price }));
        debouncedShowNotification();
    }, [debouncedShowNotification]);

    const handleAddInstance = useCallback((extraId: string) => {
        const extra = EXTRAS.find(e => e.id === extraId);
        if (!extra) return;
        const newInstance: CustomInstance = { id: crypto.randomUUID(), name: '', description: extra.description || '', price: extra.price };
        if (extra.category === 'oldalak') {
            newInstance.name = extra.name;
        }
        setCustomInstances(prev => ({...prev, [extraId]: [...(prev[extraId] || []), newInstance]}));
        showNotification(`Új "${extra.name}" példány hozzáadva`);
    }, [showNotification]);
    
    const handleRemoveInstance = useCallback((extraId: string, instanceId: string) => {
        setCustomInstances(prev => {
            const newInstances = {...prev};
            newInstances[extraId] = newInstances[extraId].filter(i => i.id !== instanceId);
            if(newInstances[extraId].length === 0) {
                delete newInstances[extraId];
                 setSelectedExtras(prev => ({ ...prev, [extraId]: false }));
            }
            return newInstances;
        });
        showNotification('Példány törölve');
    }, [showNotification]);

    const handleUpdateInstance = useCallback((extraId: string, instanceId: string, field: keyof Omit<CustomInstance, 'id'>, value: string | number) => {
        setCustomInstances(prev => {
            const instances = prev[extraId];
            if (!instances) return prev;

            const newInstances = instances.map(instance => {
                if (instance.id === instanceId) {
                    switch (field) {
                        case 'name':
                            return { ...instance, name: String(value) };
                        case 'description':
                            return { ...instance, description: String(value) };
                        case 'price':
                            return { ...instance, price: Number(value) || 0 };
                        default:
                            return instance;
                    }
                }
                return instance;
            });
            
            return {
                ...prev,
                [extraId]: newInstances
            };
        });
        debouncedShowNotification();
    }, [debouncedShowNotification]);
    
    const handleReset = useCallback(() => {
        const initialState = getInitialQuoteState();
        setSelectedPackageId(initialState.selectedPackageId);
        setSelectedExtras(initialState.selectedExtras);
        setCustomPrices(initialState.customPrices);
        setCustomSections(initialState.customSections);
        setCustomInstances(initialState.customInstances);
        setSelectedPlanId(initialState.selectedPlanId);
        setSelectedEliteExtensions(initialState.selectedEliteExtensions);
        setCustomElitePrices(initialState.customElitePrices);
        setQuoteDetails(initialState.quoteDetails);
        setEditablePackageContents(initialState.editablePackageContents);
        setStatus(initialState.status);
        setDiscountPercentage(initialState.discountPercentage);
        
        // Reset component-specific state not part of QuoteState
        setExtrasSearchQuery('');

        showNotification('Minden adat visszaállítva');
        clearUnsavedSession();
    }, [showNotification, clearUnsavedSession]);

    const handlePackageContentChange = useCallback((type: 'pages' | 'features', index: number, value: string) => {
        setEditablePackageContents(prev => {
            const newContents = [...prev[type]];
            newContents[index] = { ...newContents[index], text: value };
            return { ...prev, [type]: newContents };
        });
        debouncedShowNotification();
    }, [debouncedShowNotification]);

    const handleAddPackageContent = useCallback((type: 'pages' | 'features') => {
        setEditablePackageContents(prev => ({
            ...prev,
            [type]: [...prev[type], { text: 'Új tétel', isNew: true }]
        }));
        showNotification(`Új ${type === 'pages' ? 'oldal' : 'funkció'} hozzáadva`);
    }, [showNotification]);

    const handleRemovePackageContent = useCallback((type: 'pages' | 'features', index: number) => {
        setEditablePackageContents(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
        showNotification(`${type === 'pages' ? 'Oldal' : 'Funkció'} törölve`);
    }, [showNotification]);

    const handleSetSections = useCallback((action: React.SetStateAction<{ id: string; name: string; price: number }[]>) => {
        setCustomSections(action);
        debouncedShowNotification();
    }, [debouncedShowNotification]);
    
    const handleSaveQuote = useCallback(() => {
        if (!selectedPackageId || !quoteDetails.quoteId) {
            showNotification("Az ajánlat mentéséhez válasszon csomagot és adjon meg egy azonosítót.");
            return;
        }

        const currentState: QuoteState = {
            selectedPackageId,
            selectedExtras,
            customPrices,
            customSections,
            customInstances,
            quoteDetails,
            editablePackageContents,
            selectedPlanId,
            selectedEliteExtensions,
            customElitePrices,
            status,
            discountPercentage,
        };

        const newHistoryItem: QuoteHistoryItem = {
            id: quoteDetails.quoteId,
            savedAt: Date.now(),
            clientName: quoteDetails.clientName,
            subject: quoteDetails.subject,
            status: currentState.status,
            state: currentState,
        };

        setQuoteHistory(prevHistory => {
            const existingIndex = prevHistory.findIndex(item => item.id === newHistoryItem.id);
            let updatedHistory;
            if (existingIndex > -1) {
                updatedHistory = [...prevHistory];
                updatedHistory[existingIndex] = newHistoryItem;
            } else {
                updatedHistory = [newHistoryItem, ...prevHistory];
            }
            try {
                localStorage.setItem('quoteHistory', JSON.stringify(updatedHistory));
                showNotification(`Ajánlat mentve az előzményekbe: ${newHistoryItem.id}`);
            } catch (e) {
                console.error("Failed to save quote history to localStorage", e);
                showNotification("Hiba történt a mentés során.");
            }
            return updatedHistory;
        });

    }, [
        selectedPackageId, selectedExtras, customPrices, customSections, 
        customInstances, quoteDetails, editablePackageContents, showNotification,
        selectedPlanId, selectedEliteExtensions, customElitePrices, status, discountPercentage
    ]);

    const handleLoadQuote = useCallback((id: string) => {
        const quoteToLoad = quoteHistory.find(item => item.id === id);
        if (!quoteToLoad) {
            showNotification("Hiba: A kiválasztott ajánlat nem található.");
            return;
        }

        const { state } = quoteToLoad;
        setSelectedPackageId(state.selectedPackageId);
        setSelectedExtras(state.selectedExtras);
        setCustomPrices(state.customPrices);
        setCustomSections(state.customSections);
        setCustomInstances(state.customInstances);
        setQuoteDetails(state.quoteDetails);
        setEditablePackageContents(state.editablePackageContents);
        setSelectedPlanId(state.selectedPlanId);
        setSelectedEliteExtensions(state.selectedEliteExtensions);
        setCustomElitePrices(state.customElitePrices || {});
        setStatus(state.status || QuoteStatus.DRAFT);
        setDiscountPercentage(state.discountPercentage || 0);
        setExtrasSearchQuery('');
        
        setIsHistoryOpen(false);
        showNotification(`"${id}" azonosítójú ajánlat betöltve.`);
        clearUnsavedSession();
    }, [quoteHistory, showNotification, clearUnsavedSession]);

    const handleDeleteQuote = useCallback((id: string) => {
        // Pure state update — no side effects inside updater
        setQuoteHistory(prev => prev.filter(item => item.id !== id));

        // Persist filtered history
        try {
            const stored: QuoteHistoryItem[] = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
            localStorage.setItem('quoteHistory', JSON.stringify(stored.filter(item => item.id !== id)));
        } catch (e) {
            console.error("Failed to save quoteHistory after delete:", e);
        }

        // Always mark as deleted so JARVIS JSON merge skips it on reload
        try {
            const deleted: string[] = JSON.parse(localStorage.getItem('deletedJarvisIds') || '[]');
            if (!deleted.includes(id)) {
                localStorage.setItem('deletedJarvisIds', JSON.stringify([...deleted, id]));
            }
        } catch (e) {
            console.error("Failed to update deletedJarvisIds:", e);
        }

        showNotification(`"${id}" azonosítójú ajánlat törölve.`);
    }, [showNotification]);

    const handleDuplicateQuote = useCallback((id: string) => {
        const quoteToDuplicate = quoteHistory.find(item => item.id === id);
        if (!quoteToDuplicate) {
            showNotification("Hiba: A másolandó ajánlat nem található.");
            return;
        }
    
        // Create a base for the new ID by removing any existing "-másolat" suffix
        let baseId = id.replace(/-másolat(-\d+)?$/, '');
        let newId = `${baseId}-másolat`;
        let counter = 1;
    
        // Ensure the new ID is unique by appending a counter if needed
        while (quoteHistory.some(item => item.id === newId)) {
            counter++;
            newId = `${baseId}-másolat-${counter}`;
        }

        // Deep copy state to avoid mutations
        const duplicatedState: QuoteState = JSON.parse(JSON.stringify(quoteToDuplicate.state));
        
        // Update the quote details and status in the new state
        duplicatedState.quoteDetails.quoteId = newId;
        const originalSubject = quoteToDuplicate.state.quoteDetails.subject.replace(/^\(Másolat\) /, '');
        // FIX: corrected duplicatedState.subject to duplicatedState.quoteDetails.subject as QuoteState does not have a top-level subject property.
        duplicatedState.quoteDetails.subject = `(Másolat) ${originalSubject}`;
        duplicatedState.status = QuoteStatus.DRAFT;
    
        const newHistoryItem: QuoteHistoryItem = {
            id: newId,
            savedAt: Date.now(),
            clientName: quoteToDuplicate.clientName,
            subject: duplicatedState.quoteDetails.subject,
            status: QuoteStatus.DRAFT,
            state: duplicatedState,
        };
    
        setQuoteHistory(prevHistory => {
            const updatedHistory = [newHistoryItem, ...prevHistory];
            try {
                localStorage.setItem('quoteHistory', JSON.stringify(updatedHistory));
                showNotification(`Ajánlat másolva: ${newId}`);
            } catch (e) {
                console.error("Failed to save duplicated quote to localStorage", e);
                showNotification("Hiba történt a másolás során.");
            }
            return updatedHistory;
        });
    }, [quoteHistory, showNotification]);

    const handleStatusChange = useCallback((id: string, newStatus: QuoteStatus) => {
        // Intercept ACCEPTED: show notes modal instead of saving directly
        if (newStatus === QuoteStatus.ACCEPTED) {
            setAcceptanceModal({ phase: 'quote', quoteId: id });
            return;
        }
        setQuoteHistory(prevHistory => {
            const updatedHistory = prevHistory.map(item => {
                if (item.id === id) {
                    return { ...item, status: newStatus, state: { ...item.state, status: newStatus } };
                }
                return item;
            });
            try {
                localStorage.setItem('quoteHistory', JSON.stringify(updatedHistory));
                showNotification(`"${id}" státusza megváltozott.`);
            } catch (e) {
                console.error("Failed to update quote history in localStorage", e);
                showNotification("Hiba történt a státusz frissítése során.");
            }
            return updatedHistory;
        });
    }, [showNotification]);

    const saveHistoryUpdate = useCallback((updatedHistory: QuoteHistoryItem[], msg: string) => {
        try {
            localStorage.setItem('quoteHistory', JSON.stringify(updatedHistory));
            showNotification(msg);
        } catch (e) {
            console.error("Failed to save history", e);
        }
    }, [showNotification]);

    const handleAcceptanceNotesSaveOnly = useCallback((notes: ClientNotes) => {
        if (!acceptanceModal) return;
        const { phase, quoteId } = acceptanceModal;
        setAcceptanceModal(null);
        setQuoteHistory(prev => {
            const updated = prev.map(item => {
                if (item.id !== quoteId) return item;
                if (phase === 'quote') {
                    return { ...item, status: QuoteStatus.ACCEPTED, state: { ...item.state, status: QuoteStatus.ACCEPTED }, clientNotes: notes };
                }
                return { ...item, figmaClientNotes: notes, figmaPhase: 'figma_approved' as FigmaPhaseStatus };
            });
            saveHistoryUpdate(updated, phase === 'quote' ? `"${quoteId}" elfogadva, megjegyzések mentve.` : `"${quoteId}" Figma jóváhagyva.`);
            return updated;
        });
    }, [acceptanceModal, saveHistoryUpdate]);

    const handleAcceptanceNotesSaveAndStart = useCallback(async (notes: ClientNotes) => {
        if (!acceptanceModal) return;
        const { phase, quoteId } = acceptanceModal;

        // Figma jóváhagyás fázis — nincs API hívás
        if (phase === 'figma') {
            setAcceptanceModal(null);
            setQuoteHistory(prev => {
                const updated = prev.map(item => item.id !== quoteId ? item
                    : { ...item, figmaClientNotes: notes, figmaPhase: 'figma_approved' as FigmaPhaseStatus });
                saveHistoryUpdate(updated, `"${quoteId}" Figma jóváhagyva! Fejlesztés indítható.`);
                return updated;
            });
            return;
        }

        // Quote elfogadás fázis — snapshot ELŐBB a state változtatás előtt
        const quoteItem = quoteHistory.find(q => q.id === quoteId);
        setAcceptanceModal(null);

        // Azonnal "in_progress" állapot
        setQuoteHistory(prev => {
            const updated = prev.map(item => item.id !== quoteId ? item : {
                ...item,
                status: QuoteStatus.ACCEPTED,
                state: { ...item.state, status: QuoteStatus.ACCEPTED },
                clientNotes: notes,
                figmaPhase: 'figma_in_progress' as FigmaPhaseStatus,
            });
            saveHistoryUpdate(updated, `"${quoteId}" elfogadva! Figma tervezés indul...`);
            return updated;
        });

        // API payload összerakása
        const st = quoteItem?.state;
        const extras = st ? EXTRAS.filter(e => st.selectedExtras[e.id]).map(e => e.name) : [];
        const pages = st ? [
            ...(st.editablePackageContents?.pages ?? []).map((p: { text: string }) => p.text).filter(Boolean),
            ...(st.customSections ?? []).map((s: { name: string }) => s.name),
        ] : [];
        const packageName = st?.selectedPackageId
            ? BASE_PACKAGES.find(p => p.id === st.selectedPackageId)?.name ?? st.selectedPackageId
            : 'ismeretlen csomag';

        const payload = {
            quoteId,
            clientName: quoteItem?.clientName ?? '',
            clientEmail: st?.quoteDetails?.clientEmail ?? '',
            subject: quoteItem?.subject ?? '',
            packageName,
            totalPrice: 0,
            websiteUrl: st?.quoteDetails?.websiteUrl ?? '',
            extras,
            pages,
            clientNotes: notes.hasChanges ? notes : null,
            researchSummary: quoteItem?.researchContent
                ? quoteItem.researchContent.substring(0, 800)
                : null,
        };

        try {
            const resp = await fetch('/api/trigger-figma', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await resp.json() as { success: boolean; figmaFileUrl?: string; designBrief?: string; photos?: PexelsPhoto[]; error?: string };

            if (data.success) {
                setQuoteHistory(prev => {
                    const updated = prev.map(item => item.id !== quoteId ? item : {
                        ...item,
                        figmaPhase: 'figma_done' as FigmaPhaseStatus,
                        ...(data.figmaFileUrl ? { figmaFileUrl: data.figmaFileUrl } : {}),
                        ...(data.designBrief ? { figmaDesignBrief: data.designBrief } : {}),
                        ...(data.photos?.length ? { figmaPhotos: data.photos } : {}),
                    });
                    saveHistoryUpdate(updated, `"${quoteId}" Figma terv kész! ${data.figmaFileUrl ? 'Fájl létrehozva.' : 'Brief elkészítve.'}`);
                    return updated;
                });
                showNotification(data.figmaFileUrl
                    ? `✅ Figma fájl elkészítve — megnyithatod az Előzmények / Figma fülön!`
                    : `✅ Figma design brief elkészítve!`
                );
            } else {
                throw new Error(data.error ?? 'Ismeretlen API hiba');
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Hálózati hiba';
            setQuoteHistory(prev => {
                const updated = prev.map(item => item.id !== quoteId ? item
                    : { ...item, figmaPhase: 'brief_ready' as FigmaPhaseStatus });
                saveHistoryUpdate(updated, `"${quoteId}" Figma trigger hiba — állapot visszaállítva.`);
                return updated;
            });
            showNotification(`❌ Figma API hiba: ${msg}`);
        }
    }, [acceptanceModal, saveHistoryUpdate, quoteHistory, showNotification]);

    const handleFigmaApproval = useCallback((id: string) => {
        setAcceptanceModal({ phase: 'figma', quoteId: id });
    }, []);

    const handleUpdateFigmaPhase = useCallback((id: string, figmaPhase: FigmaPhaseStatus, figmaFileUrl?: string) => {
        setQuoteHistory(prev => {
            const updated = prev.map(item => {
                if (item.id !== id) return item;
                return { ...item, figmaPhase, ...(figmaFileUrl ? { figmaFileUrl } : {}) };
            });
            saveHistoryUpdate(updated, `"${id}" Figma fázis: ${figmaPhase}`);
            return updated;
        });
    }, [saveHistoryUpdate]);

    const handleUpdateResearch = useCallback((quoteId: string, content: string) => {
        setQuoteHistory(prev => {
            const updated = prev.map(item =>
                item.id !== quoteId ? item : { ...item, researchContent: content }
            );
            saveHistoryUpdate(updated, `"${quoteId}" research feltöltve`);
            return updated;
        });
        showNotification('✅ Research dokumentum mentve!');
    }, [saveHistoryUpdate, showNotification]);

    const handleDownloadQuotePdf = useCallback((id: string) => {
        const quoteToDownload = quoteHistory.find(item => item.id === id);
        if (!quoteToDownload) {
            showNotification("Hiba: A kiválasztott ajánlat nem található.");
            return;
        }

        const { state } = quoteToDownload;
        const { 
            selectedPackageId, 
            selectedExtras: selectedExtrasMap, 
            customPrices, 
            customSections, 
            customInstances, 
            quoteDetails, 
            editablePackageContents, 
            selectedPlanId, 
            selectedEliteExtensions,
            customElitePrices,
            discountPercentage,
        } = state;

        if (!selectedPackageId) {
            showNotification("Hiba: Érvénytelen mentett ajánlat.");
            return;
        }

        const selectedPackage = BASE_PACKAGES.find(p => p.id === selectedPackageId);
        if (!selectedPackage) {
            showNotification("Hiba: A mentett csomag nem található.");
            return;
        }

        const selectedExtraItems = EXTRAS.filter(extra => selectedExtrasMap[extra.id]);
        const chosenEliteExtensions = ELITE_EXTENSIONS.filter(ext => selectedEliteExtensions[ext.id]);

        // Recalculate totals
        let oneTime = 0;
        let monthly = 0;

        if (selectedPackageId === PackageId.CONTINUOUS_MAINTENANCE && selectedPlanId) {
            const plan = MAINTENANCE_PLANS.find(p => p.id === selectedPlanId);
            monthly = plan?.price ?? 0;

            chosenEliteExtensions.forEach(extension => {
                const customMonthlyPrice = customElitePrices?.[extension.id];
                monthly += customMonthlyPrice !== undefined ? customMonthlyPrice : extension.priceMonthly;
                oneTime += extension.priceOneTime;
            });
        } else {
            oneTime = selectedPackage.price ?? 0;

            selectedExtraItems.forEach(extra => {
                // If it's instantiable, price is handled by instances loop.
                if (extra.isInstantiable) return;

                const customPrice = customPrices[extra.id];
                switch (extra.type) {
                    case PriceType.FIXED: oneTime += extra.price; break;
                    case PriceType.FROM: oneTime += customPrice ?? extra.price; break;
                    case PriceType.HOURLY: oneTime += customPrice ?? 0; break;
                    default: break;
                }
            });

            if (Array.isArray(customSections)) {
                customSections.forEach(section => {
                    oneTime += section.price;
                });
            }

            Object.values(customInstances).forEach(instances => {
                if (Array.isArray(instances)) {
                    instances.forEach(instance => {
                        oneTime += instance.price;
                    });
                }
            });

            oneTime *= quoteDetails.priorityMultiplier;
        }
        
        const issueDate = new Date(quoteToDownload.savedAt);
        const expiryDate = addCalendarDays(issueDate, quoteDetails.validityDays);
        
        const pdfData: PdfQuoteData = {
            selectedPackage,
            selectedExtras: selectedExtraItems,
            customPrices,
            customSections,
            customInstances,
            bonusPages: BONUS_PAGES,
            oneTimeTotal: oneTime,
            monthlyTotal: monthly,
            quoteDetails,
            issueDate,
            expiryDate,
            packageContents: editablePackageContents,
            selectedPlanId,
            maintenancePlans: MAINTENANCE_PLANS,
            eliteExtensions: chosenEliteExtensions,
            customElitePrices: customElitePrices || {},
            discountPercentage: discountPercentage || 0,
        };
        
        generateQuotePDF(pdfData);
        showNotification(`"${id}" PDF generálva.`);

    }, [quoteHistory, showNotification]);

    const handleDownloadSitemapPdf = useCallback((id: string) => {
        const item = quoteHistory.find(q => q.id === id);
        if (!item) { showNotification("Hiba: Az ajánlat nem található."); return; }
        const { state } = item;
        if (!state.selectedPackageId) { showNotification("Hiba: Érvénytelen ajánlat."); return; }
        generateSitemapPDF(
            state.selectedPackageId,
            state.selectedExtras,
            state.customInstances,
            state.quoteDetails,
            new Date(item.savedAt)
        );
        showNotification(`"${id}" Site Map PDF generálva.`);
    }, [quoteHistory, showNotification]);

    const handleRestoreSession = useCallback(() => {
        if (!sessionToRestore) return;
    
        const state = sessionToRestore;
        setSelectedPackageId(state.selectedPackageId);
        setSelectedExtras(state.selectedExtras);
        setCustomPrices(state.customPrices);
        setCustomSections(state.customSections);
        setCustomInstances(state.customInstances);
        setQuoteDetails(state.quoteDetails);
        setEditablePackageContents(state.editablePackageContents);
        setSelectedPlanId(state.selectedPlanId);
        setSelectedEliteExtensions(state.selectedEliteExtensions);
        setCustomElitePrices(state.customElitePrices || {});
        setStatus(state.status || QuoteStatus.DRAFT);
        setDiscountPercentage(state.discountPercentage || 0);
        setExtrasSearchQuery('');
    
        showNotification("Előző munkamenet visszaállítva.");
        setSessionToRestore(null);
    }, [sessionToRestore, showNotification]);

    const handleDismissSession = useCallback(() => {
        clearUnsavedSession();
        setSessionToRestore(null);
        showNotification("Befejezetlen ajánlat elvetve.");
    }, [clearUnsavedSession, showNotification]);


    const selectedPackage = useMemo(() => 
        BASE_PACKAGES.find(p => p.id === selectedPackageId),
        [selectedPackageId]
    );

    const selectedExtraItems = useMemo(() => 
        EXTRAS.filter(extra => selectedExtras[extra.id]),
        [selectedExtras]
    );

    const { oneTimeTotal, monthlyTotal } = useMemo(() => {
        let oneTime = 0;
        let monthly = 0;

        if (selectedPackageId === PackageId.CONTINUOUS_MAINTENANCE && selectedPlanId) {
            const plan = MAINTENANCE_PLANS.find(p => p.id === selectedPlanId);
            monthly = plan?.price ?? 0;

            Object.keys(selectedEliteExtensions).forEach(extId => {
                if (selectedEliteExtensions[extId]) {
                    const extension = ELITE_EXTENSIONS.find(e => e.id === extId);
                    if (extension) {
                        const customMonthlyPrice = customElitePrices[extId];
                        monthly += customMonthlyPrice !== undefined ? customMonthlyPrice : extension.priceMonthly;
                        oneTime += extension.priceOneTime;
                    }
                }
            });
        } else if (selectedPackage) {
            oneTime = selectedPackage.price ?? 0;

            selectedExtraItems.forEach(extra => {
                // IMPORTANT: If an extra is instantiable, its price is handled in the customInstances loop.
                if (extra.isInstantiable) return;

                const customPrice = customPrices[extra.id];
                switch (extra.type) {
                    case PriceType.FIXED: oneTime += extra.price; break;
                    case PriceType.FROM: oneTime += customPrice ?? extra.price; break;
                    case PriceType.HOURLY: oneTime += customPrice ?? 0; break;
                    default: break;
                }
            });

            if (Array.isArray(customSections)) {
                customSections.forEach(section => {
                    oneTime += section.price;
                });
            }

            Object.values(customInstances).forEach(instances => {
                if (Array.isArray(instances)) {
                    instances.forEach(instance => {
                        oneTime += instance.price;
                    });
                }
            });

            oneTime *= quoteDetails.priorityMultiplier;
        }

        return { oneTimeTotal: oneTime, monthlyTotal: monthly };
    }, [selectedPackage, selectedPackageId, selectedPlanId, selectedEliteExtensions, customElitePrices, selectedExtraItems, customPrices, customSections, customInstances, quoteDetails.priorityMultiplier]);
    
    const filteredExtrasByPackage = useMemo(() => {
        const categories: Record<string, { name: string; items: Extra[] }> = {
            'oldalak': { name: 'Oldalak fejlesztése', items: [] },
            'webshop': { name: 'Webshop Extra Funkciók', items: [] },
            'altalanos': { name: 'Általános Extra Funkciók', items: [] },
        };
        EXTRAS.forEach(extra => {
            if (categories[extra.category]) {
                categories[extra.category].items.push(extra);
            }
        });
        return categories;
    }, []);

    const extrasCategoriesForAccordion = useMemo(() => {
        if (!selectedPackageId) return {};
        
        if (selectedPackageId === PackageId.LANDING) {
            const { altalanos } = filteredExtrasByPackage;
            return { altalanos: { ...altalanos, items: altalanos.items.filter(item => item.availableFor.includes(selectedPackageId))} };
        }
        return filteredExtrasByPackage;
    }, [selectedPackageId, filteredExtrasByPackage]);

    return (
        <>
            <Header onOpenHistory={() => setIsHistoryOpen(true)} />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 id="package-selector-heading" className="text-2xl font-bold text-slate-100">1. Válasszon alapcsomagot</h2>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 rounded-md text-sm text-slate-400 hover:text-white transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                                    title="Minden visszaállítása"
                                >
                                    <ResetIcon />
                                    Visszaállítás
                                </button>
                            </div>
                            <PackageSelector
                                packages={BASE_PACKAGES}
                                selectedPackageId={selectedPackageId}
                                onSelect={handlePackageChange}
                            />
                        </section>

                        {selectedPackage && (
                            <>
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-100 mb-4">2. Ajánlat részletei</h2>
                                    <QuoteDetails 
                                        details={quoteDetails} 
                                        issueDate={issueDate}
                                        expiryDate={expiryDate}
                                        onDetailsChange={handleDetailsChange}
                                        selectedPackageId={selectedPackageId}
                                    />
                                </section>
                                
                                {selectedPackage.id === PackageId.CONTINUOUS_MAINTENANCE && (
                                    <>
                                        <section>
                                            <h2 className="text-2xl font-bold text-slate-100 mb-4">3. Karbantartási csomag választása</h2>
                                            <ContinuousMaintenanceSelector
                                                plans={MAINTENANCE_PLANS}
                                                selectedPlanId={selectedPlanId}
                                                onSelect={(planId) => setSelectedPlanId(planId)}
                                            />
                                        </section>
                                        <section>
                                            <h2 className="text-2xl font-bold text-slate-100 mb-4">4. Extra szolgáltatások</h2>
                                            <EliteExtensions 
                                                extensions={ELITE_EXTENSIONS}
                                                selectedExtensions={selectedEliteExtensions}
                                                onToggle={handleEliteExtensionToggle}
                                                customElitePrices={customElitePrices}
                                                onCustomPriceChange={handleCustomElitePriceChange}
                                            />
                                        </section>
                                    </>
                                )}

                                {selectedPackage.id === PackageId.LANDING && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-slate-100 mb-4">3. Szekciók hozzáadása</h2>
                                        <LandingPageExtras sections={customSections} setSections={handleSetSections} />
                                    </section>
                                )}
                                
                                {selectedPackage.id !== PackageId.MAINTENANCE && selectedPackage.id !== PackageId.CONTINUOUS_MAINTENANCE && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-slate-100 mb-4">
                                            {selectedPackage.id === PackageId.LANDING ? '4. Extrák és funkciók' : '3. Extrák és aloldalak'}
                                        </h2>
                                        <div className="relative mb-4">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <SearchIcon />
                                            </div>
                                            <input
                                                type="text"
                                                value={extrasSearchQuery}
                                                onChange={(e) => setExtrasSearchQuery(e.target.value)}
                                                placeholder="Extrák keresése..."
                                                className="w-full pl-10 p-2.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                                            />
                                        </div>
                                        <ExtrasAccordion
                                            categories={extrasCategoriesForAccordion}
                                            selectedPackageId={selectedPackage.id}
                                            selectedExtras={selectedExtras}
                                            customPrices={customPrices}
                                            customInstances={customInstances}
                                            extrasSearchQuery={extrasSearchQuery}
                                            onExtraChange={handleExtraChange}
                                            onCustomPriceChange={handleCustomPriceChange}
                                            onAddInstance={handleAddInstance}
                                            onRemoveInstance={handleRemoveInstance}
                                            onUpdateInstance={handleUpdateInstance}
                                        />
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                    
                    <aside className="lg:col-span-1">
                        <Summary
                            selectedPackage={selectedPackage}
                            selectedExtras={selectedExtraItems}
                            customPrices={customPrices}
                            customSections={customSections}
                            customInstances={customInstances}
                            bonusPages={BONUS_PAGES}
                            oneTimeTotal={oneTimeTotal}
                            monthlyTotal={monthlyTotal}
                            quoteDetails={quoteDetails}
                            issueDate={issueDate}
                            expiryDate={expiryDate}
                            packageContents={editablePackageContents}
                            onPackageContentChange={handlePackageContentChange}
                            onAddPackageContent={handleAddPackageContent}
                            onRemovePackageContent={handleRemovePackageContent}
                            selectedPlanId={selectedPlanId}
                            maintenancePlans={MAINTENANCE_PLANS}
                            eliteExtensions={ELITE_EXTENSIONS}
                            selectedEliteExtensions={selectedEliteExtensions}
                            customElitePrices={customElitePrices}
                            onSaveQuote={handleSaveQuote}
                            discountPercentage={discountPercentage}
                            onDiscountChange={setDiscountPercentage}
                        />
                    </aside>
                </div>

                {selectedPackageId &&
                  selectedPackageId !== PackageId.MAINTENANCE &&
                  selectedPackageId !== PackageId.CONTINUOUS_MAINTENANCE && (
                    <section className="mt-10">
                      <h2 className="text-2xl font-bold text-slate-100 mb-4">Vizuális Site Map</h2>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <SitemapView
                          selectedPackageId={selectedPackageId}
                          selectedExtras={selectedExtras}
                          customInstances={customInstances}
                          clientName={quoteDetails.clientName}
                          subject={quoteDetails.subject}
                        />
                      </div>
                    </section>
                  )}
            </main>
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={quoteHistory}
                onLoad={handleLoadQuote}
                onDelete={handleDeleteQuote}
                onDownloadPdf={handleDownloadQuotePdf}
                onDownloadSitemapPdf={handleDownloadSitemapPdf}
                onDuplicate={handleDuplicateQuote}
                onStatusChange={handleStatusChange}
                onFigmaApproval={handleFigmaApproval}
                onUpdateFigmaPhase={handleUpdateFigmaPhase}
                onUpdateResearch={handleUpdateResearch}
            />
            {acceptanceModal && (() => {
                const item = quoteHistory.find(q => q.id === acceptanceModal.quoteId);
                return item ? (
                    <AcceptanceNotesModal
                        isOpen
                        phase={acceptanceModal.phase}
                        clientName={item.clientName}
                        quoteId={item.id}
                        onSaveOnly={handleAcceptanceNotesSaveOnly}
                        onSaveAndStart={handleAcceptanceNotesSaveAndStart}
                        onCancel={() => setAcceptanceModal(null)}
                    />
                ) : null;
            })()}
            <Notification message={notification} onHide={handleHideNotification} />
            {sessionToRestore && (
                <RestoreNotification
                    onRestore={handleRestoreSession}
                    onDismiss={handleDismissSession}
                />
            )}
        </>
    );
};

export default App;
