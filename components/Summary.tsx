
import React, { useState, useMemo } from 'react';
import { BasePackage, Extra, BonusPage, PriceType, CustomInstance, EditableContentItem, QuoteDetailsType, PackageId, MaintenancePlan, EliteExtension } from '../types';
import { CheckIcon, PlusIcon, PdfIcon, XIcon, EmailIcon, LoaderIcon } from './icons';
import { generateQuotePDF, generateSitemapPDF, PdfQuoteData } from '../pdfGenerator';
import EmailModal from './EmailModal';
import { EXTRAS } from '../constants';

interface SummaryProps {
    selectedPackage: BasePackage | undefined;
    selectedExtras: Extra[];
    customPrices: Record<string, number>;
    customSections: { id: string; name: string; price: number }[];
    customInstances: Record<string, CustomInstance[]>;
    bonusPages: BonusPage[];
    oneTimeTotal: number;
    monthlyTotal: number;
    quoteDetails: QuoteDetailsType;
    issueDate: Date;
    expiryDate: Date;
    packageContents: { pages: EditableContentItem[]; features: EditableContentItem[] };
    onPackageContentChange: (type: 'pages' | 'features', index: number, value: string) => void;
    onAddPackageContent: (type: 'pages' | 'features') => void;
    onRemovePackageContent: (type: 'pages' | 'features', index: number) => void;
    selectedPlanId: 'smart' | 'pro' | null;
    maintenancePlans: MaintenancePlan[];
    eliteExtensions: EliteExtension[];
    selectedEliteExtensions: Record<string, boolean>;
    customElitePrices: Record<string, number>;
    onSaveQuote: () => void;
    discountPercentage: number;
    onDiscountChange: (value: number) => void;
}

const formatCurrency = (amount: number, isMonthly = false) => {
    const formatted = new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount);
    return isMonthly ? `${formatted} / hó` : formatted;
};

const SummaryItem: React.FC<{ name: string; price: number; details?: string, isBonus?: boolean, isMonthly?: boolean, isCustom?: boolean }> = ({ name, price, details, isBonus = false, isMonthly = false, isCustom = false }) => (
    <div className="flex justify-between items-start py-3">
        <div className="flex items-start gap-3">
            <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isBonus ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {isBonus ? <PlusIcon /> : <CheckIcon />}
            </div>
            <div>
                <p className="text-slate-200">{name}</p>
                {details && <p className="text-xs text-slate-400">{details}</p>}
            </div>
        </div>
        {isCustom ? (
             <p className="font-semibold italic whitespace-nowrap pl-4 text-slate-400">
                Egyedi árajánlat
            </p>
        ) : (
            <p className={`font-semibold whitespace-nowrap pl-4 ${price === 0 && !isBonus ? 'text-green-500' : 'text-slate-200'}`}>
                {price > 0 ? formatCurrency(price, isMonthly) : 'Ingyenes'}
            </p>
        )}
    </div>
);

