import { Mode, Unit, Period } from "../types";

/**
 * Calls the backend API to generate KPI insight.
 * The API key is handled securely on the server side (Vercel Functions).
 */
export const generateKpiInsight = async (
  value: number,
  mode: Mode,
  unit: Unit,
  period: Period,
  comparisonPace: number | null = null
): Promise<string> => {
  try {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value,
        mode,
        unit,
        period,
        comparisonPace
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "インサイトを取得できませんでした。";
  } catch (error) {
    console.error("Insight Generation Error:", error);
    return "現在、AIインサイトへの接続が不安定です。";
  }
};
