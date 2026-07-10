import { randomInt } from "crypto"
export function generateOTP() {
    return randomInt(100000, 1000000).toString();
  }
  
  export function getOTPExpiry() {
    return new Date(Date.now() + 5 * 60 * 1000);
  }