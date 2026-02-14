const PIN_KEY = "personal_pin_hash"
const UNLOCK_KEY = "personal_unlocked"

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + "life-dashboard-salt")
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = getStoredHash()
  if (!stored) return false
  const hash = await hashPin(pin)
  return hash === stored
}

export function getStoredHash(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(PIN_KEY)
}

export function hasPin(): boolean {
  return getStoredHash() !== null
}

export async function setPin(pin: string) {
  const hash = await hashPin(pin)
  localStorage.setItem(PIN_KEY, hash)
}

export function removePin() {
  localStorage.removeItem(PIN_KEY)
  sessionStorage.removeItem(UNLOCK_KEY)
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(UNLOCK_KEY) === "true"
}

export function setUnlocked() {
  sessionStorage.setItem(UNLOCK_KEY, "true")
}
