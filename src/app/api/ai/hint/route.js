import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(req) {
  console.log("POST /api/ai/hint hit");
  try {
    const { problemTitle, problemDescription, userCode, language } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error("AI Hint Error: GEMINI_API_KEY is missing");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const prompt = `
      You are an expert coding interview coach. A student is working on the following problem:
      Title: ${problemTitle}
      Description: ${problemDescription}
      
      The student is using ${language} and has written the following code:
      \`\`\`${language}
      ${userCode}
      \`\`\`
      
      Provide a helpful, concise hint to guide them toward the solution without giving away the full code. 
      Focus on the logic, potential edge cases, or time complexity improvements.
      Format the response as a single, friendly paragraph.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using 1.5-flash as 3-flash-preview was 404ing
      contents: prompt,
    });

    return NextResponse.json({ hint: response.text });
  } catch (error) {
    console.error("AI Hint Error:", error);
    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}


