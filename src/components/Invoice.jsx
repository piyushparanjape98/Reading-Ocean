import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { btnBrass, cx, ring } from './ui.jsx'
import { GST_RATE, money2, paymentLabel, withTotals } from '../lib/checkout.js'

/* Reading Ocean tax invoice.
   <InvoiceScreen> shows the sheet on screen and mounts a second copy in a body-level portal that is
   hidden on screen and is the ONLY thing visible when printing (see the @media print rules in index.css). */

// Placeholders: replace with the real registered details before going live.
const SELLER = {
  name: 'Reading Ocean',
  tagline: 'Archival Books & Curated Editions',
  address: '[Registered address, city, state, PIN]',
  gstin: 'XXXXXXXXXXXXXXX (placeholder)',
  email: 'hello@readingocean.example',
}

const INK = '#2a1c14'
const MUTED = '#6f5b48'
const RULE = '#d9c8a8'

const dateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
const dateOnly = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()

/* A worn-ink archival stamp. The filter speckles and slightly warps the strokes so it reads as pressed ink. */
function PaidStamp({ date, className }) {
  const f = `ro-ink-${useId().replace(/:/g, '')}`
  const ink = '#8f2d22'
  return (
    <svg viewBox="0 0 250 92" className={className} role="img" aria-label="Reading Ocean, verified paid" style={{ transform: 'rotate(-9deg)', mixBlendMode: 'multiply' }}>
      <defs>
        <filter id={f} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.5" result="speck" />
          <feComposite in="SourceGraphic" in2="speck" operator="in" result="worn" />
          <feDisplacementMap in="worn" in2="noise" scale="1.5" />
        </filter>
      </defs>
      <g filter={`url(#${f})`} fill="none" stroke={ink} opacity="0.88">
        <rect x="3" y="3" width="244" height="86" rx="9" strokeWidth="3.2" />
        <rect x="10" y="10" width="230" height="72" rx="5" strokeWidth="1.1" />
        <path d="M24 49h202" strokeWidth="1" />
        <g fill={ink} stroke="none" textAnchor="middle">
          <text x="125" y="40" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="500" fontSize="23" letterSpacing="2.6">READING OCEAN</text>
          <text x="125" y="66" fontFamily="Inter, system-ui, sans-serif" fontWeight="500" fontSize="12.5" letterSpacing="3">— VERIFIED PAID —</text>
          {date && <text x="125" y="78" fontFamily="Inter, system-ui, sans-serif" fontSize="7" letterSpacing="2">{date}</text>}
        </g>
      </g>
    </svg>
  )
}

