import React from 'react';
import { Mode } from '../types';
import { Repeat, Delete, Equal } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onEqual: () => void;
  onDelete: () => void;
  onToggleMode: () => void;
  mode: Mode;
}

const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onClear,
  onEqual,
  onDelete,
  onToggleMode,
  mode
}) => {
  const btnBase = "h-16 rounded-2xl text-xl font-medium transition-all active:scale-95 flex items-center justify-center select-none";
  const btnNum = `${btnBase} bg-gray-800 text-white hover:bg-gray-700`;
  const btnOp = `${btnBase} bg-gray-700 text-indigo-300 hover:bg-gray-600`;
  const btnAction = `${btnBase} bg-red-500/10 text-red-400 hover:bg-red-500/20`;
  const btnEqual = `${btnBase} bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:bg-indigo-500`;
  const btnMode = `${btnBase} ${mode === Mode.RunRate ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-pink-900/30 text-pink-400 border border-pink-500/30'}`;

  return (
    <div className="bg-gray-900 p-4 pt-2 pb-8 grid grid-cols-4 gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
      
      {/* Row 1 */}
      <button onClick={onClear} className={btnAction}>AC</button>
      <button onClick={onToggleMode} className={`${btnMode} text-sm flex flex-col gap-0 leading-none`}>
        <span className="text-[10px] opacity-70">モード</span>
        {mode === Mode.RunRate ? '積上' : '逆算'}
      </button>
      <button onClick={() => onOperator('/')} className={btnOp}>÷</button>
      <button onClick={onDelete} className={btnOp}><Delete size={20} /></button>

      {/* Row 2 */}
      <button onClick={() => onDigit('7')} className={btnNum}>7</button>
      <button onClick={() => onDigit('8')} className={btnNum}>8</button>
      <button onClick={() => onDigit('9')} className={btnNum}>9</button>
      <button onClick={() => onOperator('*')} className={btnOp}>×</button>

      {/* Row 3 */}
      <button onClick={() => onDigit('4')} className={btnNum}>4</button>
      <button onClick={() => onDigit('5')} className={btnNum}>5</button>
      <button onClick={() => onDigit('6')} className={btnNum}>6</button>
      <button onClick={() => onOperator('-')} className={btnOp}>-</button>

      {/* Row 4 */}
      <button onClick={() => onDigit('1')} className={btnNum}>1</button>
      <button onClick={() => onDigit('2')} className={btnNum}>2</button>
      <button onClick={() => onDigit('3')} className={btnNum}>3</button>
      <button onClick={() => onOperator('+')} className={btnOp}>+</button>

      {/* Row 5 */}
      <button onClick={() => onDigit('0')} className={`${btnNum} col-span-2`}>0</button>
      <button onClick={() => onDigit('.')} className={btnNum}>.</button>
      <button onClick={onEqual} className={btnEqual}><Equal size={24} /></button>
    </div>
  );
};

export default Keypad;