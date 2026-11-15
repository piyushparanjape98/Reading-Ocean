import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Drawer, CoverArt, btnBrass, btnGhost, cx, money, ring } from './ui.jsx'
import { useStore } from '../context/StoreContext.jsx'

function Stepper({ book, quantity, onChange }) {
  const b = 'grid h-[28px] w-[28px] place-items-center font-sans text-[14px] text-cream-200 transition-colors hover:bg-walnut-800 hover:text-cream-100'
  return (
    <div className="flex items-center rounded-[2px] border border-brass-600" role="group" aria-label={`Quantity of ${book.title}`}>
      <button type="button" aria-label={`Decrease quantity of ${book.title}`} onClick={() => onChange(quantity - 1)} className={cx(b, ring)}>−</button>
      <span className="w-8 text-center font-sans text-[12px] tabular-nums text-cream-100" aria-live="polite">{quantity}</span>
      <button type="button" aria-label={`Increase quantity of ${book.title}`} onClick={() => onChange(quantity + 1)} className={cx(b, ring)}>+</button>
    </div>
  )
}

export default function CartDrawer({ onClose, onSelectBook, onViewOrders }) {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart, addOrder } = useStore()
  const [placed, setPlaced] = useState(null)

  const checkout = () => {
    // Demo checkout: records the order locally. No payment is taken.
    setPlaced(addOrder({ items: cart }))
    clearCart()
  }

  if (placed) {
    return (
      <Drawer onClose={onClose} label="Order placed" title="Order placed">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="font-display text-[30px] leading-[34px] text-cream-100">Thank you.</p>
          <p className="mt-2 font-sans text-[12px] leading-[18px] text-cream-400">
            Order <span className="text-cream-200">{placed.id}</span> · {money(placed.total)}
            <br />
            This is a demo store, so nothing was charged or shipped.
          </p>
          <div className="mt-6 flex gap-2">
            <button type="button" data-autofocus onClick={() => { onClose(); onViewOrders() }} className={cx(btnBrass, 'h-[36px] px-4', ring)}>View past orders</button>
            <button type="button" onClick={onClose} className={cx(btnGhost, 'h-[36px] px-4', ring)}>Keep browsing</button>
          </div>
        </div>
      </Drawer>
    )
  }

  return (
    <Drawer onClose={onClose} label="Cart" title="Your cart">
      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="font-display text-[26px] leading-[30px] text-cream-100">Your cart is empty</p>
          <p className="mt-2 max-w-[28ch] font-sans text-[12px] leading-[18px] text-cream-400">Pick a spine, find a book, and it will wait for you here.</p>
          <button type="button" data-autofocus onClick={onClose} className={cx(btnGhost, 'mt-5 h-[34px] px-4', ring)}>Back to the shelves</button>
        </div>
      ) : (
        <>
          <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <AnimatePresence initial={false}>
              {cart.map(({ book: b, quantity }) => (
                <motion.li key={b.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }} className="flex gap-4 rounded-[3px] border border-[#6d5235] bg-[#4a3726] p-3">
                  <button type="button" onClick={() => onSelectBook(b)} aria-label={`${b.title}, view details`} className={cx('shrink-0 self-start rounded-[2px]', ring)}>
                    <CoverArt book={b} width={56} />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <button type="button" onClick={() => onSelectBook(b)} className={cx('text-left font-display text-[19px] leading-[22px] text-[#f2e2c4] transition-colors hover:text-white', ring)}>{b.title}</button>
                    <p className="mt-1 font-sans text-[11px] text-[#d6be9c]">{b.author} · {money(b.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <Stepper book={b} quantity={quantity} onChange={(q) => updateQuantity(b.id, q)} />
                      <p className="font-display text-[18px] text-[#f0dfc0]">{money(b.price * quantity)}</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(b.id)} className={cx('mt-2 self-start font-sans text-[11px] text-cream-400 underline-offset-2 transition-colors hover:text-cream-100 hover:underline', ring)}>Remove</button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="space-y-3 border-t border-[#6d5235] p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-[12px] text-cream-400">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
              <p className="font-display text-[28px] leading-none text-cream-100">{money(cartTotal)}</p>
            </div>
            <button type="button" onClick={checkout} className={cx(btnBrass, 'h-[42px] w-full text-[13px]', ring)}>Place order</button>
            <button type="button" onClick={clearCart} className={cx(btnGhost, 'h-[34px] w-full', ring)}>Clear cart</button>
          </div>
        </>
      )}
    </Drawer>
  )
}
