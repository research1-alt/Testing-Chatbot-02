
// A simple IndexedDB wrapper to provide a persistent, client-side "database" for knowledge base files and feedback.

const DB_NAME = 'OSMServiceInternDB';
const STORE_NAME = 'files';
const FEEDBACK_STORE = 'feedback';
const DB_VERSION = 2;

export interface StoredFile {
    name: string;
    content: string;
    size: number;
    lastModified: number;
}

export interface StoredFeedback {
    id: string;
    userName: string;
    userEmail: string;
    text: string;
    timestamp: string;
    status: 'sent' | 'pending' | 'failed';
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(new Error(`IndexedDB error: ${request.error?.message}`));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'name' });
            }
            if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
                db.createObjectStore(FEEDBACK_STORE, { keyPath: 'id' });
            }
        };
    });
};

export const addFile = async (file: StoredFile): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(file);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const deleteFile = async (name: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(name);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getAllFiles = async (): Promise<StoredFile[]> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result.sort((a, b) => b.lastModified - a.lastModified));
        request.onerror = () => reject(request.error);
    });
};

export const deleteAllFiles = async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

// --- Feedback Methods ---

export const saveFeedbackLocally = async (feedback: StoredFeedback): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(FEEDBACK_STORE, 'readwrite');
    const store = transaction.objectStore(FEEDBACK_STORE);
    store.put(feedback);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getAllFeedback = async (): Promise<StoredFeedback[]> => {
    const db = await openDB();
    const transaction = db.transaction(FEEDBACK_STORE, 'readonly');
    const store = transaction.objectStore(FEEDBACK_STORE);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        request.onerror = () => reject(request.error);
    });
};

export const clearFeedbackLog = async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(FEEDBACK_STORE, 'readwrite');
    const store = transaction.objectStore(FEEDBACK_STORE);
    store.clear();
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
