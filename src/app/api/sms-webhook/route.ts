import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, secret, smsText } = body;

    if (!userId || !smsText || !secret) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    // Connect to Supabase as admin to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Parse the SMS using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const prompt = `
You are an expert financial assistant. Read this SMS text message from a bank and extract the transaction details.
Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.

Keys required:
- "description": A short, clear description of the purchase or transfer (e.g. "Keells Supermarket", "Uber Ride", "Salary").
- "amount": The amount as a number. Extract the numeric value only.
- "date": The date of the transaction in "YYYY-MM-DD" format. If the SMS says "today" or omits the date, use today's date: ${new Date().toISOString().split('T')[0]}.
- "type": Exactly "income" if money was deposited/credited to the account, or "expense" if money was spent/debited.
- "category": Must be EXACTLY one of these strings: "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Housing", "Other". Pick the most logical category, or "Income" if type is income.

SMS Text: "${smsText}"
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        description: parsedData.description,
        amount: parsedData.amount,
        type: parsedData.type,
        category: parsedData.type === "income" ? "Income" : parsedData.category,
        date: parsedData.date,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to insert transaction" }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook failed" }, { status: 500 });
  }
}
