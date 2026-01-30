
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
    
    const systemInstruction = `CRITICAL OPERATIONAL PROTOCOL FOR "OSM MENTOR":
1. LANGUAGE: RESPOND ONLY IN ${targetLanguageName.toUpperCase()}. 
   - Translate all explanations, headers, and descriptions.
   - Use English ONLY for technical identifiers (MCU, Pin, Ohm, V, A, KSI, Err-XX, CAN).

2. RESPONSE STYLE CATEGORIES:
   A. SPECIFICATION QUERIES: If the user asks for technical data, parameters, specifications, battery details, or pinouts (e.g., "Give me Exicom battery details" or "Matel MCU pin position"):
      - PROVIDE THE DATA EXACTLY AS IT APPEARS in the context.
      - Use a clear, tabular or structured list format.
      - Do NOT use [STEP X] formatting for pure data dumps.
   
   B. DIAGNOSTIC/TROUBLESHOOTING QUERIES: If the user asks "How to check", "How to fix", "How to clear", "Troubleshoot", or provides an Error Code (e.g., "How to check MCU relay" or "Err-31 resolution"):
      - PROVIDE A DIAGNOSTIC MANUAL STYLE ANSWER.
      - YOU MUST USE THE [STEP 1], [STEP 2], [STEP 3] FORMATTING.
      - This is mandatory for procedural guidance.

3. PERSONA: You are a high-precision technical intelligence for Omega Seiki Mobility service technicians. Be direct, factual, and helpful.

4. SELECTION LOGIC: If the user selects a system name (e.g., "Matel Power Train (12V)"), confirm selection in ${targetLanguageName} and wait for the query.

STRICT UI COMPLIANCE: The frontend parser uses [STEP X] markers to build visual timelines. Use them for all "How-to" procedures. Use temperature 0 for total consistency across Vercel and local deployments.`;

    const fullPrompt = `TARGET LANGUAGE: ${targetLanguageName}

KNOWLEDGE BASE:
${context || "No technical modules available."}

CONVERSATION HISTORY:
${chatHistory}

TECHNICIAN QUERY: "${query}"

MANDATORY FINAL CHECK:
- Is the query asking for a data specification? If yes, provide data as is.
- Is the query asking for a process or fix? If yes, use [STEP X] format.
- IS THE ENTIRE ANSWER IN ${targetLanguageName.toUpperCase()}? (YES)`;
  
    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
            systemInstruction,
            temperature: 0.0, 
            topP: 0.1,
            topK: 1,
            seed: 42,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { 
                        type: Type.STRING, 
                        description: `Technical response in ${targetLanguageName}. Use [STEP X] for procedures, structured list for specifications.` 
                    },
                    suggestions: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: `Three follow-up suggestions in ${targetLanguageName}.`
                    },
                    isUnclear: { type: Type.BOOLEAN }
                },
                required: ["answer", "suggestions", "isUnclear"]
            }
        },
    });

    const responseText = result.text || "";
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}') + 1;
    if (startIdx === -1) throw new Error("AI generated non-JSON content");
    const cleanJson = responseText.substring(startIdx, endIdx);
    
    return JSON.parse(cleanJson) as GeminiResponse;

  } catch (error: any) {
    console.error("OSM AI ERROR:", error);
    return {
        answer: "Connection failed. Please check Vercel environment variables or internet connection.",
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
            contents: [{ parts: [{ text: `Read in ${targetLanguageName}: ${cleanText}` }] }],
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