const EditableListItem: React.FC<{
    text: string;
    isNew?: boolean;
    type: 'page' | 'feature';
    onChange: (value: string) => void;
    onRemove: () => void;
}> = ({ text, isNew, type, onChange, onRemove }) => {
    let checkmarkClasses = 'bg-indigo-500/20 text-indigo-400'; // Default for original features
    
    if (isNew) {
        // A distinct color for new items. Let's use amber.
        checkmarkClasses = 'bg-amber-500/20 text-amber-400';
    } else if (type === 'page') {
        // Green for original pages
        checkmarkClasses = 'bg-green-500/20 text-green-400';
    }

    return (
        <div className="flex items-center gap-2 group -ml-2">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${checkmarkClasses}`}>
                <CheckIcon />
            </div>
            <input
                type="text"
                value={text}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent text-slate-300 text-sm focus:outline-none focus:bg-slate-700/50 rounded px-1 py-0.5"
            />
            <button 
                onClick={onRemove} 
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 p-1 rounded-full focus:outline-none focus:opacity-100 focus:ring-1 focus:ring-red-500 hover:scale-110"
                title="Tétel törlése"
            >
                <XIcon />
            </button>
        </div>
    );
};

const Summary: React.FC<SummaryProps> = (props) => {
    const { 
        selectedPackage, 
        selectedExtras, 
        customPrices, 
        customSections,
        customInstances,
        bonusPages, 
        oneTimeTotal,
        monthlyTotal,
        quoteDetails,
        issueDate,
        expiryDate,
        packageContents,
        onPackageContentChange,
        onAddPackageContent,
        onRemovePackageContent,
        selectedPlanId,
        maintenancePlans,
        eliteExtensions,
        selectedEliteExtensions,
        customElitePrices,
        onSaveQuote,
        discountPercentage,
        onDiscountChange
    } = props;

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingSitemapPdf, setIsGeneratingSitemapPdf] = useState(false);

    const selectedExtrasMap = useMemo(
        () => Object.fromEntries(selectedExtras.map(e => [e.id, true])),
        [selectedExtras]
    );

    const selectedPlan = useMemo(() => {
        if (selectedPackage?.id === PackageId.CONTINUOUS_MAINTENANCE && selectedPlanId) {
            return maintenancePlans.find(p => p.id === selectedPlanId);
        }
        return null;
    }, [selectedPackage, selectedPlanId, maintenancePlans]);
    
    const chosenEliteExtensions = useMemo(() => 
        eliteExtensions.filter(ext => selectedEliteExtensions[ext.id]),
    [eliteExtensions, selectedEliteExtensions]);


    const priorityMultiplier = quoteDetails.priorityMultiplier;
    const hasPriorityFee = priorityMultiplier > 1;
    const subTotal = hasPriorityFee && oneTimeTotal > 0 ? oneTimeTotal / priorityMultiplier : oneTimeTotal;

    const hasDiscount = discountPercentage > 0;
    const discountAmount = oneTimeTotal * (discountPercentage / 100);
    const discountedOneTimeTotal = oneTimeTotal - discountAmount;

    // Apply the same logic to monthlyTotal if it exists (assuming discount applies to everything as requested "egész árból")
    const monthlyDiscountAmount = monthlyTotal * (discountPercentage / 100);
    const discountedMonthlyTotal = monthlyTotal - monthlyDiscountAmount;

    const getPdfData = (): PdfQuoteData => {
        return {
            selectedPackage: selectedPackage!,
            selectedExtras,
            customPrices,
            customSections,
            customInstances,
            bonusPages,
            oneTimeTotal,
            monthlyTotal,
            quoteDetails,
            issueDate,
            expiryDate,
            packageContents,
            selectedPlanId,
            maintenancePlans,
            eliteExtensions: chosenEliteExtensions,
            customElitePrices,
            discountPercentage,
        };
    };

    const handleExportPDF = async () => {
        if (!selectedPackage || isGeneratingPdf) return;
    
        setIsGeneratingPdf(true);
        try {
            onSaveQuote();
            // Add a small delay so the user can see the loading state, as PDF generation can be blocking
            await new Promise(resolve => setTimeout(resolve, 50));
            generateQuotePDF(getPdfData());
        } catch (error) {
            console.error("PDF generation failed:", error);
            // In a real app, you might want to show an error notification here.
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleExportSitemapPDF = async () => {
        if (!selectedPackage || isGeneratingSitemapPdf) return;
        setIsGeneratingSitemapPdf(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 50));
            generateSitemapPDF(
                selectedPackage.id as PackageId,
                selectedExtrasMap,
                customInstances,
                quoteDetails,
                issueDate
            );
        } catch (error) {
            console.error('Sitemap PDF generation failed:', error);
        } finally {
            setIsGeneratingSitemapPdf(false);
        }
    };

    if (!selectedPackage) {
        return (
            <div className="lg:sticky lg:top-8 bg-slate-800 border border-slate-700 p-5 sm:p-6 rounded-xl shadow-lg text-center">
                <h3 className="text-xl font-bold text-slate-100 mb-2">Összesítő</h3>
                <p className="text-slate-400">Kérjük, válasszon egy alapcsomagot a kezdéshez.</p>
            </div>
        );
    }

    const isMaintenance = selectedPackage.id === PackageId.MAINTENANCE || selectedPackage.id === PackageId.CONTINUOUS_MAINTENANCE;

    const basePackagePrice = selectedPlan ? selectedPlan.price : selectedPackage.price;
    const basePackageName = selectedPlan ? `${selectedPlan.name}` : selectedPackage.name;


    return (
        <>
            <div className="lg:sticky lg:top-8 bg-slate-800 border border-slate-700 p-5 sm:p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-slate-100 border-b border-slate-700 pb-4 mb-4">Összesítő</h3>
                
                <div className="space-y-1 divide-y divide-slate-700">
                    {/* Base Package */}
                    <div className="py-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                                    <CheckIcon />
                                </div>
                                <div>
                                    <p className="text-slate-200 font-semibold">{basePackageName}</p>
                                    <p className="text-xs text-slate-400">{selectedPlan ? selectedPackage.name : 'Alapcsomag'}</p>
                                </div>
                            </div>
                            <p className="font-semibold whitespace-nowrap pl-4 text-slate-200">{formatCurrency(basePackagePrice, !!selectedPlan)}</p>
                        </div>
                        {/* Editable Contents or Plan Features */}
                        {selectedPlan ? (
                            <div className="pl-8 pt-3 space-y-2">
                                {selectedPlan.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 mt-0.5">
                                            <CheckIcon />
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium">{feature.name}</p>
                                            <p className="text-slate-400 text-xs">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="pl-8 pt-3 space-y-2">
                                {packageContents.pages.length > 0 && (
                                    <div className="space-y-1">
                                        {packageContents.pages.map((page, index) => (
                                            <EditableListItem
                                                key={`page-${index}`}
                                                text={page.text}
                                                isNew={page.isNew}
                                                type="page"
                                                onChange={(value) => onPackageContentChange('pages', index, value)}
                                                onRemove={() => onRemovePackageContent('pages', index)}
                                            />
                                        ))}
                                    </div>
                                )}
                                {packageContents.features.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        {packageContents.features.map((feature, index) => (
                                            <EditableListItem
                                                key={`feature-${index}`}
                                                text={feature.text}
                                                isNew={feature.isNew}
                                                type="feature"
                                                onChange={(value) => onPackageContentChange('features', index, value)}
                                                onRemove={() => onRemovePackageContent('features', index)}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-4 mt-2">
                                    {selectedPackage.id !== PackageId.MAINTENANCE && 
                                        <button 
                                            onClick={() => onAddPackageContent('pages')}
                                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-all duration-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:scale-105"
                                        >
                                            <PlusIcon/> Oldal
                                        </button>
                                    }
                                    <button 
                                        onClick={() => onAddPackageContent('features')}
                                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition-all duration-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:scale-105"
                                    >
                                        <PlusIcon/> Funkció
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Elite Extensions */}
                    {chosenEliteExtensions.map(ext => {
                        const customPrice = customElitePrices[ext.id];
                        const price = customPrice !== undefined ? customPrice : ext.priceMonthly;
                        
                        return (
                            <SummaryItem
                                key={ext.id}
                                name={ext.name}
                                price={price}
                                details={customPrice !== undefined ? 'Elite Extension (egyedi díj)' : 'Elite Extension'}
                                isMonthly
                            />
                        );
                    })}
                    
                    {/* Custom Sections for Landing Page */}
                    {customSections.map(section => (
                        <div key={section.id} className="flex justify-between items-start py-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                                    <CheckIcon />
                                </div>
                                <div>
                                    <p className="text-slate-200">{section.name}</p>
                                    <p className="text-xs text-slate-400">Egyedi szekció</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Custom Instances */}
                    {Object.entries(customInstances).map(([extraId, instances]) => {
                        const parentExtra = EXTRAS.find(e => e.id === extraId);
                        return (
                            Array.isArray(instances) && instances.map((instance) => (
                                <SummaryItem
                                    key={instance.id}
                                    name={instance.name}
                                    price={instance.price}
                                    details={parentExtra?.name || instance.description}
                                />
                            ))
                        );
                    })}


                    {/* Selected Extras */}
                    {selectedExtras.filter(extra => !extra.isInstantiable).map(extra => {
                        let price = 0;
                        let priceDetails = '';
                        const customPrice = customPrices[extra.id];
                        const isCustom = extra.type === PriceType.CUSTOM;

                        switch(extra.type) {
                            case PriceType.FIXED:
                                price = extra.price;
                                break;
                            case PriceType.FROM:
                                price = customPrice ?? extra.price;
                                priceDetails = customPrice !== undefined ? 'Véglegesített ár' : `Alapár ${formatCurrency(extra.price)}-tól`;
                                break;
                            case PriceType.HOURLY:
                                price = customPrice ?? 0;
                                priceDetails = 'Becsült díj';
                                break;
                            case PriceType.CUSTOM:
                                price = 0; // Price remains 0 for calculation, but will be displayed as custom text
                                priceDetails = 'Egyedi árajánlat alapján';
                                break;
                            case PriceType.FREE:
                                price = 0;
                                break;
                        }

                        const details = [extra.description, priceDetails].filter(Boolean).join(' - ');

                        return <SummaryItem key={extra.id} name={extra.name} price={price} details={details} isCustom={isCustom} />;
                    })}

                    {/* Bonus Pages */}
                    {!isMaintenance && bonusPages.map(page => (
                        <SummaryItem key={page.id} name={page.name} price={0} details={page.description} isBonus />
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-700 space-y-3">
                    {hasPriorityFee && (
                        <>
                            <div className="flex justify-between items-center">
                                <p className="text-md text-slate-400">Részösszeg:</p>
                                <p className="text-lg font-semibold text-slate-300">{formatCurrency(subTotal)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-md text-slate-400">Sürgősségi felár (x{priorityMultiplier.toFixed(1)}):</p>
                                <p className="text-lg font-semibold text-slate-300">{formatCurrency(oneTimeTotal - subTotal)}</p>
                            </div>
                        </>
                    )}
                    {(oneTimeTotal > 0 && monthlyTotal > 0) && (
                         <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-slate-300">Egyszeri díjak (nettó):</p>
                            <p className="text-2xl font-extrabold text-indigo-400">{formatCurrency(oneTimeTotal)}</p>
                        </div>
                    )}
                     {(monthlyTotal > 0) ? (
                        <div className="flex flex-col space-y-2">
                             <div className="flex justify-between items-center">
                                <p className="text-lg font-bold text-slate-300">{hasDiscount ? 'Eredeti havidíj (nettó):' : 'Teljes havidíj (nettó):'}</p>
                                <p className={`text-2xl font-extrabold ${hasDiscount ? 'text-slate-400 line-through decoration-red-500/50' : 'text-indigo-500'}`}>
                                    {formatCurrency(monthlyTotal, true)}
                                </p>
                            </div>
                            {hasDiscount && (
                                <div className="flex justify-between items-center bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                    <p className="text-lg font-bold text-indigo-300">Kedvezményes havidíj:</p>
                                    <p className="text-3xl font-extrabold text-indigo-500">{formatCurrency(discountedMonthlyTotal, true)}</p>
                                </div>
                            )}
                        </div>
                     ) : (
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold text-slate-300">{hasDiscount ? 'Eredeti összeg (nettó):' : 'Teljes összeg (nettó):'}</p>
                                <p className={`text-2xl font-extrabold ${hasDiscount ? 'text-slate-400 line-through decoration-red-500/50' : 'text-indigo-500'}`}>
                                    {formatCurrency(oneTimeTotal)}
                                </p>
                            </div>
                            {hasDiscount && (
                                <div className="flex justify-between items-center bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                    <p className="text-lg font-bold text-indigo-300">Kedvezményes összeg:</p>
                                    <p className="text-3xl font-extrabold text-indigo-500">{formatCurrency(discountedOneTimeTotal)}</p>
                                </div>
                            )}
                        </div>
                     )}

                    {/* Discount Input */}
                    <div className="pt-4 border-t border-slate-700">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Kedvezmény mértéke (%)
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discountPercentage || ''}
                                    onChange={(e) => onDiscountChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm pr-8"
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">%</span>
                            </div>
                            {discountPercentage > 0 && (
                                <button 
                                    onClick={() => onDiscountChange(0)}
                                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                    title="Kedvezmény törlése"
                                >
                                    <XIcon />
                                </button>
                            )}
                        </div>
                        {hasDiscount && (
                            <p className="text-xs text-indigo-400 mt-2 font-medium">
                                Megtakarítás: {formatCurrency(monthlyTotal > 0 ? monthlyDiscountAmount : discountAmount, monthlyTotal > 0)}
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-slate-500 pt-2 text-right">Az árak az áfát nem tartalmazzák. Ez egy előzetes kalkuláció, a végleges árajánlatot a személyes egyeztetés után küldjük.</p>
                </div>
                <div className="mt-8 flex items-center gap-2">
                     <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="flex-shrink-0 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 hover:-translate-y-0.5"
                        title="Küldés e-mailben"
                    >
                        <EmailIcon />
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={isGeneratingPdf}
                        className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 hover:-translate-y-0.5"
                    >
                        {isGeneratingPdf ? (
                            <>
                                <LoaderIcon />
                                PDF generálása...
                            </>
                        ) : (
                            <>
                                <PdfIcon />
                                PDF exportálás
                            </>
                        )}
                    </button>
                </div>
                {!isMaintenance && (
                    <button
                        onClick={handleExportSitemapPDF}
                        disabled={isGeneratingSitemapPdf}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 hover:-translate-y-0.5"
                    >
                        {isGeneratingSitemapPdf ? (
                            <>
                                <LoaderIcon />
                                Site Map generálása...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                                </svg>
                                Site Map PDF exportálása
                            </>
                        )}
                    </button>
                )}
            </div>
            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                quoteDetails={quoteDetails}
                onSend={() => {
                    onSaveQuote();
                    generateQuotePDF(getPdfData());
                }}
            />
        </>
    );
};

export default Summary;
