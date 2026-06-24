export function maskPhone(phone: string): string {
    if (!phone || phone.length <= 4) return phone
    const last4 = phone.slice(-4)
    return "*".repeat(phone.length - 4) + last4
  }