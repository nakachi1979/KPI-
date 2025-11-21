import React from 'react';
import { Calculator } from 'lucide-react';

interface DisplayProps {
  displayValue: string;
  formula: string;
}

const Display: React.FC<DisplayProps> = ({
  displayValue,
  formula,
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
          <span className="text-xs font-bold tracking-wider">電卓</span>
        </div>
      </div>

      {/* Formula */}
      <div className="h-6 text-right text-gray-400 text-sm mb-1 font-mono overflow-hidden">
        {formula}
      </div>

      {/* Main Value */}
      <div className="text-right text-5xl font-bold text-white mb-6 tracking-tight break-all">
        {displayValue.includes('.') ? displayValue : formatDisplay(displayValue)}
      </div>
    </div>
  );
};

export default Display;
