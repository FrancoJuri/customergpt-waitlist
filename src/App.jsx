

const App = () => {
  return (
    <div className="min-h-dvh relative overflow-hidden bg-background text-foreground flex flex-col">
      <div className="absolute inset-0 bg-surface-pattern pointer-events-none"></div>
      {/* Glows to match reference */}
      <div className="glow-purple w-[880px] h-[480px] top-28 left-[10%] -translate-x-10 rounded-full"></div>
      <div className="glow-blue w-[1000px] h-[520px] bottom-16 right-[8%] translate-x-10 rounded-full"></div>
      <main className="relative flex-1 flex flex-col">
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-16 sm:pt-24">
          {/* Badges */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm shadow-[0_2px_0_0_rgba(99,102,241,0.35)] ring-1 ring-ring/60 px-3 py-1 text-xs font-medium text-foreground/70">
              Waitlist v1
            </span>
            <span className="inline-flex items-center rounded-full bg-white/70 backdrop-blur-sm shadow-[0_2px_0_0_rgba(99,102,241,0.35)] ring-1 ring-ring/60 px-3 py-1 text-xs font-medium text-foreground/70">
              Coming Soon
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-center font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
            Get <span className="text-indigo-500">AI support</span> and <span className="text-indigo-500">feedback</span>
            <br className="hidden sm:block" />
            with just <span className="text-indigo-500">one line</span> of code
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-center text-base sm:text-lg text-muted max-w-3xl mx-auto">
            A lightweight widget that gives you a smart chatbot + feedback collector — trained on your site — with zero backend or setup needed.
          </p>

          {/* Email Card */}
          <div className="mt-10 mx-auto max-w-2xl px-4 relative">
            <div className="waitlist-card rounded-2xl p-4 relative">
              <div className="waitlist-field flex items-center gap-3 px-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <input
                  type="text"
                  placeholder="Your name..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-muted/70 text-foreground"
                />
              </div>
              <div className="waitlist-field flex items-center gap-3 px-4 mt-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                  <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <input
                  type="email"
                  placeholder="Your email..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-muted/70 text-foreground"
                />
              </div>
              <button className="waitlist-button mt-3 w-full font-semibold text-base cursor-pointer">
                Join The Waitlist
              </button>
              
            </div>
          </div>

          {/* Feature bullets */}
          <div className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
              <li className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                  <path d="M9 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>One-line integration</span>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
                  <path d="M12 4.5V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <rect x="6" y="6.5" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="10" cy="11" r="1.1" fill="currentColor"/>
                  <circle cx="14" cy="11" r="1.1" fill="currentColor"/>
                  <path d="M8.5 15.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span>AI trained on your site</span>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600">
                  <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Built for builders</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 pb-7 mt-auto">
          <p className="text-center text-xs text-muted">
            © Customer GPT – Handle customer support with AI. Built by
            <a className="font-medium text-foreground/80 hover:underline ml-1" target="_blank" rel="noreferrer" href="https://x.com/francojuri_dev">@francojuri_dev</a>
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App;