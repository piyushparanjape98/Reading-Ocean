import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Self-contained on purpose: BookshelfRoom imports this, so it must not import back into the UI kit.
const ring =
  'outline-none focus-visible:ring-2 focus-visible:ring-brass-300 focus-visible:ring-offset-2 focus-visible:ring-offset-walnut-950'
const cx = (...c) => c.filter(Boolean).join(' ')

/* Shown in the navbar in place of "Login" once someone is signed in (or browsing as guest). */
export default function AccountMenu({ user, compact, onOrders, onLogout }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const trigger = useRef(null)
  const first = user.name.split(' ')[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !wrap.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation() // don't also close a shelf behind the menu
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'block w-full px-4 py-[10px] text-left font-sans text-[12px] text-cream-200 transition-colors hover:bg-walnut-800 hover:text-cream-100'

  return (
    <div ref={wrap} className={cx('relative', compact ? 'ml-2' : 'ml-5')}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex items-center gap-[6px] transition-colors',
          compact ? 'h-10 text-[11px] text-cream-200 hover:text-brass-300' : 'h-[34px] rounded-[2px] bg-brass-200 px-3 text-[12px] text-[#332b23] hover:bg-[#efe0c4]',
          ring,
        )}
      >
        <span className={cx('truncate', compact ? 'max-w-[64px]' : 'max-w-[96px]')}>{first}</span>
        <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={cx('transition-transform', open && 'rotate-180')}>
          <path d="M1 1l3.5 3.5L8 1" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Account"
            className="absolute right-0 top-[calc(100%+6px)] z-10 w-[220px] overflow-hidden rounded-[3px] border border-brass-600 bg-[#392a1e] shadow-[0_14px_30px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <div className="border-b border-[#6d5235] px-4 py-3">
              <p className="truncate font-display text-[20px] leading-6 text-cream-100">{user.name}</p>
              <p className="truncate font-sans text-[11px] text-cream-400">{user.guest ? 'Browsing as guest' : user.email}</p>
            </div>
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onOrders() }}>Past orders</button>
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onLogout() }}>Logout</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
