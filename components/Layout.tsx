import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail, ArrowRight, CheckCircle, Calculator, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import MapleLeafCursor from './MapleLeafCursor';
import EstimatorModal from './EstimatorModal';

// ── Newsletter Section Component ───────────────────────────────────────
const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    try {
      // Save to Neon database as a message
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter Subscriber',
          email: email.trim(),
          message: 'Newsletter subscription request',
          date: new Date().toISOString(),
        }),
      });
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="pb-16 mb-16 border-b border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3">Stay Connected</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            Get Design Insights & Updates
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Join our newsletter for sustainable architecture tips, project showcases, and permaculture insights delivered to your inbox.
          </p>
        </div>
        <div>
          {status === 'success' ? (
            <div className="flex items-center gap-3 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-2xl px-6 py-5">
              <CheckCircle className="text-[#CCFF00] shrink-0" size={22} />
              <div>
                <p className="text-white font-bold text-sm">You're subscribed!</p>
                <p className="text-white/50 text-xs mt-0.5">We'll be in touch with our latest updates.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white/10 border border-white/15 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#CCFF00] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Subscribing...' : <><span>Subscribe</span><ArrowRight size={14} /></>}
                </button>
              </div>
              {status === 'error' && (
                <p className="text-red-400 text-xs px-2">Something went wrong. Please try again.</p>
              )}
              <p className="text-white/30 text-xs px-2">No spam, ever. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [estimatorServiceId, setEstimatorServiceId] = useState<string | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const handleOpenEstimator = (e: CustomEvent<{ serviceId?: string }>) => {
      setEstimatorServiceId(e.detail?.serviceId);
      setEstimatorOpen(true);
    };
    window.addEventListener('open-estimator', handleOpenEstimator as EventListener);
    return () => window.removeEventListener('open-estimator', handleOpenEstimator as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/why' },
    { name: 'Services', path: '/services' },
    { name: 'Workshops', path: '/workshops' },
    { name: 'Projects', path: '/projects' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
  ];

  const TOPMATE = 'https://topmate.io/archanagavas/1799075?utm_source=public_profile&utm_campaign=archanagavas';

  const cleanPath = location.pathname.endsWith('/') && location.pathname !== '/'
    ? location.pathname.slice(0, -1)
    : location.pathname;
  const canonicalUrl = `https://www.anvitam.com${cleanPath}`;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#EFEFEB] text-[#111] relative z-10">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      {/* Custom maple leaf cursor across all pages */}
      <MapleLeafCursor />

      {/* ── FLOATING MINIMAL NAVBAR ── */}
      <header className="fixed top-4 inset-x-0 z-50 max-w-6xl mx-3 sm:mx-4 md:mx-auto transition-all duration-300">
        <nav className={`relative w-full rounded-full border transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between ${
          scrolled 
            ? 'bg-white/95 border-gray-300/80 shadow-xl shadow-black/[0.06] backdrop-blur-xl' 
            : 'bg-white/85 border-gray-200/80 shadow-lg shadow-black/[0.04] backdrop-blur-xl'
        }`}>
          {/* Logo — Left */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 text-lg md:text-xl font-bold tracking-tight text-[#111] hover:opacity-85 transition-opacity group">
              <img src="/logo.png" alt="Anvitam Logo" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
              <span>Anvitam</span>
            </Link>
          </div>

          {/* Desktop Nav Links — Center */}
          <div className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#111] text-white shadow-xs'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100/80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons — Right */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/admin"
              className="text-xs font-semibold text-gray-500 hover:text-black transition-colors px-2.5 py-1.5"
            >
              Admin
            </Link>
            <button
              onClick={() => setEstimatorOpen(true)}
              className="inline-flex items-center gap-1.5 border border-gray-300 text-[#111] px-3.5 py-1.5 rounded-full text-xs font-semibold hover:border-black hover:bg-gray-50 transition-all duration-200"
            >
              <Calculator size={13} /> Get Estimate
            </button>
            <a
              href={TOPMATE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-[#CCFF00] text-[#111] px-4 py-1.5 rounded-full text-xs font-bold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-xs"
            >
              Consultation →
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden relative z-[60] p-1.5 text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center md:hidden pt-20 pb-8 px-6 overflow-y-auto"
          >
            <div className="flex flex-col items-center space-y-3.5 w-full max-w-xs">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-bold text-[#111] hover:text-[#5A5A40] transition-colors py-1"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="w-12 h-px bg-black/10 my-1" />

              <button
                onClick={() => { setIsMenuOpen(false); setEstimatorOpen(true); }}
                className="w-full inline-flex items-center justify-center gap-2 border border-[#111] text-[#111] py-2.5 rounded-full text-sm font-semibold hover:bg-[#111] hover:text-white transition-all"
              >
                <Calculator size={16} /> Get Estimate
              </button>
              <a
                href={TOPMATE}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-[#111] py-2.5 rounded-full text-sm font-bold shadow-sm"
              >
                Free Consultation →
              </a>
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-semibold pt-2"
              >
                Staff Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimator Modal — createPortal renders into document.body */}
      {estimatorOpen && (
        <EstimatorModal 
          initialServiceId={estimatorServiceId} 
          onClose={() => { setEstimatorOpen(false); setEstimatorServiceId(undefined); }} 
        />
      )}

      {/* Main */}
      <main className="flex-grow">{children}</main>

      {/* ── BIOGAX-STYLE DARK FOOTER ── */}
      <footer className="bg-[#0D0D0D] text-white pt-20 pb-10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-16">

          {/* Newsletter opt-in section */}
          <NewsletterSection />

          {/* 4-col grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Anvitam Logo" className="h-10 w-10 object-contain" />
                <p className="text-2xl font-bold">Anvitam</p>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Global Sustainable Resort Architect &amp; Eco Retreat Master Planner. Designing regenerative luxury, farm retreats, and biophilic sanctuaries worldwide.
              </p>

              {/* Google Reviews Badge */}
              <a
                href="https://share.google/4Jgicgzyfn407XjLz"
                target="_blank"
                rel="noopener noreferrer"
                title="View Anvitam 4.9 Rating Google Reviews"
                className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl p-2.5 px-3.5 transition-all duration-300 group hover:border-[#CCFF00]/50"
              >
                {/* Google 'G' Logo */}
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>

                <div className="flex flex-col">
                  {/* 5 Stars */}
                  <div className="flex items-center gap-0.5 text-[#FFB800]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#FFB800" stroke="none" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#CCFF00] transition-colors mt-0.5">
                    4.9 Rating Reviews
                  </span>
                </div>
              </a>
            </div>
            {/* Links */}
            <div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Links</h4>
              <ul className="space-y-3">
                {[['About', '/why'], ['Services', '/services'], ['Projects', '/projects'], ['Shop', '/shop'], ['Blog', '/blog'], ['Contact', '/contact']].map(([n, p]) => (
                  <li key={n}>
                    <Link to={p} className="text-sm text-white/70 hover:text-white transition-colors">{n}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Socials */}
            <div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Socials</h4>
              <ul className="space-y-3">
                {[
                  ['LinkedIn', 'https://www.linkedin.com/in/archana-gavas/'],
                  ['Instagram', 'https://www.instagram.com/designby.archana'],
                  ['YouTube', 'https://www.youtube.com/@designbyarchana?sub_confirmation=1'],
                  ['Medium', 'https://medium.com/@archanagavas']
                ].map(([n, p]) => (
                  <li key={n}>
                    <a href={p} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">{n}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Social / Contact */}
            <div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Contact Us</h4>
              <ul className="space-y-3">
                <li><a href="mailto:ar.archanagavas@gmail.com" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors">ar.archanagavas@gmail.com</a></li>
                <li><a href="tel:+917990657190" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors">+91 7990657190</a></li>
                <li><span className="text-xs text-white/50 leading-relaxed block">2ND Floor, alisha chambers, Santram Mandir Rd, Nadiad, Gujarat 387001</span></li>
                <li><Link to="/contact" className="text-sm text-[#CCFF00] hover:text-white transition-colors font-semibold">Send us a message →</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <span>© {new Date().getFullYear()} Anvitam. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link
                to="/admin"
                className="text-[#CCFF00] hover:text-white transition-colors font-bold uppercase tracking-widest"
              >
                Staff Login
              </Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Layout;