import { useState } from 'react'
import { Modal, CloseButton, btnGhost, cx, ring } from './ui.jsx'
import { InvoiceScreen } from './Invoice.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { money2, paymentLabel, withTotals } from '../lib/checkout.js'

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function OrdersModal({ onClose }) {
  const { myOrders, user } = useStore()
  const [openId, setOpenId] = useState(null)
  const orders = myOrders.map(withTotals)
  const open = orders.find((o) => o.id === openId)

  if (open) {
    return (
      <Modal onClose={onClose} label={`Tax invoice ${open.id}`} panelClass="max-h-[94svh] max-w-[860px] overflow-y-auto rounded-[4px] border border-brass-600 bg-[#392a1e] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-[30px] leading-[34px] text-cream-100">Tax invoice</h2>
          <CloseButton onClick={onClose} autoFocus />
        </div>
        <InvoiceScreen
          key={open.id}
          order={open}
          actions={<button type="button" onClick={() => setOpenId(null)} className={cx(btnGhost, 'h-[38px] px-4', ring)}>← All orders</button>}
        />
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose} label="Past orders" panelClass="max-h-[86svh] max-w-[560px] overflow-hidden rounded-[4px] border border-brass-600 bg-[#392a1e] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
      <div className="flex max-h-[86svh] flex-col">
        <div className="flex items-start justify-between border-b border-[#6d5235] p-6">
          <div>
            <h2 className="font-display text-[30px] leading-[34px] text-cream-100">Past orders</h2>
            <p className="mt-1 font-sans text-[12px] text-cream-400">{user?.guest ? 'Guest orders on this device' : user?.email}</p>
          </div>
          <CloseButton onClick={onClose} autoFocus />
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-[24px] text-cream-100">No orders yet</p>
            <p className="mx-auto mt-2 max-w-[30ch] font-sans text-[12px] leading-[18px] text-cream-400">Orders you place from the cart will be listed here.</p>
            <button type="button" onClick={onClose} className={cx(btnGhost, 'mt-5 h-[34px] px-4', ring)}>Back to the shelves</button>
          </div>
        ) : (
          <ul className="space-y-4 overflow-y-auto p-6">
            {orders.map((o) => (
              <li key={o.id} className="rounded-[3px] border border-[#6d5235] bg-[#4a3726] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-sans text-[11px] tracking-[0.08em] text-brass-400">{o.id}</p>
                  <p className="font-sans text-[11px] text-cream-400">{fmtDate(o.placedAt)}</p>
                </div>
                <ul className="mt-3 space-y-[6px]">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[18px] leading-[22px] text-[#f2e2c4]">
                        {i.title}
                        {i.quantity > 1 && <span className="ml-2 font-sans text-[11px] text-cream-400">× {i.quantity}</span>}
                      </span>
                      <span className="shrink-0 font-sans text-[12px] text-cream-300">{money2(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between border-t border-[#6d5235] pt-3">
                  <span className="font-sans text-[11px] text-cream-400">Total incl. GST</span>
                  <span className="font-display text-[22px] text-cream-100">{money2(o.total)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-sans text-[11px] text-cream-400">{paymentLabel(o.payment)}</span>
                  <button type="button" onClick={() => setOpenId(o.id)} aria-label={`View invoice for order ${o.id}`} className={cx(btnGhost, 'h-[30px] shrink-0 px-3', ring)}>View invoice</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
