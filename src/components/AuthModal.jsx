import { useState } from 'react'
import { motion } from 'framer-motion'
import { Modal, CloseButton, btnBrass, btnGhost, cx, inputCls, ring } from './ui.jsx'
import { useStore } from '../context/StoreContext.jsx'

/* Demo auth. Nothing is sent anywhere and the password is never stored: only a name and email
   are kept in localStorage so the navbar can greet you. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
const nameFromEmail = (email) => titleCase(email.split('@')[0].split(/[._+-]+/)[0] || 'Reader')

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-[6px] block font-sans text-[11px] tracking-[0.04em] text-cream-400">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-[6px] font-sans text-[11px] text-[#e8a28a]">{error}</p>}
    </div>
  )
}

export default function AuthModal({ onClose }) {
  const { login, accountName } = useStore()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const signup = mode === 'signup'

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (signup && !form.name.trim()) next.name = 'Tell us what to call you.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter an email like name@example.com.'
    if (!form.password) next.password = signup ? 'Choose a password.' : 'Enter your password.'
    else if (signup && form.password.length < 6) next.password = 'Use at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    const email = form.email.trim()
    login({ name: signup ? form.name : accountName(email) || nameFromEmail(email), email })
    onClose()
  }

  const tab = (id, text) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => { setMode(id); setErrors({}) }}
      className={cx('relative h-10 flex-1 font-display text-[20px] transition-colors', mode === id ? 'text-cream-100' : 'text-cream-400 hover:text-cream-200', ring)}
    >
      {text}
      {mode === id && <motion.span layoutId="auth-tab" className="absolute inset-x-6 bottom-0 h-px bg-brass-300" />}
    </button>
  )

  return (
    <Modal onClose={onClose} label="Sign in to Reading Ocean" panelClass="max-w-[400px] rounded-[4px] border border-brass-600 bg-[#392a1e] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-[30px] leading-[34px] text-cream-100">{signup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-1 font-sans text-[12px] text-cream-400">{signup ? 'Keep your wishlist and orders in one place.' : 'Pick up where you left off.'}</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div role="tablist" aria-label="Account" className="mt-5 flex border-b border-[#6d5235]">
        {tab('signin', 'Sign in')}
        {tab('signup', 'Create account')}
      </div>

      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        {signup && (
          <Field id="auth-name" label="Name" error={errors.name}>
            <input id="auth-name" data-autofocus className={inputCls} autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'auth-name-err' : undefined} />
          </Field>
        )}
        <Field id="auth-email" label="Email" error={errors.email}>
          <input id="auth-email" data-autofocus={signup ? undefined : ''} type="email" className={inputCls} autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'auth-email-err' : undefined} />
        </Field>
        <Field id="auth-password" label="Password" error={errors.password}>
          <input id="auth-password" type="password" className={inputCls} autoComplete={signup ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'auth-password-err' : undefined} />
        </Field>
        <button type="submit" className={cx(btnBrass, 'h-[42px] w-full text-[13px]', ring)}>{signup ? 'Create account' : 'Sign in'}</button>
      </form>

      <div className="my-4 flex items-center gap-3 font-sans text-[11px] text-cream-400">
        <span className="h-px flex-1 bg-[#6d5235]" />or<span className="h-px flex-1 bg-[#6d5235]" />
      </div>
      <button type="button" onClick={() => { login({ name: 'Guest', guest: true }); onClose() }} className={cx(btnGhost, 'h-[42px] w-full text-[13px]', ring)}>
        Continue as guest
      </button>
      <p className="mt-4 font-sans text-[11px] leading-[16px] text-cream-400">Demo only: nothing is sent anywhere, and your password is never saved.</p>
    </Modal>
  )
}
