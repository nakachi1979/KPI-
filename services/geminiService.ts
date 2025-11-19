
import { GoogleGenAI } from "@google/genai";
import { Mode, Unit, Period } from "../types";

const GEMINI_MODEL = 'gemini-2.5-flash';
const DAYS_PER_MONTH = 20;
const DAYS_PER_YEAR = 240;

export const generateKpiInsight = async (
  value: number,
  mode: Mode,
  unit: Unit,
  period: Period,
  comparisonPace: number | null = null
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("API Key not found");
      return "APIキーが設定されていません。";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const modeText = mode === Mode.RunRate ? "積み上げシミュレーション" : "目標からの逆算";
    const valueFormatted = new Intl.NumberFormat('ja-JP').format(value);
    
    // Prepare Context with Pre-calculated projections
    let calculationContext = "";
    const fmt = (n: number) => new Intl.NumberFormat('ja-JP').format(Math.round(n));

    if (mode === Mode.RunRate) {
      const monthly = value * DAYS_PER_MONTH;
      const yearly = value * DAYS_PER_YEAR;
      calculationContext = `
      【算出された未来の数値】
      ユーザーの入力（1日あたり）: ${valueFormatted} ${unit}
      このまま続けた場合の月間見込み（20日換算）: ${fmt(monthly)} ${unit}
      このまま続けた場合の年間見込み（240日換算）: ${fmt(yearly)} ${unit}
      `;
    } else {
      // Reverse Mode Context
      let days = DAYS_PER_YEAR;
      if (period === Period.HalfYear) days = 120;
      if (period === Period.Quarterly) days = 60;
      if (period === Period.Monthly) days = 20;
      
      const dailyRequired = value / days;
      calculationContext = `
      【目標達成に必要な数値】
      目標総量: ${valueFormatted} ${unit} （期間: ${period}）
      必要な1日あたりのペース: ${fmt(dailyRequired)} ${unit}
      `;
    }

    // Gap Analysis Context Logic
    let gapContext = "";
    let gapInstruction = "";

    if (mode === Mode.Reverse && comparisonPace) {
      // Case: Comparison data EXISTS
      const currentPaceFmt = new Intl.NumberFormat('ja-JP').format(comparisonPace);
      gapContext = `
      【現状とのギャップデータ（重要）】
      ユーザーが直近で計算した現状の実績ペース: 1日あたり ${currentPaceFmt} ${unit}
      `;
      gapInstruction = "現状のペースと、目標達成に必要なペースの差分（ギャップ）について具体的に言及し、どう埋めるかをアドバイスしてください。";
    } else {
      // Case: Comparison data DOES NOT EXIST
      gapContext = "【現状データなし】";
      gapInstruction = `
      重要: 現在、ユーザーの「現状のペース」に関するデータは入力されていません。
      絶対に「現状の12円と比較して…」のような、架空の現状数値を捏造してはいけません。
      「現状との差分」や「比較」には一切触れず、純粋に目標達成に向けた心構えや戦術のみをアドバイスしてください。
      `;
    }

    // CVR / Sales Context for 'Count' unit
    let businessContext = "";
    if (unit === Unit.Count) {
      businessContext = `
      【単位が「件」の場合の重要指示】
      ユーザーは「件数（リード数や営業活動量）」を入力しています。
      アドバイスには必ず「成約率（CVR）」や「質の向上」といった観点を盛り込んでください。
      例：「この件数を確保しつつCVRを高めれば、最終的な成果はさらに跳ね上がります」といった視点。
      `;
    }

    const prompt = `
      あなたは「上品で知的なビジネスメンタルコーチ」です。
      常に落ち着きがあり、ユーザーの視座を高めるようなプロフェッショナルな態度で接してください。
      
      ユーザーのシミュレーション状況:
      モード: ${modeText}
      単位: ${unit}
      
      ${calculationContext}
      ${gapContext}
      ${businessContext}

      【指示】
      このシミュレーション結果に基づき、以下の要件を満たすインサイト（コメント）を生成してください。

      1. **具体的な数字を引用する**: 
         上記の【算出された未来の数値】に含まれる月間・年間などの大きな数字を文中で引用し、ユーザーにインパクトや安心感を伝えてください。
      
      2. **現状データの扱い**:
         ${gapInstruction}
      
      3. **上品なコーチング**:
         数字が良い場合はさらに高みを目指す視点を、課題がある場合は具体的な改善の切り口（CVR改善や単価アップなど）を優しく提案してください。
         文体は「〜ですね」「〜しましょう」といった、丁寧で洗練された敬語（デスマス調）で統一してください。
      
      4. **名乗らない**:
         「私はコーチです」や自分の名前は一切名乗らないでください。自然なアドバイスのみを出力してください。

      制約:
      - 100文字〜140文字程度の日本語。
      - スマートフォンで読みやすいように。
      - マークダウンは使用不可。テキストのみ。
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "インサイトの生成に失敗しました。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "現在、AIインサイトを利用できません。";
  }
};
