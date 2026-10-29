import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Compass, Github, Sparkles } from 'lucide-react'

type Path = 'improve' | 'discover' | null
type Profile = { branch: string; experience: string; technology: string; interests: string[]; time: string }

const profileQuestions = [
  { key: 'branch', title: 'What are you studying?', options: ['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'] },
  { key: 'experience', title: 'How would you describe your experience?', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'technology', title: 'Which technology do you prefer?', options: ['Python', 'Java', 'C++', 'JavaScript', 'No preference'] },
  { key: 'time', title: 'How much time can you spend?', options: ['1 day', '1 week', '1 month'] },
] as const
const interestOptions = ['Web development', 'AI', 'ML', 'Computer vision', 'NLP', 'IoT', 'Cybersecurity', 'Data analytics', 'Core engineering']

function App() {
  const [path, setPath] = useState<Path>(null)
  const [step, setStep] = useState<'context' | 'profile' | 'summary'>('context')
  const [githubUrl, setGithubUrl] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [profile, setProfile] = useState<Profile>({ branch: '', experience: '', technology: '', interests: [], time: '' })
  const [error, setError] = useState('')

  function startPath(nextPath: Exclude<Path, null>) {
    setPath(nextPath)
    setStep('context')
    setError('')
  }
  function changeStep(nextStep: typeof step) {
    setStep(nextStep)
    setError('')
  }
  function updateProfile(key: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }))
  }
  function toggleInterest(interest: string) {
    setProfile((current) => ({ ...current, interests: current.interests.includes(interest) ? current.interests.filter((item) => item !== interest) : [...current.interests, interest] }))
  }
  function continueFromContext() {
    if (path === 'discover' && !targetRole.trim()) {
      setError('Add a target role so the project ideas can be relevant to you.')
      return
    }
    if (path === 'improve' && !githubUrl.trim() && !projectDescription.trim()) {
      setError('Add a public GitHub link or describe your project to continue.')
      return
    }
    setError('')
    changeStep('profile')
  }
  function finishProfile() {
    if (!profile.branch || !profile.experience || !profile.technology || !profile.time || profile.interests.length === 0) {
      setError('Answer all five questions to shape your project suggestions.')
      return
    }
    changeStep('summary')
  }

  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setPath(null) }}>
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span>
          <span>project<span className="brand-light">dna</span></span>
        </a>
        <div className="topbar-right">
          <span className="nav-note">A better next step starts here</span>
          <a className="workshop-link" href="#workshop">Free AI workshop <ArrowUpRight size={15} /></a>
        </div>
      </nav>

      {!path ? (
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT PROJECT, FIGURED OUT</div>
            <h1>Make your next<br />move <span className="serif-accent">count.</span></h1>
            <p className="hero-description">You have the ambition. Let’s find the project that gets you closer to the role you want — or make the one you have stand out.</p>
            <div className="hero-proof"><div className="avatar-stack"><i>R</i><i>A</i><i>K</i><i>+</i></div><span>Built for curious builders, at every stage.</span></div>
          </div>
          <div className="path-panel">
            <div className="panel-heading"><span>CHOOSE YOUR STARTING POINT</span><span className="step-count">01 <b>/ 02</b></span></div>
            <button className="path-card" onClick={() => startPath('improve')}>
              <span className="path-icon purple"><Github size={20} /></span>
              <span className="path-text"><strong>I have a project</strong><small>Give it an AI-powered glow-up</small></span>
              <ArrowRight className="path-arrow" size={19} />
            </button>
            <button className="path-card" onClick={() => startPath('discover')}>
              <span className="path-icon green"><Compass size={20} /></span>
              <span className="path-text"><strong>I need an idea</strong><small>Find a project for the role I want</small></span>
              <ArrowRight className="path-arrow" size={19} />
            </button>
            <div className="panel-foot"><span className="sparkle-mini">✳</span> No perfect prompt needed. Just start where you are.</div>
          </div>
          <div className="floating-note"><span className="note-icon">✦</span><span><b>Small steps.</b><br />Real momentum.</span></div>
          <div className="hero-index">01 <span>—</span> YOUR NEXT CHAPTER</div>
        </section>
      ) : (
        <section className="intake-wrap">
          <button className="back-button" onClick={() => step === 'context' ? (setPath(null), setError('')) : changeStep(step === 'summary' ? 'profile' : 'context')}><ArrowLeft size={16} /> Back</button>
          <div className="intake-card">
            {step === 'context' && <>
              <div className="eyebrow"><span className="eyebrow-dot" /> FIRST, A LITTLE CONTEXT</div>
              <h1>{path === 'improve' ? <>Let’s meet your<br /><span className="serif-accent">project.</span></> : <>What do you want<br />to <span className="serif-accent">become?</span></>}</h1>
              <p className="hero-description">{path === 'improve' ? 'Share a public GitHub link or tell us what you’ve been building. We’ll help you spot its next move.' : 'Tell us the role you’re aiming for. We’ll find project ideas that help you build toward it.'}</p>
              {path === 'improve' ? <>
                <label className="field-label">PUBLIC GITHUB REPOSITORY <span>OPTIONAL</span><div className="input-wrap"><Github size={18} /><input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/you/your-project" /></div></label>
                <label className="field-label">WHAT DOES IT DO?<textarea rows={3} value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="A couple of sentences is plenty. You can paste a README later, too." /></label>
              </> : <label className="field-label">ROLE YOU’RE AIMING FOR<div className="input-wrap"><Sparkles size={18} /><input type="text" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. AI engineer, product designer…" /></div></label>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="continue-button" onClick={continueFromContext}>Continue <ArrowRight size={17} /></button>
              <p className="privacy-note">Your ideas stay yours. We only use what you share to shape your suggestions.</p>
            </>}

            {step === 'profile' && <>
              <div className="eyebrow"><span className="eyebrow-dot" /> FIVE QUICK QUESTIONS</div>
              <h1>Make it <span className="serif-accent">yours.</span></h1>
              <p className="hero-description">A little about your background helps us suggest projects that fit your interests and the time you have.</p>
              <div className="profile-grid">
                {profileQuestions.map((question) => <label className="field-label" key={question.key}>{question.title}<select value={profile[question.key]} onChange={(event) => updateProfile(question.key, event.target.value)}><option value="" disabled>Select one</option>{question.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}
              </div>
              <fieldset className="interest-field"><legend>What are you interested in? <span>CHOOSE ANY</span></legend><div className="interest-options">{interestOptions.map((interest) => <button type="button" className={`interest-chip ${profile.interests.includes(interest) ? 'selected' : ''}`} key={interest} onClick={() => toggleInterest(interest)} aria-pressed={profile.interests.includes(interest)}>{profile.interests.includes(interest) && <Check size={12} />}{interest}</button>)}</div></fieldset>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="continue-button" onClick={finishProfile}>Review my answers <ArrowRight size={17} /></button>
              <p className="privacy-note">Choose one or more interests. You can change these answers any time.</p>
            </>}

            {step === 'summary' && <>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PROJECT BRIEF</div>
              <h1>Good place<br />to <span className="serif-accent">start.</span></h1>
              <p className="hero-description">Here’s the context we’ll use to shape your next project suggestion.</p>
              <div className="summary-card">
                {path === 'discover' ? <div><small>TARGET ROLE</small><strong>{targetRole}</strong></div> : <div><small>EXISTING PROJECT</small><strong>{projectDescription.trim() || githubUrl}</strong></div>}
                <div><small>BRANCH · EXPERIENCE</small><strong>{profile.branch} · {profile.experience}</strong></div>
                <div><small>PREFERRED TECHNOLOGY · TIME</small><strong>{profile.technology} · {profile.time}</strong></div>
                <div><small>INTERESTS</small><strong>{profile.interests.join(', ')}</strong></div>
              </div>
              <div className="prototype-note">Recommendations are the next build. Your answers currently stay in this browser session.</div>
              <button className="continue-button" onClick={() => changeStep('profile')}>Edit my answers <ArrowRight size={17} /></button>
            </>}
          </div>
        </section>
      )}

      <footer className="site-footer" id="workshop">
        <div><span className="footer-burst">✳</span><span><b>Build Your First AI Project</b> <i>·</i> A free, 60-minute workshop</span></div>
        <a href="#workshop">Save your spot <ArrowUpRight size={15} /></a>
      </footer>
    </main>
  )
}

export default App
