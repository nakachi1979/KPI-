import React, { useState } from 'react';
import Display from './components/Display';
import Keypad from './components/Keypad';
import { CalculationState } from './types';

const App: React.FC = () => {
  // Calculator State
  const [calcState, setCalcState] = useState<CalculationState>({
    displayValue: '0',
    previousValue: null,
    operation: null,
    isNewInput: true,
  });

  // Helper to execute math
  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleDigit = (digit: string) => {
    setCalcState((prev) => {
      let newValue = prev.displayValue;

      if (prev.isNewInput) {
        newValue = digit;
      } else {
        if (digit === '.' && newValue.includes('.')) return prev;
        newValue = newValue === '0' && digit !== '.' ? digit : newValue + digit;
      }

      return {
        ...prev,
        displayValue: newValue,
        isNewInput: false,
      };
    });
  };

  const handleOperator = (op: string) => {
    setCalcState((prev) => {
      const current = parseFloat(prev.displayValue);
      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: current,
          operation: op,
          isNewInput: true,
        };
      }

      if (prev.operation) {
        const result = calculate(prev.previousValue, current, prev.operation);
        return {
          ...prev,
          previousValue: result,
          displayValue: String(result),
          operation: op,
          isNewInput: true,
        };
      }

      return prev;
    });
  };

  const handleEqual = () => {
    const current = parseFloat(calcState.displayValue);
    let finalValue = current;

    if (calcState.previousValue !== null && calcState.operation) {
      finalValue = calculate(calcState.previousValue, current, calcState.operation);
    }

    setCalcState({
      displayValue: String(finalValue),
      previousValue: null,
      operation: null,
      isNewInput: true,
    });
  };

  const handleClear = () => {
    setCalcState({
      displayValue: '0',
      previousValue: null,
      operation: null,
      isNewInput: true,
    });
  };

  const handleDelete = () => {
    setCalcState((prev) => {
      if (prev.isNewInput) return prev;
      const newVal = prev.displayValue.slice(0, -1) || '0';
      return { ...prev, displayValue: newVal };
    });
  };

  const getFormulaDisplay = () => {
    if (calcState.previousValue !== null && calcState.operation) {
      return `${calcState.previousValue} ${calcState.operation}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Top: Display */}
      <Display
        displayValue={calcState.displayValue}
        formula={getFormulaDisplay()}
      />

      {/* Bottom: Keypad */}
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onClear={handleClear}
        onEqual={handleEqual}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default App;