export function InvoiceSheet({ order: raw, className }) {
  const order = withTotals(raw)
  const c = order.customer
  const th = 'py-2 text-left font-sans text-[9px] font-medium uppercase tracking-[0.12em]'
  const row = 'flex items-baseline justify-between gap-6 py-[5px] font-sans text-[12px]'

  return (
    <article
      className={cx('invoice-sheet relative mx-auto w-full max-w-[760px] bg-[#fffdf7] p-6 sm:p-10', className)}
      style={{ color: INK }}
      aria-label={`Tax invoice ${order.id}`}
    >
      {/* header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-[38px] leading-[40px]">{SELLER.name}</p>
          <p className="mt-1 font-display text-[16px] italic" style={{ color: MUTED }}>{SELLER.tagline}</p>
          <div className="mt-3 font-sans text-[10.5px] leading-[16px]" style={{ color: MUTED }}>
            <p>{SELLER.address}</p>
            <p>GSTIN: {SELLER.gstin}</p>
            <p>{SELLER.email}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#8c5933' }}>Tax Invoice</p>
          <dl className="mt-2 font-sans text-[12px] leading-[19px]">
            <div className="sm:flex sm:justify-end sm:gap-3"><dt style={{ color: MUTED }}>Invoice / Order no.</dt><dd className="font-medium">{order.id}</dd></div>
            <div className="sm:flex sm:justify-end sm:gap-3"><dt style={{ color: MUTED }}>Date</dt><dd>{dateTime(order.placedAt)}</dd></div>
            <div className="sm:flex sm:justify-end sm:gap-3"><dt style={{ color: MUTED }}>Payment</dt><dd>{paymentLabel(order.payment)}</dd></div>
          </dl>
        </div>
      </header>

      <hr className="my-6 border-0 border-t-2" style={{ borderColor: INK }} />

      {/* billing */}
      <section className="grid gap-5 sm:grid-cols-2" aria-label="Billing details">
        <div>
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: MUTED }}>Billed &amp; shipped to</h3>
          {c ? (
            <div className="mt-2 font-sans text-[12.5px] leading-[19px]">
              <p className="font-medium">{c.name}</p>
              <p className="whitespace-pre-line">{c.address}</p>
              <p>{c.phone}</p>
              <p className="break-all">{c.email}</p>
            </div>
          ) : (
            <p className="mt-2 font-sans text-[12.5px]" style={{ color: MUTED }}>Customer details were not recorded for this order.</p>
          )}
        </div>
        <div>
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: MUTED }}>Supply</h3>
          <p className="mt-2 font-sans text-[12.5px] leading-[19px]">Printed books · HSN 4901<br />Shipping: free</p>
        </div>
      </section>

      {/* items */}
      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="border-y" style={{ borderColor: INK, color: MUTED }}>
              <th className={cx(th, 'w-7 pr-2')}>#</th>
              <th className={th}>Title</th>
              <th className={cx(th, 'hidden w-14 sm:table-cell')}>HSN</th>
              <th className={cx(th, 'w-10 text-right')}>Qty</th>
              <th className={cx(th, 'w-[84px] text-right')}>Rate</th>
              <th className={cx(th, 'w-[96px] text-right')}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i, n) => (
              <tr key={i.id} className="border-b align-top" style={{ borderColor: RULE }}>
                <td className="py-[10px] pr-2 font-sans text-[11px]" style={{ color: MUTED }}>{n + 1}</td>
                <td className="py-[10px] pr-3">
                  <p className="font-display text-[19px] leading-[21px]">{i.title}</p>
                  <p className="font-sans text-[10.5px]" style={{ color: MUTED }}>{i.author}</p>
                </td>
                <td className="hidden py-[10px] font-sans text-[11px] sm:table-cell" style={{ color: MUTED }}>4901</td>
                <td className="py-[10px] text-right font-sans text-[12px] tabular-nums">{i.quantity}</td>
                <td className="py-[10px] text-right font-sans text-[12px] tabular-nums">{money2(i.price)}</td>
                <td className="py-[10px] text-right font-sans text-[12px] tabular-nums">{money2(i.price * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* totals + stamp */}
      <div className="relative mt-4 flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PaidStamp date={dateOnly(order.placedAt)} className="-ml-1 h-auto w-[210px] shrink-0 sm:mb-2" />
        <dl className="w-full sm:w-[290px]">
          <div className={row}><dt style={{ color: MUTED }}>Subtotal</dt><dd className="tabular-nums">{money2(order.subtotal)}</dd></div>
          <div className={row}><dt style={{ color: MUTED }}>CGST @ {GST_RATE / 2}%</dt><dd className="tabular-nums">{money2(order.cgst)}</dd></div>
          <div className={row}><dt style={{ color: MUTED }}>SGST @ {GST_RATE / 2}%</dt><dd className="tabular-nums">{money2(order.sgst)}</dd></div>
          <div className={cx(row, 'border-t')} style={{ borderColor: RULE }}><dt>Total GST ({GST_RATE}%)</dt><dd className="tabular-nums">{money2(order.gst)}</dd></div>
          <div className={row}><dt style={{ color: MUTED }}>Shipping</dt><dd>Free</dd></div>
          <div className="mt-1 flex items-baseline justify-between gap-6 border-y-2 py-3" style={{ borderColor: INK }}>
            <dt className="font-sans text-[11px] font-medium uppercase tracking-[0.14em]">Grand total</dt>
            <dd className="font-display text-[30px] leading-none tabular-nums">{money2(order.total)}</dd>
          </div>
        </dl>
      </div>

      <footer className="mt-8 border-t pt-4 font-sans text-[10px] leading-[15px]" style={{ borderColor: RULE, color: MUTED }}>
        <p>Thank you for reading with us. This is a computer-generated invoice and needs no signature.</p>
        <p className="mt-1">Demo store: no payment was collected and nothing will be shipped. Seller details above are placeholders.</p>
      </footer>
    </article>
  )
}

/* The on-screen sheet, an action bar, and the print-only copy. `actions` renders beside the print button. */
export function InvoiceScreen({ order, actions }) {
  // A recognisable file name when the person chooses “Save as PDF”.
  const print = () => {
    const prev = document.title
    document.title = `Reading Ocean Invoice ${order.id}`
    const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore) }
    window.addEventListener('afterprint', restore)
    window.print()
  }
  useEffect(() => () => { if (document.title.startsWith('Reading Ocean Invoice')) document.title = 'Reading Ocean · An independent bookstore' }, [])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <button type="button" onClick={print} className={cx(btnBrass, 'h-[38px] px-4 text-[13px]', ring)}>Download / Print Invoice</button>
        {actions}
        <p className="basis-full font-sans text-[11px] text-cream-400 sm:ml-1 sm:basis-auto">Choose “Save as PDF” in the print dialog to download.</p>
      </div>
      <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[3px] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <InvoiceSheet order={order} />
      </div>
      {createPortal(
        <div className="print-only"><InvoiceSheet order={order} /></div>,
        document.body,
      )}
    </>
  )
}
