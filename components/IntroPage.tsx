
import React from 'react';

// Added logoUrl to IntroPageProps to fix type error in App.tsx
interface IntroPageProps {
  onStart: () => void;
  logoUrl: string;
}

const IntroPage: React.FC<IntroPageProps> = ({ onStart, logoUrl }) => {
  return (
    <div className="h-screen w-screen bg-sky-50 flex items-center justify-center font-sans text-slate-900 p-4">
      <div className="max-w-2xl w-full bg-white border border-sky-100 rounded-3xl p-12 shadow-2xl text-center flex flex-col items-center">
        {/* Applied mix-blend-mode: multiply to remove white background of the logo on the intro page */}
        <img 
            src={logoUrl} 
            alt="OSM Logo" 
            className="h-28 w-auto object-contain mb-8 select-none pointer-events-none drop-shadow-sm" 
            style={{ mixBlendMode: 'multiply' }}
        />
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">OSM</h1>
        <div className="w-16 h-1.5 bg-green-600 rounded-full mb-8"></div>
        <p className="text-slate-600 mb-10 max-w-lg text-lg leading-relaxed font-medium">
          Your intelligent partner in the field. Query technical manuals and troubleshooting guides using natural language to get instant, step-by-step solutions for OSM vehicles.
        </p>
        <button
          onClick={onStart}
          className="bg-sky-600 text-white font-black py-5 px-14 rounded-2xl hover:bg-sky-700 transition-all text-xl shadow-2xl uppercase tracking-widest transform hover:-translate-y-1 active:scale-95"
        >
          Initialize Session
        </button>
        <div className="mt-12 pt-8 border-t border-sky-100 w-full">
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">
              Omega Seiki Mobility • Service Intelligence
            </p>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
