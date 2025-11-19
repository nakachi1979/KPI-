export enum Mode {
  RunRate = 'run_rate',
  Reverse = 'reverse',
}

export enum Unit {
  Yen = '円',
  Count = '件',
  Hours = '時間',
}

export enum Period {
  Daily = '1日あたり',
  Weekly = '1週間あたり',
  Monthly = '1ヶ月あたり',
  Yearly = '1年',
  Quarterly = '四半期',
  HalfYear = '半年',
}

export interface SimulationItem {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}

export interface CalculationState {
  displayValue: string;
  previousValue: number | null;
  operation: string | null;
  isNewInput: boolean;
  lastCalculatedValue: number;
}
