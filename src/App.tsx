import React, { useState, useEffect, useCallback } from 'react';
import Display from './components/Display';
import SimulationPanel from './components/SimulationPanel';
import Keypad from './components/Keypad';
import { Mode, Unit, Period, CalculationState, SimulationItem } from './types';
import { calculateSimulations } from './utils/kpi';
import { generateKpiInsight } from './services/geminiService';

const App: React.FC = () => {
  // Calculator State
  const [calcState, setCalcState] = useState<CalculationState>({
    displayValue: '0',
    previousValue: null,
    operation: null,
    isNewInput: true,
    lastCalculatedValue: 0,
  });

  // Settings State
  const [mode, setMode] = useState<Mode>(Mode.RunRate);
  const [unit, setUnit] = useState<Unit>(Unit.Yen);
  const [period, setPeriod] = useState<Period>(Period.Yearly);

  // Result State
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Gap Analysis State: Store the last "Run Rate" value (Daily Pace) to compare in Reverse Mode
  const [currentPace, setCurrentPace] = useState<number | null>(null);

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
          formula: `${current} ${op}`,
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

  // Execute Calculation and Trigger Simulation immediately
  const handleEqual = useCallback(async () => {
    const current = parseFloat(calcState.displayValue);
    let finalValue = current;

    // 1. Perform Math
    if (calcState.previousValue !== null && calcState.operation) {
      finalValue = calculate(calcState.previousValue, current, calcState.operation);
    }

    // 2. Update Calculator State
    setCalcState((prev) => ({
      ...prev,
      displayValue: String(finalValue),
      previousValue: null,
      operation: null,
      isNewInput: true,
      lastCalculatedValue: finalValue,
      formula: '',
    }));

    // 3. Trigger Simulation & AI with the *Computed* value and *Current* Context
    // This fixes the issue where buttons had to be pressed *after* calculation.
    // Now, if you set Unit -> Type -> Equal, it works.
    handleSimulationLogic(finalValue, mode);

  }, [calcState, mode, unit, period]);

  // Manual Trigger (The "Simulate" Button)
  const handleManualSimulate = () => {
    const val = parseFloat(calcState.displayValue);
    if (!isNaN(val)) {
      // Treat this as a committed value
      setCalcState(prev => ({ ...prev, lastCalculatedValue: val, isNewInput: true }));
      handleSimulationLogic(val, mode);
    }
  };

  const handleClear = () => {
    setCalcState({
      displayValue: '0',
      previousValue: null,
      operation: null,
      isNewInput: true,
      lastCalculatedValue: 0,
    });
    setSimulations([]);
    setAiInsight('');
    setCurrentPace(null); // Reset Gap Analysis context
  };

  const handleDelete = () => {
    setCalcState((prev) => {
      if (prev.isNewInput) return prev;
      const newVal = prev.displayValue.slice(0, -1) || '0';
      return { ...prev, displayValue: newVal };
    });
  };

  const handleToggleMode = () => {
    const newMode = mode === Mode.RunRate ? Mode.Reverse : Mode.RunRate;
    setMode(newMode);

    // If we have a valid value, recalculate immediately
    // Try to use the last calculated value if valid, otherwise current display
    const valToUse = calcState.lastCalculatedValue > 0
      ? calcState.lastCalculatedValue
      : parseFloat(calcState.displayValue);

    if (!isNaN(valToUse) && valToUse > 0) {
      handleSimulationLogic(valToUse, newMode);
    }
  };

  // Core Simulation Logic
  const handleSimulationLogic = (val: number, currentMode: Mode) => {
    if (val === 0) return;

    // 1. Local Calculation (Instant)
    const items = calculateSimulations(val, currentMode, unit, period);
    setSimulations(items);

    // 2. Store "Current Pace" for Gap Analysis
    // If we are in RunRate mode, this value represents the user's current daily performance.
    if (currentMode === Mode.RunRate) {
      setCurrentPace(val);
    }

    // 3. AI Generation (Async)
    triggerAi(val, currentMode);
  };

  const triggerAi = async (val: number, currentMode: Mode) => {
    setLoadingAi(true);
    // Pass 'currentPace' if we are in Reverse mode to allow "Gap Analysis"
    const comparisonPace = currentMode === Mode.Reverse ? currentPace : null;

    const insight = await generateKpiInsight(val, currentMode, unit, period, comparisonPace);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  // Auto-update Simulation (Math only) when Context Changes
  // We do NOT auto-trigger AI here to save tokens/latency unless explicitly desired,
  // but user asked for "Simulate without calculation", so updating math is good.
  // If there is a committed result, we also update AI to keep context fresh.
  useEffect(() => {
    const val = parseFloat(calcState.displayValue);
    if (!isNaN(val) && val > 0) {
       // Update Cards
       const items = calculateSimulations(val, mode, unit, period);
       setSimulations(items);

       // Update AI if we are looking at a result (not mid-typing)
       if (calcState.lastCalculatedValue > 0) {
         triggerAi(val, mode);
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, period]); // Run when Unit or Period changes

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
        mode={mode}
        unit={unit}
        period={period}
        onUnitChange={setUnit}
        onPeriodChange={setPeriod}
      />

      {/* Middle: Simulation Panel */}
      <SimulationPanel
        items={simulations}
        aiInsight={aiInsight}
        loadingAi={loadingAi}
        onSimulate={handleManualSimulate}
        onRegenerate={() => triggerAi(parseFloat(calcState.displayValue), mode)}
      />

      {/* Bottom: Keypad */}
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onClear={handleClear}
        onEqual={handleEqual}
        onDelete={handleDelete}
        onToggleMode={handleToggleMode}
        mode={mode}
      />
    </div>
  );
};

export default App;
