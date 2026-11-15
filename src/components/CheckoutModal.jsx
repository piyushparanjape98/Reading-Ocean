import { useEffect, useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { Modal, CloseButton, btnBrass, btnGhost, cx, inputCls, ring } from './ui.jsx'
import { InvoiceScreen } from './Invoice.jsx'
import { useStore } from '../context/StoreContext.jsx'
import {
  BANKS, DEMO_VPA, EMAIL_RE, UPI_RE, breakdown, cleanPhone, expiryError, formatCardNumber, formatExpiry,
  luhn, money2, upiIntent,
} from '../lib/checkout.js'

/* Three-step demo checkout: details → payment → tax invoice.
   Nothing leaves the browser and no money moves. Card numbers, CVVs and UPI IDs live only in this
   component's state; the saved order keeps just a label such as "•••• 4242". */

const STEPS = ['Details', 'Payment', 'Invoice']
const TABS = [
  { id: 'upi', label: 'UPI / QR' },
  { id: 'card', label: 'Card' },
  { id: 'netbanking', label: 'NetBanking' },
]

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-[6px] block font-sans text-[11px] tracking-[0.04em] text-cream-400">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-[6px] font-sans text-[11px] text-cream-400/80">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-[6px] font-sans text-[11px] text-[#e8a28a]">{error}</p>}
    </div>
  )
}
const aria = (id, error, hint) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined,
})

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-2 font-sans text-[11px]" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const n = i + 1
        const state = n < step ? 'done' : n === step ? 'now' : 'next'
        return (
          <li key={label} className="flex items-center gap-2" aria-current={state === 'now' ? 'step' : undefined}>
            <span className={cx('grid h-[22px] w-[22px] place-items-center rounded-full border text-[10px] transition-colors', state === 'next' ? 'border-brass-600 text-cream-400' : 'border-brass-300 bg-brass-300 text-[#2e281d]')}>
              {state === 'done' ? '✓' : n}
            </span>
            <span className={cx(state === 'next' ? 'text-cream-400' : 'text-cream-100', state !== 'now' && 'hidden sm:inline')}>{label}</span>
            {n < STEPS.length && <span className="mx-0 h-px w-3 bg-brass-600 sm:mx-1 sm:w-8" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

/* A real, scannable QR code (qrcode-generator), drawn as one SVG path. It encodes a UPI payment link
   to a deliberately invalid demo handle, so scanning it can never pay anyone. */
function UpiQr({ amount }) {
  const { path, size } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(upiIntent(amount, 'Reading Ocean order'))
    qr.make()
    const n = qr.getModuleCount()
    let d = ''
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!qr.isDark(r, c)) continue
        let run = 1
        while (c + run < n && qr.isDark(r, c + run)) run++
        d += `M${c + 4} ${r + 4}h${run}v1h-${run}z`
        c += run - 1
      }
    }
    return { path: d, size: n + 8 }
  }, [amount])

  return (
    <div className="shrink-0 rounded-[3px] bg-[#fffdf7] p-2 shadow-[0_6px_18px_rgba(0,0,0,0.4)]">
      <svg viewBox={`0 0 ${size} ${size}`} width="148" height="148" shapeRendering="crispEdges" role="img" aria-label={`UPI QR code for Reading Ocean, ${money2(amount)}`}>
        <rect width={size} height={size} fill="#fffdf7" />
        <path d={path} fill="#2a1c14" />
      </svg>
      <p className="mt-1 text-center font-display text-[13px] leading-none text-[#2a1c14]">Reading Ocean</p>
    </div>
  )
}

