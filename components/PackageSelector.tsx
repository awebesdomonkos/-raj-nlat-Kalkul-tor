
import React from 'react';
import { BasePackage, PackageId } from '../types';
import { CheckCircleIcon } from './icons';

interface PackageSelectorProps {
  packages: BasePackage[];
  selectedPackageId: PackageId | null;
  onSelect: (packageId: PackageId) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount);
};

const PackageSelector: React.FC<PackageSelectorProps> = ({ packages, selectedPackageId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-labelledby="package-selector-heading">
      {packages.map((pkg) => {
        const isSelected = selectedPackageId === pkg.id;
        return (
          <div
            key={pkg.id}
            onClick={() => onSelect(pkg.id)}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(pkg.id)}
            role="radio"
            aria-checked={isSelected}
            className={`
              p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 relative focus:outline-none
              ${isSelected ? 'bg-slate-700 border-indigo-500 shadow-lg ring-2 ring-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 hover:-translate-y-1 focus:ring-2 focus:ring-indigo-500'}
            `}
          >
            <div className="flex justify-between items-start">
              <div className="pr-8">
                <h3 className="font-bold text-lg text-slate-100">{pkg.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{pkg.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-4 right-4 text-indigo-500">
                  <CheckCircleIcon />
                </div>
              )}
            </div>
            <p className="text-xl font-bold text-indigo-500 mt-4">{formatCurrency(pkg.price)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PackageSelector;
