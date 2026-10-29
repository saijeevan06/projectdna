import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from 'lucide-react'
import { setInvitedUserPassword, type InviteRedirect } from './lib/authInvite'

export function InviteAcceptance({ redirect, onDone }: { redirect: Exclude<InviteRedirect, null>; onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [complete, setComplete] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('Those passwords do not match.')
      return
    }

    if (redirect.kind !== 'invite') return
    setBusy(true)
    try {
      await setInvitedUserPassword(redirect.accessToken, password)
      setComplete(true)
    } catch {
      setError('This invitation could not be completed. It may have expired or already been used. Ask the project owner for a fresh invitation.')
    } finally {
      setBusy(false)
    }
  }

  const expired = redirect.kind === 'error'
  const expiredMessage = redirect.kind === 'error' && ['otp_expired', 'invite_not_found'].includes(redirect.code)

  return <main className="invite-page">
    <div className="invite-card">
      <button className="back-button invite-back" type="button" onClick={onDone}><ArrowLeft size={15} /> Back to Project DNA</button>
      <div className="eyebrow"><span className="eyebrow-dot" /> PROJECT DNA ACCOUNT</div>
      {expired ? <>
        <h1>That invite link<br /><span className="serif-accent">has expired.</span></h1>
        <p className="hero-description">{expiredMessage ? 'This one-time invitation link has expired or was already used. Ask the Project DNA owner to send a fresh invite.' : 'This invitation link could not be verified. Ask the Project DNA owner to send a fresh invite.'}</p>
        <button className="continue-button" type="button" onClick={onDone}>Back to Project DNA <ArrowRight size={16} /></button>
      </> : complete ? <>
        <div className="invite-success-icon"><Check size={21} /></div>
        <h1>Your account is<br /><span className="serif-accent">ready.</span></h1>
        <p className="hero-description">Your password is set. You can now sign in to Project DNA. Admin dashboard access will work once the project database setup is complete.</p>
        <button className="continue-button" type="button" onClick={onDone}>Continue to Project DNA <ArrowRight size={16} /></button>
      </> : <>
        <h1>Set up your<br /><span className="serif-accent">account.</span></h1>
        <p className="hero-description">Choose a password to finish accepting your Project DNA invitation.</p>
        <form className="invite-password-form" onSubmit={(event) => void submit(event)}>
          <label className="field-label">NEW PASSWORD<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <label className="field-label">CONFIRM PASSWORD<input type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="continue-button" disabled={busy}>{busy ? 'Setting password…' : 'Finish account setup'} {!busy && <LockKeyhole size={15} />}</button>
          <p className="privacy-note">Use at least 8 characters. Your password is sent directly to Supabase Auth and is never stored in this app.</p>
        </form>
      </>}
    </div>
  </main>
}
