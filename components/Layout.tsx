import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import MapleLeafCursor from './MapleLeafCursor';

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
  const location = useLocation();

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

      {/* ── HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-black/5' : 'bg-white/90 backdrop-blur-md border-b border-black/5'
      }`}>
        <div className="max-w-[92%] mx-auto flex items-center justify-between py-3">
          <Link to="/" className="z-50 flex items-center gap-2.5 text-xl md:text-2xl font-bold tracking-tight text-[#111] hover:opacity-85 transition-opacity duration-300 group">
            <img src="/logo.png" alt="Anvitam Logo" className="h-10 w-10 object-contain" />
            Anvitam
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-[#333] hover:text-[#111] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA + Admin */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin"
              className="text-xs font-semibold text-gray-400 hover:text-[#111] transition-colors border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-400"
            >
              Admin
            </Link>
            <a
              href={TOPMATE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-5 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300"
            >
              Free Consultation →
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative z-[60] p-2 text-[#111]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile overlay moved outside header to prevent backdrop-blur containment */}
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 md:hidden pt-16"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-3xl font-bold text-[#111] hover:text-[#555] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <a
              href={TOPMATE}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-8 py-4 rounded-full text-base font-semibold"
            >
              Free Consultation →
            </a>
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-full px-6 py-2.5"
            >
              Staff Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

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
              <p className="text-white/50 text-sm leading-relaxed">
                Sustainable resort architect and eco retreat designer. Serving USA &amp; Australia — and worldwide.
              </p>
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
                    <a href={p} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">{n}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Social / Contact */}
            <div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Contact Us</h4>
              <ul className="space-y-3">
                <li><a href="mailto:anvitamarchitects@gmail.com" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors">anvitamarchitects@gmail.com</a></li>
                <li><a href="tel:+917990657190" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors">+91 7990657190</a></li>
                <li><Link to="/contact" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors">Send us a message</Link></li>
                <li><Link to="/shop" className="text-sm text-white/70 hover:text-[#CCFF00] transition-colors">Shop & Resources</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact icons row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 mb-10 border-b border-white/10">
            {[
              { icon: '📞', label: 'Phone No:', val: '+91 7990657190' },
              { icon: '✉️', label: 'Email Address:', val: 'anvitamarchitects@gmail.com' },
              { icon: '📍', label: 'Location:', val: 'India' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-lg shrink-0">{c.icon}</div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#CCFF00] text-xs font-bold mb-1">{c.label}</p>
                  <p className="text-white/70 text-sm leading-tight">{c.val}</p>
                </div>
              </div>
            ))}
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