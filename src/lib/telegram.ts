export interface VouchFormData {
  name: string;
  phone: string;
  telegram: string;
  comment: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sends a vouch application notification directly to the team Telegram group via Telegram Bot API.
 */
export async function sendTelegramNotification(
  data: VouchFormData
): Promise<{ success: boolean; error?: string }> {
  const botToken =
    import.meta.env.VITE_TELEGRAM_BOT_TOKEN ||
    "8540288473:AAEw5j5X6Xt9cONi4xpci23SUxoJoz6-yms";
  const chatId =
    import.meta.env.VITE_TELEGRAM_CHAT_ID ||
    "-5129195932";

  if (!botToken || !chatId) {
    console.warn(
      "[Local Guarantor] Telegram Bot credentials not set in .env. Notification skipped."
    );
    return { success: true };
  }

  const formattedTg = data.telegram.trim().startsWith("@")
    ? data.telegram.trim()
    : `@${data.telegram.trim()}`;

  const message = `
🔔 <b>New Vouch Request Received! (Local Guarantor)</b>

👤 <b>Student Name & Year:</b> ${escapeHtml(data.name)}
📞 <b>Phone / WhatsApp:</b> <code>${escapeHtml(data.phone)}</code>
✈️ <b>Telegram:</b> ${escapeHtml(formattedTg)}
📝 <b>Krisha.kz Listing / Notes:</b>
${data.comment ? escapeHtml(data.comment) : "<i>(No details provided)</i>"}

📍 <b>Campus:</b> Narxoz University, Almaty
👥 <b>Team Lead:</b> Yersultan Aldanazar (+7 708 501 02 70)
⏰ <b>Timestamp:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Almaty" })} (Almaty Time)
`.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Local Guarantor] Telegram API Error:", err);
      return { success: false, error: err.description || "Telegram API Error" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Local Guarantor] Error sending Telegram message:", error);
    return { success: false, error: error?.message || "Network Error" };
  }
}
