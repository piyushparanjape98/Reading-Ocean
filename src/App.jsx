import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import BookshelfRoom from './components/BookshelfRoom.jsx'
import BookSpreadModal from './components/BookSpreadModal.jsx'
import AuthModal from './components/AuthModal.jsx'
import WishlistDrawer from './components/WishlistDrawer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import OrdersModal from './components/OrdersModal.jsx'
import SearchPanel from './components/SearchPanel.jsx'
import { AboutModal, ContactModal } from './components/InfoModal.jsx'
import { StoreProvider, useStore } from './context/StoreContext.jsx'
import { genres } from './data/books.js'

function Store() {
  const { cartCount, wishlist, addToCart, toggleWishlist, user, logout, announcement } = useStore()
  const [panel, setPanel] = useState(null) // search | wishlist | cart | checkout | about | contact | login | orders
  const [book, setBook] = useState(null)

  const openPanel = useCallback((name) => () => setPanel(name), [])
  const closePanel = useCallback(() => setPanel(null), [])
  const closeBook = useCallback(() => setBook(null), [])
  const selectBook = useCallback((b) => {
    setPanel((p) => (p === 'search' ? null : p)) // the search sheet gives way to the book
    setBook(b)
  }, [])

  const wishSet = useMemo(() => new Set(wishlist), [wishlist])
  const nav = useMemo(
    () => ({
      user,
      onSearch: openPanel('search'),
      onWishlist: openPanel('wishlist'),
      onCart: openPanel('cart'),
      onAbout: openPanel('about'),
      onContact: openPanel('contact'),
      onLogin: openPanel('login'),
      onOrders: openPanel('orders'),
      onLogout: logout,
    }),
    [user, openPanel, logout],
  )

  return (
    <>
      <BookshelfRoom
        genres={genres}
        cartCount={cartCount}
        wishlist={wishSet}
        onAddToCart={(b) => addToCart(b)}
        onToggleWishlist={toggleWishlist}
        onSelectBook={selectBook}
        escapeDisabled={Boolean(panel || book)}
        nav={nav}
      />

      <AnimatePresence>
        {panel === 'search' && <SearchPanel key="search" onClose={closePanel} onSelectBook={selectBook} />}
        {panel === 'wishlist' && <WishlistDrawer key="wishlist" onClose={closePanel} onSelectBook={selectBook} />}
        {panel === 'cart' && <CartDrawer key="cart" onClose={closePanel} onSelectBook={selectBook} onCheckout={openPanel('checkout')} />}
        {panel === 'checkout' && <CheckoutModal key="checkout" onClose={closePanel} onViewOrders={openPanel('orders')} />}
        {panel === 'about' && <AboutModal key="about" onClose={closePanel} />}
        {panel === 'contact' && <ContactModal key="contact" onClose={closePanel} />}
        {panel === 'login' && <AuthModal key="login" onClose={closePanel} />}
        {panel === 'orders' && <OrdersModal key="orders" onClose={closePanel} />}
        {book && <BookSpreadModal key="spread" book={book} onClose={closeBook} />}
      </AnimatePresence>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement?.text}</div>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Store />
    </StoreProvider>
  )
}
