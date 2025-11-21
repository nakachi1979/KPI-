// api/insight.ts

// Vercel Node.js Functions 用のシンプルなハンドラ
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not set on the server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let prompt: string;
  try {
    const body = await req.json();
    // フロント側のフィールド名に合わせて調整してください
    prompt = body.prompt ?? body.input ?? "";
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: "prompt is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // さきほど確認した REST エンドポイントをそのまま利用
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return new Response(
        JSON.stringify({
          error: "Gemini API error",
          status: resp.status,
          details: data,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text ?? "")
        .join("") ?? "";

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "Request to Gemini failed", details: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
