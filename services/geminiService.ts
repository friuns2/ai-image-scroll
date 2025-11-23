
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT_GENERATION_MODEL = 'gemini-2.5-flash';
const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image-preview';

/**
 * Generates a list of creative prompts for image editing.
 */
export const generateEditPrompts = async (): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: PROMPT_GENERATION_MODEL,
      contents: "Generate 20 short, creative, and varied prompts to wildly edit a user's photo. The prompts should be phrased as commands. For example: 'Turn the background into a psychedelic vortex', 'Add a cute cartoon robot waving', 'Make it look like a vintage comic book panel', 'Cover everything in glitter', 'Reimagine this in a vaporwave aesthetic'. Be imaginative and fun.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A creative command to edit an image.",
              },
            },
          },
          required: ["prompts"],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.prompts && Array.isArray(result.prompts)) {
      return result.prompts;
    }
    throw new Error("Invalid response format from prompt generation model.");
  } catch (error) {
    console.error("Error generating edit prompts:", error);
    throw new Error("Could not generate creative prompts.");
  }
};

/**
 * Edits an image based on a text prompt.
 */
export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<{ text: string | null; image: string | null }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: IMAGE_EDIT_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let generatedText: string | null = null;
    let generatedImage: string | null = null;
    
    // The response is not guaranteed to contain an image
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                generatedText = part.text;
            } else if (part.inlineData) {
                generatedImage = part.inlineData.data;
            }
        }
    }


    if (!generatedImage) {
      console.warn("Image edit model did not return an image.", response);
    }
    
    return { text: generatedText, image: generatedImage };

  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image with AI.");
  }
};
