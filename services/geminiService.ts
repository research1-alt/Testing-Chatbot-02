
import { GoogleGenAI, Type, Modality } from "@google/genai";

interface GeminiResponse {
    answer: string;
    suggestions: string[];
    isUnclear: boolean;
}

const languageMap: { [key: string]: string } = {
    'en-US': 'English',
    'hi-IN': 'Hindi (हिन्दी)',
    'mr-IN': 'Marathi (मराठी)',
    'ta-IN': 'Tamil (தமிழ்)',
    'te-IN': 'Telugu (తెలుగు)',
    'bn-IN': 'Bengali (বাংলা)',
    'gu-IN': 'Gujarati (ગુજરાતી)',
    'kn-IN': 'Kannada (ಕನ್ನಡ)',
    'ml-IN': 'Malayalam (മലയാളം)',
    'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)',
    'ur-IN': 'Urdu (اردو)',
    'as-IN': 'Assamese (অসমীয়া)',
    'or-IN': 'Odia (ଓଡ଼ିଆ)',
};

export async function getChatbotResponse(
    query: string, 
    context: string | null,
    chatHistory: string,
    language: string,
): Promise<{ answer: string, suggestions: string[], isUnclear: boolean }> {
  const apiKey = process.env.API_KEY;
  const targetLanguageFull = languageMap[language] || 'English';
  
  if (!apiKey || apiKey === "") {
      return {
          answer: "⚠️ SYSTEM CONFIGURATION ERROR: The 'API_KEY' is missing in environment variables.",
          suggestions: ["Contact Admin"],
          isUnclear: true
      };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `YOU ARE "OSM MASTER MENTOR"—THE AUTHORITATIVE SERVICE INTELLIGENCE FOR OMEGA SEIKI MOBILITY.

### CORE OPERATIONAL DIRECTIVE:
You MUST respond EXCLUSIVELY in the NATIVE SCRIPT of the selected language: ${targetLanguageFull}. 
- DO NOT use Romanized Hindi/Transliteration (e.g., do not write "Karein", write "करें").
- Translate all conversational text, explanations, and safety warnings into the native script.

### TAG PRESERVATION RULE:
To maintain UI formatting, you MUST keep these specific structural tags in English:
1. **Steps**: Use [STEP 1], [STEP 2], etc. (e.g., "[STEP 1] बैटरी वोल्टेज की जांच करें")
2. **Pins**: Use [PIN 30], [PIN 87a], etc. (e.g., "[PIN 30] पर वोल्टेज देखें")
3. **Hardware Labels**: Keep MCU, KSI, CAN, PIN, Relay, GND, BAT, V, A, Ohm in English.

### SPREADSHEET COLUMN MAPPING:
The [MASTER DATABASE] CSV uses these headers:
1. Topic / Component | 2. Category | 3. Technical Specs | 4. Procedure / Pin-out | 5. Diagram Link

### HANDLING MULTIPLE SYSTEMS:
If a component exists in multiple systems (e.g., "MCU Relay" in both "Matel" and "Virya"):
1. **DETECT MATCHES**: Find all systems.
2. **ASK CLARIFICATION**: "यह घटक कई प्रणालियों में उपलब्ध है। कृपया चुनें:"
3. **SUGGESTIONS**: List the system names as buttons.

### OUTPUT JSON SCHEMA:
- "answer": Comprehensive Markdown response in the NATIVE SCRIPT of ${targetLanguageFull}.
- "suggestions": 3 context-aware technical follow-ups translated into the native script.
- "isUnclear": True if data is missing.`;

    const fullPrompt = `### MASTER DATABASE:
${context?.split('[ADMIN UPLOADED MANUALS]')[0] || "DATABASE SYNC ERROR."}

### MANUALS:
${context?.split('[ADMIN UPLOADED MANUALS]')[1] || "NO SUPPLEMENTAL FILES."}

### CHAT HISTORY:
${chatHistory}

### TECHNICIAN QUERY:
"${query}"

### FINAL COMMAND:
Provide the technical solution. Use NATIVE SCRIPT for ${targetLanguageFull}. Ensure [STEP X] and [PIN X] tags are present but descriptions are translated. Output JSON.`;
  
    const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
            systemInstruction,
            temperature: 0.1, 
            thinkingConfig: { thinkingBudget: 16384 },
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
    
    return JSON.parse(responseText.substring(startIdx, endIdx)) as GeminiResponse;

  } catch (error: any) {
    console.error("OSM AI Failure:", error);
    return {
        answer: "Technical Intelligence Link Severed. Please check language settings.",
        suggestions: ["Reconnect System"],
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
            .replace(/!\[.*?\]\(.*?\)/g, 'Refer to schematic.') 
            .replace(/(https?:\/\/[^\s\n)]+)/g, '')
            .replace(/\[STEP \d+\]/g, 'Step.')
            .replace(/\[PIN ([a-zA-Z0-9]+)\]/g, 'Pin $1.')
            .replace(/[*#_~`>]/g, '')
            .replace(/\|/g, ' ') 
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
