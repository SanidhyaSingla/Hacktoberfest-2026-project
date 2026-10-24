import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { problem, images } = await req.json();

    const systemInstruction = `You are LogicFlow AI STEM Engine. Analyze the math, physics, or chemistry problem provided (via text or images) and output:
1. A clear high-level overview/summary of the problem.
2. A step-by-step breakdown solving or deriving the solution.
3. Key variables or formulas identified using standard LaTeX notation.
4. A valid Mermaid.js flowchart mapping out the logical solving workflow.
5. Experimental cross-references or error checks in "corrections".
6. DYNAMIC SIMULATION: If applicable, provide "simulationParams" (sliders) and "simulationOutputs" (results with plain JS expressions using slider keys). If not applicable, return empty arrays [].

CRITICAL MERMAID SYNTAX RULES:
- Begin directly with "graph TD" without markdown code blocks.
- EVERY node label MUST be wrapped in double quotes inside the node shape (e.g., NodeA["Calculate Drift Velocity"]). 
- DO NOT use raw underscores (_), equal signs (=), or unquoted math symbols inside node text or node IDs. Keep node IDs simple alphanumeric (e.g., Step1, Step2).

CRITICAL RULES:
- For "simulationOutputs", expressions must be valid JavaScript math using ONLY standard numbers and the parameter keys. NO LaTeX inside expressions.
- Respond EXCLUSIVELY in valid raw JSON.

JSON Structure:
{
  "mermaidCode": "graph TD\\nStep1[\"Identify Given Variables\"] --> Step2[\"Calculate Current Density\"]",
  "overview": "...",
  "steps": [{ "stepNumber": 1, "title": "...", "explanation": "..." }],
  "variables": [{ "name": "...", "value": "..." }],
  "corrections": [],
  "simulationParams": [],
  "simulationOutputs": []
}`;

    const parts: any[] = [];

    if (images && Array.isArray(images)) {
      images.forEach((img: string) => {
        const matches = img.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      });
    }

    parts.push({
      text: problem || 'Analyze and solve the provided problem.',
    });

    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text ? response.text.trim() : '{}';
    
    // Robust JSON extractor to handle any model chatter or wrapper blocks
    let parsedData;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawText;
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse fallback triggered. Raw text was:", rawText);
      parsedData = {
        overview: rawText,
        steps: [],
        variables: [],
        corrections: [],
        simulationParams: [],
        simulationOutputs: []
      };
    }

    if (parsedData.mermaidCode) {
      parsedData.mermaidCode = parsedData.mermaidCode
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .trim();
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Gemini STEM API error:', error);
    return NextResponse.json(
      { error: 'Failed to solve STEM problem' },
      { status: 500 }
    );
  }
}