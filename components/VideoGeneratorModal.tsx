import React, { useState, useCallback, useEffect } from 'react';

interface VideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageFile: File, prompt: string, aspectRatio: '16:9' | '9:16') => void;
  isGenerating: boolean;
  generationError: string | null;
  resetGenerationError: () => void;
}

const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isGenerating,
  generationError,
  resetGenerationError,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
        (window as any).aistudio?.hasSelectedApiKey().then(setHasApiKey);
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectKey = async () => {
      await (window as any).aistudio?.openSelectKey();
      setHasApiKey(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full z-50 overflow-hidden">
          {!hasApiKey ? (
              <div className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-2">Paid API Key Required</h3>
                  <p className="text-sm text-gray-600 mb-4">Video generation requires a paid Tier Google AI Studio API key with billing enabled.</p>
                  <button onClick={handleSelectKey} className="w-full py-2 bg-green-600 text-white rounded font-bold">Select API Key</button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-blue-600 mt-2 block underline">Billing Documentation</a>
              </div>
          ) : isGenerating ? (
              <div className="p-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="font-bold">Generating Video...</h3>
                  <p className="text-xs text-gray-500 mt-2 italic">This usually takes 2-3 minutes. Do not close this window.</p>
              </div>
          ) : (
            <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Generate Video from Image</h3>
                <div className="space-y-4">
                    <div className="border-2 border-dashed p-4 rounded text-center">
                        {imagePreview ? <img src={imagePreview} className="h-32 mx-auto rounded" /> : (
                            <label className="cursor-pointer text-blue-600 text-sm font-bold">
                                Upload Start Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Action prompt (e.g. wheels spinning)" className="w-full p-2 border rounded text-sm" />
                    <div className="flex gap-4 text-xs font-bold">
                        <label><input type="radio" checked={aspectRatio === '16:9'} onChange={() => setAspectRatio('16:9')} /> 16:9 (Landscape)</label>
                        <label><input type="radio" checked={aspectRatio === '9:16'} onChange={() => setAspectRatio('9:16')} /> 9:16 (Portrait)</label>
                    </div>
                    {generationError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{generationError}</p>}
                    <div className="flex gap-2">
                        <button onClick={() => onSubmit(imageFile!, prompt, aspectRatio)} disabled={!imageFile} className="flex-1 py-2 bg-green-600 text-white rounded font-bold disabled:bg-gray-300">Generate</button>
                        <button onClick={onClose} className="flex-1 py-2 border rounded font-bold">Cancel</button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorModal;