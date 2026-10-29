import { useEffect, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Compass, Github, Sparkles, Copy, LockKeyhole } from 'lucide-react'
import type { Profile } from './types'
import { projectCatalogue, recommendProjects, type ProjectIdea } from './data/projects'
import { buildMakeover, type Makeover } from './lib/makeover'
import { fetchGitHubMakeover, hasProjectFunctionConfig, isValidGitHubRepoUrl, ProjectApiError } from './lib/projectApi'
import { fetchProjectRecommendations, type RecommendationResult } from './lib/recommendationApi'
import { fetchReferralProgress, getWorkshopUrl, saveDemoRegistration, trackProjectEvent, type DemoRegistrationResult, type RegistrationDraft, type RegistrationPath } from './lib/registrationApi'
import { adminLogin, fetchAdminMetrics, type AdminMetrics } from './lib/adminApi'
import { clearAuthRedirectHash, readInviteRedirect, type InviteRedirect } from './lib/authInvite'
import { InviteAcceptance } from './InviteAcceptance'

type Path = 'improve' | 'discover' | null
type Audience = 'student' | 'developer'

const profileQuestions = [
  { key: 'branch', title: 'What are you studying?', options: ['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'] },
  { key: 'experience', title: 'How would you describe your experience?', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'technology', title: 'Which technology do you prefer?', options: ['Python', 'Java', 'C++', 'JavaScript', 'No preference'] },
  { key: 'time', title: 'How much time can you spend?', options: ['1 day', '1 week', '1 month'] },
] as const
const interestOptions = ['Web development', 'AI', 'ML', 'Computer vision', 'NLP', 'IoT', 'Cybersecurity', 'Data analytics', 'Core engineering']
const roleSuggestions = [
  { group: 'Software & product', roles: ['Frontend developer', 'Backend developer', 'Full-stack developer', 'Mobile app developer', 'UI/UX designer', 'Product designer'] },
  { group: 'AI & data', roles: ['AI/ML engineer', 'Data analyst', 'Data scientist', 'Data engineer', 'NLP engineer'] },
  { group: 'Infrastructure & security', roles: ['Cloud/DevOps engineer', 'Cybersecurity analyst', 'Network engineer'] },
  { group: 'Core engineering', roles: ['Embedded/IoT engineer', 'Robotics engineer', 'Mechanical design engineer', 'Electronics engineer', 'Civil engineer'] },
]

