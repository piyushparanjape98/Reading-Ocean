import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BookshelfRoom, { BookCover } from './components/BookshelfRoom.jsx'
import { genres } from './data/books.js'

/* Book detail drawer — opens from onSelectBook(book). Uses the same walnut + brass tokens. */
function BookDetail({ book, inCart, wished, onClose, onAdd, onToggleWishlist }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!book) return
    const t = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [book, onClose])

  return (
    <AnimatePresence>
      {book && (
        <motion.div key="detail" className="fixed inset-0 z-[70] flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <button type="button" aria-label="Close details" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-room-dim/70" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            className="relative mt-auto max-h-[88svh] w-full overflow-y-auto border-t border-brass-600 bg-[#392a1e] p-6 shadow-[0_-18px_35px_rgba(0,0,0,0.5)] md:mt-0 md:ml-auto md:max-h-none md:w-[420px] md:border-l md:border-t-0 md:p-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 h-[31px] w-[72px] rounded-[2px] border border-brass-600 bg-walnut-800 font-sans text-[11px] text-[#e9d6b6] outline-none transition-colors hover:border-brass-300 focus-visible:ring-2 focus-visible:ring-brass-300"
            >
              × Close
            </button>

            <p className="font-sans text-[10px] tracking-[0.1em] text-[#d4bc94]">{book.genreName.toUpperCase()}</p>
            <div className="mt-5 flex gap-5">
              <BookCover book={book} w={98} h={137} />
              <div className="pt-1">
                <h2 id="detail-title" className="font-display text-[30px] leading-[34px] text-cream-100">{book.title}</h2>
                <p className="mt-2 font-sans text-[12px] text-cream-500">{book.author}</p>
                <p className="mt-3 font-display text-[22px] text-[#f3e4c8]">₹{book.price}</p>
              </div>
            </div>

            <p className="mt-6 max-w-[52ch] font-display text-[19px] leading-[1.45] text-cream-300">{book.synopsis}</p>

            <div className="mt-7 flex gap-[10px]">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onAdd(book)}
                className="h-[38px] flex-1 rounded-[2px] bg-brass-300 font-sans text-[12px] text-[#2e281d] outline-none transition-colors hover:bg-[#e3ca96] focus-visible:ring-2 focus-visible:ring-brass-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#392a1e]"
              >
                {inCart ? `+ Cart (${inCart} in cart)` : '+ Cart'}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                aria-pressed={wished}
                onClick={() => onToggleWishlist(book)}
                className={`h-[38px] flex-1 rounded-[2px] border font-sans text-[12px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brass-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#392a1e] ${wished ? 'border-brass-300 bg-[#5b4230] text-cream-100' : 'border-brass-600 bg-walnut-800 text-[#e9d6b6] hover:border-brass-300'}`}
              >
                {wished ? '♥ Wishlisted' : 'Wishlist'}
              </motion.button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [cart, setCart] = useState({}) // { [bookId]: quantity }
  const [wishlist, setWishlist] = useState(() => new Set())
  const [selected, setSelected] = useState(null)
  const [announce, setAnnounce] = useState('')

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart])

  const addToCart = useCallback((book) => {
    setCart((c) => ({ ...c, [book.id]: (c[book.id] ?? 0) + 1 }))
    setAnnounce(`${book.title} added to cart`)
  }, [])

  const toggleWishlist = useCallback((book) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(book.id)) {
        next.delete(book.id)
        setAnnounce(`${book.title} removed from wishlist`)
      } else {
        next.add(book.id)
        setAnnounce(`${book.title} added to wishlist`)
      }
      return next
    })
  }, [])

  const closeDetail = useCallback(() => setSelected(null), [])

  return (
    <>
      <BookshelfRoom
        genres={genres}
        cartCount={cartCount}
        wishlist={wishlist}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        onSelectBook={setSelected}
        escapeDisabled={Boolean(selected)}
      />
      <BookDetail
        book={selected}
        inCart={selected ? cart[selected.id] : 0}
        wished={selected ? wishlist.has(selected.id) : false}
        onClose={closeDetail}
        onAdd={addToCart}
        onToggleWishlist={toggleWishlist}
      />
      <p role="status" aria-live="polite" className="sr-only">{announce}</p>
    </>
  )
}
