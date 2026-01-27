
import React from 'react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-top duration-500">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg">
            OSM
          </div>
          <div className="flex flex-col">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Install OSM App</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hide browser bars & use full screen</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDismiss}
            className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Later
          </button>
          <button 
            onClick={onInstall}
            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
