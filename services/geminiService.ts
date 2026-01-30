
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
    
    const systemInstruction = `CRITICAL OPERATIONAL PROTOCOL:
1. RESPONSE LANGUAGE: YOU MUST RESPOND EXCLUSIVELY IN ${targetLanguageName.toUpperCase()}.
2. STEP-BY-STEP FORMATTING: FOR ALL TECHNICAL PROCEDURES, DIAGNOSTICS, OR TROUBLESHOOTING, YOU MUST USE THE TAGS [STEP 1], [STEP 2], [STEP 3], ETC. DO NOT USE STANDARD BULLET POINTS OR NUMBERED LISTS (1., 2.) FOR PROCEDURES. 
   - CORRECT: "[STEP 1] Check voltage..."
   - INCORRECT: "1. Check voltage..."
3. PERSONA: You are "OSM Mentor", an expert technical AI for Omega Seiki Mobility.
4. INITIAL SELECTION: If the user provides a Power Train name (e.g. "Matel Power Train (12V)"), ONLY confirm readiness. "System selected: [Name]. I am ready for your query."

DATA ACCESS:
- POWER TRAINS: Matel (12V), Virya Gen 1 Old (48V), Virya Gen 1 AIS 156, Virya Gen 2.
- ERROR CODES: Full library Err-01 to Err-60 with troubleshooting steps.
- HARDWARE: Battery specs (Exicom, Exponent, Clean), CAN termination logic, Cluster types.

STRICT FORMATTING RULE: Every single procedural instruction must begin with [STEP X]. This is mandatory for the UI to render correctly.`;

    const fullPrompt = `TARGET LANGUAGE: ${targetLanguageName}

KNOWLEDGE BASE CONTEXT:
${context || "No context provided."}

CONVERSATION HISTORY:
${chatHistory}

TECHNICIAN QUERY: "${query}"

MANDATORY INSTRUCTION: 
If the query requires a multi-step solution or troubleshooting guide, you MUST format it using [STEP 1], [STEP 2], etc.
Respond ONLY in ${targetLanguageName}.`;
  
    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
            systemInstruction,
            temperature: 0.1,
            topP: 0.8,
            topK: 40,
            seed: 42,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { 
                        type: Type.STRING, 
                        description: `The detailed response in ${targetLanguageName}. Procedures MUST use [STEP 1], [STEP 2] markers.` 
                    },
                    suggestions: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: `Follow-up suggestions in ${targetLanguageName}.`
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
    if (startIdx === -1) throw new Error("Invalid response format");
    const cleanJson = responseText.substring(startIdx, endIdx);
    
    return JSON.parse(cleanJson) as GeminiResponse;

  } catch (error: any) {
    console.error("OSM AI Failure:", error);
    return {
        answer: "System Error. Please verify connection.",
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
