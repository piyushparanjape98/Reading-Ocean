import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { booksById } from '../data/books.js'
import { breakdown, newOrderId } from '../lib/checkout.js'

/* ────────────────────────────────────────────────────────────────────────────
   Reading Ocean · store state
   cart, wishlist, user and orders live in React state and are mirrored to
   localStorage. Everything is a demo: there is no server, and passwords are
   never stored (the auth screens only keep a name and email).
   ──────────────────────────────────────────────────────────────────────────── */

const KEYS = {
  cart: 'ro:cart',
  wishlist: 'ro:wishlist',
  user: 'ro:user',
  orders: 'ro:orders',
  accounts: 'ro:accounts',
}
const MAX_QTY = 99

// Storage can be missing or blocked (private windows, quota), so every call is guarded.
const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore: the app keeps working in memory */
  }
}

// The cart is saved as [{ id, quantity }] and re-hydrated against the catalogue,
// so a saved cart never carries stale titles or prices.
function loadCart() {
  const raw = read(KEYS.cart, [])
  if (!Array.isArray(raw)) return []
  return raw.flatMap((e) => {
    const book = booksById[e?.id]
    const quantity = Number.parseInt(e?.quantity, 10)
    return book && quantity > 0 ? [{ book, quantity: Math.min(quantity, MAX_QTY) }] : []
  })
}
function loadWishlist() {
  const raw = read(KEYS.wishlist, [])
  return Array.isArray(raw) ? [...new Set(raw.filter((id) => booksById[id]))] : []
}
function loadUser() {
  const u = read(KEYS.user, null)
  return u && typeof u.name === 'string' && u.name ? { name: u.name, email: String(u.email ?? ''), guest: Boolean(u.guest) } : null
}
function loadOrders() {
  const raw = read(KEYS.orders, [])
  return Array.isArray(raw) ? raw.filter((o) => o && Array.isArray(o.items) && typeof o.id === 'string') : []
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(loadCart)
  const [wishlist, setWishlist] = useState(loadWishlist)
  const [user, setUser] = useState(loadUser)
  const [orders, setOrders] = useState(loadOrders)
  const [accounts, setAccounts] = useState(() => read(KEYS.accounts, {}))
  const [note, setNote] = useState({ id: 0, text: '' })

  useEffect(() => write(KEYS.cart, cart.map(({ book, quantity }) => ({ id: book.id, quantity }))), [cart])
  useEffect(() => write(KEYS.wishlist, wishlist), [wishlist])
  useEffect(() => write(KEYS.user, user), [user])
  useEffect(() => write(KEYS.orders, orders), [orders])
  useEffect(() => write(KEYS.accounts, accounts), [accounts])

  // Screen-reader announcements; App renders the latest one in a live region.
  const announce = useCallback((text) => setNote((n) => ({ id: n.id + 1, text })), [])

  /* ── cart ── */
  const addToCart = useCallback(
    (book, quantity = 1) => {
      setCart((c) => {
        const i = c.findIndex((e) => e.book.id === book.id)
        if (i === -1) return [...c, { book, quantity: Math.min(quantity, MAX_QTY) }]
        return c.map((e, j) => (j === i ? { ...e, quantity: Math.min(e.quantity + quantity, MAX_QTY) } : e))
      })
      announce(`${book.title} added to cart`)
    },
    [announce],
  )
  const removeFromCart = useCallback((bookId) => setCart((c) => c.filter((e) => e.book.id !== bookId)), [])
  const updateQuantity = useCallback(
    (bookId, quantity) =>
      setCart((c) =>
        quantity <= 0
          ? c.filter((e) => e.book.id !== bookId)
          : c.map((e) => (e.book.id === bookId ? { ...e, quantity: Math.min(quantity, MAX_QTY) } : e)),
      ),
    [],
  )
  const clearCart = useCallback(() => setCart([]), [])

  /* ── wishlist (array of book ids) ── */
  const toggleWishlist = useCallback(
    (bookOrId) => {
      const id = typeof bookOrId === 'string' ? bookOrId : bookOrId?.id
      if (!booksById[id]) return
      const saved = wishlist.includes(id)
      setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))
      announce(`${booksById[id].title} ${saved ? 'removed from' : 'saved to'} wishlist`)
    },
    [wishlist, announce],
  )
  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist])
  const moveToCart = useCallback(
    (bookOrId) => {
      const id = typeof bookOrId === 'string' ? bookOrId : bookOrId?.id
      const book = booksById[id]
      if (!book) return
      setWishlist((w) => w.filter((x) => x !== id))
      addToCart(book)
    },
    [addToCart],
  )

  /* ── user (mock auth: name + email only) ── */
  const login = useCallback(
    ({ name, email = '', guest = false }) => {
      const clean = { name: name.trim(), email: email.trim().toLowerCase(), guest }
      setUser(clean)
      if (!guest && clean.email) setAccounts((a) => ({ ...a, [clean.email]: clean.name }))
      announce(guest ? 'Continuing as guest' : `Signed in as ${clean.name}`)
    },
    [announce],
  )
  const logout = useCallback(() => {
    setUser(null)
    announce('Signed out')
  }, [announce])
  const accountName = useCallback((email) => accounts[email.trim().toLowerCase()] ?? '', [accounts])

  /* ── orders ── */
  const owner = user?.email || 'guest'
  // draft: { items: [{ book, quantity }], customer: { name, email, phone, address }, payment: { method, detail } }
  // Card numbers, CVVs and UPI PINs are never passed in here: `payment.detail` is only a label such as "•••• 4242".
  const addOrder = useCallback(
    (draft) => {
      const items = draft.items.map(({ book, quantity }) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price, // price at the time of purchase
        quantity,
      }))
      const placed = new Date()
      const order = {
        id: newOrderId(orders.map((o) => o.id), placed),
        placedAt: placed.toISOString(),
        owner,
        items,
        ...breakdown(items),
        customer: draft.customer ?? null,
        payment: draft.payment ?? null,
      }
      setOrders((o) => [order, ...o])
      announce(`Order ${order.id} placed`)
      return order
    },
    [owner, orders, announce],
  )

  const value = useMemo(() => {
    const cartCount = cart.reduce((n, e) => n + e.quantity, 0)
    const cartTotal = cart.reduce((n, e) => n + e.book.price * e.quantity, 0)
    return {
      cart, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart,
      wishlist, toggleWishlist, isWishlisted, moveToCart,
      user, login, logout, accountName,
      orders, myOrders: orders.filter((o) => o.owner === owner), addOrder,
      announcement: note,
    }
  }, [cart, wishlist, user, orders, owner, note, addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist, isWishlisted, moveToCart, login, logout, accountName, addOrder])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
