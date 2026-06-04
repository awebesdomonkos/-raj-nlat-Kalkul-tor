

import React, { useState } from 'react';
import { Extra, PackageId, CustomInstance } from '../types';
import ExtraItem from './ExtraItem';
import { ChevronDownIcon } from './icons';

interface ExtrasAccordionProps {
    categories: Record<string, { name: string; items: Extra[] }>;
    selectedPackageId: PackageId;
    selectedExtras: Record<string, boolean>;
    customPrices: Record<string, number>;
    customInstances: Record<string, CustomInstance[]>;
    extrasSearchQuery: string;
    onExtraChange: (extraId: string, isSelected: boolean) => void;
    onCustomPriceChange: (extraId: string, price: number) => void;
    onAddInstance: (extraId: string) => void;
    onRemoveInstance: (extraId: string, instanceId: string) => void;
    onUpdateInstance: (extraId: string, instanceId: string, field: keyof Omit<CustomInstance, 'id'>, value: string | number) => void;
}

const ExtrasAccordion: React.FC<ExtrasAccordionProps> = ({
    categories,
    selectedPackageId,
    selectedExtras,
    customPrices,
    customInstances,
    extrasSearchQuery,
    onExtraChange,
    onCustomPriceChange,
    onAddInstance,
    onRemoveInstance,
    onUpdateInstance,
}) => {
    const [openCategory, setOpenCategory] = useState<string | null>(Object.keys(categories)[0]);

    const isSearching = !!extrasSearchQuery;
    const searchQuery = extrasSearchQuery.toLowerCase();

    const toggleCategory = (categoryKey: string) => {
        if (isSearching) return;
        setOpenCategory(prev => (prev === categoryKey ? null : categoryKey));
    };

    const categoriesToRender = Object.keys(categories).reduce((acc, key) => {
        const category = categories[key];
        
        let items = category.items.filter(item => item.availableFor.includes(selectedPackageId));

        if (isSearching) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchQuery) ||
                (item.description && item.description.toLowerCase().includes(searchQuery))
            );
        }

        if (items.length > 0) {
            acc[key] = { ...category, items };
        }
        
        return acc;
    }, {} as Record<string, { name: string; items: Extra[] }>);

    if (isSearching && Object.keys(categoriesToRender).length === 0) {
        return <p className="text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Nincs a keresésnek megfelelő extra.</p>;
    }

    return (
        <div className="space-y-3">
            {Object.keys(categoriesToRender).map((key) => {
                const category = categoriesToRender[key];
                const isOpen = isSearching || openCategory === key;

                return (
                    <div key={key} className="border border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleCategory(key)}
                            className={`w-full flex justify-between items-center p-4 bg-slate-800 focus:outline-none rounded-t-lg focus:relative focus:z-10 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${!isSearching ? 'hover:bg-slate-700/80 cursor-pointer' : 'cursor-default'}`}
                            disabled={isSearching}
                            aria-expanded={isOpen}
                            aria-controls={`category-content-${key}`}
                        >
                            <span className="font-bold text-lg text-slate-200">{category.name}</span>
                            <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                            <div id={`category-content-${key}`} className="p-4 border-t border-slate-700">
                                <div className="space-y-4">
                                    {category.items.map(extra => (
                                        <ExtraItem
                                            key={extra.id}
                                            extra={extra}
                                            isSelected={!!selectedExtras[extra.id] || (!!customInstances[extra.id] && customInstances[extra.id].length > 0)}
                                            customPrice={customPrices[extra.id]}
                                            instances={customInstances[extra.id] || []}
                                            onExtraChange={onExtraChange}
                                            onCustomPriceChange={onCustomPriceChange}
                                            onAddInstance={onAddInstance}
                                            onRemoveInstance={onRemoveInstance}
                                            onUpdateInstance={onUpdateInstance}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ExtrasAccordion;
