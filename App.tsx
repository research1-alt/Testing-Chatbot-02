
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import IntroPage from './components/IntroPage';
import AuthPage from './components/AuthPage';
import FileUpload from './components/FileUpload';
import AdminDashboard from './components/AdminDashboard';
import InstallPrompt from './components/InstallPrompt';
import { ChatMessage } from './types';
import { getChatbotResponse } from './services/geminiService';
import { addFile, getAllFiles, StoredFile, deleteFile } from './utils/db';
import { ALL_DEFAULT_LIBRARIES } from './defaultLibrary';
import { logUserQuery } from './services/otpService';
import useAuth from './hooks/useAuth';

const ADMIN_EMAIL = 'research1@omegaseikimobility.com';
const MASTER_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRbi-3Um2agWeTvsMt2D3F3HOAzNkqqQfjQdk4uqep53qjV6BnHIBXWVuhtfH8kzWsgdPsqaVi0CgtD/pub?output=csv";
const FEEDBACK_URL = 'https://forms.gle/YcrerYAazwxi5zXL7';
const LOGO_URL = "https://ik.imagekit.io/m8gcj8knd/white%20(with%20background).png";

const INDIAN_LANGUAGES = [
    { code: 'en-US', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi', native: 'مراठी', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'Gujarati', native: 'Gujarati', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada', native: 'Kannada', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam', native: 'Malayalam', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'Punjabi', native: 'Punjabi', flag: '🇮🇳' },
    { code: 'ur-IN', name: 'Urdu', native: 'Urdu', flag: '🇮🇳' },
    { code: 'as-IN', name: 'Assamese', native: 'Assamese', flag: '🇮🇳' },
    { code: 'or-IN', name: 'Odia', native: 'Odia', flag: '🇮🇳' },
];

const App: React.FC = () => {
  const { 
    user, view, setView, login, finalizeLogin, signup, commitSignup, 
    logout, authError, isAuthLoading, getAllInterns, deleteIntern,
    checkEmailExists, resetPassword
  } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessionKey, setChatSessionKey] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKbLoading, setIsKbLoading] = useState(false);
  const [kbContent, setKbContent] = useState<string>('');
  const [masterSheetContent, setMasterSheetContent] = useState<string>('');
  const [kbFiles, setKbFiles] = useState<StoredFile[]>([]);
  const [language, setLanguage] = useState('en-US');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const isAdmin = user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const getInitialMessage = useCallback((): ChatMessage => ({
    id: `welcome-${chatSessionKey}-${Date.now()}`,
    text: `Hello! Before we begin, please select which Power Train you are working with. I will only provide data relevant to your selection.`,
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
        "Matel Power Train (12V)", 
        "Virya Gen 1 (AIS 156)", 
        "Virya Gen 1 (Old Wiring)", 
        "Virya Gen 2 (Advanced)"
    ]
  }), [chatSessionKey]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleReloadApp = useCallback(() => {
    setIsRefreshing(true);
    setIsSidebarOpen(false);
    setMessages([]);
    setTimeout(() => {
        setChatSessionKey(prev => prev + 1);
        setIsRefreshing(false);
        fetchMasterSheet();
        loadKnowledgeBase();
    }, 500);
  }, []);

  const handleLogoutAction = useCallback(() => {
    setMessages([]);
    setChatSessionKey(prev => prev + 1);
    logout();
  }, [logout]);

  const handleFeedbackClick = () => {
    window.open(FEEDBACK_URL, '_blank');
    setIsSidebarOpen(false);
  };

  const fetchMasterSheet = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch(MASTER_SHEET_URL);
      if (!response.ok) throw new Error("Cloud access denied");
      const csvData = await response.text();
      setMasterSheetContent(csvData);
      setSyncStatus('success');
    } catch (err) {
      console.error("OSM Sync Error:", err);
      setSyncStatus('error');
    }
  }, []);

  const loadKnowledgeBase = useCallback(async () => {
    setIsKbLoading(true);
    try {
      let storedFiles = await getAllFiles();
      if (storedFiles.length === 0) {
        for (const file of ALL_DEFAULT_LIBRARIES) {
          await addFile(file);
        }
        storedFiles = await getAllFiles();
      }
      setKbFiles(storedFiles);
      
      const combined = storedFiles
        .map(f => `--- KNOWLEDGE BASE MODULE: ${f.name} ---\n${f.content}\n--- END MODULE ---`)
        .join('\n\n');
      setKbContent(combined);
    } catch (err) {
      console.error("Local KB Error:", err);
    } finally {
      setIsKbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'chat') {
      fetchMasterSheet();
      loadKnowledgeBase();
    }
  }, [view, loadKnowledgeBase, fetchMasterSheet]);

  // Handle fresh chat or language change (optional re-init)
  useEffect(() => {
    if (view === 'chat' && !isRefreshing) {
        setMessages([getInitialMessage()]);
    }
  }, [view, chatSessionKey, getInitialMessage, isRefreshing]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || isRefreshing) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages
        .slice(-6)
        .map(m => `${m.sender === 'bot' ? 'OSM Mentor' : 'Technician'}: ${m.text}`)
        .join('\n');

      const fullContext = `[OSM CENTRAL DATABASE]\n${masterSheetContent}\n\n[TECHNICAL KNOWLEDGE BASE]\n${kbContent}`;
      
      const response = await getChatbotResponse(text, fullContext, history, language);
      
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        text: response.answer,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions,
        unclear: response.isUnclear
      };

      setMessages(prev => [...prev, botMsg]);

      if (user?.email) {
          logUserQuery(user.email, user.name || 'Intern', text, user.sessionId, response.isUnclear, user.mobile).catch(e => {
              console.warn("Cloud logging failed.");
          });
      }
      
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        text: `Analysis error: ${err.message}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesStored = async (newFiles: StoredFile[]) => {
    for (const f of newFiles) await addFile(f);
    await loadKnowledgeBase();
  };

  const handleDeleteFile = async (name: string) => {
    if (confirm(`Remove manual "${name}"?`)) {
        await deleteFile(name);
        await loadKnowledgeBase();
    }
  };

  if (view === 'intro') return <IntroPage onStart={() => setView('auth')} logoUrl={LOGO_URL} />;
  if (view === 'auth') return (
    <AuthPage 
      onLogin={login} 
      onFinalizeLogin={finalizeLogin} 
      onSignup={signup} 
      commitSignup={commitSignup}
      checkEmailExists={checkEmailExists}
      resetPassword={resetPassword}
      error={authError} 
      isLoading={isAuthLoading}
      logoUrl={LOGO_URL}
    />
  );

  const selectedLang = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto border-x bg-sky-50 shadow-2xl overflow-hidden font-sans text-slate-900 relative">
      {showInstallPrompt && <InstallPrompt onInstall={handleInstallClick} onDismiss={() => setShowInstallPrompt(false)} />}
      {isRefreshing && (
        <div className="fixed inset-0 z-[100] bg-sky-900 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
           <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white text-center px-4">Recalibrating Technical Modules...</p>
        </div>
      )}

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => { setIsSidebarOpen(false); setIsLangSelectorOpen(false); }}></div>
        <aside className={`absolute top-0 left-0 h-full w-[70vw] sm:w-80 bg-white shadow-2xl transition-transform duration-500 transform ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden`}>
          <div className={`p-8 h-full flex flex-col transition-transform duration-500 ${isLangSelectorOpen ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className="flex justify-between items-center mb-10 pt-safe">
                <div className="flex flex-col">
                    <img src={LOGO_URL} alt="OSM Logo" className="h-14 w-auto object-contain pr-4 select-none pointer-events-none" style={{ mixBlendMode: 'multiply' }} />
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest mt-2">OSM Service Bot</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-sky-50 rounded-full text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <nav className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
                <button onClick={() => { setShowAdminPanel(false); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all ${!showAdminPanel ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-sky-50 text-slate-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Service Intelligence
                </button>
                {isAdmin && (
                    <button onClick={() => { setShowAdminPanel(true); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all ${showAdminPanel ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-sky-50 text-slate-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572-1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Admin Dashboard
                    </button>
                )}
                <button type="button" onClick={handleFeedbackClick} className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-sky-50 transition-all border border-slate-100 active:bg-sky-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                    Submit Feedback
                </button>
                <div className="py-2"></div>
                <button onClick={() => setIsLangSelectorOpen(true)} className="w-full flex items-center justify-between px-6 py-5 rounded-3xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="text-xl">{selectedLang.flag}</div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Interface</span>
                            <span className="text-xs font-black text-slate-900">{selectedLang.name}</span>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </nav>
            <div className="pt-8 border-t border-slate-100 pb-safe">
                <button onClick={handleLogoutAction} className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout Intern
                </button>
            </div>
          </div>
          {/* Language Selector Sub-panel */}
          <div className={`absolute inset-0 p-8 flex flex-col transition-transform duration-500 bg-white pt-safe ${isLangSelectorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setIsLangSelectorOpen(false)} className="p-2 hover:bg-sky-50 rounded-full text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Choose Language</h2>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-safe">
                <div className="grid grid-cols-2 gap-3 pb-8">
                    {INDIAN_LANGUAGES.map((lang) => (
                        <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsLangSelectorOpen(false); }} className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all border aspect-square ${language === lang.code ? 'bg-green-600 border-green-500 text-white shadow-xl scale-[1.05] z-10' : 'bg-sky-50 border-sky-100 text-slate-600 hover:bg-sky-100'}`}>
                            <span className="text-3xl mb-3">{lang.flag}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </aside>
      </div>

      <header className="bg-white/95 backdrop-blur-md text-slate-900 p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] flex justify-between items-center shadow-lg z-20 shrink-0 border-b border-sky-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-sky-50 rounded-2xl text-slate-500 hover:text-sky-600 transition-all shadow-inner border border-sky-100 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex flex-col">
              <img src={LOGO_URL} alt="OSM Logo" className="h-10 w-auto object-contain object-left pr-4 select-none pointer-events-none" style={{ mixBlendMode: 'multiply' }} />
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'success' ? 'bg-green-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">{syncStatus === 'syncing' ? 'Syncing Knowledge...' : showAdminPanel ? 'Admin Mode' : 'Multi-Module AI Active'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReloadApp} className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-full text-sky-600 transition-all shadow-sm group active:scale-90" title="Refresh Application">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-sky-100">
                <div className="w-10 h-10 rounded-2xl bg-sky-900 flex items-center justify-center font-black text-sm text-white shadow-xl border-2 border-white">
                  {user?.name?.[0] || 'U'}
                </div>
            </div>
          </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {showAdminPanel && isAdmin ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <AdminDashboard interns={getAllInterns()} onDeleteIntern={deleteIntern} kbFiles={kbFiles} onDeleteFile={handleDeleteFile} cloudData={masterSheetContent} />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-sky-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between pb-safe">
                <FileUpload onFilesStored={handleFilesStored} onError={(msg) => alert(msg)} />
                <span className="hidden xs:inline text-[9px] font-black uppercase text-sky-400 tracking-widest ml-4">Module Management</span>
            </div>
          </div>
        ) : (
          <ChatWindow key={`session-v${chatSessionKey}`} messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} isKbLoading={isKbLoading || syncStatus === 'syncing'} selectedLanguage={language} onOpenVideo={() => {}} showVideoAction={false} />
        )}
      </main>
    </div>
  );
};

export default App;
