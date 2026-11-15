import { useState } from 'react'
import { Modal, CloseButton, btnBrass, cx, inputCls, ring } from './ui.jsx'

// Placeholder address on the reserved .example domain: swap in the real one when there is one.
const CONTACT_EMAIL = 'hello@readingocean.example'

function Shell({ label, title, kicker, onClose, children }) {
  return (
    <Modal onClose={onClose} label={label} panelClass="max-h-[90svh] max-w-[480px] overflow-y-auto rounded-[4px] border border-brass-600 bg-[#392a1e] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-[10px] tracking-[0.14em] text-[#ceaf79]">{kicker}</p>
          <h2 className="mt-2 font-display text-[36px] leading-[40px] text-cream-100">{title}</h2>
        </div>
        <CloseButton onClick={onClose} autoFocus />
      </div>
      <div className="my-4 h-px w-16 bg-brass-500" />
      {children}
    </Modal>
  )
}

export function AboutModal({ onClose }) {
  return (
    <Shell label="About Reading Ocean" title="A quiet place. An ocean of ideas." kicker="ABOUT" onClose={onClose}>
      <div className="space-y-4 font-display text-[19px] leading-[1.5] text-cream-300">
        <p>Reading Ocean is an independent bookstore laid out like a private library: four shelves, a warm lamp, and a few books worth taking home.</p>
        <p>Every title is chosen by hand. The “Curated Recommendations” shelf is where to begin; the shelf below it holds the rest of the genre.</p>
        <p>Books to get lost in. Ideas to come home to.</p>
      </div>
      <p className="mt-5 font-sans text-[11px] text-cream-400">Curated with care · India</p>
    </Shell>
  )
}

export function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', message: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const ready = form.message.trim().length > 0
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Hello from ${form.name.trim() || 'a reader'}`)}&body=${encodeURIComponent(form.message)}`

  return (
    <Shell label="Contact Reading Ocean" title="Say hello" kicker="CONTACT" onClose={onClose}>
      <p className="font-display text-[19px] leading-[1.5] text-cream-300">Questions about a book, an order, or a recommendation? Write to us.</p>
      <p className="mt-3 font-sans text-[12px] text-cream-400">
        Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className={cx('rounded-sm text-brass-300 underline-offset-2 hover:underline', ring)}>{CONTACT_EMAIL}</a>
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="ct-name" className="mb-[6px] block font-sans text-[11px] tracking-[0.04em] text-cream-400">Your name</label>
          <input id="ct-name" className={inputCls} autoComplete="name" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label htmlFor="ct-msg" className="mb-[6px] block font-sans text-[11px] tracking-[0.04em] text-cream-400">Message</label>
          <textarea id="ct-msg" rows={4} className={cx(inputCls, 'resize-y')} value={form.message} onChange={set('message')} />
        </div>
        <a
          href={ready ? href : undefined}
          aria-disabled={!ready}
          onClick={(e) => !ready && e.preventDefault()}
          className={cx(btnBrass, 'grid h-[42px] place-items-center text-[13px]', !ready && 'pointer-events-none opacity-50', ring)}
        >
          Open in your email app
        </a>
        <p className="font-sans text-[11px] leading-[16px] text-cream-400">This opens a draft in your own email app. Nothing is sent from this page.</p>
      </div>
    </Shell>
  )
}
