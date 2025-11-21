// api/insight.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel で Edge Functions として動かす設定
export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  try {
    // POST 以外は拒否
    if (req.method !== "POST") {
      return new Response("Only POST is allowed", { status: 405 });
    }

    // フロントから送られてきた JSON を取得
    const body: any = await req.json().catch(() => ({}));

    // どんな形で来ても、とりあえずテキストを取り出す
    const prompt =
      body?.prompt ??
      body?.input ??
      body?.message ??
      body?.text ??
      JSON.stringify(body ?? {});

    // 環境変数から API キー取得（Vercel の GEMINI_API_KEY）
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not set", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 新しい generateContent 形式で呼び出し
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.response.text();

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
