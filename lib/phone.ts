// যেকোনো ফরম্যাটে লেখা বাংলাদেশি মোবাইল নম্বরকে 01XXXXXXXXX ফরম্যাটে নিয়ে আসে
// উদাহরণ: +8801737939688, 8801737939688, 1737939688, 017-3793-9688 → 01737939688
export function normalizePhone(raw: string): string {
    let digits = raw.replace(/\D/g, "")
    if (digits.startsWith("880")) {
      digits = digits.slice(3)
    }
    if (!digits.startsWith("0")) {
      digits = "0" + digits
    }
    return digits
  }
  
  // সঠিক বাংলাদেশি মোবাইল ফরম্যাট কিনা যাচাই করে (01[3-9] দিয়ে শুরু, মোট ১১ ডিজিট)
  export function isValidBDPhone(phone: string): boolean {
    return /^01[3-9]\d{8}$/.test(phone)
  }