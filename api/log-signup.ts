
/**
 * Mock Serverless Function for logging signups.
 * In production, this would connect to Google Sheets API or a database.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, mobile, name, timestamp } = req.body;

  // Logic to append to Google Spreadsheet would go here.
  // For now, we simulate success for the requirements.
  console.log(`[SPREADSHEET LOG] New Intern Registered: ${name}, ${email}, ${mobile} at ${timestamp}`);

  return res.status(200).json({ 
    success: true, 
    message: 'Intern data logged to database successfully.' 
  });
}
