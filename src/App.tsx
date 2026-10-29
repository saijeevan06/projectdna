import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, Github, Sparkles } from 'lucide-react'

type Path = 'improve' | 'discover' | null

function App() {
  const [path, setPath] = useState<Path>(null)

  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#home" onClick={() => setPath(null)}>
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
            <button className="path-card" onClick={() => setPath('improve')}>
              <span className="path-icon purple"><Github size={20} /></span>
              <span className="path-text"><strong>I have a project</strong><small>Give it an AI-powered glow-up</small></span>
              <ArrowRight className="path-arrow" size={19} />
            </button>
            <button className="path-card" onClick={() => setPath('discover')}>
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
          <button className="back-button" onClick={() => setPath(null)}><ArrowLeft size={16} /> Back</button>
          <div className="intake-card">
            <div className="eyebrow"><span className="eyebrow-dot" /> FIRST, A LITTLE CONTEXT</div>
            <h1>{path === 'improve' ? <>Let’s meet your<br /><span className="serif-accent">project.</span></> : <>What do you want<br />to <span className="serif-accent">become?</span></>}</h1>
            <p className="hero-description">{path === 'improve' ? 'Share a public GitHub link or tell us what you’ve been building. We’ll help you spot its next move.' : 'Tell us the role you’re aiming for. We’ll find project ideas that help you build toward it.'}</p>
            {path === 'improve' ? (
              <label className="field-label">PUBLIC GITHUB REPOSITORY <span>OPTIONAL</span><div className="input-wrap"><Github size={18} /><input type="url" placeholder="https://github.com/you/your-project" /></div></label>
            ) : (
              <label className="field-label">ROLE YOU’RE AIMING FOR<div className="input-wrap"><Sparkles size={18} /><input type="text" placeholder="e.g. AI engineer, product designer…" /></div></label>
            )}
            <label className="field-label">{path === 'improve' ? 'WHAT DOES IT DO?' : 'WHAT ARE YOU CURIOUS ABOUT?'}<textarea rows={3} placeholder={path === 'improve' ? 'A couple of sentences is plenty. You can paste a README later, too.' : 'Tell us what you like building or learning about…'} /></label>
            <button className="continue-button" onClick={() => {}}>Continue <ArrowRight size={17} /></button>
            <p className="privacy-note">Your ideas stay yours. We only use what you share to shape your suggestions.</p>
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
