
import { GoogleGenAI, Type, Modality } from "@google/genai";

interface GeminiResponse {
    answer: string;
    suggestions: string[];
    isUnclear: boolean;
}

const languageMap: { [key: string]: string } = {
    'en-US': 'English',
    'hi-IN': 'Hindi',
    'mr-IN': 'Marathi',
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'bn-IN': 'Bengali',
    'gu-IN': 'Gujarati',
    'kn-IN': 'Kannada',
    'ml-IN': 'Malayalam',
    'pa-IN': 'Punjabi',
    'ur-IN': 'Urdu',
    'as-IN': 'Assamese',
    'or-IN': 'Odia',
};

export async function getChatbotResponse(
    query: string, 
    context: string | null,
    chatHistory: string,
    language: string,
): Promise<{ answer: string, suggestions: string[], isUnclear: boolean }> {
  const apiKey = process.env.API_KEY;
  const targetLanguageName = languageMap[language] || 'English';
  
  if (!apiKey || apiKey === "") {
      return {
          answer: "⚠️ SYSTEM CONFIGURATION ERROR: The 'API_KEY' is missing.",
          suggestions: ["Contact Admin"],
          isUnclear: true
      };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `CRITICAL: YOUR ENTIRE RESPONSE MUST BE IN THE ${targetLanguageName.toUpperCase()} LANGUAGE. 
DO NOT USE ENGLISH EXCEPT FOR TECHNICAL KEYWORDS LIKE "MCU", "Pin", "Relay", "KSI", "V", "A", "CAN", "PCAN".

You are "OSM Mentor"—a high-precision technical intelligence for Omega Seiki Mobility service technicians.

YOU HAVE ACCESS TO MULTIPLE TECHNICAL MODULES:
1. **POWER TRAIN SPECIFICS**: Matel (12V), Virya Gen 1 Old (48V), Virya Gen 1 AIS 156 (12V Aux), Virya Gen 2 (Advanced).
2. **MASTER ERROR DIAGNOSTICS**: Detailed Err-01 to Err-60 definitions and troubleshooting steps.
3. **HARDWARE & BATTERY SPECS**: Detailed info on Exicom, Exponent, and Clean batteries, CAN termination, and Sloki/Virya clusters.
4. **TOOLS**: Step-by-step PCAN Tool process.

STRICT OPERATIONAL RULES:
1. **INITIAL SELECTION CONFIRMATION**: If the user selects a Power Train system from the initial list, ONLY confirm that you have selected that module and are ready to help. DO NOT provide technical info yet.
2. **STEP-BY-STEP FORMATTING**: For all troubleshooting or technical instructions, use the [STEP 1], [STEP 2] format.
3. **TECHNICAL ACCURACY**: Use the specific battery and hardware specs (e.g., Exicom vs Exponent) when the user mentions a battery make. Use the Master Error list for any "Err-X" queries.
4. **LANGUAGE**: Respond ONLY in ${targetLanguageName}. Even the 'answer' field in JSON must be translated.

JSON OUTPUT: Return valid JSON with 'answer', 'suggestions', and 'isUnclear'.`;

    const fullPrompt = `LANGUAGE TO USE: ${targetLanguageName}
    
KNOWLEDGE BASE:
${context || "No context provided."}

HISTORY:
${chatHistory}

USER QUERY: "${query}"

REMINDER: 
- Respond ONLY in ${targetLanguageName}.
- Use [STEP X] for instructions.
- If just a system selection, confirm and wait.`;
  
    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
            systemInstruction,
            temperature: 0.1,
            seed: 42,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { type: Type.STRING },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    isUnclear: { type: Type.BOOLEAN }
                },
                required: ["answer", "suggestions", "isUnclear"]
            }
        },
    });

    const responseText = result.text || "";
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}') + 1;
    if (startIdx === -1) throw new Error("Invalid response format");
    const cleanJson = responseText.substring(startIdx, endIdx);
    
    return JSON.parse(cleanJson) as GeminiResponse;

  } catch (error: any) {
    console.error("OSM AI Failure:", error);
    return {
        answer: "Processing error. Please try again.",
        suggestions: ["Retry"],
        isUnclear: true
    };
  }
}

export async function generateSpeech(text: string, language: string): Promise<string> {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return '';
        const ai = new GoogleGenAI({ apiKey });
        const targetLanguageName = languageMap[language] || 'English';

        const cleanText = text
            .replace(/SAFETY WARNING:/g, 'Warning.')
            .replace(/PRO-TIP:/g, 'Tip.')
            .replace(/\[STEP \d+\]/g, 'Step.')
            .replace(/!\[.*?\]\(.*?\)/g, 'Check visual.') 
            .replace(/(https?:\/\/[^\s\n)]+)/g, '')
            .replace(/[*#_~`>]/g, '')
            .trim();

        if (!cleanText) return '';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: `Speak in ${targetLanguageName}: ${cleanText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { 
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
                },
            },
        });
        
        return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || '';
    } catch (error) {
        return '';
    }
}
