import React from 'react';
import { Mode, Unit, Period } from '../types';
import { Calculator, ArrowLeftRight } from 'lucide-react';

interface DisplayProps {
  displayValue: string;
  formula: string;
  mode: Mode;
  unit: Unit;
  period: Period;
  onUnitChange: (u: Unit) => void;
  onPeriodChange: (p: Period) => void;
}

const Display: React.FC<DisplayProps> = ({
  displayValue,
  formula,
  mode,
  unit,
  period,
  onUnitChange,
  onPeriodChange,
}) => {
  
  const formatDisplay = (val: string) => {
    // Simple comma formatting for display logic (visual only)
    if (val.endsWith('.')) return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 10 }).format(num);
  };

  return (
    <div className="bg-gray-800 p-4 pb-6 rounded-b-3xl shadow-lg z-10 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 opacity-50">
        <div className="flex items-center gap-2">
          <Calculator size={16} />
          <span className="text-xs font-bold tracking-wider">KPI電卓</span>
        </div>
        <span className="text-xs">{mode === Mode.RunRate ? '積上モード' : '逆算モード'}</span>
      </div>

      {/* Formula */}
      <div className="h-6 text-right text-gray-400 text-sm mb-1 font-mono overflow-hidden">
        {formula}
      </div>

      {/* Main Value */}
      <div className="text-right text-5xl font-bold text-white mb-6 tracking-tight break-all">
        {displayValue.includes('.') ? displayValue : formatDisplay(displayValue)}
        <span className="text-2xl text-gray-500 ml-2 font-normal">{unit}</span>
      </div>

      {/* Context Chips */}
      <div className="flex flex-col gap-3">
        {/* Unit Selection */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {Object.values(Unit).map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                unit === u
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Period Selection (Dependent on Mode) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {mode === Mode.RunRate ? (
            // Run Rate Mode: Usually assumes input is Daily, but could expand. 
            // For MVP, we stick to visual indication or simple toggles if we supported input frequency.
            // Let's lock it to '1日あたり' input for now as per MVP Use Case 1.
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              入力: 1日あたりペース
            </div>
          ) : (
            // Reverse Mode: Select Target Period
            Object.values(Period).filter(p => p !== Period.Daily && p !== Period.Weekly).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  period === p
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                目標: {p}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Display;