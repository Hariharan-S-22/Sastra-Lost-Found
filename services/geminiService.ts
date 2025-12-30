
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to generate a professional description for a lost/found item
 * based on a short user prompt or notes.
 */
export async function generateItemDescription(briefNotes: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an assistant for a University Lost & Found platform. 
      Generate a clear, professional, and detailed description for an item based on these notes: "${briefNotes}". 
      Focus on identifiers that would help the owner recognize it, but don't include sensitive private details. 
      Keep it under 60 words.`,
    });
    return response.text?.trim() || "No description generated.";
  } catch (error) {
    console.error("Gemini description error:", error);
    return briefNotes; 
  }
}

/**
 * Helps categorize an item based on its title and description.
 */
export async function categorizeItem(title: string, description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize the following lost/found item into one of these: Electronics, Books, IDs, Keys, Bags, Others.
      Title: ${title}
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          }
        }
      }
    });
    const jsonStr = response.text?.trim();
    if (!jsonStr) return "Others";
    
    const result = JSON.parse(jsonStr);
    return result.category || "Others";
  } catch (error) {
    console.error("Gemini categorization error:", error);
    return "Others";
  }
}

/**
 * Generates a minimalist black and white doodle for a specific item category.
 */
export async function generateCategoryDoodle(category: string): Promise<string | null> {
  try {
    const prompt = `A simple, minimalist black and white line art doodle icon of a ${category} item. Solid white background. Thick black outlines only. No shading, no gradients, no colors. Clean vector style. High contrast.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Doodle generation failed:", error);
    return null;
  }
}
