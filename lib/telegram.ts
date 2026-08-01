// 🔒 কাস্টমার/ব্যবহারকারীর লেখা টেক্সট Telegram HTML parse_mode-এ বসানোর আগে escape করা —
// নাহলে <a>, <b> ইত্যাদি ট্যাগ ব্যবহার করে ফরম্যাটিং/লিংক ইনজেক্ট করা সম্ভব
export function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// 📲 Telegram এ instant notification পাঠানোর হেল্পার ফাংশন
// সম্পূর্ণ ফ্রি, কোনো approval/cost লাগে না (Telegram Bot API)
export async function sendTelegramAlert(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
  
    if (!token || !chatId) {
      console.error("Telegram বট সেটআপ করা হয়নি (.env এ TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID নেই)")
      return
    }
  
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      })
    } catch (error) {
      // নোটিফিকেশন ফেইল হলেও অর্ডার ক্রিয়েশন আটকাবে না, শুধু লগ হবে
      console.error("TELEGRAM ALERT FAILED ->", error)
    }
  }
  export async function sendTelegramMessage(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
  
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  }