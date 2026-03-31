import { Generator } from '@/components/Generator'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-bg/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center text-sm font-bold text-black">
            ⚡
          </div>
          <span className="font-bold text-[15px] tracking-tight text-fore">ShipReady</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <a
            href="https://luciferankon.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fore transition-colors"
          >
            by luciferankon →
          </a>
          <a
            href="https://github.com/luciferankon/shipready"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg hover:border-muted2 hover:text-fore transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[rgba(245,200,66,0.1)] border border-[rgba(245,200,66,0.25)] rounded-full px-4 py-1.5 text-gold text-xs font-semibold tracking-widest uppercase mb-6">
          <span>⚡</span> No API key required
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none mb-5">
          Stop writing{' '}
          <span className="text-gradient-gold">boring</span>
          <br />
          PR descriptions.
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed mb-3">
          Paste your git diff or describe your changes. Get a polished PR description,
          conventional commit message, or release notes — instantly.
        </p>
        <p className="text-muted/60 text-sm">
          Runs on the server. Your code never touches a third-party service.
        </p>
      </section>

      {/* Generator */}
      <Generator />

      {/* Footer */}
      <footer className="text-center py-12 text-sm text-muted border-t border-border mt-12">
        <p>
          Built by{' '}
          <a href="https://luciferankon.dev" className="text-gold hover:underline">
            luciferankon
          </a>{' '}
          · Powered by Claude AI · Your code stays on the server
        </p>
      </footer>
    </main>
  )
}
