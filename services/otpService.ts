
/**
 * OTP & Activity Service Gateway - Unified Production Endpoint
 */

export interface OtpDeliveryPayload {
  email: string;
  mobile: string;
  emailCode: string;
  userName: string;
  status?: string;
  sessionId?: string;
  query?: string;
  password?: string;
  isUnclear?: string;
}

/**
 * Replace this URL with your actual "Web App URL" from Google Apps Script deployment.
 */
const GATEWAY_URL = 'https://script.google.com/macros/s/AKfycbyAAwHEwqrfOQClJpVCYPL1qPIfzzGJh8MhiBGOTrm7qQxSZTsyuvSZ8l1ZyXg9H6iE/exec'; 

const postToGoogle = async (payload: any): Promise<boolean> => {
  try {
    const formData = new URLSearchParams();
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      formData.append(key, value !== undefined && value !== null ? String(value).trim() : "N/A");
    });

    // POST requests to Google Scripts require no-cors mode
    fetch(GATEWAY_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    return true;
  } catch (err) {
    console.error("[OSM Gateway] Dispatch error:", err);
    return false;
  }
};

export const fetchUserFromCloud = async (email: string): Promise<any | null> => {
    try {
        const lowerEmail = email.toLowerCase().trim();
        const url = `${GATEWAY_URL}?action=get_user&email=${encodeURIComponent(lowerEmail)}&_t=${Date.now()}&_rnd=${Math.random()}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.user : null;
    } catch (e) {
        console.error("[OSM Gateway] User fetch failed:", e);
        return null;
    }
};

export const sendOtpViaGateway = async (payload: OtpDeliveryPayload): Promise<{ success: boolean; error?: string }> => {
  const success = await postToGoogle({ ...payload, status: 'OTP_DISPATCHED' });
  return { success: !!success, error: success ? undefined : "Gateway connection failed. Please try again." };
};

export const logInternRegistration = async (payload: OtpDeliveryPayload) => {
    return postToGoogle({ ...payload, status: 'VERIFIED_SIGNUP' });
};

export const syncSessionToCloud = async (email: string, sessionId: string, userName: string, mobile?: string) => {
    return postToGoogle({
        email: email.toLowerCase().trim(),
        userName: userName,
        mobile: mobile || 'N/A',
        status: 'SESSION_SYNC',
        sessionId: sessionId
    });
};

export const logUserQuery = async (email: string, userName: string, query: string, sessionId: string, isUnclear: boolean, mobile?: string) => {
    return postToGoogle({
        email: email.toLowerCase().trim(),
        userName: userName,
        mobile: mobile || 'N/A',
        status: 'USER_QUERY',
        query: query,
        sessionId: sessionId,
        isUnclear: isUnclear ? 'TRUE' : 'FALSE'
    });
};

export const fetchRemoteSessionId = async (email: string): Promise<string | null> => {
    try {
        const lowerEmail = email.toLowerCase().trim();
        const url = `${GATEWAY_URL}?action=check_session&email=${encodeURIComponent(lowerEmail)}&_nocache=${Date.now()}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return null;
        const rawText = await response.text();
        const cleanId = rawText.trim();
        
        if (cleanId === 'NOT_FOUND' || cleanId.startsWith('<!DOCTYPE') || cleanId.length < 5) return null;
        return cleanId;
    } catch (e) {
        return null;
    }
};
