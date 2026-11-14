import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/* ────────────────────────────────────────────────────────────────────────────
   Reading Ocean · the room
   Desktop = a 1440×900 "stage" (the Figma frame) scaled to fit the window.
   Mobile  = a 390×844 column (the Figma frame), centred.
   Everything is CSS + SVG + Framer Motion. No images, no network.
   ──────────────────────────────────────────────────────────────────────────── */

const STAGE_W = 1440
const STAGE_H = 900
const MOBILE_BP = 820
const EASE = [0.22, 1, 0.36, 1]

const cx = (...c) => c.filter(Boolean).join(' ')
const ring =
  'outline-none focus-visible:ring-2 focus-visible:ring-brass-300 focus-visible:ring-offset-2 focus-visible:ring-offset-walnut-950'
const numWord = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six']

function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight })
  const [vp, setVp] = useState(read)
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setVp(read()))
    }
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return vp
}

/* ───────────────────────────── icons ───────────────────────────── */

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

const SearchIcon = () => (
  <svg width="21" height="21" viewBox="0 0 22 22" aria-hidden="true" {...line}>
    <circle cx="9.5" cy="9.5" r="7" />
    <path d="M14.7 14.7 20 20" />
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="21" height="19" viewBox="0 0 24 22" aria-hidden="true" {...line} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5S2.5 14.8 2.5 8.4C2.5 5.4 4.7 3.2 7.5 3.2c1.9 0 3.5 1 4.5 2.7 1-1.7 2.6-2.7 4.5-2.7 2.8 0 5 2.2 5 5.2 0 6.4-9.5 12.1-9.5 12.1Z" />
  </svg>
)
const CartIcon = () => (
  <svg width="24" height="21" viewBox="0 0 26 22" aria-hidden="true" {...line}>
    <path d="M1 1.5h3.6l2.5 12.2h12.2l2.4-8.6H5.6" />
    <circle cx="9" cy="18.6" r="1.4" />
    <circle cx="18" cy="18.6" r="1.4" />
  </svg>
)

/* ───────────────────────────── nav ───────────────────────────── */

function NavBar({ compact, cartCount, wishlistCount }) {
  const iconBtn = cx(
    'relative grid h-10 place-items-center rounded-sm text-cream-200 transition-colors hover:text-brass-300',
    compact ? 'w-9' : 'w-10',
    ring,
  )
  const badge = compact ? 'h-[14px] w-[14px] text-[9px]' : 'h-4 w-4 text-[10px]'
  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 flex items-center justify-between',
        compact ? 'h-[58px] bg-[#37362d]/[.93] pl-5 pr-3' : 'h-16 bg-room-nav/[.92] px-[38px]',
      )}
    >
      <nav aria-label="Primary" className={cx('flex items-center text-cream-200', compact ? 'gap-[17px] text-[12px]' : 'gap-[31px] text-[13px]')}>
        <a href="#about" className={cx('rounded-sm transition-colors hover:text-brass-300', ring)}>About</a>
        <a href="#contact" className={cx('rounded-sm transition-colors hover:text-brass-300', ring)}>Contact</a>
      </nav>

      {!compact && (
        <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[10px] tracking-[0.14em] text-cream-400">
          AN INDEPENDENT BOOKSTORE
        </p>
      )}

      <div className="flex items-center gap-[2px]">
        <button type="button" className={iconBtn} aria-label="Search"><SearchIcon /></button>
        <button type="button" className={iconBtn} aria-label={`Wishlist, ${wishlistCount} saved`}>
          <HeartIcon filled={wishlistCount > 0} />
        </button>
        <button type="button" className={iconBtn} aria-label={`Cart, ${cartCount} items`}>
          <CartIcon />
          <motion.span
            key={cartCount}
            initial={cartCount === 0 ? false : { scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
            className={cx('pointer-events-none absolute grid place-items-center rounded-full bg-brass-300 font-sans text-[#30271c]', badge, compact ? 'left-[22px] top-[1px]' : 'left-[26px] top-0')}
          >
            {cartCount}
          </motion.span>
        </button>
        {compact ? (
          <a href="#login" className={cx('ml-3 rounded-sm text-[11px] text-cream-200 transition-colors hover:text-brass-300', ring)}>Login</a>
        ) : (
          <a href="#login" className={cx('ml-5 grid h-[34px] w-[76px] place-items-center rounded-[2px] bg-brass-200 text-[12px] text-[#332b23] transition-colors hover:bg-[#efe0c4]', ring)}>Login</a>
        )}
      </div>
    </header>
  )
}

/* ───────────────────────────── covers + buttons ───────────────────────────── */

export function BookCover({ book, w = 98, h = 137, numeral, compact = false, shadow = '5px 6px 7px rgba(0,0,0,0.5)' }) {
  const c = book.cover
  const text = book.coverTitle ?? book.title
  const long = text.length > 26
  const size = compact ? (long ? 13 : 16) : 15
  return (
    <span aria-hidden="true" className="relative block shrink-0 overflow-hidden rounded-[2px] text-left" style={{ width: w, height: h, background: c.bg, boxShadow: shadow }}>
      <i className="absolute left-1 top-0 block h-full w-[3px] opacity-50" style={{ background: c.binding }} />
      <i className="absolute left-[13px] top-4 block h-px" style={{ width: w - 26, background: c.rule }} />
      <span className="absolute left-[14px] top-[27px] block font-display" style={{ width: w - 25, color: c.ink, fontSize: size, lineHeight: long && compact ? '15px' : 1.2 }}>
        {text}
      </span>
      {numeral != null && (
        <span className="absolute left-[14px] top-[92px] font-display text-[18px] leading-none" style={{ color: c.ink }}>
          {String(numeral).padStart(2, '0')}
        </span>
      )}
      <span className="absolute bottom-4 left-[14px] font-sans text-[6px] uppercase tracking-[0.06em]" style={{ color: c.ink }}>
        {book.author}
      </span>
    </span>
  )
}

