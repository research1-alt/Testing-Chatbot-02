
import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { generateSpeech } from '../services/geminiService';

interface ChatMessageProps {
  message: ChatMessageType;
  language: string;
  onSendMessage: (message: string) => void;
}

/**
 * Transforms various URL formats into direct displayable image streams.
 * Crucial for Google Drive images in spreadsheets.
 */
const getDirectImageUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Handle Google Drive Links (Automatic conversion to direct stream)
  if (trimmed.includes('drive.google.com')) {
    let id = '';
    // Standard /d/ID/view format
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch) id = dMatch[1];
    
    // ?id=ID format
    if (!id) {
        const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) id = idMatch[1];
    }
    
    // Convert to Direct Stream URL
    if (id) return `https://lh3.googleusercontent.com/d/${id}`;
  }
  
  // Also handle direct image links pasted raw
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(trimmed)) {
    return trimmed;
  }
  
  return null;
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-sm border-2 border-white">U</div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message, language, onSendMessage }) => {
  const isUser = message.sender === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{url: string, alt: string} | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<AudioBuffer | null>(null);

  const processContent = (text: string) => {
    // 1. Detect Markdown Images, Standalone Drive Links, and Direct Image URLs
    const mdRegex = /(!\[.*?\]\(.*?\))/g;
    const linkRegex = /(https?:\/\/(?:drive\.google\.com\/[^\s\n)]+|[^\s\n)]+\.(?:jpg|jpeg|png|webp|gif|svg)))/gi;
    
    const imageCards: React.ReactNode[] = [];
    let processedText = text;
    
    // First pass: Markdown Images
    const mdMatches = text.match(mdRegex);
    if (mdMatches) {
        mdMatches.forEach((match, idx) => {
            const inner = match.match(/!\[(.*?)\]\((.*?)\)/);
            if (inner) {
                const directUrl = getDirectImageUrl(inner[2]);
                if (directUrl) {
                    imageCards.push(renderImage(inner[1] || "Technical Schematic", directUrl, `md-${idx}`));
                    processedText = processedText.replace(match, ''); 
                }
            }
        });
    }

    // Second pass: Raw technical links from spreadsheet that were missed by Markdown
    const linkMatches = processedText.match(linkRegex);
    if (linkMatches) {
        linkMatches.forEach((url, idx) => {
            const directUrl = getDirectImageUrl(url);
            if (directUrl) {
                imageCards.push(renderImage("Technical Drawing", directUrl, `raw-${idx}`));
                processedText = processedText.replace(url, '');
            }
        });
    }

    // 3. Render structured text
    const parts = processedText.split(/(SAFETY WARNING:|PRO-TIP:|\[STEP \d+\]|^\s*[•\-*]|\*\*.*?\*\*|\b\d+(?:\.\d+)?[V|v|A|a]\b|\bPin \d+[a-z]?\b|\b\d+ Ohm\b|\bErr-\d+\b)/gm);
    
    const contentNodes: React.ReactNode[] = parts.map((part, index) => {
        if (!part || !part.trim()) return null;

        const trimmedPart = part.trim();

        if (trimmedPart === "SAFETY WARNING:") {
            return (
                <div key={index} className="flex items-center gap-3 mt-4 mb-3 bg-red-50 border-2 border-red-200 p-4 rounded-2xl shadow-sm">
                    <span className="text-2xl">⚠️</span>
                    <span className="text-[11px] font-black text-red-700 uppercase tracking-widest leading-tight">MANDATORY SAFETY CHECK</span>
                </div>
            );
        }

        if (trimmedPart === "PRO-TIP:") {
            return (
                <div key={index} className="flex items-center gap-2 mt-6 mb-3 bg-amber-50 border border-amber-200 p-3 rounded-2xl shadow-sm">
                    <span className="text-xl">💡</span>
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Mentor's Pro-Tip</span>
                </div>
            );
        }

        if (/^\[STEP \d+\]$/.test(trimmedPart)) {
            const stepNum = trimmedPart.match(/\d+/)?.[0] || '?';
            return (
                <div key={index} className="flex items-center gap-3 mt-8 mb-4 first:mt-2">
                    <span className="flex items-center justify-center bg-sky-900 text-white min-w-[32px] h-8 rounded-full text-[13px] font-black shadow-xl ring-2 ring-sky-100">{stepNum}</span>
                    <span className="h-[1px] flex-1 bg-sky-100"></span>
                </div>
            );
        }

        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-black text-slate-900 bg-yellow-50 px-1 rounded-md border border-yellow-100">{part.slice(2, -2)}</strong>;
        }

        if (/\b\d+(?:\.\d+)?[V|v|A|a]\b|\bPin \d+[a-z]?\b|\b\d+ Ohm\b|\bErr-\d+\b/.test(part)) {
            return <span key={index} className="inline-block px-2 py-0.5 bg-sky-100 text-sky-900 font-black rounded-lg border border-sky-200 mx-0.5 text-[11px] shadow-sm">{part}</span>;
        }

        return <span key={index} className="text-slate-700 leading-relaxed whitespace-pre-wrap">{part}</span>;
    });

    return (
        <div className="flex flex-col">
            {imageCards}
            <div className="message-content-text">{contentNodes}</div>
        </div>
    );
  };

  const renderImage = (alt: string, directUrl: string, key: string) => {
    return (
        <div key={key} className="mb-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl">
            <div className="px-5 py-3 bg-slate-950 text-[10px] font-black text-white uppercase tracking-widest flex justify-between items-center">
                <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   {alt}
                </span>
                <span className="text-slate-500 text-[9px] uppercase">Tap to Zoom</span>
            </div>
            <div className="bg-slate-50 p-4 text-center overflow-hidden border-t border-slate-100">
                <img 
                    src={directUrl} 
                    alt={alt} 
                    className="w-full h-auto max-h-[400px] object-contain block mx-auto rounded-xl cursor-zoom-in hover:scale-[1.01] transition-all duration-500 shadow-sm" 
                    onClick={() => setZoomedImage({ url: directUrl, alt })}
                    loading="lazy"
                    onError={(e) => {
                        console.error("Image load failed:", directUrl);
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Drawing+Link+Error";
                    }}
                />
            </div>
        </div>
    );
  };

  const formatMessage = (text: string) => {
    if (text.length < 25 && /\d+/.test(text) && !isUser) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-[2rem] border-4 border-slate-100 shadow-2xl">
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] mb-2">Essential Data</span>
                <span className="text-4xl font-black text-white tracking-tighter">{text}</span>
            </div>
        );
    }
    return processContent(text);
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsSpeaking(false);
    source.start(0);
    sourceRef.current = source;
    setIsSpeaking(true);
  };

  const handlePlayAudio = async () => {
    if (isSpeaking) {
      if (sourceRef.current) { try { sourceRef.current.stop(); } catch(e) {} }
      setIsSpeaking(false);
      return;
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    await audioContextRef.current.resume();
    if (audioCacheRef.current) {
      playBuffer(audioCacheRef.current);
      return;
    }
    setIsAudioLoading(true);
    try {
      const base64Audio = await generateSpeech(message.text, language);
      if (base64Audio) {
        const audioBytes = decodeBase64(base64Audio);
        const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        audioCacheRef.current = buffer;
        playBuffer(buffer);
      }
    } catch (err) {
      setIsSpeaking(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${isUser ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
        <div className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <div className="w-8 h-8 rounded-full bg-sky-900 flex items-center justify-center font-black text-[10px] text-white flex-shrink-0 shadow-lg border-2 border-white uppercase tracking-tighter">MENTOR</div>}
            
            <div className={`rounded-[1.5rem] p-5 max-w-[90%] sm:max-w-xl group relative shadow-xl transition-all border w-fit ${isUser ? 'bg-green-600 text-white border-green-500 rounded-br-none' : 'bg-white text-slate-800 border-slate-100 rounded-bl-none'}`}>
                <div className="text-[14px] leading-[1.6]">
                  {formatMessage(message.text)}
                </div>
                <div className={`text-[9px] mt-4 font-black flex justify-between items-center opacity-60 ${isUser ? 'text-green-50' : 'text-slate-400'}`}>
                    <span className="uppercase tracking-widest">{message.timestamp}</span>
                    {!isUser && (
                        <div className="flex gap-4">
                            <button onClick={handlePlayAudio} title="Speak Response" className={`transition-all p-2 rounded-xl ${isSpeaking ? 'text-green-600 bg-green-50 shadow-inner' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'}`}>
                                {isAudioLoading ? (
                                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : isSpeaking ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" /></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isUser && <UserIcon />}
        </div>
        {!isUser && message.suggestions && (
            <div className="flex flex-wrap gap-2 ml-11 mt-2">
                {message.suggestions.map((s, i) => <button key={i} onClick={() => onSendMessage(s)} className="text-[10px] font-black bg-white border border-slate-200 text-slate-500 py-2 px-5 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all uppercase tracking-[0.1em] shadow-sm">{s}</button>)}
            </div>
        )}

        {zoomedImage && (
            <div className="fixed inset-0 z-[100] bg-slate-950/98 flex flex-col items-center justify-center backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
                <div className="absolute top-10 right-10">
                    <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <img src={zoomedImage.url} alt={zoomedImage.alt} className="max-w-[90%] max-h-[80%] shadow-2xl rounded-3xl object-contain border-4 border-white/10" />
                <h4 className="text-white font-black text-xl mt-8 uppercase tracking-widest">{zoomedImage.alt}</h4>
            </div>
        )}
    </div>
  );
};

export default ChatMessage;
