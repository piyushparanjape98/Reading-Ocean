/* Pure helpers for checkout: money maths, input formatting and validation. No React in here. */

export const GST_RATE = 5 // percent, split evenly into CGST + SGST

// All arithmetic is done in integer paise so totals never drift.
export function breakdown(items) {
  const subP = items.reduce((s, i) => s + Math.round(i.price * 100) * i.quantity, 0)
  const gstP = Math.round((subP * GST_RATE) / 100)
  const cgstP = Math.floor(gstP / 2)
  const sgstP = gstP - cgstP
  return { subtotal: subP / 100, cgst: cgstP / 100, sgst: sgstP / 100, gst: gstP / 100, total: (subP + gstP) / 100 }
}

export const money2 = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/* Orders saved before checkout existed have no tax fields; fill them in so every order can show an invoice. */
export function withTotals(order) {
  if (typeof order.gst === 'number' && typeof order.subtotal === 'number') return order
  return { ...order, ...breakdown(order.items) }
}

export function paymentLabel(payment) {
  if (!payment) return 'Not recorded'
  const name = { UPI: 'UPI', Card: 'Credit / Debit Card', NetBanking: 'NetBanking' }[payment.method] ?? payment.method
  return payment.detail ? `${name} · ${payment.detail}` : name
}

/* RO-2026-8492: year plus four digits, retried until it is unused on this device. */
export function newOrderId(existingIds, date = new Date()) {
  const taken = new Set(existingIds)
  for (let i = 0; i < 50; i++) {
    const id = `RO-${date.getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`
    if (!taken.has(id)) return id
  }
  return `RO-${date.getFullYear()}-${Date.now().toString().slice(-6)}`
}

/* ── validation ── */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/

// Accepts 10-digit Indian mobiles, with or without +91 / 91 / 0 in front. Returns the 10 digits or null.
export function cleanPhone(raw) {
  const d = String(raw).replace(/\D/g, '')
  const ten = d.length === 12 && d.startsWith('91') ? d.slice(2) : d.length === 11 && d.startsWith('0') ? d.slice(1) : d
  return /^[6-9]\d{9}$/.test(ten) ? ten : null
}

export function luhn(num) {
  const d = num.replace(/\D/g, '')
  if (d.length < 13) return false
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i])
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return sum % 10 === 0
}

export const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()

export function formatExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function expiryError(v, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v)
  if (!m) return 'Use MM/YY.'
  const month = Number(m[1])
  if (month < 1 || month > 12) return 'Month must be 01 to 12.'
  const endOfMonth = new Date(2000 + Number(m[2]), month, 1) // first moment after the expiry month
  return endOfMonth <= now ? 'This card has expired.' : ''
}

export const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'sbi', name: 'State Bank of India', short: 'SBI' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS' },
]

// A deliberately invalid handle (“@demo” is not a real UPI app) so the demo QR can never route real money.
export const DEMO_VPA = 'readingocean@demo'
export const upiIntent = (amount, orderRef) =>
  `upi://pay?pa=${DEMO_VPA}&pn=${encodeURIComponent('Reading Ocean')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderRef)}`
