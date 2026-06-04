
import React from 'react';
import { MaintenancePlan } from '../types';
import { CheckCircleIcon } from './icons';

interface ContinuousMaintenanceSelectorProps {
  plans: MaintenancePlan[];
  selectedPlanId: 'smart' | 'pro' | null;
  onSelect: (planId: 'smart' | 'pro') => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 }).format(amount) + ' / hó';
};

const ContinuousMaintenanceSelector: React.FC<ContinuousMaintenanceSelectorProps> = ({ plans, selectedPlanId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        return (
          <div
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            className={`
              p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 relative focus:outline-none
              ${isSelected ? 'bg-slate-700 border-indigo-500 shadow-lg ring-2 ring-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 hover:-translate-y-1 focus:ring-2 focus:ring-indigo-500'}
            `}
          >
            <div className="flex justify-between items-start">
              <div className="pr-8">
                <h3 className="font-bold text-lg text-slate-100">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                <ul className="mt-4 space-y-3 text-sm">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <div>
                                <span className="text-slate-200 font-medium">{feature.name}</span>
                                <p className="text-slate-400 text-xs mt-1">{feature.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
              </div>
              {isSelected && (
                <div className="absolute top-4 right-4 text-indigo-500">
                  <CheckCircleIcon />
                </div>
              )}
            </div>
            <p className="text-xl font-bold text-indigo-500 mt-4">{formatCurrency(plan.price)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ContinuousMaintenanceSelector;