function CoverButton({ book, onSelect, ...cover }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      onClick={() => onSelect?.(book)}
      aria-label={`${book.title} by ${book.author}, view details`}
      className={cx('shrink-0 rounded-[2px]', ring)}
    >
      <BookCover book={book} {...cover} />
    </motion.button>
  )
}

function CartButton({ book, onAdd, className }) {
  const [added, setAdded] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        onAdd?.(book)
        setAdded(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setAdded(false), 1300)
      }}
      aria-label={`Add ${book.title} to cart`}
      className={cx('rounded-[2px] bg-brass-300 font-sans text-[11px] text-[#2e281d] transition-colors hover:bg-[#e3ca96]', ring, className)}
    >
      {added ? 'Added ✓' : '+ Cart'}
    </motion.button>
  )
}

function WishlistButton({ book, on, onToggle, className }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => onToggle?.(book)}
      aria-pressed={on}
      aria-label={`${on ? 'Remove' : 'Add'} ${book.title} ${on ? 'from' : 'to'} wishlist`}
      className={cx(
        'rounded-[2px] border font-sans text-[11px] transition-colors',
        on ? 'border-brass-300 bg-[#5b4230] text-cream-100' : 'border-brass-600 bg-walnut-800 text-[#e9d6b6] hover:border-brass-300',
        ring,
        className,
      )}
    >
      {on ? '♥ Wishlisted' : 'Wishlist'}
    </motion.button>
  )
}

/* ───────────────────────────── genre spines ───────────────────────────── */