function Summary({ cart, totals }) {
  return (
    <aside aria-label="Order summary" className="h-fit rounded-[3px] border border-[#6d5235] bg-[#4a3726] p-4 md:sticky md:top-0">
      <h3 className="font-display text-[22px] leading-none text-cream-100">Order summary</h3>
      <ul className="mt-3 space-y-2 border-b border-[#6d5235] pb-3">
        {cart.map(({ book, quantity }) => (
          <li key={book.id} className="flex items-baseline justify-between gap-3 font-sans text-[12px]">
            <span className="min-w-0 text-[#f2e2c4]">{book.title}{quantity > 1 && <span className="text-cream-400"> × {quantity}</span>}</span>
            <span className="shrink-0 tabular-nums text-cream-300">{money2(book.price * quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-[6px] font-sans text-[12px]">
        <div className="flex justify-between"><dt className="text-cream-400">Subtotal</dt><dd className="tabular-nums text-cream-200">{money2(totals.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-cream-400">GST (5%)</dt><dd className="tabular-nums text-cream-200">{money2(totals.gst)}</dd></div>
        <div className="flex justify-between"><dt className="text-cream-400">Shipping</dt><dd className="text-cream-200">Free</dd></div>
        <div className="flex items-baseline justify-between border-t border-[#6d5235] pt-3">
          <dt className="text-cream-200">Total</dt>
          <dd className="font-display text-[28px] leading-none tabular-nums text-cream-100">{money2(totals.total)}</dd>
        </div>
      </dl>
    </aside>
  )
}

export default function CheckoutModal({ onClose, onViewOrders }) {
  const { cart, user, addOrder, clearCart } = useStore()
  const [step, setStep] = useState(1)
  const [details, setDetails] = useState(() => ({ name: user?.guest ? '' : user?.name ?? '', email: user?.email ?? '', phone: '', address: '' }))
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('upi')
  const [vpa, setVpa] = useState('')
  const [vpaState, setVpaState] = useState('idle') // idle | checking | ok
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' })
  const [bank, setBank] = useState('')
  const [paying, setPaying] = useState(false)
  const [order, setOrder] = useState(null)
  const headingRef = useRef(null)
  const timers = useRef([])

  const totals = useMemo(() => breakdown(cart.map(({ book, quantity }) => ({ price: book.price, quantity }))), [cart])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [step])

  const setD = (k) => (e) => { setDetails((d) => ({ ...d, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })) }
  const setC = (k, fmt = (v) => v) => (e) => { setCard((c) => ({ ...c, [k]: fmt(e.target.value) })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })) }

  /* step 1 → 2 */
  const submitDetails = (e) => {
    e.preventDefault()
    const next = {}
    if (details.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!EMAIL_RE.test(details.email.trim())) next.email = 'Enter an email like name@example.com.'
    if (!cleanPhone(details.phone)) next.phone = 'Enter a 10-digit mobile number.'
    if (details.address.trim().length < 10) next.address = 'Enter the full delivery address with city and PIN.'
    setErrors(next)
    if (!Object.keys(next).length) setStep(2)
  }

  /* UPI: the “verification” is a format check only. There is no bank behind it. */
  const verifyVpa = () => {
    if (!UPI_RE.test(vpa.trim())) { setErrors((x) => ({ ...x, vpa: 'Enter a UPI ID like yourname@okaxis.' })); return }
    setErrors((x) => ({ ...x, vpa: undefined }))
    setVpaState('checking')
    timers.current.push(setTimeout(() => setVpaState('ok'), 700))
  }

  /* step 2 → 3 */
  const pay = () => {
    const next = {}
    let payment
    if (tab === 'upi') {
      if (vpaState !== 'ok') next.vpa = vpa.trim() ? 'Verify your UPI ID to continue.' : 'Enter and verify a UPI ID to continue.'
      payment = { method: 'UPI', detail: vpa.trim() }
    } else if (tab === 'card') {
      if (!luhn(card.number)) next.number = 'Enter a valid card number.'
      const exp = expiryError(card.expiry)
      if (exp) next.expiry = exp
      if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = '3 or 4 digits.'
      if (card.holder.trim().length < 2) next.holder = 'Enter the name on the card.'
      payment = { method: 'Card', detail: `•••• ${card.number.replace(/\D/g, '').slice(-4)}` }
    } else {
      if (!bank) next.bank = 'Choose your bank.'
      payment = { method: 'NetBanking', detail: BANKS.find((b) => b.id === bank)?.name ?? '' }
    }
    setErrors(next)
    if (Object.keys(next).length || paying || !cart.length) return
    setPaying(true)
    timers.current.push(
      setTimeout(() => {
        const placed = addOrder({
          items: cart,
          customer: { name: details.name.trim(), email: details.email.trim(), phone: `+91 ${cleanPhone(details.phone)}`, address: details.address.trim() },
          payment,
        })
        clearCart()
        setCard({ number: '', expiry: '', cvv: '', holder: '' }) // card data never outlives the payment step
        setOrder(placed)
        setPaying(false)
        setStep(3)
      }, 1000),
    )
  }

  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const t = TABS[(i + d + TABS.length) % TABS.length]
    setTab(t.id); setErrors({})
    document.getElementById(`pay-tab-${t.id}`)?.focus()
  }

  const wide = step === 3 ? 'max-w-[860px]' : 'max-w-[940px]'
  const title = step === 1 ? 'Shipping & details' : step === 2 ? 'Payment' : 'Payment received'
  const empty = !order && cart.length === 0

  return (
    <Modal onClose={onClose} label="Checkout" panelClass={cx('max-h-[94svh] overflow-y-auto rounded-[4px] border border-brass-600 bg-[#392a1e] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-7', wide)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Stepper step={step} />
          <h2 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[34px] leading-[38px] text-cream-100 outline-none">{title}</h2>
        </div>
        <div className="shrink-0"><CloseButton onClick={onClose} autoFocus /></div>
      </div>
      <div className="my-4 h-px w-16 bg-brass-500" />

      {empty ? (
        <div className="py-10 text-center">
          <p className="font-display text-[26px] text-cream-100">Your cart is empty</p>
          <button type="button" onClick={onClose} className={cx(btnGhost, 'mt-5 h-[34px] px-4', ring)}>Back to the shelves</button>
        </div>
      ) : step === 3 ? (
        <>
          <p className="mb-4 font-display text-[19px] leading-[1.4] text-cream-300" role="status">
            Thank you, {order.customer?.name.split(' ')[0]}. Order <span className="text-cream-100">{order.id}</span> is confirmed and your invoice is below.
          </p>
          <InvoiceScreen
            order={order}
            actions={
              <>
                <button type="button" onClick={() => { onClose(); onViewOrders?.() }} className={cx(btnGhost, 'h-[38px] px-4', ring)}>Past orders</button>
                <button type="button" onClick={onClose} className={cx(btnGhost, 'h-[38px] px-4', ring)}>Keep browsing</button>
              </>
            }
          />
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_290px]">
          {step === 1 ? (
            <form onSubmit={submitDetails} noValidate className="space-y-4">
              <Field id="co-name" label="Full name" error={errors.name}>
                <input id="co-name" className={inputCls} autoComplete="name" value={details.name} onChange={setD('name')} {...aria('co-name', errors.name)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="co-email" label="Email" error={errors.email}>
                  <input id="co-email" type="email" className={inputCls} autoComplete="email" value={details.email} onChange={setD('email')} {...aria('co-email', errors.email)} />
                </Field>
                <Field id="co-phone" label="Phone" error={errors.phone}>
                  <input id="co-phone" type="tel" inputMode="tel" className={inputCls} autoComplete="tel" placeholder="98765 43210" value={details.phone} onChange={setD('phone')} {...aria('co-phone', errors.phone)} />
                </Field>
              </div>
              <Field id="co-address" label="Delivery address" error={errors.address} hint="House / flat, street, city, state and PIN.">
                <textarea id="co-address" rows={4} className={cx(inputCls, 'resize-y')} autoComplete="street-address" value={details.address} onChange={setD('address')} {...aria('co-address', errors.address, true)} />
              </Field>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button type="submit" className={cx(btnBrass, 'h-[42px] px-6 text-[13px]', ring)}>Continue to payment</button>
                <button type="button" onClick={onClose} className={cx(btnGhost, 'h-[42px] px-4', ring)}>Back to cart</button>
              </div>
            </form>
          ) : (
            <div>
              <div role="tablist" aria-label="Payment method" onKeyDown={onTabKey} className="flex border-b border-[#6d5235]">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    id={`pay-tab-${t.id}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    aria-controls="pay-panel"
                    tabIndex={tab === t.id ? 0 : -1}
                    onClick={() => { setTab(t.id); setErrors({}) }}
                    className={cx('relative h-10 flex-1 font-display text-[19px] transition-colors', tab === t.id ? 'text-cream-100' : 'text-cream-400 hover:text-cream-200', ring)}
                  >
                    {t.label}
                    {tab === t.id && <span className="absolute inset-x-4 bottom-[-1px] h-[2px] bg-brass-300" />}
                  </button>
                ))}
              </div>

              <div id="pay-panel" role="tabpanel" aria-labelledby={`pay-tab-${tab}`} className="space-y-4 pt-5">
                {tab === 'upi' && (
                  <>
                    <div className="flex flex-col items-start gap-4 sm:flex-row">
                      <UpiQr amount={totals.total} />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[20px] leading-[24px] text-cream-100">Scan with any UPI app</p>
                        <p className="mt-1 font-sans text-[11px] leading-[17px] text-cream-400">
                          Demo QR: it points to <span className="text-cream-300">{DEMO_VPA}</span>, which is not a real account, so nothing can be paid by scanning. To continue, verify a UPI ID below.
                        </p>
                      </div>
                    </div>
                    <Field id="co-vpa" label="Or pay with your UPI ID" error={errors.vpa} hint="Demo verification only checks the format.">
                      <div className="flex gap-2">
                        <input
                          id="co-vpa"
                          className={inputCls}
                          placeholder="yourname@okaxis"
                          autoComplete="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={vpa}
                          onChange={(e) => { setVpa(e.target.value); setVpaState('idle'); if (errors.vpa) setErrors((x) => ({ ...x, vpa: undefined })) }}
                          {...aria('co-vpa', errors.vpa, true)}
                        />
                        <button
                          type="button"
                          onClick={verifyVpa}
                          disabled={vpaState === 'checking' || vpaState === 'ok'}
                          className={cx(vpaState === 'ok' ? 'rounded-[2px] border border-[#8fb58a] px-4 font-sans text-[12px] text-[#b9dbb4]' : btnGhost, 'h-[40px] shrink-0 px-4', ring)}
                        >
                          {vpaState === 'checking' ? 'Checking…' : vpaState === 'ok' ? 'Verified ✓' : 'Verify'}
                        </button>
                      </div>
                    </Field>
                  </>
                )}

                {tab === 'card' && (
                  <>
                    <Field id="co-card" label="Card number" error={errors.number} hint="Demo: any Luhn-valid number works, e.g. 4242 4242 4242 4242.">
                      <input id="co-card" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" className={cx(inputCls, 'tabular-nums tracking-[0.06em]')} value={card.number} onChange={setC('number', formatCardNumber)} {...aria('co-card', errors.number, true)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field id="co-exp" label="Expiry" error={errors.expiry}>
                        <input id="co-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" className={cx(inputCls, 'tabular-nums')} value={card.expiry} onChange={setC('expiry', formatExpiry)} {...aria('co-exp', errors.expiry)} />
                      </Field>
                      <Field id="co-cvv" label="CVV" error={errors.cvv}>
                        <input id="co-cvv" type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="•••" className={cx(inputCls, 'tabular-nums')} value={card.cvv} onChange={setC('cvv', (v) => v.replace(/\D/g, '').slice(0, 4))} {...aria('co-cvv', errors.cvv)} />
                      </Field>
                    </div>
                    <Field id="co-holder" label="Cardholder name" error={errors.holder}>
                      <input id="co-holder" autoComplete="cc-name" className={inputCls} value={card.holder} onChange={setC('holder')} {...aria('co-holder', errors.holder)} />
                    </Field>
                  </>
                )}

                {tab === 'netbanking' && (
                  <div>
                    <p id="bank-label" className="mb-2 font-sans text-[11px] tracking-[0.04em] text-cream-400">Choose your bank</p>
                    <div role="radiogroup" aria-labelledby="bank-label" className="grid grid-cols-2 gap-3">
                      {BANKS.map((b) => {
                        const on = bank === b.id
                        return (
                          <button
                            key={b.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => { setBank(b.id); setErrors({}) }}
                            className={cx('flex items-center gap-3 rounded-[3px] border p-3 text-left transition-colors', on ? 'border-brass-300 bg-[#4f3b29]' : 'border-[#6d5235] bg-[#4a3726] hover:border-brass-500', ring)}
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brass-200 font-sans text-[9px] font-medium tracking-[0.06em] text-[#332b23]">{b.short}</span>
                            <span className="font-display text-[18px] leading-[20px] text-[#f2e2c4]">{b.name}</span>
                          </button>
                        )
                      })}
                    </div>
                    {errors.bank && <p role="alert" className="mt-2 font-sans text-[11px] text-[#e8a28a]">{errors.bank}</p>}
                    <p className="mt-3 font-sans text-[11px] text-cream-400">Demo: you are not redirected anywhere and no bank is contacted.</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-[#6d5235] pt-4">
                  <button type="button" onClick={pay} disabled={paying} className={cx(btnBrass, 'h-[44px] px-6 text-[13px]', ring)}>
                    {paying ? 'Processing…' : `Complete Payment · ${money2(totals.total)}`}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setErrors({}) }} disabled={paying} className={cx(btnGhost, 'h-[44px] px-4', ring)}>Back</button>
                </div>
                <p className="font-sans text-[11px] text-cream-400">Demo checkout: card details stay on this page and are never saved. Only the last four digits go on your invoice.</p>
              </div>
            </div>
          )}
          <Summary cart={cart} totals={totals} />
        </div>
      )}
    </Modal>
  )
}
