import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message || "").toLowerCase();

    if (message.includes("explain this simply") || message.includes("explain simply") || message.includes("explain this")) {
      return NextResponse.json({
        reply:
          "In simple words:\n\n" +
          "Your login screen takes what a visitor types into the username box and glues it directly into the database command. If someone types special symbols like `' OR '1'='1'`, the database gets tricked into thinking the password was correct.\n\n" +
          "This lets an attacker log into your admin account without needing a password at all.",
        quickReplies: ["Show me the fix", "What should I fix first?", "Re-test it"],
      });
    }

    if (message.includes("show me the fix") || message.includes("show fix")) {
      return NextResponse.json({
        reply:
          "The fix is very straightforward:\n\n" +
          "Instead of pasting user text into SQL using Python string formatting, use **parameter bindings** (like `:username` and `:hash`).\n\n" +
          "When you do this, the database treats the text strictly as plain data, so it can never be executed as a command.",
        quickReplies: ["What should I fix first?", "Re-test it"],
      });
    }

    if (message.includes("what should i fix first") || message.includes("first")) {
      return NextResponse.json({
        reply:
          "Fix the **Critical Login Bypass** first:\n\n" +
          "1. **Why first?** It allows any visitor to instantly become an admin.\n" +
          "2. **How long does it take?** It only requires changing 2 lines in `backend/app/auth/routes.py` to use parameterized queries.\n\n" +
          "After that, fix the High-severity issue where users can view each other's private files.",
        quickReplies: ["Show me the fix", "Explain this simply"],
      });
    }

    if (message.includes("scan my web app") || message.includes("scan")) {
      return NextResponse.json({
        reply:
          "To test your website, simply enter its web address (like https://myapp.com) into Step 1 on the left, check the ownership confirmation box in Step 3, and click **Start scan**!\n\n" +
          "Optionally, you can upload your project code in Step 2 to get exact copy-paste code patches.",
        quickReplies: ["How do I secure my login page?", "Explain this vulnerability"],
      });
    }

    if (message.includes("how do i secure my login page") || message.includes("secure login")) {
      return NextResponse.json({
        reply:
          "Here are 3 golden rules for securing your login screen:\n\n" +
          "1. **Use Parameterized Queries**: Never glue user input directly into SQL strings.\n" +
          "2. **Hash Passwords Securely**: Always use bcrypt or Argon2 with salt, never plain text or MD5.\n" +
          "3. **Add Rate Limiting**: Block repeated failed attempts (e.g. max 5 tries in 5 minutes) to stop automated brute-force tools.",
        quickReplies: ["Show me the fix", "What should I fix first?"],
      });
    }

    return NextResponse.json({
      reply:
        "I'm HackFix AI, your security assistant. I translate technical risks into plain words and show you exactly how to fix them.\n\n" +
        "You can ask me to explain any problem, show the copy-paste code fix, or help prioritize what to fix first.",
      quickReplies: ["Explain this simply", "What should I fix first?", "Show me the fix"],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
