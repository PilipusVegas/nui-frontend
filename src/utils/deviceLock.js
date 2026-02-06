import CryptoJS from "crypto-js";

const STORAGE_KEY = "device_user_lock"; // nama masuk akal & eksplisit
const SECRET_KEY = "nico-device-lock-v1"; 
// 👉 idealnya dari env, tapi frontend-only cukup

export function encryptUserId(userId) {
  return CryptoJS.AES.encrypt(String(userId), SECRET_KEY).toString();
}

export function decryptUserId(cipherText) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

export function getLockedUserId() {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  return decryptUserId(encrypted);
}

export function lockDeviceToUser(userId) {
  const encrypted = encryptUserId(userId);
  localStorage.setItem(STORAGE_KEY, encrypted);
}
