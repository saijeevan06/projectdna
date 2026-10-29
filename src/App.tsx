import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Compass, Github, Sparkles } from 'lucide-react'
import type { Profile } from './types'
import { recommendProjects, type ProjectIdea } from './data/projects'
import { buildMakeover, type Makeover } from './lib/makeover'
import { fetchGitHubMakeover, hasProjectFunctionConfig, isValidGitHubRepoUrl, ProjectApiError } from './lib/projectApi'

type Path = 'improve' | 'discover' | null

const profileQuestions = [
  { key: 'branch', title: 'What are you studying?', options: ['CSE', 'IT', 'AI/ML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'] },
  { key: 'experience', title: 'How would you describe your experience?', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'technology', title: 'Which technology do you prefer?', options: ['Python', 'Java', 'C++', 'JavaScript', 'No preference'] },
  { key: 'time', title: 'How much time can you spend?', options: ['1 day', '1 week', '1 month'] },
] as const
const interestOptions = ['Web development', 'AI', 'ML', 'Computer vision', 'NLP', 'IoT', 'Cybersecurity', 'Data analytics', 'Core engineering']

function App() {
  const [path, setPath] = useState<Path>(null)
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

  function startPath(nextPath: Exclude<Path, null>) {
    setPath(nextPath)
    setStep('context')
    setError('')
    setContextNotice('')
    setMakeover(null)
    setFallbackNotice('')
    setGithubUrl('')
    setProjectDescription('')
    setTargetRole('')
    setProfile({ branch: '', experience: '', technology: '', interests: [], time: '' })
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

  async function runMakeover(usePasteOnly = false) {
    setGenerating(true)
    setError('')
    setFallbackNotice(contextNotice)
    try {
      if (!usePasteOnly && githubUrl.trim()) {
        if (!hasProjectFunctionConfig()) throw new ProjectApiError('SERVER_FUNCTION_NOT_CONFIGURED')
        const result = await fetchGitHubMakeover(githubUrl.trim(), projectDescription, profile)
        setMakeover(result)
      } else {
        const text = projectDescription.trim()
        if (!text) { setStep('fallback'); setError('Paste a README or a short project description to continue.'); return }
        const notice = contextNotice || (!hasProjectFunctionConfig() && githubUrl.trim()
          ? 'GitHub import is not configured for this preview. This suggestion uses only the project text you pasted.'
          : '')
        setMakeover(buildMakeover(text, profile, 'Based on the README/project description you provided.'))
        setFallbackNotice(notice)
      }
      setStep('results')
    } catch (caught) {
      const code = caught instanceof ProjectApiError ? caught.code : 'FUNCTION_UNAVAILABLE'
      if (projectDescription.trim()) {
        setMakeover(buildMakeover(projectDescription, profile, 'Based on the project text you provided.'))
        setFallbackNotice(`${readableRepoError(code)} This template suggestion uses only the project text you pasted.`)
        setStep('results')
      } else {
        setError(readableRepoError(code))
        setStep('fallback')
      }
    } finally { setGenerating(false) }
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
          <button className="back-button" onClick={() => step === 'context' ? (setPath(null), setError('')) : changeStep(step === 'summary' ? 'profile' : step === 'results' ? (path === 'discover' ? 'profile' : 'summary') : step === 'fallback' ? 'summary' : 'context')}><ArrowLeft size={16} /> Back</button>
          <div className="intake-card">
            {step === 'context' && <>
              <div className="eyebrow"><span className="eyebrow-dot" /> FIRST, A LITTLE CONTEXT</div>
              <h1>{path === 'improve' ? <>Let’s meet your<br /><span className="serif-accent">project.</span></> : <>What do you want<br />to <span className="serif-accent">become?</span></>}</h1>
              <p className="hero-description">{path === 'improve' ? 'Share a public GitHub link or tell us what you’ve been building. We’ll help you spot its next move.' : 'Tell us the role you’re aiming for. We’ll find project ideas that help you build toward it.'}</p>
              {path === 'improve' ? <>
                <label className="field-label">PUBLIC GITHUB REPOSITORY <span>OPTIONAL</span><div className="input-wrap"><Github size={18} /><input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/you/your-project" /></div></label>
                <label className="field-label">README OR PROJECT DESCRIPTION <span>PASTE FALLBACK</span><textarea rows={4} maxLength={12000} value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="Paste your README or describe the problem, users and what the project does." /></label>
                <div className="character-count">{projectDescription.length.toLocaleString()} / 12,000 characters</div>
              </> : <label className="field-label">ROLE YOU’RE AIMING FOR<div className="input-wrap"><Sparkles size={18} /><input type="text" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. AI engineer, product designer…" /></div></label>}
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
                <button className="continue-button" onClick={() => changeStep('results')}>Get project recommendations <ArrowRight size={17} /></button>
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

            {step === 'results' && path === 'discover' && <Recommendations role={targetRole} profile={profile} onEdit={() => changeStep('profile')} />}
            {step === 'results' && path === 'improve' && makeover && <MakeoverResults makeover={makeover} notice={fallbackNotice} onEdit={() => changeStep('summary')} />}
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

function Recommendations({ role, profile, onEdit }: { role: string; profile: Profile; onEdit: () => void }) {
  const projects = recommendProjects(profile, role)
  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PROJECT SHORTLIST</div>
    <h1>Three ways<br />to <span className="serif-accent">grow.</span></h1>
    <p className="hero-description">Ideas for a <b>{role}</b> path, shaped around {profile.time.toLowerCase()}, {profile.technology === 'No preference' ? 'any technology' : profile.technology}, and your interests.</p>
    <div className="catalogue-note"><Sparkles size={15} /> Curated matches · Works without AI</div>
    <div className="recommendation-list">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index + 1} />)}</div>
    <div className="results-workshop"><div><b>Keep building with us</b><span>Join the free 60-minute AI project workshop.</span></div><a href="#workshop">Workshop info <ArrowUpRight size={14} /></a></div>
    <button className="text-button" onClick={onEdit}><ArrowLeft size={14} /> Edit your answers</button>
  </>
}

function ProjectCard({ project, index }: { project: ProjectIdea; index: number }) {
  return <article className="recommendation-card">
    <div className="recommendation-topline"><span>PROJECT 0{index}</span><span>{project.difficulty} · {project.time}</span></div>
    <h2>{project.title}</h2>
    <p className="project-problem">{project.problem}</p>
    <div className="project-outcome"><small>WHAT YOU’LL MAKE</small><p>{project.outcome}</p></div>
    <div className="project-tags">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
    <div className="project-detail-grid"><div><small>SKILLS YOU’LL PRACTICE</small><p>{project.skills.join(' · ')}</p></div><div><small>STARTER ROADMAP</small><ol>{project.roadmap.map((step) => <li key={step}>{step}</li>)}</ol></div></div>
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

function MakeoverResults({ makeover, notice, onEdit }: { makeover: Makeover; notice: string; onEdit: () => void }) {
  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> PROJECT MAKEOVER · TEMPLATE-BASED</div>
    <h1>{makeover.title}<br /><span className="serif-accent">next moves.</span></h1>
    <p className="hero-description makeover-summary">{makeover.summary}</p>
    <div className="basis-note"><b>Basis:</b> {makeover.basis} {notice && <span>{notice}</span>}</div>
    <section className="makeover-section"><h2>Potential opportunities</h2><ul>{makeover.opportunities.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="makeover-section"><h2>Four ideas to explore</h2><div className="enhancement-grid">{makeover.enhancements.map((item) => <article key={item.title}><b>{item.title}</b><p>{item.detail}</p></article>)}</div></section>
    <section className="makeover-meta"><div><small>TECHNOLOGY IDEAS</small><div className="project-tags">{makeover.technologies.map((item) => <span key={item}>{item}</span>)}</div></div><div><small>DIFFICULTY · ESTIMATED TIME</small><b>{makeover.difficulty} · {makeover.estimatedTime}</b></div></section>
    <section className="makeover-section"><h2>A practical roadmap</h2><ol>{makeover.roadmap.map((item) => <li key={item}>{item}</li>)}</ol></section>
    <section className="makeover-section"><h2>Skills you could practice</h2><div className="project-tags">{makeover.skills.map((item) => <span key={item}>{item}</span>)}</div></section>
    <section className="resume-note"><small>POTENTIAL RESUME BULLET · EDIT AFTER YOU BUILD IT</small><p>{makeover.resumeBullet}</p></section>
    <p className="makeover-disclaimer">{makeover.disclaimer}</p>
    <div className="results-workshop"><div><b>Keep building with us</b><span>Join the free 60-minute AI project workshop.</span></div><a href="#workshop">Workshop info <ArrowUpRight size={14} /></a></div>
    <button className="text-button" onClick={onEdit}><ArrowLeft size={14} /> Edit project context</button>
  </>
}

export default App
