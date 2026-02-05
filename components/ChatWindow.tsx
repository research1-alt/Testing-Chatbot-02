
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onstart: () => void;
    onend: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    start(): void;
    stop(): void;
    abort(): void;
}

interface ChatWindowProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isKbLoading: boolean;
  selectedLanguage: string;
  onOpenVideo: () => void;
  showVideoAction?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading,
    isKbLoading,
    selectedLanguage,
    onOpenVideo,
    showVideoAction = false
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  useEffect(() => { return () => { recognitionRef.current?.abort(); }; }, []);

  const handleSend = () => { if (input.trim() && !isLoading) { onSendMessage(input); setInput(''); } };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter') handleSend(); };

  const handleListen = () => {
    if (isListening) { recognitionRef.current?.stop(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.onresult = (event: any) => { setInput(Array.from(event.results).map((r: any) => r[0].transcript).join('')); };
    recognition.start();
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} language={selectedLanguage} onSendMessage={onSendMessage} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="rounded-lg p-3 max-w-lg bg-gray-100 rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
	                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
            <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isKbLoading ? 'Please wait...' : 'Type or say something...'}
                  className="w-full border rounded-md py-2 pl-3 pr-20 focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 disabled:opacity-70"
                  disabled={isLoading || isKbLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                    {showVideoAction && (
                      <button onClick={onOpenVideo} disabled={isLoading || isKbLoading} className="p-1 text-gray-600 hover:text-green-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                    )}
                    <button onClick={handleListen} disabled={isLoading || isKbLoading} className={`p-1 ${isListening ? 'text-green-500 animate-pulse' : 'text-gray-600'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
                </div>
            </div>
            <button onClick={handleSend} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400" disabled={isLoading || isKbLoading || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
