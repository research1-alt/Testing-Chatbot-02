// Type declarations for CDN libraries
declare const pdfjsLib: any;
declare const mammoth: any;
declare const JSZip: any;
declare const XLSX: any;

// --- Helper Functions ---

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Text Extraction Functions ---

async function parseTxt(file: File): Promise<string> {
  return file.text();
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let textContent = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent += text.items.map((item: any) => item.str).join(' ');
  }
  return textContent;
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parseXlsx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    let textContent = '';
    workbook.SheetNames.forEach((sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        textContent += XLSX.utils.sheet_to_csv(sheet);
    });
    return textContent;
}

async function parsePptx(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const slidePromises: Promise<string>[] = [];
  zip.folder('ppt/slides')?.forEach((relativePath, zipEntry) => {
    if (relativePath.endsWith('.xml')) {
      slidePromises.push(
        zipEntry.async('string').then(xmlContent => {
          const textNodes = xmlContent.match(/<a:t>.*?<\/a:t>/g) || [];
          return textNodes.map(node => node.replace(/<.*?>/g, '')).join(' ');
        })
      );
    }
  });
  const slideTexts = await Promise.all(slidePromises);
  return slideTexts.join('\n\n');
}

async function parseZip(file: File): Promise<string> {
    const zip = await JSZip.loadAsync(file);
    let combinedText = '';
    const contentPromises: Promise<string>[] = [];

    zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            const promise = async () => {
                try {
                    const blob = await zipEntry.async('blob');
                    const nestedFile = new File([blob], zipEntry.name, { type: blob.type });
                    
                    const extension = nestedFile.name.split('.').pop()?.toLowerCase();
                    if (extension === 'zip') {
                        // To prevent infinite recursion, we'll just warn and skip nested zips.
                        console.warn(`Skipping nested zip file: ${nestedFile.name}`);
                        return '';
                    }

                    // We recursively call parseFile for each file in the zip
                    const content = await parseFile(nestedFile);
                    return `--- Content from ${zipEntry.name} ---\n${content}\n\n`;
                } catch (err) {
                    // Log a warning for files that couldn't be parsed and continue with others.
                    console.warn(`Could not parse file "${zipEntry.name}" within the zip archive: ${(err as Error).message}`);
                    return ''; // Return empty string so Promise.all doesn't fail.
                }
            };
            contentPromises.push(promise());
        }
    });

    const allContents = await Promise.all(contentPromises);
    combinedText = allContents.join('').trim();

    if (!combinedText) {
        throw new Error("No readable or supported files found in the ZIP archive. If the archive is password-protected, it cannot be opened.");
    }
    return combinedText;
}


// --- Main Parser Function ---

export const parseFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'txt':
        case 'md':
        case 'json':
        case 'csv':
        case 'html':
        case 'css':
        case 'js':
        case 'ts':
        case 'tsx':
        case 'py':
        case 'xml':
            return parseTxt(file);
        case 'pdf':
            return parsePdf(file);
        case 'docx':
            return parseDocx(file);
        case 'xlsx':
        case 'xls':
            return parseXlsx(file);
        case 'pptx':
            return parsePptx(file);
        case 'zip':
            return parseZip(file);
        case 'rar':
            throw new Error('WinRAR archives (.rar) are not supported. Please use a standard ZIP (.zip) file instead.');
        case '7z':
            throw new Error('7-Zip archives (.7z) are not supported. Please use a standard ZIP (.7z) file instead.');
        default:
            // Fallback for unknown extensions: try to read as text.
            try {
                // Heuristic to avoid trying to read large binary files as text
                if (file.size > 10 * 1024 * 1024) { // 10 MB limit
                    throw new Error("File is too large to be read as plain text.");
                }
                const content = await parseTxt(file);
                // Basic check if the content is mostly printable ASCII
                 if (/[\x00-\x08\x0E-\x1F]/.test(content)) {
                    throw new Error("File appears to be binary and not readable as text.");
                }
                return `--- Content from ${file.name} (read as plain text) ---\n${content}`;
            } catch (err) {
                 throw new Error(`Unsupported file type: .${extension}. Could not be read as text.`);
            }
    }
};