function GenreSpines({ genres, mobile, active, setActive, onOpen, reduce }) {
  const W = mobile ? 59 : 110
  const STEP = mobile ? 63 : 119
  const X0 = mobile ? 9 : 25
  const box = mobile
    ? { left: 61, top: 382, width: 267, height: 176, perspective: 700 }
    : { left: 245, top: 213, width: 772, height: 275, perspective: 1100 }

  return (
    <div className="absolute" style={{ ...box, perspectiveOrigin: '50% 70%' }}>
      {genres.map((g, i) => {
        const isActive = active === g.id
        const dimmed = active && !isActive
        const h = mobile ? g.height.mobile : g.height.desktop
        const rest = {
          z: 0, y: 0, rotateY: 0, scale: 1, filter: 'brightness(1)',
          boxShadow: mobile ? '3px 2px 4px rgba(0,0,0,0.4)' : '5px 3px 6px rgba(0,0,0,0.5)',
        }
        const lift = reduce
          ? { filter: 'brightness(1.08)' }
          : { z: mobile ? 30 : 52, y: -8, rotateY: -16, scale: 1.02, filter: 'brightness(1.07)', boxShadow: '14px 16px 22px rgba(0,0,0,0.6)' }
        const pose = isActive ? lift : dimmed ? { ...rest, filter: 'brightness(0.78)' } : rest

        return (
          <motion.button
            key={g.id}
            type="button"
            aria-haspopup="dialog"
            aria-label={`${g.name}, open the shelf`}
            animate={pose}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={
              reduce
                ? { duration: 0 }
                : { default: { type: 'spring', stiffness: 240, damping: 20, mass: 0.8 }, filter: { duration: 0.25 }, boxShadow: { duration: 0.25 } }
            }
            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(g.id)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
            onFocus={() => setActive(g.id)}
            onBlur={() => setActive(null)}
            onClick={(e) => onOpen(g.id, i, e.currentTarget)}
            className={cx('absolute bottom-0 block rounded-[3px] text-left', ring)}
            style={{
              left: X0 + STEP * i,
              width: W,
              height: h,
              background: mobile ? g.spine.flat : `linear-gradient(to right, ${g.spine.from}, ${g.spine.to})`,
              transformStyle: 'preserve-3d',
              transformOrigin: '0% 50%',
              zIndex: isActive ? 10 : 1,
            }}
          >
            <i className="absolute top-0 block h-full bg-[#5f4428]/25" style={{ left: mobile ? 3 : 5, width: mobile ? 3 : 4 }} />
            <i className="absolute block h-px" style={{ background: g.spine.rule, left: mobile ? 8 : 13, width: mobile ? 43 : 84, top: mobile ? 24 : 30 }} />
            <i className="absolute block h-px" style={{ background: g.spine.rule, left: mobile ? 8 : 13, width: mobile ? 43 : 84, bottom: mobile ? 13 : 24 }} />
            <span className={cx('absolute inset-x-0 text-center font-sans', mobile ? 'top-2 text-[9px]' : 'top-[10px] text-[12px]')} style={{ color: g.spine.numeral }}>
              {g.number}
            </span>
            <span
              className="absolute inset-x-0 flex items-center justify-center whitespace-nowrap font-display [writing-mode:vertical-rl]"
              style={{ top: mobile ? 32 : 34, bottom: mobile ? 16 : 28, color: g.spine.ink, fontSize: mobile ? 14 : 19, lineHeight: 1 }}
            >
              {g.name}
            </span>
            {!mobile && (
              <span className="absolute inset-x-0 bottom-[7px] text-center font-sans text-[9px] tracking-[0.14em]" style={{ color: '#3a3025' }}>
                EXPLORE
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ───────────────────────────── shelf dressing (from Figma) ───────────────────────────── */

// [left, top, height, colour, label] — bottom row of the desktop bookcase, all rest on y = 747
const VOLUMES_DESKTOP = [
  [269, 601, 146, '#655942', 'ESSAYS'], [312, 578, 169, '#8c6042', 'IDEAS'], [355, 555, 192, '#4b5245', 'WONDER'],
  [398, 595, 152, '#926347', 'DISCOVERY'], [441, 572, 175, '#54483c', 'ESSAYS'], [484, 549, 198, '#706443', 'IDEAS'],
  [527, 589, 158, '#a28052', 'WONDER'], [570, 566, 181, '#4d5b58', 'DISCOVERY'], [613, 543, 204, '#705342', 'ESSAYS'],
  [656, 583, 164, '#4b4636', 'IDEAS'], [699, 560, 187, '#8a693f', 'WONDER'],
]
// [height, colour] — mobile row, 24px wide, 27px pitch from x = 71, resting on y = 745
const VOLUMES_MOBILE = [
  [93, '#5c5c43'], [106, '#8d6746'], [119, '#9b7746'], [132, '#4e5a51'], [95, '#5c5c43'],
  [108, '#8d6746'], [121, '#9b7746'], [134, '#4e5a51'], [97, '#5c5c43'],
]

function DesktopVolumes() {
  return (
    <>
      {VOLUMES_DESKTOP.map(([left, top, h, c, label]) => (
        <div key={left} className="absolute w-[38px]" style={{ left, top, height: h, background: `linear-gradient(to right, ${c}, #30231a)` }}>
          <i className="absolute left-1 right-1 top-[13px] block h-[2px] bg-[#b99859]" />
          <i className="absolute bottom-[18px] left-1 right-1 block h-px bg-[#b99859]" />
          <span className="absolute left-3 top-[33px] font-sans text-[10px] tracking-[0.04em] text-[#d2b789] [writing-mode:vertical-rl]">{label}</span>
        </div>
      ))}
    </>
  )
}

function MobileVolumes() {
  return (
    <>
      {VOLUMES_MOBILE.map(([h, c], i) => (
        <div key={i} className="absolute w-6" style={{ left: 71 + 27 * i, top: 745 - h, height: h, background: c }}>
          <i className="absolute left-[3px] top-[9px] block h-px w-[18px] bg-[#c3a36c]" />
          <i className="absolute bottom-3 left-[3px] block h-px w-[18px] bg-[#c3a36c]" />
        </div>
      ))}
    </>
  )
}

/* ───────────────────────────── desktop scene ───────────────────────────── */

function DesktopBackdrop() {
  return (
    <>
      {/* wall — dusk-warm plaster, brighter under the lamp */}
      <div className="absolute" style={{ left: -3000, top: -3000, width: 7440, height: 3502, background: 'linear-gradient(to bottom, #382d23 0, #3b3026 2900px, #5b4837 3150px, #6a5441 3300px, #5a4636 3502px)' }} />
      <div className="absolute mix-blend-screen" style={{ left: -80, top: -60, width: 1234, height: 760, background: 'radial-gradient(ellipse at 50% 38%, rgba(255,208,146,0.26), rgba(255,208,146,0.08) 45%, transparent 70%)' }} />
      <div className="absolute mix-blend-screen" style={{ left: 60, top: 120, width: 520, height: 520, background: 'radial-gradient(circle at 25% 45%, rgba(232,140,84,0.16), transparent 65%)' }} />

      {/* chair rail, green wainscot, floor */}
      <div className="absolute" style={{ left: -3000, top: 498, width: 7440, height: 10, background: 'linear-gradient(to bottom, #6c5640, #3a2e22)', boxShadow: '0 4px 10px rgba(0,0,0,0.35)' }} />
      <div className="absolute" style={{ left: -3000, top: 508, width: 7440, height: 262, background: 'linear-gradient(to bottom, #2f3226, #25271e)' }} />
      <div className="absolute" style={{ left: 1164, top: 566, width: 212, height: 156, border: '3px solid #1f2119', background: '#2b2d23', boxShadow: 'inset 0 0 0 2px #383b2e, inset 0 8px 18px rgba(0,0,0,0.35)' }} />
      <div className="absolute" style={{ left: -172, top: 566, width: 212, height: 156, border: '3px solid #1f2119', background: '#2b2d23', boxShadow: 'inset 0 0 0 2px #383b2e, inset 0 8px 18px rgba(0,0,0,0.35)' }} />
      <div className="absolute" style={{ left: -3000, top: 770, width: 7440, height: 12, background: '#241a12', boxShadow: '0 -1px 0 #3a2c1e' }} />
      <div className="absolute" style={{ left: -3000, top: 782, width: 7440, height: 3000, background: 'linear-gradient(to bottom, #1e1710, #120d09 140px, #100b08)' }} />

      <svg className="absolute left-0 top-0 overflow-visible" width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
        <defs>
          <linearGradient id="ro-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2863" />
            <stop offset="0.28" stopColor="#34509a" />
            <stop offset="0.5" stopColor="#8a7fa8" />
            <stop offset="0.64" stopColor="#e59a63" />
            <stop offset="0.78" stopColor="#ee8d3d" />
          </linearGradient>
          <radialGradient id="ro-sun">
            <stop offset="0" stopColor="#ffaa5a" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffaa5a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="ro-glass"><rect x="-70" y="98" width="222" height="352" /></clipPath>
        </defs>

        {/* dusk window */}
        <g clipPath="url(#ro-glass)">
          <rect x="-70" y="98" width="222" height="352" fill="url(#ro-sky)" />
          <circle cx="64" cy="352" r="150" fill="url(#ro-sun)" />
          <g fill="#e9e2ff" opacity="0.6">
            <circle cx="-22" cy="128" r="1.2" /><circle cx="22" cy="150" r="1" /><circle cx="118" cy="132" r="1.3" /><circle cx="92" cy="176" r="0.9" />
          </g>
          <path d="M-70 392 L-18 366 L30 386 L84 352 L152 384 V450 H-70 Z" fill="#4a3d72" />
          <path d="M-70 428 L22 402 L76 420 L152 398 V450 H-70 Z" fill="#2b2751" />
        </g>
        <g fill="#2a2018">
          <rect x="-80" y="88" width="242" height="10" /><rect x="-80" y="450" width="242" height="10" />
          <rect x="152" y="88" width="10" height="372" /><rect x="43" y="98" width="6" height="352" />
          <rect x="-70" y="225" width="222" height="7" /><rect x="-70" y="344" width="222" height="7" />
        </g>
        <path d="M-70 98H152V450" fill="none" stroke="#4a3a2a" strokeWidth="1" />
        <rect x="-90" y="460" width="270" height="18" fill="#3a2d20" />
        <rect x="-90" y="460" width="270" height="2" fill="#6f5a42" />
        <rect x="-90" y="478" width="270" height="8" fill="#000" opacity="0.18" />

        {/* kinetic mobile */}
        <g stroke="#b08b58" strokeWidth="1.4" fill="none">
          <path d="M268 92 H420" /><path d="M268 92 V121" /><path d="M356 92 V130" /><path d="M416 92 V116" />
        </g>
        <circle cx="270" cy="124" r="13" fill="#e8693a" />
        <circle cx="356" cy="139" r="9" fill="#e6d3a8" />
        <circle cx="416" cy="121" r="5" fill="#3a3a3a" />

        {/* reed diffuser + clock on the cornice */}
        <g stroke="#a07a45" strokeWidth="1.4" strokeLinecap="round">
          <path d="M731 134 716 88" /><path d="M731 134 722 80" /><path d="M731 134 729 76" /><path d="M731 134 737 78" /><path d="M731 134 745 82" /><path d="M731 134 751 92" />
        </g>
        <path d="M717 159 C713 148 719 140 724 134 H738 C743 140 749 148 745 159 Z" fill="#27332e" />
        <ellipse cx="731" cy="134" rx="7" ry="2" fill="#0f1512" />
        <circle cx="840" cy="133" r="26" fill="#d9c9a4" stroke="#b08b58" strokeWidth="3" />
        <g stroke="#2a2118" strokeLinecap="round">
          <path d="M840 133 V117" strokeWidth="2" /><path d="M840 133 L853 126" strokeWidth="1.6" />
          <path d="M840 110 V113 M863 133 H860 M840 156 V153 M817 133 H820" strokeWidth="1.2" />
        </g>

        {/* rug */}
        <polygon points="-200,900 80,818 1360,818 1640,900" fill="#261c13" opacity="0.9" />
        <path d="M80 818 H1360" stroke="#3a2b1c" strokeWidth="2" />
      </svg>
    </>
  )
}

function DesktopBookcase() {
  return (
    <>
      <div className="absolute" style={{ left: 185, top: 159, width: 892, height: 656, boxShadow: '0 0 90px rgba(0,0,0,0.5)' }} />
      {/* interior */}
      <div className="absolute" style={{ left: 245, top: 213, width: 772, height: 535, background: 'linear-gradient(to bottom, #1b130e, #4c2c18)', boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.6)' }} />
      {/* pillars */}
      <div className="absolute" style={{ left: 185, top: 200, width: 60, height: 548, background: 'linear-gradient(to right, #2c180e, #5b3822 55%, #3a2214)' }} />
      <div className="absolute" style={{ left: 1017, top: 200, width: 60, height: 548, background: 'linear-gradient(to left, #2c180e, #5b3822 55%, #3a2214)' }} />
      <div className="absolute" style={{ left: 243, top: 213, width: 2, height: 535, background: '#7a5030', opacity: 0.6 }} />
      <div className="absolute" style={{ left: 1017, top: 213, width: 2, height: 535, background: '#7a5030', opacity: 0.4 }} />
      {/* cornice */}
      <div className="absolute" style={{ left: 158, top: 158, width: 946, height: 32, borderRadius: 2, background: 'linear-gradient(to bottom, #a06c3f, #6a4126 40%, #3d2314)', boxShadow: '0 10px 22px rgba(0,0,0,0.55)' }} />
      <div className="absolute" style={{ left: 158, top: 158, width: 946, height: 2, background: '#c79a62' }} />
      <div className="absolute" style={{ left: 170, top: 190, width: 922, height: 10, background: 'linear-gradient(to bottom, #3a2214, #24150c)' }} />
      {/* plinth */}
      <div className="absolute" style={{ left: 175, top: 748, width: 912, height: 68, background: 'linear-gradient(to bottom, #4b2c19, #2a180e)', boxShadow: '0 14px 26px rgba(0,0,0,0.6)' }} />
      <div className="absolute" style={{ left: 175, top: 748, width: 912, height: 2, background: '#7a5030' }} />
      <div className="absolute" style={{ left: 245, top: 745, width: 772, height: 5, background: '#5a3820' }} />
      {/* polished middle shelf + brass rule, centre divider */}
      <div className="absolute" style={{ left: 245, top: 488, width: 772, height: 15, background: 'linear-gradient(to bottom, #8c5933, #321d13)' }} />
      <div className="absolute" style={{ left: 245, top: 488, width: 772, height: 1, background: '#a67443' }} />
      <div className="absolute" style={{ left: 773, top: 213, width: 16, height: 535, background: '#58341f' }} />
      <div className="absolute" style={{ left: 773, top: 213, width: 2, height: 535, background: '#87603a' }} />

      <DesktopVolumes />

      {/* reading note */}
      <div className="absolute" style={{ left: 823, top: 319, width: 145, height: 165, background: '#9e7746', boxShadow: '4px 5px 8px rgba(0,0,0,0.5)' }} />
      <div className="absolute" style={{ left: 830, top: 326, width: 131, height: 151, background: '#e7d8b9' }}>
        <p className="absolute left-5 top-[27px] font-display text-[26px] leading-[31px] text-[#494535]">A world<br />within<br />reach.</p>
        <p className="absolute left-4 top-[122px] font-sans text-[8px] tracking-[0.14em] text-[#6b5e46]">READING OCEAN</p>
      </div>

      {/* resting volumes */}
      <div className="absolute" style={{ left: 805, top: 734, width: 181, height: 15, background: '#b29460', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      <div className="absolute" style={{ left: 820, top: 705, width: 160, height: 28, background: '#5f6048' }}>
        <span className="absolute left-[13px] top-[7px] font-sans text-[9px] tracking-[0.12em] text-[#e3d0a6]">THE ART OF READING</span>
      </div>
    </>
  )
}

function DesktopLamp({ dimmed, reduce }) {
  // Shade, cord and warm lip — drawn above the nav bar, exactly as the Figma frame hangs it.
  return (
    <motion.div className="absolute inset-0" animate={{ filter: dimmed ? 'brightness(0.5)' : 'brightness(1)' }} transition={{ duration: reduce ? 0 : 0.5 }}>
      <svg className="absolute left-0 top-0 overflow-visible" width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
        <defs>
          <radialGradient id="ro-bulb"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.7" stopColor="#ffe3a8" /><stop offset="1" stopColor="#ffc872" /></radialGradient>
          <linearGradient id="ro-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2c2824" /><stop offset="0.45" stopColor="#151413" /><stop offset="1" stopColor="#0c0b0b" /></linearGradient>
        </defs>
        <line x1="537" y1="-3000" x2="537" y2="40" stroke="#1a1612" strokeWidth="1.5" />
        <rect x="529" y="30" width="16" height="14" rx="2" fill="#14110e" />
        <path d="M522 44 H552 L630 90 A93 11 0 0 1 444 90 Z" fill="url(#ro-shade)" />
        <ellipse cx="537" cy="90" rx="93" ry="11" fill="url(#ro-bulb)" stroke="#3a352e" strokeWidth="1" />
        {!dimmed && (
          <g>
            <line x1="537" y1="101" x2="537" y2="207" stroke="#cdbf9f" strokeWidth="0.8" opacity="0.8" />
            <circle cx="537" cy="211" r="3" fill="#cdbf9f" />
          </g>
        )}
      </svg>
      <motion.div
        className="absolute mix-blend-screen"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        style={{ left: 407, top: 70, width: 260, height: 60, background: 'radial-gradient(ellipse at 50% 30%, rgba(255,226,170,0.75), transparent 70%)', filter: 'blur(8px)' }}
      />
    </motion.div>
  )
}

function LightCone({ reduce, left, top, width, height, topLeftPct, topRightPct }) {
  return (
    <motion.div
      className="pointer-events-none absolute mix-blend-screen"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, delay: 0.2, ease: 'easeOut' }}
      style={{ left, top, width, height, filter: 'blur(14px)' }}
    >
      <div
        className="h-full w-full"
        style={{
          clipPath: `polygon(${topLeftPct}% 0, ${topRightPct}% 0, 100% 100%, 0 100%)`,
          background: 'linear-gradient(to bottom, rgba(255,222,160,0.34) 0%, rgba(255,205,130,0.14) 45%, rgba(255,205,130,0) 100%)',
        }}
      />
    </motion.div>
  )
}

/* ───────────────────────────── desktop showcase ───────────────────────────── */

const listV = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.22 } } }
const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

function SectionHeading({ n, title, note, top, noteRight }) {
  return (
    <>
      <div className="absolute left-[34px] h-[30px]" style={{ top }}>
        <span className="absolute left-0 top-[7px] font-sans text-[11px] text-brass-400">{n}</span>
        <h3 className="absolute left-[33px] top-0 whitespace-nowrap font-display text-[25px] leading-[30px] text-[#f0debd]">{title}</h3>
      </div>
      <p className="absolute font-sans text-[10px] text-[#d0ba95]" style={{ right: noteRight, top: top + 11 }}>{note}</p>
    </>
  )
}

function Showcase({ genre, origin, onClose, closeRef, wishlist, onAdd, onToggleWishlist, onSelect }) {
  const recs = genre.books.filter((b) => b.isRecommended)
  const rest = genre.books.filter((b) => !b.isRecommended)
  const titleBtn = 'text-left transition-colors hover:text-white'

  return (
    <motion.section
      role="dialog"
      aria-modal="true"
      aria-labelledby="showcase-title"
      className="absolute z-40"
      style={{ left: 134, top: 113, width: 1172, height: 720, transformOrigin: origin }}
      initial={{ opacity: 0, scale: 0.9, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 12 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="absolute inset-0 rounded-[4px]" style={{ background: 'linear-gradient(to bottom, #6a472d, #2a1c14)', boxShadow: '0 18px 35px rgba(0,0,0,0.6)' }} />
      <div className="absolute left-4 top-[14px] h-[690px] w-[1140px] overflow-hidden" style={{ background: 'linear-gradient(to bottom, #58402a, #2b2118)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,205,140,0.16), transparent 70%)' }} />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#b08b58]" />

        <p className="absolute left-[34px] top-[21px] whitespace-pre font-sans text-[10px] tracking-[0.1em] text-[#d4bc94]">
          {`THE SHELVES   /   ${genre.name.toUpperCase()}`}
        </p>
        <h2 id="showcase-title" className="absolute left-[33px] top-[43px] font-display text-[45px] leading-[54px] text-cream-100">{genre.name}</h2>
        <p className="absolute left-[35px] top-[97px] font-sans text-[12px] text-[#d7c4a5]">{genre.tagline}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className={cx('absolute right-[31px] top-5 h-[31px] w-[72px] rounded-[2px] border border-brass-600 bg-walnut-800 font-sans text-[11px] text-[#e9d6b6] transition-colors hover:border-brass-300', ring)}
        >
          × Close
        </button>

        {/* 01 · Curated Recommendations */}
        <SectionHeading n="01" title="Curated Recommendations" note="A good place to begin" top={138} noteRight={124} />
        <motion.ul variants={listV} initial="hidden" animate="show" className="absolute left-[60px] top-[183px] grid w-[1064px] grid-cols-2">
          {recs.map((b, i) => (
            <motion.li key={b.id} variants={itemV} className="flex gap-[25px]">
              <CoverButton book={b} w={98} h={137} numeral={i + 1} onSelect={onSelect} />
              <div className="pt-[5px]">
                <p className="font-sans text-[9px] uppercase leading-[11px] tracking-[0.1em] text-[#d5b77c]">{b.tagline}</p>
                <button type="button" onClick={() => onSelect(b)} className={cx('mt-[11px] block font-display text-[27px] leading-[33px] text-[#f3e4c8]', titleBtn, ring)}>{b.title}</button>
                <p className="mt-[3px] font-sans text-[12px] leading-[15px] text-cream-500">{b.author}</p>
                <div className="mt-[22px] flex items-center">
                  <span className="w-[97px] font-display text-[20px] leading-6 text-[#f3e4c8]">₹{b.price}</span>
                  <CartButton book={b} onAdd={onAdd} className="mr-[10px] h-[31px] w-[86px]" />
                  <WishlistButton book={b} on={wishlist.has(b.id)} onToggle={onToggleWishlist} className="h-[31px] w-[104px]" />
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* the ledge between the two shelves */}
        <div className="absolute left-[21px] top-[336px] h-[15px] w-[1098px]" style={{ background: 'linear-gradient(to bottom, #a77a47, #392518)' }} />
        <div className="absolute left-[21px] top-[336px] h-px w-[1098px] bg-[#c09962]" />

        {/* 02 · Available to Purchase */}
        <SectionHeading n="02" title="Available to Purchase" note={`${String(rest.length).padStart(2, '0')} BOOKS`} top={368} noteRight={52} />
        <motion.ul variants={listV} initial="hidden" animate="show" className="absolute left-[45px] top-[414px] grid grid-cols-[repeat(4,244px)] gap-x-[28px]">
          {rest.map((b) => (
            <motion.li key={b.id} variants={itemV} className="w-[244px]">
              <div className="pl-[68px]"><CoverButton book={b} w={98} h={124} onSelect={onSelect} /></div>
              <button type="button" onClick={() => onSelect(b)} className={cx('mt-3 block h-12 text-left font-display text-[19px] leading-[23px] text-[#f3e3c5]', titleBtn, ring)}>{b.title}</button>
              <div className="flex h-[21px] items-center justify-between pr-[30px]">
                <span className="font-sans text-[10px] text-[#d3bfa0]">{b.author}</span>
                <span className="font-display text-[17px] text-[#f3e3c5]">₹{b.price}</span>
              </div>
              <div className="mt-[14px] flex gap-[10px]">
                <WishlistButton book={b} on={wishlist.has(b.id)} onToggle={onToggleWishlist} className="h-[31px] w-[116px]" />
                <CartButton book={b} onAdd={onAdd} className="h-[31px] w-[116px]" />
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  )
}

/* ───────────────────────────── desktop root ───────────────────────────── */

function Stage({ scale, offset, className, interactive, children }) {
  return (
    <div
      className={cx('absolute left-0 top-0 origin-top-left', interactive ? '' : 'pointer-events-none', className)}
      style={{ width: STAGE_W, height: STAGE_H, transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
    >
      {children}
    </div>
  )
}

function DesktopRoom({ vp, genres, cartCount, wishlist, openId, active, setActive, onOpen, close, closeRef, origin, reduce, onAdd, onToggleWishlist, onSelect }) {
  const scale = Math.min(vp.w / STAGE_W, vp.h / STAGE_H)
  const offset = { x: (vp.w - STAGE_W * scale) / 2, y: (vp.h - STAGE_H * scale) / 2 }
  const genre = genres.find((g) => g.id === openId)
  const open = Boolean(genre)

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#150f0a]">
      <Stage scale={scale} offset={offset} interactive className="z-0">
        <DesktopBackdrop />
        <DesktopBookcase />
        <div {...(open ? { inert: '' } : {})}>
          <GenreSpines genres={genres} active={active} setActive={setActive} onOpen={onOpen} reduce={reduce} />
        </div>
        <LightCone reduce={reduce} left={100} top={90} width={870} height={540} topLeftPct={39.5} topRightPct={60.9} />

        <p className="absolute left-[269px] top-[192px] whitespace-pre font-sans text-[9px] tracking-[0.1em] text-[#e5cca7]">{'01 — 04  /  EXPLORE THE SHELVES'}</p>

        <h1 className="absolute left-[1118px] top-[248px] w-[300px] font-display text-[65px] font-normal leading-[79px] text-[#f0debe]">Reading<br />Ocean</h1>
        <div className="absolute left-[1120px] top-[411px] h-px w-[63px] bg-[#d4b37a]" />
        <p className="absolute left-[1121px] top-[435px] w-[270px] font-display text-[16px] leading-[19px] text-cream-300">A quiet place.<br />An ocean of ideas.</p>
        <p className="absolute left-[1121px] top-[514px] w-[260px] font-sans text-[12px] leading-[15px] text-[#d9c7ac]">Choose a spine.<br />Find your next chapter.</p>

        {/* footer line */}
        {open ? (
          <>
            <button type="button" onClick={close} className={cx('absolute left-[134px] top-[852px] z-50 font-sans text-[12px] text-[#f1dec0] transition-colors hover:text-white', ring)}>← Back to the bookshelf</button>
            <p className="absolute left-[982px] top-[859px] z-50 font-sans text-[11px] text-[#e1cfb3]">Thoughtfully selected. Delivered to your door.</p>
          </>
        ) : (
          <>
            <p className="absolute left-[38px] top-[849px] font-sans text-[11px] tracking-[0.1em] text-cream-200">READING OCEAN</p>
            <p className="absolute left-[565px] top-[848px] font-sans text-[11px] text-[#ddcdb6]">Books to get lost in. Ideas to come home to.</p>
            <p className="absolute left-[1230px] top-[849px] whitespace-pre font-sans text-[10px] text-[#ddcdb6]">{'Curated with care  ·  India'}</p>
          </>
        )}

        <AnimatePresence>
          {open && (
            <motion.div key="dim" className="absolute z-30 bg-room-dim" style={{ left: -3000, top: -3000, width: 7440, height: 6900 }} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={close} />
          )}
          {open && (
            <Showcase key="showcase" genre={genre} origin={origin} onClose={close} closeRef={closeRef} wishlist={wishlist} onAdd={onAdd} onToggleWishlist={onToggleWishlist} onSelect={onSelect} />
          )}
        </AnimatePresence>
      </Stage>

      <Stage scale={scale} offset={offset} className="z-[55]">
        <DesktopLamp dimmed={open} reduce={reduce} />
      </Stage>
    </div>
  )
}

/* ───────────────────────────── mobile ───────────────────────────── */

function MobileScene({ genres, active, setActive, onOpen, reduce, inertBg }) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#17110b]" {...(inertBg ? { inert: '' } : {})}>
      <div className="relative left-1/2 -ml-[195px] h-[844px] w-[390px]">
        {/* wall, rail, wainscot, floor */}
        <div className="absolute" style={{ left: -2000, top: -2000, width: 4390, height: 2505, background: 'linear-gradient(to bottom, #3a2f25 0, #3d3228 1950px, #6e5843 2200px, #5e4a39 2505px)' }} />
        <div className="absolute mix-blend-screen" style={{ left: -85, top: -40, width: 560, height: 600, background: 'radial-gradient(ellipse at 50% 42%, rgba(255,208,146,0.3), rgba(255,208,146,0.08) 50%, transparent 72%)' }} />
        <div className="absolute" style={{ left: -2000, top: 505, width: 4390, height: 8, background: 'linear-gradient(to bottom, #6c5640, #3a2e22)' }} />
        <div className="absolute" style={{ left: -2000, top: 513, width: 4390, height: 217, background: 'linear-gradient(to bottom, #2f3226, #25271e)' }} />
        <div className="absolute" style={{ left: -170, top: 530, width: 178, height: 190, border: '3px solid #1f2119', background: '#2b2d23', boxShadow: 'inset 0 0 0 2px #383b2e' }} />
        <div className="absolute" style={{ left: 382, top: 530, width: 178, height: 190, border: '3px solid #1f2119', background: '#2b2d23', boxShadow: 'inset 0 0 0 2px #383b2e' }} />
        <div className="absolute" style={{ left: -2000, top: 730, width: 4390, height: 10, background: '#241a12' }} />
        <div className="absolute" style={{ left: -2000, top: 740, width: 4390, height: 3000, background: 'linear-gradient(to bottom, #1c150e, #100b08 120px)' }} />

        {/* pendant lamp */}
        <svg className="absolute left-0 top-0 overflow-visible" width="390" height="844" viewBox="0 0 390 844" aria-hidden="true">
          <defs>
            <radialGradient id="ro-m-bulb"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.7" stopColor="#ffe3a8" /><stop offset="1" stopColor="#ffc872" /></radialGradient>
            <linearGradient id="ro-m-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2c2824" /><stop offset="0.45" stopColor="#151413" /><stop offset="1" stopColor="#0c0b0b" /></linearGradient>
          </defs>
          <line x1="195" y1="-2000" x2="195" y2="58" stroke="#1a1612" strokeWidth="1.5" />
          <rect x="189" y="56" width="12" height="14" rx="2" fill="#14110e" />
          <path d="M188 70 H202 L250 150 A55 11 0 0 1 140 150 Z" fill="url(#ro-m-shade)" />
          <ellipse cx="195" cy="150" rx="55" ry="11" fill="url(#ro-m-bulb)" stroke="#3a352e" strokeWidth="1" />
        </svg>
        <LightCone reduce={reduce} left={-80} top={152} width={550} height={470} topLeftPct={40} topRightPct={60} />

        {/* heading */}
        <h1 className="absolute inset-x-0 top-[218px] text-center font-display text-[45px] font-normal leading-[54px] text-[#f4e4c4]">Reading Ocean</h1>
        <p className="absolute inset-x-0 top-[276px] text-center font-display text-[14px] leading-[17px] text-[#ead9bb]">A quiet place. An ocean of ideas.</p>
        <p className="absolute inset-x-0 top-[324px] text-center font-sans text-[9px] tracking-[0.14em] text-[#ebd6b0]">CHOOSE YOUR NEXT CHAPTER</p>

        {/* bookcase */}
        <div className="absolute" style={{ left: 33, top: 356, width: 324, height: 436, boxShadow: '0 0 60px rgba(0,0,0,0.5)' }} />
        <div className="absolute" style={{ left: 61, top: 382, width: 267, height: 362, background: 'linear-gradient(to bottom, #241a12, #53321e)', boxShadow: 'inset 0 8px 18px rgba(0,0,0,0.55)' }} />
        <div className="absolute" style={{ left: 33, top: 372, width: 28, height: 372, background: 'linear-gradient(to right, #2c180e, #5b3822 60%, #3a2214)' }} />
        <div className="absolute" style={{ left: 328, top: 372, width: 28, height: 372, background: 'linear-gradient(to left, #2c180e, #5b3822 60%, #3a2214)' }} />
        <div className="absolute" style={{ left: 28, top: 356, width: 334, height: 26, borderRadius: 2, background: 'linear-gradient(to bottom, #a06c3f, #6a4126 45%, #3d2314)', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }} />
        <div className="absolute" style={{ left: 28, top: 356, width: 334, height: 2, background: '#c79a62' }} />
        <div className="absolute" style={{ left: 36, top: 744, width: 318, height: 48, background: 'linear-gradient(to bottom, #4b2c19, #2a180e)', boxShadow: '0 10px 20px rgba(0,0,0,0.55)' }} />
        <div className="absolute" style={{ left: 36, top: 744, width: 318, height: 2, background: '#7a5030' }} />
        <div className="absolute" style={{ left: 61, top: 558, width: 267, height: 12, background: '#744c2f' }} />
        <div className="absolute" style={{ left: 61, top: 558, width: 267, height: 1, background: '#ab8252' }} />
        <MobileVolumes />
        <GenreSpines genres={genres} mobile active={active} setActive={setActive} onOpen={onOpen} reduce={reduce} />

        <p className="absolute inset-x-0 top-[803px] text-center font-display text-[13px] leading-[16px] text-[#e1ccab]">Books to get lost in.<br />Ideas to come home to.</p>
      </div>
    </div>
  )
}

function MobileCard({ book, rec, index, wishlist, onAdd, onToggleWishlist, onSelect }) {
  return (
    <motion.li variants={itemV} className="relative h-[178px] overflow-hidden rounded-[3px] border border-[#6d5235] bg-[#4a3726]">
      <div className="absolute left-3 top-4">
        <CoverButton book={book} w={89} h={139} compact numeral={rec ? index + 1 : undefined} shadow="4px 5px 7px rgba(0,0,0,0.45)" onSelect={onSelect} />
      </div>
      <button type="button" onClick={() => onSelect(book)} className={cx('absolute left-[115px] top-4 w-[225px] text-left font-display text-[22px] leading-[27px] text-[#f2e2c4]', ring)}>
        {book.title}
      </button>
      <p className="absolute left-[116px] top-[81px] font-sans text-[11px] text-[#d6be9c]">{book.author}</p>
      <p className="absolute left-[116px] top-[104px] font-display text-[20px] leading-6 text-[#f0dfc0]">₹{book.price}</p>
      <div className="absolute left-[116px] top-[135px] flex gap-[9px]">
        <CartButton book={book} onAdd={onAdd} className="h-[34px] w-[105px]" />
        <WishlistButton book={book} on={wishlist.has(book.id)} onToggle={onToggleWishlist} className="h-[34px] w-[109px]" />
      </div>
    </motion.li>
  )
}

function MobileHead({ n, title, note }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="font-sans text-[10px] text-[#c9a66d]">{n}</span>
        <h3 className="font-display text-[25px] leading-[30px] text-[#f0dfc0]">{title}</h3>
      </div>
      <p className="mt-[5px] font-sans text-[11px] text-[#cdb694]">{note}</p>
    </div>
  )
}

function MobileStore({ genre, onClose, closeRef, cartCount, wishlist, onAdd, onToggleWishlist, onSelect }) {
  const recs = genre.books.filter((b) => b.isRecommended)
  const rest = genre.books.filter((b) => !b.isRecommended)
  const cardProps = { wishlist, onAdd, onToggleWishlist, onSelect }
  return (
    <motion.section
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-title"
      className="fixed inset-0 z-[60] bg-[#392a1e]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="flex h-16 items-center bg-[#33372e] px-[10px]">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Back to the bookshelf" className={cx('grid h-11 w-11 place-items-center rounded-sm font-sans text-[21px] text-[#f2e4c9]', ring)}>←</button>
        <p className="ml-[3px] font-display text-[25px] leading-[30px] text-[#f1e2c4]">Reading Ocean</p>
        <p className="ml-auto flex items-center gap-[10px] pr-[18px] font-sans text-[12px] text-[#f2e4c9]">
          Cart
          <motion.span key={cartCount} initial={cartCount === 0 ? false : { scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }} className="grid h-[18px] w-[18px] place-items-center rounded-full bg-brass-300 text-[10px] text-[#30281d]">{cartCount}</motion.span>
        </p>
      </div>

      <div className="h-[calc(100svh-64px)] overflow-y-auto overscroll-contain">
        <div className="px-4 pb-10 pt-6">
          <p className="whitespace-pre px-1 font-sans text-[9px] tracking-[0.1em] text-[#ceaf79]">{`THE SHELVES  /  GENRE ${genre.number}`}</p>
          <h2 id="store-title" className="mt-[10px] px-1 font-display text-[36px] leading-[44px] text-[#f2e2c3]">{genre.name}</h2>
          <p className="mt-1 px-1 font-sans text-[12px] text-[#d5c3a5]">{genre.tagline}</p>
          <div className="mx-1 mt-4 h-px bg-[#90724b]" />

          <div className="mt-4 px-1"><MobileHead n="01" title="Curated Recommendations" note="A good place to begin" /></div>
          <motion.ul variants={listV} initial="hidden" animate="show" className="mt-[21px] space-y-[14px]">
            {recs.map((b, i) => <MobileCard key={b.id} book={b} rec index={i} {...cardProps} />)}
          </motion.ul>

          <div className="mt-4 h-[9px] bg-[#9a7143]" />
          <div className="h-1 bg-[#241b13]" />

          <div className="mt-[19px] px-1"><MobileHead n="02" title="Available to Purchase" note={`${numWord[rest.length] ?? rest.length} more ways to see the world`} /></div>
          <motion.ul variants={listV} initial="hidden" animate="show" className="mt-[21px] space-y-[14px]">
            {rest.map((b) => <MobileCard key={b.id} book={b} {...cardProps} />)}
          </motion.ul>

          <p className="mt-6 px-1 font-sans text-[10px] text-[#d9c09a]">Thoughtfully selected. Delivered to your door.</p>
        </div>
      </div>
    </motion.section>
  )
}

/* ───────────────────────────── public component ───────────────────────────── */

export default function BookshelfRoom({
  genres,
  cartCount = 0,
  wishlist = new Set(),
  onAddToCart,
  onToggleWishlist,
  onSelectBook,
  escapeDisabled = false,
}) {
  const vp = useViewport()
  const reduce = useReducedMotion()
  const mobile = vp.w < MOBILE_BP

  const [openId, setOpenId] = useState(null)
  const [active, setActive] = useState(null)
  const [origin, setOrigin] = useState('50% 50%')
  const returnFocus = useRef(null)
  const closeRef = useRef(null)

  const openGenre = useCallback((id, index, el) => {
    returnFocus.current = el
    setOrigin(`${25 + 119 * index + 55 + 245 - 134}px ${370 - 113}px`) // spine centre → showcase-local origin
    setActive(null)
    setOpenId(id)
  }, [])
  const close = useCallback(() => setOpenId(null), [])

  useEffect(() => {
    if (openId) {
      const t = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80)
      return () => clearTimeout(t)
    }
    returnFocus.current?.focus?.({ preventScroll: true })
  }, [openId])

  useEffect(() => {
    if (!openId || escapeDisabled) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, escapeDisabled, close])

  useEffect(() => {
    if (!(openId && mobile)) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [openId, mobile])

  const genre = genres.find((g) => g.id === openId)
  const shared = { genres, cartCount, wishlist, onAdd: onAddToCart, onToggleWishlist, onSelect: onSelectBook }

  return (
    <>
      {mobile ? (
        <>
          <MobileScene genres={genres} active={active} setActive={setActive} onOpen={openGenre} reduce={reduce} inertBg={Boolean(genre)} />
          <AnimatePresence>
            {genre && <MobileStore key="mobile-store" genre={genre} onClose={close} closeRef={closeRef} {...shared} />}
          </AnimatePresence>
        </>
      ) : (
        <DesktopRoom vp={vp} openId={openId} active={active} setActive={setActive} onOpen={openGenre} close={close} closeRef={closeRef} origin={origin} reduce={reduce} {...shared} />
      )}
      {!(mobile && genre) && <NavBar compact={mobile} cartCount={cartCount} wishlistCount={wishlist.size} />}
    </>
  )
}
