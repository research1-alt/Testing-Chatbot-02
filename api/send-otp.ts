
import { Resend } from 'resend';

/**
 * Vercel Serverless Function
 * Dispatches the OTP via Resend. 
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, emailCode, userName } = req.body;

  if (!email || !emailCode) {
    return res.status(400).json({ message: 'Target email and code are required.' });
  }

  const resendKey = process.env.RESEND_API_KEY;

  // FALLBACK: If no API key is provided, we simulate success and log to console
  // This allows the user to test the app for FREE during development.
  if (!resendKey) {
    console.log("-----------------------------------------");
    console.log(`[FREE DEV MODE] OTP for ${email}: ${emailCode}`);
    console.log("-----------------------------------------");
    return res.status(200).json({ 
      success: true, 
      message: 'Dev Mode: OTP logged to server console. Check your terminal.' 
    });
  }

  try {
    const resend = new Resend(resendKey);
    const sender = 'OSM Security <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: sender,
      to: [email],
      subject: `Verify Your OSM Identity: ${emailCode}`,
      html: `
        <div style="font-family: sans-serif; background-color: #f8fafc; padding: 40px; color: #0f172a;">
          <div style="max-width: 500px; margin: auto; background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #16a34a; padding: 24px; text-align: center;">
               <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em;">OMEGA SEIKI MOBILITY</h1>
            </div>
            <div style="padding: 40px; text-align: center;">
              <p style="font-size: 16px; color: #64748b; margin-bottom: 8px;">Hello ${userName},</p>
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 24px; color: #1e293b;">Confirm Your Registration</h2>
              <p style="font-size: 15px; color: #64748b; line-height: 1.5; margin-bottom: 32px;">
                Enter the following 4-digit verification code to activate your account in the Service Intern Portal.
              </p>
              <div style="background-color: #f1f5f9; border-radius: 16px; padding: 30px; border: 2px solid #e2e8f0;">
                <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #16a34a;">${emailCode}</span>
              </div>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Internal mail server error.',
      error: err.message 
    });
  }
}
