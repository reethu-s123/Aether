import { GoogleGenAI, Modality } from "@google/genai";

export const getGeminiModel = () => {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("Gemini API key is not configured. Please configure GEMINI_API_KEY in environment settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export const chatWithGemini = async (
  message: string,
  history: { role: "user" | "model"; parts: MessagePart[] }[],
  attachments?: { base64: string; mimeType: string }[]
) => {
  const ai = getGeminiModel();
  
  // Ensure we have a meaningful prompt if only attachments are provided
  const hasAttachments = attachments && attachments.length > 0;
  const effectiveMessage = message.trim() || (hasAttachments ? "Please analyze the attached file(s) and provide a detailed summary of their contents, including any visual elements or data patterns." : "");
  
  const userParts: MessagePart[] = [];
  if (effectiveMessage) {
    userParts.push({ text: effectiveMessage });
  }
  
  if (attachments) {
    attachments.forEach(att => {
      userParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.base64
        }
      });
    });
  }

  // If no parts at all, return early
  if (userParts.length === 0) return "Neural core requires input to synthesize response.";

  const systemInstruction = `You are Aether, a sophisticated multimodal AI assistant. 
Your answers must be short, sweet, and easy for humans to understand. 
Use simple language but maintain a helpful and professional tone. 

CORE PROTOCOLS:
1. MULTIMODAL ANALYSIS: You are equipped with advanced vision and document processing capabilities. When an image, PDF, or document is provided, you MUST analyze it thoroughly. Describe key visual elements, text content, or data patterns and incorporate these findings into your response.
2. DIAGRAMS: If the user asks for a pipeline, architecture, flow, or sequence diagram, you MUST provide it using a mermaid code block (e.g., \`\`\`mermaid ... \`\`\`).
3. CONCISENESS: Focus on being concise. Avoid long-winded explanations unless specifically requested.
4. CODE: If code is requested, provide it clearly and correctly.`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-3-flash-preview"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          ...history,
          { role: "user", parts: userParts }
        ],
        config: {
          systemInstruction,
        }
      });

      if (response.text) {
        return response.text;
      }
    } catch (error: any) {
      console.warn(`Attempt with ${modelName} failed:`, error?.message || error);
      lastError = error;
      // If error is about model not found, try next model in loop
      if (error?.message?.includes("Requested entity was not found") || error?.message?.includes("not found")) {
        continue;
      }
      // For other critical errors like permission, break early
      break;
    }
  }

  console.error("Gemini API Error:", lastError);
  throw new Error("Neural link failure: " + (lastError?.message || "Protocol error detected."));
};

export const generateSpeech = async (text: string) => {
  const ai = getGeminiModel();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Speech generation error:", error);
    return null;
  }
};

export const generateImageWithGemini = async (prompt: string) => {
  const ai = getGeminiModel();
  
  await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Generate a high-quality image based on this prompt: ${prompt}. Return only the image.` }] }],
  });

  // In a real app, you'd use imagen-3.0-generate-001 or similar if available.
  // For this turn, we'll focus on the UI and use a placeholder for the image result.
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`;
};
