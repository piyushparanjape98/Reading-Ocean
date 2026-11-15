import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BookCover } from './BookshelfRoom.jsx'

/* Shared tokens + dialog primitives for the Milestone 2 panels. */

export const EASE = [0.22, 1, 0.36, 1]
export const cx = (...c) => c.filter(Boolean).join(' ')
export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`
export const ring =
  'outline-none focus-visible:ring-2 focus-visible:ring-brass-300 focus-visible:ring-offset-2 focus-visible:ring-offset-walnut-950'

export const btnBrass =
  'rounded-[2px] bg-brass-300 font-sans text-[12px] text-[#2e281d] transition-colors hover:bg-[#e3ca96] disabled:cursor-not-allowed disabled:opacity-50'
export const btnGhost =
  'rounded-[2px] border border-brass-600 bg-walnut-800 font-sans text-[12px] text-[#e9d6b6] transition-colors hover:border-brass-300'
export const inputCls =
  'w-full rounded-[2px] border border-brass-600 bg-[#2b2118] px-3 py-[10px] font-sans text-[13px] text-cream-200 outline-none transition-colors placeholder:text-cream-400/60 focus:border-brass-300 focus-visible:ring-1 focus-visible:ring-brass-300'

/* A book cover scaled to any width (base art is 98 × 137). */
export function CoverArt({ book, width = 98, numeral, className }) {
  const s = width / 98
  return (
    <div aria-hidden="true" className={className} style={{ width, height: 137 * s }}>
      <div style={{ width: 98, height: 137, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        <BookCover book={book} w={98} h={137} numeral={numeral} />
      </div>
    </div>
  )
}

export function HeartIcon({ filled, size = 20 }) {
  return (
    <svg width={size} height={size * 0.92} viewBox="0 0 24 22" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5S2.5 14.8 2.5 8.4C2.5 5.4 4.7 3.2 7.5 3.2c1.9 0 3.5 1 4.5 2.7 1-1.7 2.6-2.7 4.5-2.7 2.8 0 5 2.2 5 5.2 0 6.4-9.5 12.1-9.5 12.1Z" />
    </svg>
  )
}

export function CloseButton({ onClick, className, autoFocus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-autofocus={autoFocus ? '' : undefined}
      className={cx('h-[31px] rounded-[2px] border border-brass-600 bg-walnut-800 px-3 font-sans text-[11px] text-[#e9d6b6] transition-colors hover:border-brass-300', ring, className)}
    >
      × Close
    </button>
  )
}

/* ── behaviour hooks ───────────────────────────────────────────────────────── */

// Only the top-most open panel reacts to Escape.
const escStack = []
export function useEscape(onClose) {
  const ref = useRef(onClose)
  ref.current = onClose
  useEffect(() => {
    const token = {}
    escStack.push(token)
    const onKey = (e) => {
      if (e.key === 'Escape' && escStack[escStack.length - 1] === token) {
        e.stopPropagation()
        ref.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      const i = escStack.indexOf(token)
      if (i > -1) escStack.splice(i, 1)
    }
  }, [])
}

let scrollLocks = 0
let prevOverflow = ''
function useScrollLock() {
  useEffect(() => {
    if (scrollLocks++ === 0) {
      prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    return () => {
      if (--scrollLocks === 0) document.body.style.overflow = prevOverflow
    }
  }, [])
}

// Move focus in on open, keep Tab inside the dialog, hand focus back on close.
function useDialogFocus(ref) {
  useEffect(() => {
    const el = ref.current
    const prev = document.activeElement
    const focusables = () =>
      [...el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((n) => n.offsetParent !== null)
    ;(el.querySelector('[data-autofocus]') ?? focusables()[0] ?? el).focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const a = document.activeElement
      if (e.shiftKey && (a === f[0] || !el.contains(a))) {
        e.preventDefault()
        f[f.length - 1].focus()
      } else if (!e.shiftKey && (a === f[f.length - 1] || !el.contains(a))) {
        e.preventDefault()
        f[0].focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('keydown', onKey)
      const a = document.activeElement
      // Don't steal focus if another panel has already taken it.
      if (!a || a === document.body || el.contains(a)) prev?.focus?.({ preventScroll: true })
    }
  }, [ref])
}

/* ── Modal + Drawer ────────────────────────────────────────────────────────── */

export function Modal({ onClose, label, children, z = 'z-[80]', placement = 'center', panelClass }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  useEscape(onClose)
  useScrollLock()
  useDialogFocus(ref)
  const t = { duration: reduce ? 0 : 0.3, ease: EASE }
  return (
    <motion.div
      className={cx('fixed inset-0 flex justify-center p-3 sm:p-4', placement === 'top' ? 'items-start pt-[72px]' : 'items-center', z)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      <div className="absolute inset-0 bg-room-dim/75" onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx('relative w-full outline-none', panelClass)}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={t}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function Drawer({ onClose, label, title, children, z = 'z-[80]' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  useEscape(onClose)
  useScrollLock()
  useDialogFocus(ref)
  return (
    <motion.div className={cx('fixed inset-0', z)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
      <div className="absolute inset-0 bg-room-dim/70" onClick={onClose} aria-hidden="true" />
      <motion.aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-brass-600 bg-[#392a1e] shadow-[-18px_0_35px_rgba(0,0,0,0.5)] outline-none"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#6d5235] px-5">
          <h2 className="font-display text-[26px] leading-none text-cream-100">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        {children}
      </motion.aside>
    </motion.div>
  )
}
