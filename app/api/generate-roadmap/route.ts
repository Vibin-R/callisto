import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { Topic } from "../../../types";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key is missing');
      return NextResponse.json(
        { error: 'API key is not configured. Please set GEMINI_API_KEY in your environment variables.', topics: [] },
        { status: 500 }
      );
    }

    const { itemName } = await request.json();

    if (!itemName) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Try multiple models in order of preference
    const modelsToTry = [
      'gemini-pro',                    // Most widely available
      'gemini-1.5-pro',                // Alternative
      'gemini-2.0-flash-001',          // Latest flash model
      'gemini-2.0-flash-lite-001'      // Lite version
    ];

    let result: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        result = await ai.models.generateContent({
          model: modelName,
          contents: `Generate a structured learning roadmap for the subject: "${itemName}". 
            The roadmap should consist of main topics and for each topic, several detailed sub-topics. 
            Limit to 5-8 main topics to keep it focused.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The title of the main learning module" },
                  subTopics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: "The specific sub-topic or skill to learn" }
                      },
                      required: ["title"]
                    }
                  }
                },
                required: ["title", "subTopics"]
              }
            }
          }
        });
        console.log(`Successfully used model: ${modelName}`);
        break; // Success, exit loop
      } catch (modelError: any) {
        lastError = modelError;
        const errorMessage = modelError?.message || 'Unknown error';
        console.log(`Model ${modelName} failed: ${errorMessage}`);
        
        // Check if it's an API key error - if so, don't try other models
        const errorStr = JSON.stringify(modelError) || '';
        if (errorStr.includes('API_KEY_INVALID') || 
            errorStr.includes('API key expired') || 
            errorStr.includes('API key is invalid') ||
            errorMessage.includes('API key')) {
          throw new Error('Your Gemini API key is expired or invalid. Please get a new API key from https://aistudio.google.com/app/apikey and update your .env.local file with GEMINI_API_KEY=your_new_key');
        }
        // Continue to next model
        continue;
      }
    }

    if (!result) {
      // Check if the last error was about API key
      const lastErrorStr = JSON.stringify(lastError) || '';
      if (lastErrorStr.includes('API_KEY_INVALID') || 
          lastErrorStr.includes('API key expired') || 
          lastErrorStr.includes('API key is invalid')) {
        throw new Error('Your Gemini API key is expired or invalid. Please get a new API key from https://aistudio.google.com/app/apikey and update your .env.local file with GEMINI_API_KEY=your_new_key');
      }
      throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}. Please check your API key and available models.`);
    }

    // Access the response text - check multiple possible properties
    let responseText = '';
    if (typeof (result as any).text === 'string') {
      responseText = (result as any).text;
    } else if ((result as any).response?.text) {
      responseText = (result as any).response.text;
    } else if (result && typeof result === 'object' && 'text' in result) {
      responseText = String((result as any).text);
    } else {
      // Try to get text from the response object
      const responseObj = (result as any).response || result;
      responseText = responseObj?.text || responseObj?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    const jsonStr = responseText.trim();
    
    if (!jsonStr) {
      throw new Error('Empty response from Gemini API');
    }

    let rawData;
    try {
      rawData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', jsonStr);
      throw new Error('Invalid JSON response from Gemini API');
    }
    
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid response format from Gemini API - expected array');
    }
    
    const topics: Topic[] = rawData.map((t: any, idx: number) => ({
      id: `topic-${Date.now()}-${idx}`,
      title: t.title || `Topic ${idx + 1}`,
      isCompleted: false,
      subTopics: (t.subTopics || []).map((st: any, sIdx: number) => ({
        id: `subtopic-${Date.now()}-${idx}-${sIdx}`,
        title: st.title || `Sub-topic ${sIdx + 1}`,
        isCompleted: false
      }))
    }));

    return NextResponse.json({ topics });
  } catch (error: any) {
    console.error("Failed to generate roadmap:", error);
    let errorMessage = error?.message || 'Unknown error occurred';
    const errorDetails = error?.stack || error?.toString();
    
    // Check if it's an API key error and provide helpful message
    const errorStr = JSON.stringify(error) || errorDetails || '';
    if (errorStr.includes('API_KEY_INVALID') || 
        errorStr.includes('API key expired') || 
        errorStr.includes('API key is invalid') ||
        errorMessage.includes('API key')) {
      errorMessage = 'Your Gemini API key is expired or invalid. Please get a new API key from https://aistudio.google.com/app/apikey and update your .env.local file with GEMINI_API_KEY=your_new_key';
    }
    
    console.error("Error details:", errorDetails);
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        topics: [],
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}
