
import React, { useState } from 'react';
import { User } from '../hooks/useAuth';
import { StoredFile } from '../utils/db';

interface AdminDashboardProps {
  interns: User[];
  onDeleteIntern: (email: string) => void;
  kbFiles: StoredFile[];
  onDeleteFile: (name: string) => void;
  cloudData?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    interns, 
    onDeleteIntern, 
    kbFiles, 
    onDeleteFile,
    cloudData
}) => {
  const [previewFile, setPreviewFile] = useState<{name: string, content: string} | null>(null);
  
  // Link to the centralized activity log spreadsheet provided by user
  const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1VAxeaMJz_epaw1o0Q-WCnB9-on3-i5ySbmALevZigW8/edit";

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-10 pb-48">
      <div className="max-w-5xl mx-auto">
        
        {/* Monitoring Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-10">
            <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">OSM Administrative Terminal</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Monitoring Live Technical Queries & Sessions</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => setPreviewFile({ name: 'Active Session Database Preview', content: cloudData || 'Retrieving latest activity logs...' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                >
                    Activity Snapshot
                </button>
                <a 
                    href={SPREADSHEET_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                >
                    Open Live Logs
                </a>
            </div>
        </div>

        {/* Technical Library Section */}
        <section className="mb-12">
            <div className="flex justify-between items-end mb-6 px-1">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Knowledge Base</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Uploaded Manuals for Assistant Training</p>
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    {kbFiles.length} Documents Active
                </div>
            </div>

            {kbFiles.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    No technical documents uploaded.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kbFiles.map(file => (
                        <div key={file.name} className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col gap-3 shadow-sm group hover:border-sky-300 transition-colors">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-[10px]">DOC</div>
                                    <div className="overflow-hidden">
                                        <div className="text-[12px] font-black text-slate-900 truncate pr-2">{file.name}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => setPreviewFile({ name: file.name, content: file.content })}
                                        className="p-2 text-slate-300 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => onDeleteFile(file.name)} 
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {/* User Directory Section */}
        <section>
            <div className="flex justify-between items-end mb-6 px-1">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Field Intern Registry</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Management of Authorized Access</p>
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    {interns.length} Registered
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {interns.length === 0 ? (
                    <div className="p-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">
                        No interns registered on this terminal.
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Information</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Administrative</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {interns.map((intern) => (
                                    <tr key={intern.email} className="hover:bg-sky-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-sky-900 text-white rounded-[1.25rem] flex items-center justify-center font-black text-lg shadow-inner">
                                                    {intern.name?.[0] || 'U'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="font-black text-slate-900 text-sm tracking-tight truncate">{intern.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-black tracking-widest truncate uppercase opacity-80">{intern.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Access</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => onDeleteIntern(intern.email)}
                                                className="text-[9px] font-black text-red-500 hover:bg-red-500 hover:text-white uppercase tracking-widest border border-red-100 px-5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
                                            >
                                                Revoke Access
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
      </div>

      {/* Cloud & Document Previewer */}
      {previewFile && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-12">
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setPreviewFile(null)}></div>
                <div className="relative bg-white w-full max-w-5xl max-h-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200 border border-white/20">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{previewFile.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Administrative Audit Interface</p>
                        </div>
                        <button onClick={() => setPreviewFile(null)} className="p-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-2xl transition-all shadow-sm active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-6 sm:p-10 bg-slate-50">
                        <pre className="text-[12px] font-mono text-slate-700 bg-white p-8 rounded-[2rem] border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                            {previewFile.content}
                        </pre>
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100 flex justify-center">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Audit End of Data</span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
