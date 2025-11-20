import { Mode, Period, SimulationItem, Unit } from '../types';

// Constants for business assumptions
const DAYS_PER_MONTH = 20; // Business days assumption
const DAYS_PER_YEAR = 240; // Business days assumption
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 1 }).format(num);
};

export const calculateSimulations = (
  value: number,
  mode: Mode,
  unit: Unit,
  period: Period
): SimulationItem[] => {
  if (value === 0) return [];

  const suffix = unit;

  if (mode === Mode.RunRate) {
    // Input is interpreted as a "Daily Pace" for MVP simplicity based on spec flow
    // "UC: Run Rate Sales - Input daily amount"

    // Base calculation: assume input is DAILY run rate
    const daily = value;
    const weekly = daily * 5;
    const monthly = daily * DAYS_PER_MONTH;
    const yearly = daily * DAYS_PER_YEAR;
    const threeYear = yearly * 3;

    return [
      {
        label: '月間見込み',
        value: `${formatNumber(monthly)}${suffix}`,
        subtext: `稼働${DAYS_PER_MONTH}日換算`,
      },
      {
        label: '年間見込み (着地)',
        value: `${formatNumber(yearly)}${suffix}`,
        subtext: `稼働${DAYS_PER_YEAR}日換算`,
        highlight: true,
      },
      {
        label: '3年後',
        value: `${formatNumber(threeYear)}${suffix}`,
        subtext: '現状維持の場合',
      },
    ];
  } else {
    // Reverse Mode: Input is the TARGET Total
    // Calculate required pace
    let targetDays = 0;

    // Determine total duration in business days
    switch (period) {
      case Period.Yearly:
        targetDays = DAYS_PER_YEAR;
        break;
      case Period.HalfYear:
        targetDays = DAYS_PER_YEAR / 2;
        break;
      case Period.Quarterly:
        targetDays = DAYS_PER_YEAR / 4;
        break;
      case Period.Monthly:
        targetDays = DAYS_PER_MONTH;
        break;
      default:
        targetDays = DAYS_PER_YEAR;
    }

    const dailyRequired = value / targetDays;
    const weeklyRequired = dailyRequired * 5;
    const monthlyRequired = dailyRequired * DAYS_PER_MONTH;

    return [
      {
        label: '1日あたりの目標',
        value: `${formatNumber(dailyRequired)}${suffix}`,
        subtext: '営業日ベース',
        highlight: true,
      },
      {
        label: '週間目標',
        value: `${formatNumber(weeklyRequired)}${suffix}`,
        subtext: '週5日稼働',
      },
      {
        label: '月間目標',
        value: `${formatNumber(monthlyRequired)}${suffix}`,
        subtext: '月20日稼働',
      },
    ];
  }
};
