export interface CalculationState {
  displayValue: string;
  previousValue: number | null;
  operation: string | null;
  isNewInput: boolean;
}
