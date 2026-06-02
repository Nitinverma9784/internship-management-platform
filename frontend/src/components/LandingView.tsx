import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Users, 
  GraduationCap,
  ArrowUpRight,
  ChevronRight,
  Award
} from 'lucide-react';

interface LandingViewProps {
  onBrowseListings: () => void;
  onStartAuth: (mode: 'login' | 'register') => void;
}

export default function LandingView({ onBrowseListings, onStartAuth }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-page-bg flex flex-col font-sans selection:bg-editorial-light/20 selection:text-editorial">
      
      {/* Premium Elegant Header */}
      <header className="h-20 px-8 lg:px-16 border-b border-[#F1F0EC] flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-editorial-light rounded-lg flex items-center justify-center text-white font-serif text-lg font-bold shadow-sm">
            I
          </div>
          <span className="font-serif text-2xl tracking-tight text-[#0D2D2D] font-semibold">Incipio.</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBrowseListings}
            className="text-xs font-semibold text-text-muted hover:text-editorial-light transition-colors px-3 py-2 cursor-pointer"
          >
            Browse Internships
          </button>
          <button
            onClick={() => onStartAuth('login')}
            className="text-xs font-semibold text-editorial hover:underline px-3 py-2 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => onStartAuth('register')}
            className="text-xs font-bold bg-editorial text-white border border-editorial hover:bg-editorial-light hover:border-editorial-light px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Register Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 lg:px-16 py-20 lg:py-28 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 text-left space-y-6 animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-editorial-light font-mono text-[10px] uppercase tracking-wider font-semibold">
            <Sparkles size={11} className="animate-pulse" />
            <span>Redefining University Career Networks</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-editorial leading-[1.1] font-semibold tracking-tight">
            Connecting collegiate craft with <span className="italic font-normal font-serif text-editorial-light">preeminent</span> opportunity.
          </h1>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans max-w-xl">
            Incipio acts as the premium bridge between elite students and top-tier companies. Create a unified dossier with verified PDF resumes, explore curated technical positions, and direct-apply with a single click.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onStartAuth('register')}
              className="px-6 py-3.5 bg-editorial text-white hover:bg-editorial-light rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
            >
              Get Started as Student / Recruiter
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBrowseListings}
              className="px-6 py-3.5 bg-white text-editorial hover:bg-[#F9F8F6] border border-[#E5E2DE] rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              Browse Open Listings
              <ArrowUpRight size={14} className="text-text-muted" />
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-10 border-t border-[#F1F0EC] grid grid-cols-3 gap-6">
            <div>
              <p className="font-serif text-2xl lg:text-3xl font-semibold text-editorial">100%</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mt-1">Real Persistence</p>
            </div>
            <div>
              <p className="font-serif text-2xl lg:text-3xl font-semibold text-editorial">1-Click</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mt-1">Application Vetting</p>
            </div>
            <div>
              <p className="font-serif text-2xl lg:text-3xl font-semibold text-editorial">Zero</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mt-1">Simulated Mock Seeds</p>
            </div>
          </div>
        </div>

        {/* Hero Interactive Card Mockups */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0D9488]/5 rounded-full blur-3xl -z-10" />
          
          <div className="w-full max-w-sm space-y-4">
            
            {/* Design System Glassmorphic Job Card */}
            <div className="bg-white border border-[#E5E2DE] p-5 rounded-2xl shadow-lg relative transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase text-editorial-light bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                  Featured Partner
                </span>
                <span className="text-[10px] text-text-light font-mono">Closing June 20</span>
              </div>
              <h4 className="font-serif font-semibold text-base text-editorial mt-3 leading-snug">
                Frontend Systems Architect
              </h4>
              <p className="text-[11px] text-text-muted mt-1">
                Linear • Remote (US/Canada)
              </p>
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-dashed border-[#F1F0EC]">
                <span className="text-[11px] text-editorial font-mono font-semibold">$45 / hr</span>
                <span className="text-[10px] font-bold text-editorial-light flex items-center gap-0.5">
                  Standard Apply <ChevronRight size={11} />
                </span>
              </div>
            </div>

            {/* Micro Apply Dossier Card */}
            <div className="bg-white border border-[#E5E2DE] p-5 rounded-2xl shadow-xl transform translate-x-4 lg:translate-x-8 rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-editorial-light/10 text-editorial-light flex items-center justify-center font-bold text-xs">
                  AR
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-editorial leading-none">Alex River</p>
                  <p className="text-[9px] text-text-muted mt-0.5">Stanford University • CS '27</p>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-[#F9F8F6] rounded-lg border border-[#E5E2DE] text-left">
                <p className="text-[9px] font-mono text-text-light uppercase tracking-wider">Attached Dossier</p>
                <div className="flex items-center justify-between mt-1 text-[10px] font-semibold text-editorial">
                  <span>alex_river_resume.pdf</span>
                  <span className="text-emerald-600">Verified ✓</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#F1F0EC] rounded-full overflow-hidden">
                  <div className="bg-editorial-light h-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-[9px] font-mono text-text-muted">Profile Complete</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-y border-[#F1F0EC] py-20 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-[10px] font-mono uppercase text-editorial-light tracking-widest font-semibold">Core Advantages</span>
            <h2 className="font-serif text-3xl font-semibold text-editorial">
              Crafted beautifully. Engineered for high performance.
            </h2>
            <p className="text-xs text-text-muted">
              Every detail is meticulously refined to offer student applicants and recruiting coordinators the absolute ultimate software experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-page-bg border border-[#E5E2DE] rounded-2xl space-y-4">
              <div className="h-9 w-9 rounded-xl bg-editorial-light/10 text-editorial-light flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <h3 className="font-serif font-semibold text-lg text-editorial">Elite Curated Opportunities</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Browse premium internships from leading startups and tech standard-bearers. Tailored pay ranges, detailed tech stacks, and clear expectations.
              </p>
            </div>

            <div className="p-6 bg-page-bg border border-[#E5E2DE] rounded-2xl space-y-4">
              <div className="h-9 w-9 rounded-xl bg-editorial-light/10 text-editorial-light flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-serif font-semibold text-lg text-editorial">Verified PDF Credentials</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Upload real, structured PDF resumes stored directly on the Express server. Showcase GitHub, LinkedIn, and X profiles cleanly on a single unified canvas.
              </p>
            </div>

            <div className="p-6 bg-page-bg border border-[#E5E2DE] rounded-2xl space-y-4">
              <div className="h-9 w-9 rounded-xl bg-editorial-light/10 text-editorial-light flex items-center justify-center">
                <Mail size={18} />
              </div>
              <h3 className="font-serif font-semibold text-lg text-editorial">Direct Dialogue Channels</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Never fall into a recruiting void. Send, review, and track messages in real time. Receive structured, automated company updates at every review stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-8 lg:px-16 py-20 max-w-7xl mx-auto text-center space-y-10">
        <div className="max-w-md mx-auto space-y-2">
          <Award className="text-[#94A3B8] mx-auto" size={24} />
          <h2 className="font-serif text-2xl font-semibold text-editorial">Praised by candidates</h2>
          <p className="text-xs text-text-muted">Hear what developers and designers say about Incipio's speed and design elegance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white border border-[#E5E2DE] rounded-2xl text-left space-y-4 shadow-xs">
            <p className="text-xs text-text-muted italic leading-relaxed font-sans">
              "Applying was incredibly fast. I filled out my LinkedIn, GitHub, and resume details in five minutes, clicked 'One-Click Apply' on a backend role at Stripe, and got a real-time messaging receipt instantly."
            </p>
            <div>
              <p className="text-xs font-semibold text-editorial font-serif">Marcus Vance</p>
              <p className="text-[10px] text-text-light font-mono">Cornell University • Systems Engineering '26</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E5E2DE] rounded-2xl text-left space-y-4 shadow-xs">
            <p className="text-xs text-text-muted italic leading-relaxed font-sans">
              "The design aesthetics of Incipio are absolutely stunning. The editorial type scales and typography pairing feel premium, responsive, and lightyears ahead of standard university tools."
            </p>
            <div>
              <p className="text-xs font-semibold text-editorial font-serif">Vicky Chen</p>
              <p className="text-[10px] text-text-light font-mono">University of Waterloo • HCI Design '27</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action banner */}
      <section className="bg-editorial text-white py-16 px-8 lg:px-16 text-center space-y-6 relative overflow-hidden select-none border-t border-brand-800">
        <div className="absolute inset-0 bg-[#0D9488]/10 blur-2xl" />
        <div className="relative max-w-xl mx-auto space-y-6">
          <h3 className="font-serif text-3xl font-semibold leading-tight">
            Empower your next career transition today.
          </h3>
          <p className="text-xs text-brand-100 max-w-sm mx-auto leading-relaxed">
            Create your account to unlock internship pipelines, set up social coordinates, and interact with reviewing recruiting officers.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onStartAuth('register')}
              className="px-6 py-3 bg-white text-editorial hover:bg-cream-accent rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              Sign Up Now <ArrowRight size={13} className="text-editorial" />
            </button>
          </div>
        </div>
      </section>

      {/* Natural Minimalist Footer */}
      <footer className="mt-auto h-16 border-t border-[#F1F0EC] bg-white px-8 flex items-center justify-between text-[10px] text-text-light font-mono select-none">
        <span>© 2026 INCIPIO PORTALS INC.</span>
        <span>AESTHETIC CAREER COORDINATION TECHNOLOGY</span>
      </footer>

    </div>
  );
}
