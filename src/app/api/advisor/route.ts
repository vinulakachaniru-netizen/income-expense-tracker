import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the prompt context
    const systemInstruction = `
You are an expert, empathetic, and highly analytical financial advisor named "Lanka AI".
You are helping the user manage their personal finances.
You should provide direct, actionable advice without long, fluffy introductions. Keep it conversational but concise.
Use formatting like bullet points, bold text, or line breaks to make your response easy to read.

Here is the user's current financial context:
Transactions: ${JSON.stringify(context.transactions)}
Category Budgets: ${JSON.stringify(context.budgets)}
Savings Goal: ${context.goal ? JSON.stringify(context.goal) : "None set"}

If the user asks about a purchase, look at their balances and budgets. If they are overspending, politely warn them.
`;

    // Start a chat session (For simplicity in this API route, we're just doing a one-off prompt with system instruction)
    // If we wanted true memory, we'd pass the full chat history. Here we just prepend the system instruction to the latest prompt.
    const fullPrompt = `${systemInstruction}\n\nUser Question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error("Error in AI Advisor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
