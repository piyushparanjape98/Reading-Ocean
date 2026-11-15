import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CloseButton, CoverArt, HeartIcon, Modal, cx, money, ring } from './ui.jsx'
import { genres } from '../data/books.js'
import { useStore } from '../context/StoreContext.jsx'

/* A hardcover opened flat: cover + edition on the left leaf, story + purchase on the right.
   On phones the two leaves stack into one scrolling sheet. */

const PAPER_L = 'linear-gradient(to right, #eee1c4 0%, #e7d8b9 72%, #d3c097 100%)'
const PAPER_R = 'linear-gradient(to left, #eee1c4 0%, #e7d8b9 72%, #d3c097 100%)'
const GUTTER =
  'linear-gradient(to right, transparent, rgba(70,48,22,0.22) 38%, rgba(40,25,12,0.5) 50%, rgba(70,48,22,0.22) 62%, transparent)'
// stacked page edges give the block of paper some thickness
const PAGE_EDGE =
  '0 1px 0 #d9cba9, 0 2px 0 #c4b38a, 0 3px 0 #dccfae, 0 4px 0 #b9a77b, 0 5px 0 #d6c8a5, 0 6px 0 #a89668'

const INK = '#37372e'
const INK_SOFT = '#5a4e38'

function Detail({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#c9b88f] py-[7px] font-sans text-[12px]">
      <dt style={{ color: INK_SOFT }}>{label}</dt>
      <dd className="text-right" style={{ color: INK }}>{children}</dd>
    </div>
  )
}

export default function BookSpreadModal({ book, onClose }) {
  const { isWishlisted, toggleWishlist, addToCart, cart } = useStore()
  const reduce = useReducedMotion()
  const [wide] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const [added, setAdded] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const genre = genres.find((g) => g.id === book.genreId)
  const number = String(genre.books.indexOf(book) + 1).padStart(2, '0')
  const saved = isWishlisted(book.id)
  const inCart = cart.find((e) => e.book.id === book.id)?.quantity ?? 0
  const turn = wide && !reduce

  return (
    <Modal
      onClose={onClose}
      label={`${book.title} by ${book.author}`}
      z="z-[90]"
      panelClass="max-h-[94svh] max-w-[1000px] overflow-y-auto overflow-x-hidden [scrollbar-width:thin] md:overflow-visible"
    >
      {/* hardcover boards */}
      <div
        className="relative rounded-[10px] p-3 md:p-[14px]"
        style={{ background: 'linear-gradient(to bottom, #6a472d, #2a1c14)', boxShadow: '0 30px 70px rgba(0,0,0,0.65), inset 0 1px 0 #8c5933' }}
      >
        <div className="pointer-events-none absolute inset-[5px] rounded-[7px] border border-brass-500/50" />

        <div className="relative grid overflow-hidden rounded-[3px] md:grid-cols-2" style={{ boxShadow: PAGE_EDGE, perspective: 1800 }}>
          {/* ── left leaf ── */}
          <section aria-label="Cover and edition" className="relative px-7 pb-8 pt-9 md:px-11" style={{ background: PAPER_L }}>
            <p className="font-sans text-[10px] tracking-[0.14em]" style={{ color: INK_SOFT }}>HARDCOVER EDITION</p>
            <motion.div
              className="mx-auto mt-5 w-fit"
              initial={reduce ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <CoverArt book={book} width={190} />
            </motion.div>

            <dl className="mt-7">
              <Detail label="Author">{book.author}</Detail>
              <Detail label="Genre">{genre.name}</Detail>
              <Detail label="Format">Hardcover, cloth-bound</Detail>
              <Detail label="Language">English</Detail>
              <Detail label="Catalogue no.">RO-{genre.number}-{number}</Detail>
              <Detail label="Shelf">{book.isRecommended ? 'Curated recommendation' : 'Available to purchase'}</Detail>
            </dl>
            <p className="mt-5 font-display text-[14px] italic" style={{ color: INK_SOFT }}>ii</p>
          </section>

          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-14 -translate-x-1/2 md:block" style={{ background: GUTTER }} />

          {/* ── right leaf (turns in from the gutter) ── */}
          <motion.section
            aria-label="Story and purchase"
            className="relative flex flex-col px-7 pb-8 pt-9 md:px-11"
            style={{ background: PAPER_R, transformOrigin: '0% 50%' }}
            initial={turn ? { rotateY: -80, opacity: 0.2 } : { opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: turn ? 0.7 : 0.3, delay: turn ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <CloseButton onClick={onClose} autoFocus className="absolute right-5 top-5 !border-[#8c6f45] !bg-transparent !text-[#3a2819] hover:!border-[#3a2819]" />

            <p className="font-sans text-[10px] tracking-[0.14em]" style={{ color: INK_SOFT }}>{genre.name.toUpperCase()}</p>
            <h2 className="mt-2 pr-20 font-display text-[36px] leading-[40px]" style={{ color: INK }}>{book.title}</h2>
            <p className="mt-2 font-sans text-[12px]" style={{ color: INK_SOFT }}>by {book.author}</p>
            <div className="my-5 h-px w-16 bg-[#a67443]" />

            <p className="font-display text-[19px] leading-[1.5] text-[#494535]">{book.synopsis}</p>

            <div className="mt-auto pt-8">
              <p className="font-display text-[32px] leading-none" style={{ color: INK }}>{money(book.price)}</p>

              <div className="mt-4 flex flex-wrap gap-[10px]">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={saved}
                  onClick={() => toggleWishlist(book.id)}
                  className={cx(
                    'flex h-[42px] items-center gap-2 rounded-[2px] border px-4 font-sans text-[12px] transition-colors',
                    saved ? 'border-[#8c3b2a] bg-[#8c3b2a]/10 text-[#8c3b2a]' : 'border-[#8c6f45] text-[#3a2819] hover:border-[#3a2819]',
                    ring,
                  )}
                >
                  <motion.span key={String(saved)} initial={saved ? { scale: 1.6 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }} className="grid place-items-center">
                    <HeartIcon filled={saved} size={18} />
                  </motion.span>
                  {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    addToCart(book)
                    setAdded(true)
                    clearTimeout(timer.current)
                    timer.current = setTimeout(() => setAdded(false), 1300)
                  }}
                  className={cx('h-[42px] min-w-[132px] rounded-[2px] border border-[#a67443] bg-[#3a2819] px-5 font-sans text-[12px] text-cream-100 transition-colors hover:bg-[#4b3422]', ring)}
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </motion.button>
              </div>
              <p className="mt-3 h-4 font-sans text-[11px]" style={{ color: INK_SOFT }}>{inCart > 0 ? `${inCart} in your cart` : ''}</p>
            </div>
            <p className="mt-4 text-right font-display text-[14px] italic" style={{ color: INK_SOFT }}>iii</p>
          </motion.section>
        </div>
      </div>
    </Modal>
  )
}
