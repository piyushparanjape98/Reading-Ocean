import { useMemo, useState } from 'react'
import { Modal, CoverArt, cx, inputCls, money, ring } from './ui.jsx'
import { allBooks } from '../data/books.js'

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9₹ ]+/g, ' ').replace(/\s+/g, ' ').trim()

// Every typed word must appear somewhere in title, author or genre, so "kahneman slow" works.
const haystack = new Map(allBooks.map((b) => [b.id, norm(`${b.title} ${b.author} ${b.genreName}`)]))

export function searchBooks(query) {
  const words = norm(query).split(' ').filter(Boolean)
  if (!words.length) return []
  return allBooks
    .filter((b) => words.every((w) => haystack.get(b.id).includes(w)))
    .sort((a, b) => Number(norm(b.title).startsWith(words[0])) - Number(norm(a.title).startsWith(words[0])))
}

export default function SearchPanel({ onClose, onSelectBook }) {
  const [q, setQ] = useState('')
  const results = useMemo(() => searchBooks(q), [q])
  const typed = q.trim().length > 0

  return (
    <Modal onClose={onClose} label="Search books" placement="top" panelClass="max-w-[620px] overflow-hidden rounded-[4px] border border-brass-600 bg-[#392a1e] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
      <form role="search" onSubmit={(e) => { e.preventDefault(); if (results[0]) onSelectBook(results[0]) }} className="flex items-center gap-3 border-b border-[#6d5235] p-4">
        <label htmlFor="ro-search" className="sr-only">Search by title, author or genre</label>
        <input
          id="ro-search"
          data-autofocus
          type="search"
          autoComplete="off"
          placeholder="Search by title, author or genre"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={cx(inputCls, 'h-[42px] text-[14px]')}
        />
        <button type="button" onClick={onClose} className={cx('h-[31px] shrink-0 rounded-[2px] border border-brass-600 bg-walnut-800 px-3 font-sans text-[11px] text-[#e9d6b6] transition-colors hover:border-brass-300', ring)}>× Close</button>
      </form>

      <p className="px-5 pt-3 font-sans text-[11px] text-cream-400" role="status" aria-live="polite">
        {!typed ? `${allBooks.length} books across ${new Set(allBooks.map((b) => b.genreId)).size} shelves` : results.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : `No books match “${q.trim()}”`}
      </p>

      <ul className="max-h-[min(56svh,460px)] space-y-2 overflow-y-auto p-4">
        {(typed ? results : []).map((b) => (
          <li key={b.id}>
            <button type="button" onClick={() => onSelectBook(b)} className={cx('flex w-full items-center gap-4 rounded-[3px] border border-[#6d5235] bg-[#4a3726] p-3 text-left transition-colors hover:border-brass-300', ring)}>
              <CoverArt book={b} width={44} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[20px] leading-[23px] text-[#f2e2c4]">{b.title}</span>
                <span className="mt-[2px] block font-sans text-[11px] text-[#d6be9c]">{b.author} · {b.genreName}</span>
              </span>
              <span className="font-display text-[18px] text-[#f0dfc0]">{money(b.price)}</span>
            </button>
          </li>
        ))}
        {!typed && (
          <li className="px-1 pb-2 font-display text-[18px] leading-[26px] text-cream-300">
            Try “habits”, “Stoic”, “Kahneman” or “dune”.
          </li>
        )}
      </ul>
    </Modal>
  )
}
