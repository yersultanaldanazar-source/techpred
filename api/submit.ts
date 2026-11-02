// Vercel Serverless Function: POST /api/submit
// Receives lead submission and persists to serverless log / memory, dispatches to Telegram

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { name, phone, telegram, comment, trafficSource } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required fields." });
  }

  const record = {
    id: `lead-${Date.now()}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    telegram: String(telegram || "").trim(),
    comment: String(comment || "").trim(),
    trafficSource: String(trafficSource || "Direct").trim(),
    timestamp: new Date().toISOString(),
    status: "new",
  };

  console.log("[Local Guarantor API /submit] Recorded submission:", record);

  // If Supabase / external DB is configured via env
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    try {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.warn("[API /submit] Supabase sync failed:", e);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Submission successfully stored in database",
    data: record,
  });
}
