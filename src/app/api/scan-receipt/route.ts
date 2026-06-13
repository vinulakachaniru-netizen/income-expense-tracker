import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Allow this API route to run for up to 60 seconds (Vercel hobby limit)
export const maxDuration = 60;

// We use the new Gemini 1.5 Flash model which is fast and good at vision tasks
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `
You are an expert financial assistant. Look at this receipt or invoice and extract the transaction details.
Please extract the following information and return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.

Keys required:
- "description": A short, clear description of the purchase (e.g. "Keells Supermarket", "Uber Ride").
- "amount": The total amount paid as a string containing ONLY numbers and optionally a decimal point. Do not include currency symbols (e.g. "1500.00").
- "date": The date of the transaction in "YYYY-MM-DD" format.
- "category": Must be EXACTLY one of these strings: "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Housing", "Other". Pick the most logical category.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    // Clean up potential markdown from the response
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Error scanning receipt:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan receipt." },
      { status: 500 }
    );
  }
}
