import { AnimatePresence, motion } from 'framer-motion'
import { Drawer, CoverArt, btnBrass, btnGhost, cx, money, ring } from './ui.jsx'
import { booksById } from '../data/books.js'
import { useStore } from '../context/StoreContext.jsx'

export default function WishlistDrawer({ onClose, onSelectBook }) {
  const { wishlist, toggleWishlist, moveToCart } = useStore()
  const books = wishlist.map((id) => booksById[id]).filter(Boolean)

  return (
    <Drawer onClose={onClose} label="Wishlist" title="Wishlist">
      {books.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="font-display text-[26px] leading-[30px] text-cream-100">Nothing saved yet</p>
          <p className="mt-2 max-w-[28ch] font-sans text-[12px] leading-[18px] text-cream-400">
            Open a shelf, tap a book, and choose “Save to Wishlist”. It will wait for you here.
          </p>
          <button type="button" data-autofocus onClick={onClose} className={cx(btnGhost, 'mt-5 h-[34px] px-4', ring)}>Back to the shelves</button>
        </div>
      ) : (
        <>
          <p className="px-5 pt-4 font-sans text-[11px] text-cream-400" role="status">
            {books.length} {books.length === 1 ? 'book' : 'books'} saved
          </p>
          <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <AnimatePresence initial={false}>
              {books.map((b) => (
                <motion.li
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-4 rounded-[3px] border border-[#6d5235] bg-[#4a3726] p-3"
                >
                  <button type="button" onClick={() => onSelectBook(b)} aria-label={`${b.title}, view details`} className={cx('shrink-0 self-start rounded-[2px]', ring)}>
                    <CoverArt book={b} width={64} />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <button type="button" onClick={() => onSelectBook(b)} className={cx('text-left font-display text-[20px] leading-[23px] text-[#f2e2c4] transition-colors hover:text-white', ring)}>{b.title}</button>
                    <p className="mt-1 font-sans text-[11px] text-[#d6be9c]">{b.author}</p>
                    <p className="mt-1 font-display text-[18px] text-[#f0dfc0]">{money(b.price)}</p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <button type="button" onClick={() => moveToCart(b.id)} className={cx(btnBrass, 'h-[32px] flex-1', ring)}>Move to Cart</button>
                      <button type="button" onClick={() => toggleWishlist(b.id)} aria-label={`Remove ${b.title} from wishlist`} className={cx(btnGhost, 'h-[32px] px-3', ring)}>Remove</button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="border-t border-[#6d5235] p-5">
            <button type="button" onClick={() => books.forEach((b) => moveToCart(b.id))} className={cx(btnGhost, 'h-[38px] w-full text-[13px]', ring)}>Move all to cart</button>
          </div>
        </>
      )}
    </Drawer>
  )
}