function App() {
  const [path, setPath] = useState<Path>(null)
  const [audience, setAudience] = useState<Audience | null>(null)
  const [audienceError, setAudienceError] = useState('')
  const [step, setStep] = useState<'context' | 'profile' | 'summary' | 'fallback' | 'results'>('context')
  const [githubUrl, setGithubUrl] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [profile, setProfile] = useState<Profile>({ branch: '', experience: '', technology: '', interests: [], time: '' })
  const [error, setError] = useState('')
  const [contextNotice, setContextNotice] = useState('')
  const [makeover, setMakeover] = useState<Makeover | null>(null)
  const [fallbackNotice, setFallbackNotice] = useState('')
  const [generating, setGenerating] = useState(false)
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<DemoRegistrationResult | null>(null)
  const [registrationError, setRegistrationError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null)
  const [adminToken, setAdminToken] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminBusy, setAdminBusy] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [inviteRedirect, setInviteRedirect] = useState<InviteRedirect>(() => readInviteRedirect(window.location.hash))

  useEffect(() => {
    if (!inviteRedirect) void trackProjectEvent('landing')
  }, [inviteRedirect])

  useEffect(() => {
    if (inviteRedirect) {
      clearAuthRedirectHash()
      return
    }
    const syncRoute = () => {
      const nextPath = window.location.hash === '#improve' ? 'improve' : window.location.hash === '#discover' ? 'discover' : null
      if (nextPath && !audience) {
        setAudienceError('Choose Student or Developer first so we can shape the right next step.')
        setPath(null)
        return
      }
      setPath(nextPath)
      if (nextPath) setStep('context')
    }
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0)
    }
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('scroll', updateProgress)
    }
  }, [audience, inviteRedirect])

  useEffect(() => {
    if (path) return
    const revealItems = document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)')
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [path])

  function startPath(nextPath: Exclude<Path, null>) {
    if (!audience) {
      setAudienceError('Choose Student or Developer first so we can shape the right next step.')
      document.getElementById('audience-type')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    window.history.pushState({ projectDnaPath: nextPath }, '', `#${nextPath}`)
    setPath(nextPath)
    setStep('context')
    setError('')
    setContextNotice('')
    setMakeover(null)
    setFallbackNotice('')
    setRecommendationResult(null)
    setSelectedProjectId(null)
    void trackProjectEvent('path_start', nextPath)
    setGithubUrl('')
    setProjectDescription('')
    setTargetRole('')
    setProfile({ branch: '', experience: '', technology: '', interests: [], time: '' })
  }
  function returnHome() {
    window.history.pushState({}, '', '#home')
    setPath(null)
    setStep('context')
    setError('')
  }
  function navigateLandingSection(section: string) {
    if (!path) return
    window.history.pushState({}, '', `#${section}`)
    setPath(null)
    window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 40)
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
    if (path === 'improve' && githubUrl.trim() && !isValidGitHubRepoUrl(githubUrl.trim())) {
      if (projectDescription.trim()) {
        setGithubUrl('')
        setContextNotice('That link is not a supported GitHub repository, so this result will use only the project text you pasted.')
      } else {
        setError('Use an HTTPS link in the format github.com/owner/repository, or paste your README/description below.')
        return
      }
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

  async function generateRecommendations() {
    setGenerating(true)
    setError('')
    const shortlist = recommendProjects(profile, targetRole)
    try {
      if (!hasProjectFunctionConfig()) throw new Error('SERVER_FUNCTION_NOT_CONFIGURED')
      const result = await fetchProjectRecommendations(targetRole, profile)
      setRecommendationResult(result)
    } catch {
      setRecommendationResult({
        provider: 'catalogue',
        providerNote: hasProjectFunctionConfig()
          ? 'The recommendation service is not available right now. These curated matches are still ready to use.'
          : 'Curated matches from the local catalogue. AI tailoring is available when the server function is configured.',
        projects: shortlist.map((project) => ({ id: project.id, roadmap: project.roadmap })),
      })
    } finally {
      setStep('results')
      void trackProjectEvent('result', 'discover')
      setGenerating(false)
    }
  }

  function handleWorkshopClick() {
    const pathValue = path === 'improve' ? 'improve' : path === 'discover' ? 'discover' : 'unknown'
    void trackProjectEvent('workshop_cta_click', pathValue)
    const destination = getWorkshopUrl()
    if (destination) {
      window.open(destination, '_blank', 'noopener,noreferrer')
      return
    }
    setRegistrationResult(null)
    setRegistrationError('')
    setRegistrationOpen(true)
    void trackProjectEvent('registration_form_start', pathValue)
  }

  async function handleDemoRegistration(draft: RegistrationDraft) {
    setRegistrationError('')
    try {
      const result = await saveDemoRegistration(draft)
      setRegistrationResult(result)
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : 'REGISTRATION_SAVE_FAILED'
      setRegistrationError(code === 'REGISTRATION_SERVICE_UNAVAILABLE'
        ? 'The demo registration service is not connected. Your details were not submitted.'
        : 'We could not save this demo registration. Your details were not counted; please try again later.')
    }
  }

  async function refreshReferralProgress(code: string) {
    const referralCount = await fetchReferralProgress(code)
    setRegistrationResult((current) => current ? { ...current, referralCount } : current)
  }

  const selectedProject = path === 'improve'
    ? makeover?.title || ''
    : projectCatalogue.find((project) => project.id === selectedProjectId)?.title || ''

  async function runMakeover(usePasteOnly = false) {
    setGenerating(true)
    setError('')
    setFallbackNotice(contextNotice)
    try {
      if (hasProjectFunctionConfig()) {
        const result = await fetchGitHubMakeover(!usePasteOnly ? githubUrl.trim() : '', projectDescription, profile)
        setMakeover(result)
      } else {
        if (!usePasteOnly && githubUrl.trim()) throw new ProjectApiError('SERVER_FUNCTION_NOT_CONFIGURED')
        const text = projectDescription.trim()
        if (!text) { setStep('fallback'); setError('Paste a README or a short project description to continue.'); return }
        const notice = contextNotice || (!hasProjectFunctionConfig() && githubUrl.trim()
          ? 'GitHub import is not configured for this preview. This suggestion uses only the project text you pasted.'
          : '')
        setMakeover(buildMakeover(text, profile, 'Based on the README/project description you provided.'))
        setFallbackNotice(notice)
      }
      setStep('results')
      void trackProjectEvent('result', 'improve')
    } catch (caught) {
      const code = caught instanceof ProjectApiError ? caught.code : 'FUNCTION_UNAVAILABLE'
      if (projectDescription.trim()) {
        setMakeover(buildMakeover(projectDescription, profile, 'Based on the project text you provided.'))
        setFallbackNotice(`${readableRepoError(code)} This template suggestion uses only the project text you pasted.`)
        setStep('results')
        void trackProjectEvent('result', 'improve')
      } else {
        setError(readableRepoError(code))
        setStep('fallback')
      }
    } finally { setGenerating(false) }
  }

  if (inviteRedirect) return <InviteAcceptance redirect={inviteRedirect} onDone={() => { clearAuthRedirectHash(); window.location.hash = 'home'; setInviteRedirect(null) }} />

  return (
    <main className="page-shell">
      <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${scrollProgress})` }} />
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); returnHome() }}>
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span>
          <span>project<span className="brand-light">dna</span></span>
        </a>
        <div className="topbar-links">
          <a href="#how-it-works" onClick={() => navigateLandingSection('how-it-works')}>How it works</a>
          <a href="#roles" onClick={() => navigateLandingSection('roles')}>Explore roles</a>
        </div>
        <div className="topbar-right">
          <a className="workshop-link" href="#workshop">Free AI workshop <ArrowUpRight size={15} /></a>
          <button className="text-button" onClick={() => { setAdminOpen(true); setAdminError('') }}><LockKeyhole size={14} /> Admin</button>
        </div>
      </nav>

      {!path ? (
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT PROJECT, FIGURED OUT</div>
            <h1>Turn what you know<br />into what’s <span className="serif-accent">next.</span></h1>
            <p className="hero-description">Get a practical project direction for the role you want, or find the next version of something you’ve already built.</p>
            <fieldset className="audience-select" id="audience-type"><legend>FIRST, TELL US ABOUT YOU</legend><div><button type="button" className={audience === 'student' ? 'selected' : ''} aria-pressed={audience === 'student'} onClick={() => { setAudience('student'); setAudienceError('') }}>I’m a student</button><button type="button" className={audience === 'developer' ? 'selected' : ''} aria-pressed={audience === 'developer'} onClick={() => { setAudience('developer'); setAudienceError('') }}>I’m a developer</button></div>{audienceError && <p className="form-error" role="alert">{audienceError}</p>}</fieldset>
            <div className="hero-actions"><button className="continue-button" onClick={() => startPath('discover')}>Find my next project <ArrowRight size={17} /></button><button className="hero-secondary" onClick={() => startPath('improve')}><Github size={16} /> Improve a project</button></div>
            <div className="hero-proof"><span className="proof-sparkle">✳</span><span>Useful ideas first. Workshop when you’re ready.</span></div>
          </div>
          <div className="path-panel">
            <div className="panel-heading"><span>START WHERE YOU ARE</span><span className="step-count">01 <b>/ 02</b></span></div>
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
            <div className="path-panel-glow" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="floating-note"><span className="note-icon">✦</span><span><b>Pick a direction.</b><br />Build with purpose.</span></div>
          <a className="hero-scroll" href="#how-it-works"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></a>
          <div className="hero-index">01 <span>—</span> YOUR NEXT CHAPTER</div>
        </section>
      ) : (
        <section className="intake-wrap">
          <button className="back-button" onClick={() => step === 'context' ? returnHome() : changeStep(step === 'summary' ? 'profile' : step === 'results' ? (path === 'discover' ? 'profile' : 'summary') : step === 'fallback' ? 'summary' : 'context')}><ArrowLeft size={16} /> Back</button>
          <div className="intake-card">
            {step === 'context' && <>
              <div className="eyebrow"><span className="eyebrow-dot" /> FIRST, A LITTLE CONTEXT</div>
              <h1>{path === 'improve' ? <>Let’s meet your<br /><span className="serif-accent">project.</span></> : <>What do you want<br />to <span className="serif-accent">become?</span></>}</h1>
              <p className="hero-description">{path === 'improve' ? 'Share a public GitHub link or tell us what you’ve been building. We’ll help you spot its next move.' : 'Tell us the role you’re aiming for. We’ll find project ideas that help you build toward it.'}</p>
              {path === 'improve' ? <>
                <label className="field-label">PUBLIC GITHUB REPOSITORY <span>OPTIONAL</span><div className="input-wrap"><Github size={18} /><input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/you/your-project" /></div></label>
                <label className="field-label">README OR PROJECT DESCRIPTION <span>PASTE FALLBACK</span><textarea rows={4} maxLength={12000} value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="Paste your README or describe the problem, users and what the project does." /></label>
                <div className="character-count">{projectDescription.length.toLocaleString()} / 12,000 characters</div>
              </> : <div className="role-picker"><label className="field-label">ROLE YOU’RE AIMING FOR<div className="input-wrap"><Sparkles size={18} /><input type="text" maxLength={100} value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Type a role or choose a suggestion below" /></div></label><p className="role-picker-hint">Choose a suggested role, or enter any role in your own words.</p>{roleSuggestions.map((group) => <section className="role-group" key={group.group}><h2>{group.group}</h2><div className="role-chips">{group.roles.map((role) => <button type="button" className={`role-chip ${targetRole === role ? 'selected' : ''}`} aria-pressed={targetRole === role} key={role} onClick={() => setTargetRole(role)}>{role}</button>)}</div></section>)}</div>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="continue-button" onClick={continueFromContext}>Continue <ArrowRight size={17} /></button>
              <p className="privacy-note">GitHub reads use a secure server function. Pasted text can use the local template. We never clone or run repository code.</p>
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
                {path === 'discover' ? <div><small>TARGET ROLE</small><strong>{targetRole}</strong></div> : <><div><small>PROJECT CONTEXT</small><strong>{projectDescription.trim() || (githubUrl ? 'Public GitHub README' : 'Pasted project description')}</strong></div>{githubUrl && <div><small>GITHUB REPOSITORY</small><strong>{githubUrl}</strong></div>}</>}
                <div><small>BRANCH · EXPERIENCE</small><strong>{profile.branch} · {profile.experience}</strong></div>
                <div><small>PREFERRED TECHNOLOGY · TIME</small><strong>{profile.technology} · {profile.time}</strong></div>
                <div><small>INTERESTS</small><strong>{profile.interests.join(', ')}</strong></div>
              </div>
              {path === 'discover' ? <>
                <div className="prototype-note">Matched from our curated catalogue using your role, interests, technology and available time. No AI provider is needed.</div>
                <button className="continue-button" onClick={generateRecommendations} disabled={generating}>{generating ? 'Finding your matches…' : 'Get project recommendations'} {!generating && <ArrowRight size={17} />}</button>
              </> : <>
                <div className="prototype-note">We’ll use only the public README or the text you provide. Suggestions are templates; source code is not inspected.</div>
                <button className="continue-button" onClick={() => runMakeover()} disabled={generating}>{generating ? 'Preparing your makeover…' : 'Create my project makeover'} {!generating && <ArrowRight size={17} />}</button>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="text-button" onClick={() => changeStep('profile')}><ArrowLeft size={14} /> Edit my answers</button>
              </>}
            </>}

            {step === 'fallback' && path === 'improve' && <>
              <div className="eyebrow"><span className="eyebrow-dot" /> README PASTE FALLBACK</div>
              <h1>Let’s try it<br /><span className="serif-accent">another way.</span></h1>
              <p className="hero-description">{error || 'We could not read that public README. Your profile is saved in this page; paste the README or describe the project to continue.'}</p>
              <label className="field-label">README OR PROJECT DESCRIPTION<textarea rows={7} value={projectDescription} maxLength={12000} onChange={(event) => setProjectDescription(event.target.value)} placeholder="Paste up to 12,000 characters of README text or describe your project…" /></label>
              <div className="character-count">{projectDescription.length.toLocaleString()} / 12,000 characters</div>
              <button className="continue-button" onClick={() => runMakeover(true)} disabled={generating}>{generating ? 'Preparing your makeover…' : 'Use this project text'} {!generating && <ArrowRight size={17} />}</button>
              <p className="privacy-note">No repository is cloned, crawled or executed. The template uses only the text you paste.</p>
            </>}

            {step === 'results' && path === 'discover' && <Recommendations role={targetRole} profile={profile} tailoring={recommendationResult} selectedProjectId={selectedProjectId} onSelect={setSelectedProjectId} onWorkshop={handleWorkshopClick} onEdit={() => changeStep('profile')} />}
            {step === 'results' && path === 'improve' && makeover && <MakeoverResults makeover={makeover} notice={fallbackNotice} onWorkshop={handleWorkshopClick} onEdit={() => changeStep('summary')} />}
          </div>
        </section>
      )}

      {!path && <LandingExperience onStart={(nextPath) => startPath(nextPath)} onChooseRole={(role) => { startPath('discover'); setTargetRole(role) }} />}

      <footer className="site-footer" id="workshop">
        <div><span className="footer-burst">✳</span><span><b>Build Your First AI Project</b> <i>·</i> A free, 60-minute workshop</span></div>
        <button className="footer-action" onClick={handleWorkshopClick}>Workshop next step <ArrowUpRight size={15} /></button>
      </footer>
      {registrationOpen && <RegistrationDialog
        profileBranch={profile.branch}
        initialUserType={audience || 'student'}
        registrationResult={registrationResult}
        registrationError={registrationError}
        selectedProject={selectedProject}
        path={path === 'improve' ? 'improve' : path === 'discover' ? 'discover' : 'unknown'}
        onClose={() => setRegistrationOpen(false)}
        onSubmit={handleDemoRegistration}
        onReferralProgress={refreshReferralProgress}
      />}
      {adminOpen && <AdminDialog metrics={adminMetrics} error={adminError} busy={adminBusy} onClose={() => { setAdminOpen(false); setAdminToken(''); setAdminMetrics(null) }} onLogin={async (email, password) => {
        setAdminBusy(true); setAdminError('')
        try { const token = await adminLogin(email, password); const metrics = await fetchAdminMetrics(token); setAdminToken(token); setAdminMetrics(metrics) }
        catch { setAdminError('Sign-in or dashboard access failed. Check your account and admin access, then try again.') }
        finally { setAdminBusy(false) }
      }} onRefresh={async () => { if (!adminToken) return; setAdminBusy(true); setAdminError(''); try { setAdminMetrics(await fetchAdminMetrics(adminToken)) } catch { setAdminError('Metrics could not be refreshed. Please sign in again.') } finally { setAdminBusy(false) } }} />}
    </main>
  )
}

function LandingExperience({ onStart, onChooseRole }: { onStart: (path: Exclude<Path, null>) => void; onChooseRole: (role: string) => void }) {
  const featuredRoles = ['Frontend developer', 'AI/ML engineer', 'Data analyst', 'Cybersecurity analyst', 'Embedded/IoT engineer', 'Mechanical design engineer']
  return <div className="landing-experience">
    <section className="signal-strip" aria-label="Project interests">
      <div className="signal-track" aria-hidden="true">{[0, 1].map((copy) => <span className="signal-copy" key={copy}>{['WEB DEVELOPMENT', 'ARTIFICIAL INTELLIGENCE', 'DATA & ML', 'CYBERSECURITY', 'IOT & ROBOTICS', 'CORE ENGINEERING'].map((label) => <b key={`${copy}-${label}`}>{label}<i>✳</i></b>)}</span>)}</div>
      <span className="sr-only">Explore web development, artificial intelligence, data, cybersecurity, IoT, robotics and core engineering.</span>
    </section>
    <section className="how-section reveal" id="how-it-works">
      <div className="section-kicker"><span>THE PROJECT DNA LOOP</span><i>02 — 03</i></div>
      <div className="section-heading-row"><h2>A little clarity.<br /><span className="serif-accent">A lot of momentum.</span></h2><p>Skip the blank page. Start with the experience you have and leave with a project plan you can actually begin.</p></div>
      <div className="how-grid">
        <article className="how-card"><span className="how-number">01</span><div className="how-icon purple"><Compass size={18} /></div><h3>Choose your starting point</h3><p>Bring a project you have, or tell us the role you’re working toward.</p><span className="how-connector" /></article>
        <article className="how-card"><span className="how-number">02</span><div className="how-icon green"><Sparkles size={18} /></div><h3>Get a useful direction</h3><p>See an improvement roadmap or three project ideas shaped around your time and interests.</p><span className="how-connector" /></article>
        <article className="how-card"><span className="how-number">03</span><div className="how-icon amber"><ArrowUpRight size={18} /></div><h3>Make the next move</h3><p>Keep the result, share it if you like, and explore the workshop as an optional next step.</p></article>
      </div>
    </section>
    <section className="role-section reveal" id="roles">
      <div className="role-section-copy"><div className="section-kicker"><span>START WITH A ROLE</span><i>YOUR PATH, YOUR PACE</i></div><h2>Where do you<br />want to <span className="serif-accent">grow?</span></h2><p>Choose a direction to begin. We’ll shape project suggestions around your branch, experience, preferred technology and available time.</p><button className="text-link-button" onClick={() => onStart('discover')}>Explore all roles <ArrowRight size={15} /></button></div>
      <div className="featured-role-grid">{featuredRoles.map((role, index) => <button className="featured-role" key={role} onClick={() => onChooseRole(role)}><span className={`role-index tone-${index % 3}`}>0{index + 1}</span><strong>{role}</strong><ArrowUpRight size={15} /></button>)}</div>
    </section>
    <section className="build-band reveal">
      <div className="build-band-orbit orbit-one" /><div className="build-band-orbit orbit-two" />
      <div className="build-band-copy"><div className="eyebrow"><span className="eyebrow-dot" /> BUILT AROUND YOUR NEXT STEP</div><h2>Good projects start<br />with a <span className="serif-accent">clear why.</span></h2><p>Make your learning visible. Turn an interest into something you can build, explain and keep improving.</p><button className="build-band-button" onClick={() => onStart('improve')}>Give my project a next step <ArrowRight size={16} /></button></div>
      <div className="build-note-stack" aria-label="Project guidance includes a roadmap, skills and a time estimate"><div className="build-note build-note-main"><small>YOUR NEXT BUILD</small><strong>A direction that fits you.</strong><span><i /> Project idea <i /> Starter roadmap <i /> Skills to practice</span></div><div className="build-note build-note-float"><span className="note-icon">✦</span><span><b>Start small.</b><br />Make it yours.</span></div></div>
    </section>
    <section className="final-cta reveal"><div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Let’s find your<br /><span className="serif-accent">next project.</span></h2></div><button className="continue-button" onClick={() => onStart('discover')}>Find my next project <ArrowRight size={17} /></button></section>
  </div>
}

function Recommendations({ role, profile, tailoring, selectedProjectId, onSelect, onWorkshop, onEdit }: { role: string; profile: Profile; tailoring: RecommendationResult | null; selectedProjectId: string | null; onSelect: (id: string) => void; onWorkshop: () => void; onEdit: () => void }) {
  const rankedProjects = recommendProjects(profile, role)
  const remoteProjects = tailoring?.projects.map((item) => projectCatalogue.find((project) => project.id === item.id)).filter((project): project is ProjectIdea => Boolean(project)) || []
  const projects = remoteProjects.length === 3 ? remoteProjects : rankedProjects
  const providerLabel = tailoring?.provider === 'gemini' ? 'Gemini-tailored' : tailoring?.provider === 'groq' ? 'Groq-tailored' : 'Curated matches'
  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PROJECT SHORTLIST</div>
    <h1>Three ways<br />to <span className="serif-accent">grow.</span></h1>
    <p className="hero-description">Ideas for a <b>{role}</b> path, shaped around {profile.time.toLowerCase()}, {profile.technology === 'No preference' ? 'any technology' : profile.technology}, and your interests.</p>
    <div className="catalogue-note"><Sparkles size={15} /> {providerLabel} · Catalogue projects preserved</div>
    {tailoring?.providerNote && <div className="basis-note">{tailoring.providerNote}</div>}
    <div className="recommendation-list">{projects.map((project, index) => <ProjectCard key={project.id} project={project} tailoring={tailoring?.projects.find((item) => item.id === project.id)} selected={selectedProjectId === project.id} onSelect={() => onSelect(project.id)} index={index + 1} />)}</div>
    <ResultsWorkshop onClick={onWorkshop} />
    <button className="text-button" onClick={onEdit}><ArrowLeft size={14} /> Edit your answers</button>
  </>
}

function ProjectCard({ project, tailoring, selected, onSelect, index }: { project: ProjectIdea; tailoring?: { tailoredSummary?: string; roadmap: string[] }; selected: boolean; onSelect: () => void; index: number }) {
  const [copyStatus, setCopyStatus] = useState('')
  const roadmap = tailoring?.roadmap || project.roadmap
  async function copyProject() {
    const text = `${project.title}\n\n${tailoring?.tailoredSummary || project.problem}\n\nOutcome: ${project.outcome}\nTechnologies: ${project.technologies.join(', ')}\nTime: ${project.time}\nSkills: ${project.skills.join(', ')}\nRoadmap:\n${roadmap.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')}\n\nProject idea from Project DNA.`
    try { await navigator.clipboard.writeText(text); setCopyStatus('Copied project brief') }
    catch { setCopyStatus('Clipboard unavailable') }
  }
  return <article className={`recommendation-card ${selected ? 'selected-card' : ''}`}>
    <div className="recommendation-topline"><span>PROJECT 0{index}</span><span>{project.difficulty} · {project.time}</span></div>
    <h2>{project.title}</h2>
    <p className="project-problem">{project.problem}</p>
    {tailoring?.tailoredSummary && <p className="tailored-summary">{tailoring.tailoredSummary}</p>}
    <div className="project-outcome"><small>WHAT YOU’LL MAKE</small><p>{project.outcome}</p></div>
    <div className="project-tags">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
    <div className="project-detail-grid"><div><small>SKILLS YOU’LL PRACTICE</small><p>{project.skills.join(' · ')}</p></div><div><small>STARTER ROADMAP</small><ol>{roadmap.map((step) => <li key={step}>{step}</li>)}</ol></div></div>
    <div className="project-card-actions"><button className={`select-project ${selected ? 'selected' : ''}`} onClick={onSelect}>{selected ? 'Selected for the workshop' : 'Choose this project'}{selected && <Check size={14} />}</button><button type="button" className="text-button" onClick={() => void copyProject()} aria-live="polite"><Copy size={14} /> {copyStatus || 'Copy project brief'}</button></div>
  </article>
}

function readableRepoError(code: string) {
  const messages: Record<string, string> = {
    SERVER_FUNCTION_NOT_CONFIGURED: 'GitHub import is not configured in this preview. Paste your README or describe the project below.',
    FUNCTION_UNAVAILABLE: 'We could not reach the secure GitHub reader. Paste your README or describe the project below.',
    INVALID_GITHUB_URL: 'That link is not a supported public GitHub repository. Check the link or paste the README/description below.',
    REPO_PRIVATE_OR_UNAVAILABLE: 'The repository may be private, missing, or unavailable. Paste the README or a project description to continue.',
    README_UNAVAILABLE: 'We could not find a readable README. Paste the README or describe the project below.',
    README_TOO_LARGE: 'That README is larger than this prototype can read. Paste a shorter excerpt or project description.',
    GITHUB_RATE_LIMIT: 'GitHub temporarily limited this request. Paste your README or project description to continue.',
    FETCH_TIMEOUT: 'Reading the README took too long. Paste the README or project description to continue.',
  }
  return messages[code] || 'We could not read that README. Paste it or describe the project to continue.'
}

function MakeoverResults({ makeover, notice, onWorkshop, onEdit }: { makeover: Makeover; notice: string; onWorkshop: () => void; onEdit: () => void }) {
  const [copyStatus, setCopyStatus] = useState('')
  async function copyMakeover() {
    const text = `${makeover.title}\n\n${makeover.summary}\n\nPotential opportunities:\n${makeover.opportunities.map((item) => `• ${item}`).join('\n')}\n\nIdeas to explore:\n${makeover.enhancements.map((item) => `• ${item.title}: ${item.detail}`).join('\n')}\n\nTechnology ideas: ${makeover.technologies.join(', ')}\nDifficulty and time: ${makeover.difficulty} · ${makeover.estimatedTime}\n\nRoadmap:\n${makeover.roadmap.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\nSkills: ${makeover.skills.join(', ')}\n\n${makeover.disclaimer}\n\nProject guidance from Project DNA.`
    try { await navigator.clipboard.writeText(text); setCopyStatus('Copied makeover brief') }
    catch { setCopyStatus('Clipboard unavailable') }
  }
  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> PROJECT MAKEOVER · {makeover.provider.toUpperCase()}</div>
    <h1>{makeover.title}<br /><span className="serif-accent">next moves.</span></h1>
    <p className="hero-description makeover-summary">{makeover.summary}</p>
    <div className="basis-note"><b>Basis:</b> {makeover.basis}<span>{makeover.providerNote}</span>{notice && <span>{notice}</span>}</div>
    <button type="button" className="text-button result-copy-button" onClick={() => void copyMakeover()} aria-live="polite"><Copy size={14} /> {copyStatus || 'Copy makeover brief'}</button>
    <section className="makeover-section"><h2>Potential opportunities</h2><ul>{makeover.opportunities.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="makeover-section"><h2>Four ideas to explore</h2><div className="enhancement-grid">{makeover.enhancements.map((item) => <article key={item.title}><b>{item.title}</b><p>{item.detail}</p></article>)}</div></section>
    <section className="makeover-meta"><div><small>TECHNOLOGY IDEAS</small><div className="project-tags">{makeover.technologies.map((item) => <span key={item}>{item}</span>)}</div></div><div><small>DIFFICULTY · ESTIMATED TIME</small><b>{makeover.difficulty} · {makeover.estimatedTime}</b></div></section>
    <section className="makeover-section"><h2>A practical roadmap</h2><ol>{makeover.roadmap.map((item) => <li key={item}>{item}</li>)}</ol></section>
    <section className="makeover-section"><h2>Skills you could practice</h2><div className="project-tags">{makeover.skills.map((item) => <span key={item}>{item}</span>)}</div></section>
    <section className="resume-note"><small>POTENTIAL RESUME BULLET · EDIT AFTER YOU BUILD IT</small><p>{makeover.resumeBullet}</p></section>
    <p className="makeover-disclaimer">{makeover.disclaimer}</p>
    <ResultsWorkshop onClick={onWorkshop} />
    <button className="text-button" onClick={onEdit}><ArrowLeft size={14} /> Edit project context</button>
  </>
}

function ResultsWorkshop({ onClick }: { onClick: () => void }) {
  const official = Boolean(getWorkshopUrl())
  return <div className="results-workshop"><div><b>Keep building with us</b><span>{official ? 'Continue to the configured workshop registration page.' : 'Open the clearly labeled demo registration flow.'}</span></div><button onClick={onClick}>{official ? 'Open registration' : 'Register (demo)'} <ArrowUpRight size={14} /></button></div>
}

function RegistrationDialog({ profileBranch, initialUserType, registrationResult, registrationError, selectedProject, path, onClose, onSubmit, onReferralProgress }: {
  profileBranch: string
  initialUserType: Audience
  registrationResult: DemoRegistrationResult | null
  registrationError: string
  selectedProject: string
  path: RegistrationPath
  onClose: () => void
  onSubmit: (draft: RegistrationDraft) => Promise<void>
  onReferralProgress: (code: string) => Promise<void>
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [college, setCollege] = useState('')
  const [userType, setUserType] = useState<Audience>(initialUserType)
  const [branch, setBranch] = useState(profileBranch || '')
  const [finalYear, setFinalYear] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const backendReady = hasProjectFunctionConfig()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    await onSubmit({
      fullName,
      email,
      college,
      userType,
      branch: userType === 'student' ? branch : null,
      finalYearEngineering: userType === 'student' ? finalYear === 'yes' : null,
      selectedProject,
      consent,
      path,
      referralCode: null,
    })
    setBusy(false)
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="registration-dialog" role="dialog" aria-modal="true" aria-labelledby="registration-title">
      <button className="dialog-close" onClick={onClose} type="button">Close</button>
      <div className="eyebrow"><span className="eyebrow-dot" /> WORKSHOP NEXT STEP</div>
      <h2 id="registration-title">Demo <span className="serif-accent">registration</span></h2>
      <p className="dialog-intro">This captures an internal demo record only. It is not an official NxtWave registration.</p>
      {!backendReady ? <div className="prototype-note">Demo registration storage isn’t connected in this preview. No personal details were requested or submitted. Configure Supabase to enable the form, or add the approved workshop URL to continue on the official page.</div> : registrationResult ? <div className="registration-success"><b>{registrationResult.status === 'saved' ? 'Demo registration saved.' : 'This email already has a demo registration.'}</b><span>{registrationResult.status === 'saved' ? 'This prototype record is separate from official workshop signups. Student eligibility is self-reported, not verified.' : 'It wasn’t counted a second time. This prototype record is not an official signup.'}</span><div className="referral-box"><small>YOUR OPTIONAL INVITE LINK</small><code>{`${window.location.origin}/?ref=${registrationResult.referralCode}`}</code><button type="button" className="text-button" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}/?ref=${registrationResult.referralCode}`) }}><Copy size={14} /> Copy link</button><a href={`https://wa.me/?text=${encodeURIComponent(`I’m exploring a project idea with Project DNA. Join me: ${window.location.origin}/?ref=${registrationResult.referralCode}`)}`} target="_blank" rel="noreferrer">Share on WhatsApp <ArrowUpRight size={13} /></a><div><b>{registrationResult.referralCount} / 3</b><span> optional invitations registered</span></div><button type="button" className="text-button" onClick={() => void onReferralProgress(registrationResult.referralCode)}>Check progress</button>{registrationResult.referralAttributed && <span>Your registration was attributed to an invite.</span>}</div></div> : <form className="registration-form" onSubmit={submit}>
        <label className="field-label">YOUR NAME<input required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>
        <label className="field-label">EMAIL ADDRESS<input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label className="field-label">COLLEGE<input required minLength={2} maxLength={180} value={college} onChange={(event) => setCollege(event.target.value)} autoComplete="organization" /></label>
        <label className="field-label">I AM A<select value={userType} onChange={(event) => setUserType(event.target.value as 'student' | 'developer')}><option value="student">Student</option><option value="developer">Developer</option></select></label>
        {userType === 'student' && <div className="registration-row">
          <label className="field-label">BRANCH<select required value={branch} onChange={(event) => setBranch(event.target.value)}><option value="" disabled>Select branch</option>{['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field-label">FINAL-YEAR ENGINEERING STUDENT?<select required value={finalYear} onChange={(event) => setFinalYear(event.target.value)}><option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option></select></label>
        </div>}
        {selectedProject && <div className="selected-project-note"><small>PROJECT YOU’RE BRINGING</small><b>{selectedProject}</b></div>}
        <label className="consent-label"><input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I agree to store these details for this demo registration. I understand this is not an official workshop signup.</span></label>
        {registrationError && <p className="form-error" role="alert">{registrationError}</p>}
        <button className="continue-button" disabled={busy}>{busy ? 'Saving demo registration…' : 'Save demo registration'} {!busy && <ArrowRight size={17} />}</button>
        <p className="privacy-note">Email is normalized for duplicate prevention. Demo entries are kept separate from official registration totals.</p>
      </form>}
    </section>
  </div>
}

function AdminDialog({ metrics, error, busy, onClose, onLogin, onRefresh }: { metrics: AdminMetrics | null; error: string; busy: boolean; onClose: () => void; onLogin: (email: string, password: string) => Promise<void>; onRefresh: () => Promise<void> }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const eligible = metrics?.registrations.eligibleSelfReported || 0
  const goalProgress = Math.min(100, Math.round(eligible / 500 * 100))
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="registration-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-title"><button className="dialog-close" onClick={onClose} type="button">Close</button><div className="eyebrow"><span className="eyebrow-dot" /> PRIVATE CAMPAIGN VIEW</div><h2 id="admin-title">Admin <span className="serif-accent">dashboard</span></h2>{!metrics ? <form className="registration-form" onSubmit={(event) => { event.preventDefault(); void onLogin(email, password) }}><label className="field-label">ADMIN EMAIL<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="field-label">PASSWORD<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><p className="privacy-note">Only an active admin account can read aggregate demo metrics. No registration identities are shown.</p><button className="continue-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button></form> : <><div className="admin-metric-grid"><Metric label="Demo registrations" value={metrics.registrations.total} /><Metric label="Eligible · self-reported" value={eligible} /><Metric label="Other demo records" value={metrics.registrations.otherDemo} /><Metric label="Referral registrations" value={metrics.referralRegistrations} /></div><section className="admin-goal" aria-label="500 eligible student registration goal"><div><span>Eligible students · self-reported</span><b>{eligible.toLocaleString()} / 500</b></div><div className="admin-goal-track" role="progressbar" aria-label="Progress toward 500 eligible student registrations" aria-valuemin={0} aria-valuemax={500} aria-valuenow={Math.min(500, eligible)}><span style={{ width: `${goalProgress}%` }} /></div><small>{goalProgress}% of campaign target · Demo counts only; eligibility is self-reported.</small></section><h3>Funnel</h3><div className="admin-list">{Object.entries(metrics.funnel).map(([label, value]) => <div key={label}><span>{label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</span><b>{value}</b></div>)}</div><h3>Sources</h3><div className="admin-list">{metrics.sources.map((row) => <div key={row.source}><span>{row.source}</span><b>{row.count}</b></div>)}</div><h3>Last 14 days</h3><div className="admin-list">{metrics.daily.map((row) => <div key={row.date}><span>{row.date}</span><b>{row.count}</b></div>)}</div><button className="text-button" onClick={() => void onRefresh()} disabled={busy}>Refresh metrics</button></>}{error && <p className="form-error" role="alert">{error}</p>}</section></div>
}
function Metric({ label, value }: { label: string; value: number }) { return <article className="admin-metric"><small>{label}</small><b>{value}</b></article> }

export default App
