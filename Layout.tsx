import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/why' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#EFEFEB] text-[#111] relative z-10">

      {/* ── HEADER — Biogax style: white bg, logo left, nav center, neon CTA right ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 transition-all duration-300">
        <div className="max-w-[92%] mx-auto flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="z-50 hover:opacity-80 transition-opacity">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-14 w-auto"
              src="https://jitter.video/v/1739023402773.mp4"
            >
              Anvitam
            </video>
          </Link>

          {/* Desktop Nav — centered */}
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

          {/* Neon CTA pill — far right */}
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-5 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300"
          >
            Free Design Consultation <span>→</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden z-50 p-2 text-[#111]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile overlay */}
          <div
            className={`fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 transition-transform duration-500 ease-in-out md:hidden ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-3xl font-bold text-[#111] hover:text-[#555] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-8 py-4 rounded-full text-base font-semibold"
            >
              Free Design Consultation →
            </Link>
          </div>
        </div>
      </header>

      {/* Main — no top-padding, hero handles its own spacing */}
      <main className="flex-grow">{children}</main>

      {/* ── FOOTER — full Biogax dark footer ── */}
      <footer className="bg-[#0D0D0D] text-white pt-20 pb-10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-16">

          {/* Top CTA row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-16 mb-16 border-b border-white/10">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.15] max-w-xl">
              Ready to Transform<br />Your Space With Anvitam?
            </h2>
            <div className="md:pt-2 flex-shrink-0">
              <a
                href="https://topmate.io/archanagavas/1799075?utm_source=public_profile&utm_campaign=archanagavas"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-7 py-3.5 rounded-full text-sm font-bold hover:scale-105 transition-transform duration-300"
              >
                Free Design Consultation →
              </a>
            </div>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <p className="text-2xl font-bold mb-4">Anvitam</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Sustainable resort architect and eco retreat designer. Serving USA & Australia — and worldwide.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Links</h4>
              <ul className="space-y-3">
                {[['About', '/why'], ['Services', '/services'], ['Projects', '/projects'], ['Blog', '/blog']].map(([n, p]) => (
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
                {[['LinkedIn', 'https://linkedin.com'], ['Instagram', 'https://instagram.com'], ['YouTube', 'https://youtube.com'], ['Medium', 'https://medium.com']].map(([n, p]) => (
                  <li key={n}>
                    <a href={p} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">{n}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Newsletter */}
            <div>
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Subscribe Newsletter</h4>
              <p className="text-white/50 text-sm mb-4">Sign up to get updates &amp; news.</p>
              <input
                type="email"
                placeholder="jane@email.com"
                className="w-full bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#CCFF00] mb-2"
              />
              <button className="w-full bg-white text-[#111] font-semibold py-2.5 rounded-full text-sm hover:bg-[#CCFF00] transition-colors">
                Submit
              </button>
            </div>
          </div>

          {/* Contact icons row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-10 border-b border-white/10">
            {[
              { icon: '📞', label: 'Phone No:', val: '+91 98765 43210' },
              { icon: '✉️', label: 'Email Address:', val: 'anvitamarchitect@gmail.com' },
              { icon: '📍', label: 'Location:', val: 'India · USA · Australia — serving worldwide' },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-lg shrink-0">{c.icon}</div>
                <div>
                  <p className="text-[#CCFF00] text-xs font-bold mb-1">{c.label}</p>
                  <p className="text-white/70 text-sm">{c.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <span>© {new Date().getFullYear()} Anvitam. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/admin" className="text-[#CCFF00] hover:text-white transition-colors font-bold">Staff Login</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Layout;

