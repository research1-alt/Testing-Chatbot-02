import React, { useState, useCallback } from 'react';
import { parseFile } from '../utils/fileParser';
import { StoredFile } from '../utils/db';

interface FileUploadProps {
  onFilesStored: (files: StoredFile[]) => void;
  onError: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesStored, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File): Promise<StoredFile | null> => {
    try {
        const content = await parseFile(file);
        return {
            name: file.name,
            content: content,
            size: file.size,
            lastModified: file.lastModified,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Skipping file ${file.name}: ${message}`);
        // Optionally, inform the user of skipped files via onError or a different mechanism.
        return null;
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
        const fileList = Array.from(files);
        const storedFilePromises = fileList.map(processFile);
        const results = await Promise.all(storedFilePromises);
        const successfullyStoredFiles = results.filter((file): file is StoredFile => file !== null);
        
        if (successfullyStoredFiles.length > 0) {
            onFilesStored(successfullyStoredFiles);
        }

    } catch (err) {
        const message = err instanceof Error ? err.message : "Could not process selected files.";
        onError(message);
    } finally {
        setIsProcessing(false);
        // Reset file input value to allow re-uploading the same file/folder
        event.target.value = '';
    }
  }, [processFile, onFilesStored, onError]);
  
  const processingText = isProcessing ? 'Processing...' : null;

  return (
    <div className="flex items-center gap-2">
        <label htmlFor="file-upload" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isProcessing ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
           {processingText || 'Upload File(s)'}
        </label>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isProcessing} multiple />

        <label htmlFor="folder-upload" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isProcessing ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
           {processingText || 'Upload Folder'}
        </label>
        {/* Use spread attributes for non-standard properties */}
        <input id="folder-upload" type="file" className="hidden" onChange={handleFileChange} {...{webkitdirectory: ""}} disabled={isProcessing}/>
    </div>
  );
};

export default FileUpload;