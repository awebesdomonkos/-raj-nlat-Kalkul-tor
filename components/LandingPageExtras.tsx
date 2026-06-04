
import React from 'react';
import { LANDING_PAGE_SECTIONS } from '../constants';
import { TrashIcon, PlusIcon } from './icons';

interface Section {
    id: string;
    name: string;
    price: number;
}

interface LandingPageExtrasProps {
    sections: Section[];
    setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

const LandingPageExtras: React.FC<LandingPageExtrasProps> = ({ sections, setSections }) => {

    const handleAddSection = () => {
        setSections(prev => [...prev, { id: crypto.randomUUID(), name: '', price: 0 }]);
    };

    const handleRemoveSection = (id: string) => {
        setSections(prev => prev.filter(section => section.id !== id));
    };

    const handleSectionChange = (id: string, field: 'name' | 'price', value: string | number) => {
        setSections(prev => prev.map(section => 
            section.id === id ? ({ ...section, [field]: value } as Section) : section
        ));
    };

    return (
        <div className="space-y-4">
            {sections.map((section, index) => (
                <div key={section.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center gap-4">
                    <span className="font-bold text-slate-400">#{index + 1}</span>
                    <div className="flex-grow w-full">
                        <label htmlFor={`name-${section.id}`} className="sr-only">Szekció neve</label>
                        <input
                            type="text"
                            id={`name-${section.id}`}
                            list="landing-sections-list"
                            value={section.name}
                            placeholder="Szekció neve (pl. Kapcsolat űrlap)"
                            onChange={(e) => handleSectionChange(section.id, 'name', e.target.value)}
                            className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition-colors duration-200"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label htmlFor={`price-${section.id}`} className="sr-only">Szekció ára</label>
                        <div className="relative">
                            <input
                                type="number"
                                id={`price-${section.id}`}
                                value={section.price}
                                min="0"
                                step="1000"
                                placeholder="Ár"
                                onChange={(e) => handleSectionChange(section.id, 'price', parseInt(e.target.value) || 0)}
                                className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 pr-8 transition-colors duration-200"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400">Ft</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemoveSection(section.id)}
                        className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-900/30 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
                        title="Szekció törlése"
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <datalist id="landing-sections-list">
                {LANDING_PAGE_SECTIONS.map(sectionName => <option key={sectionName} value={sectionName} />)}
            </datalist>
             <button
                onClick={handleAddSection}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:bg-slate-800 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 hover:-translate-y-0.5"
            >
                <PlusIcon />
                Új szekció hozzáadása
            </button>
        </div>
    );
};

export default LandingPageExtras;
