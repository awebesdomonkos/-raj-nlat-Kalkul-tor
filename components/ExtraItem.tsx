
import React from 'react';
import { Extra, PriceType, CustomInstance } from '../types';
import { PlusIcon, TrashIcon } from './icons';
import { LANGUAGES } from '../constants';

interface ExtraItemProps {
  extra: Extra;
  isSelected: boolean;
  customPrice?: number;
  instances: CustomInstance[];
  onExtraChange: (extraId: string, isSelected: boolean) => void;
  onCustomPriceChange: (extraId: string, price: number) => void;
  onAddInstance: (extraId: string) => void;
  onRemoveInstance: (extraId: string, instanceId: string) => void;
  onUpdateInstance: (extraId: string, instanceId: string, field: keyof Omit<CustomInstance, 'id'>, value: string | number) => void;
}

const formatCurrency = (amount: number, type?: PriceType) => {
    const formatted = new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount);
    switch (type) {
        case PriceType.FROM: return `${formatted}-tól`;
        default: return formatted;
    }
};

const InstanceEditor: React.FC<{
    extra: Extra;
    instance: CustomInstance;
    index: number;
    totalInstances: number;
    onRemove: () => void;
    onUpdate: (field: keyof Omit<CustomInstance, 'id'>, value: string | number) => void;
}> = ({ extra, instance, index, totalInstances, onRemove, onUpdate }) => {
    const isLanguageExtra = extra.id === 'multilingualism';

    return (
        <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-300">{isLanguageExtra ? `Nyelv #${index + 1}` : `${extra.name} #${index + 1}`}</p>
                {totalInstances > 1 && (
                    <button onClick={onRemove} title="Példány törlése" className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-900/30 transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500">
                        <TrashIcon />
                    </button>
                )}
            </div>
            
            {isLanguageExtra ? (
                <div>
                    <label htmlFor={`lang-name-${instance.id}`} className="text-xs font-medium text-slate-400">Nyelv</label>
                    <input
                        type="text"
                        id={`lang-name-${instance.id}`}
                        list="languages-list"
                        value={instance.name}
                        placeholder="Válasszon nyelvet..."
                        onChange={(e) => onUpdate('name', e.target.value)}
                        className="mt-1 w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                    />
                </div>
            ) : (
                <div>
                    <label htmlFor={`name-${instance.id}`} className="text-xs font-medium text-slate-400">Név</label>
                    <input
                        type="text"
                        id={`name-${instance.id}`}
                        value={instance.name}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        className="mt-1 w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                    />
                </div>
            )}
            
            {!isLanguageExtra && (
                <div>
                    <label htmlFor={`desc-${instance.id}`} className="text-xs font-medium text-slate-400">Leírás</label>
                    <textarea
                        id={`desc-${instance.id}`}
                        value={instance.description}
                        rows={2}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        className="mt-1 w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                    />
                </div>
            )}

             <div>
                <label htmlFor={`price-${instance.id}`} className="text-xs font-medium text-slate-400">{isLanguageExtra ? 'Becsült díj' : 'Ár'}</label>
                <div className="relative mt-1">
                    <input
                        type="number"
                        id={`price-${instance.id}`}
                        value={instance.price}
                        min="0"
                        step="1000"
                        onChange={(e) => onUpdate('price', parseInt(e.target.value) || 0)}
                        className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 pr-8 transition-colors duration-200"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400">Ft</span>
                </div>
            </div>
        </div>
    )
};

const ExtraItem: React.FC<ExtraItemProps> = ({ extra, isSelected, customPrice, instances, onExtraChange, onCustomPriceChange, onAddInstance, onRemoveInstance, onUpdateInstance }) => {
    
    const renderPrice = () => {
        switch (extra.type) {
            case PriceType.FIXED:
            case PriceType.FROM:
                return <span className="font-semibold text-slate-300">{formatCurrency(extra.price, extra.type)}{extra.unit}</span>;
            case PriceType.HOURLY:
                 return <span className="font-semibold text-indigo-400">Becsült díj</span>;
            case PriceType.CUSTOM:
                return <span className="font-semibold text-indigo-400">Egyedi árajánlat</span>;
            case PriceType.FREE:
                return <span className="font-semibold text-green-500">Ingyenes</span>;
            default:
                return null;
        }
    };

    const handlePriceChange = (value: string) => {
        const price = parseInt(value, 10);
        onCustomPriceChange(extra.id, isNaN(price) ? 0 : price);
    };

    const showCustomPriceInput = isSelected && !extra.isInstantiable && (extra.type === PriceType.HOURLY || extra.type === PriceType.FROM);

    return (
        <div className={`p-4 rounded-lg transition-colors ${isSelected ? 'bg-slate-700/50' : 'bg-transparent'}`}>
            <datalist id="languages-list">
                {LANGUAGES.map(lang => <option key={lang} value={lang} />)}
            </datalist>
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="flex items-start gap-3 flex-grow">
                    <input
                        type="checkbox"
                        id={extra.id}
                        checked={isSelected}
                        onChange={(e) => onExtraChange(extra.id, e.target.checked)}
                        className="mt-1 h-5 w-5 rounded bg-slate-600 border-slate-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0 transition-all duration-150"
                    />
                    <div>
                        <label htmlFor={extra.id} className="text-slate-200 cursor-pointer">{extra.name}</label>
                        {extra.description && <p className="text-sm text-slate-400 mt-1">{extra.description}</p>}
                    </div>
                </div>
                <div className="flex-shrink-0 ml-auto pl-4">{renderPrice()}</div>
            </div>

            {showCustomPriceInput && (
                <div className="mt-3 pl-8 flex items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-700">
                    <label htmlFor={`price-${extra.id}`} className="text-sm font-medium text-slate-400">
                        {extra.type === PriceType.FROM ? 'Végleges ár:' : 'Becsült díj:'}
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            id={`price-${extra.id}`}
                            value={customPrice ?? ''}
                            min="0"
                            step="1000"
                            placeholder={extra.type === PriceType.FROM ? extra.price.toString() : '0'}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="w-32 rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 pr-8 transition-colors duration-200"
                        />
                         <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400">Ft</span>
                    </div>
                </div>
            )}

            {extra.isInstantiable && isSelected && (
                <div className="mt-4 pl-8 space-y-4">
                    {instances.map((instance, index) => (
                        <InstanceEditor
                            key={instance.id}
                            extra={extra}
                            instance={instance}
                            index={index}
                            totalInstances={instances.length}
                            onRemove={() => onRemoveInstance(extra.id, instance.id)}
                            onUpdate={(field, value) => onUpdateInstance(extra.id, instance.id, field, value)}
                        />
                    ))}
                    <button 
                        onClick={() => onAddInstance(extra.id)}
                        className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-slate-600 text-slate-400 rounded-lg hover:bg-slate-800 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700/50 focus:ring-indigo-500 hover:-translate-y-0.5"
                    >
                        <PlusIcon />
                        További "{extra.name}" hozzáadása
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExtraItem;
