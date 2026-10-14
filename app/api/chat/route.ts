import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Forward directly to Python FastAPI backend (which has live Gemini AI and scan context)
    try {
      const fastApiRes = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unreachable or timed out, proceed to fallback
    }

    const message = (body.message || "").toLowerCase();

    if (message.includes("explain") || message.includes("simply") || message.includes("what")) {
      return NextResponse.json({
        reply:
          "In simple words:\n\n" +
          "Modern web applications require defense-in-depth headers like **Content-Security-Policy** and **Strict-Transport-Security** to prevent browsers from loading unauthorized scripts or transmitting data over unencrypted channels.\n\n" +
          "When these protective directives are absent, attackers can exploit browser trust to inject malicious payloads or eavesdrop on user sessions.",
        quickReplies: ["Show me the fix", "What should I fix first?"],
      });
    }

    if (message.includes("fix") || message.includes("patch")) {
      return NextResponse.json({
        reply:
          "The recommended fix is to configure strict HTTP response headers on your web server or application middleware:\n\n" +
          "1. Add `Content-Security-Policy: default-src 'self'`\n" +
          "2. Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`\n" +
          "3. Add `X-Content-Type-Options: nosniff`\n" +
          "4. Add `X-Frame-Options: SAMEORIGIN`",
        quickReplies: ["What should I fix first?", "Explain this simply"],
      });
    }

    return NextResponse.json({
      reply:
        "I am **HackFix AI**, your application security assistant. I translate security findings into plain language and provide actionable fixing recommendations.\n\n" +
        "Ask me to explain any identified finding, assess threat vectors, or provide configuration patches.",
      quickReplies: ["Explain this simply", "What should I fix first?", "Show me the fix"],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process chat" }, { status: 500 });
  }
}
