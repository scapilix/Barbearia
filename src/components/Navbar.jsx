import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Sobre nós', href: '#sobre' },
    { name: 'Equipa', href: '#equipa' },
    { name: 'Galeria', href: '#galeria' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contactos', href: '#footer' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 shadow-lg border-b backdrop-blur-xl'
          : 'py-8 bg-transparent'
      }`}
      style={scrolled ? {
        backgroundColor: 'rgba(var(--bg-main), 0.97)',
        borderColor: 'rgba(var(--border-main), 0.5)',
      } : {}}
    >
      {/* Gradient overlay when transparent (hero visible) */}
      {!scrolled && (
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none -z-10"></div>
      )}

      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="font-serif text-2xl font-bold tracking-tighter transition-colors duration-300"
          style={{ color: scrolled ? 'rgb(var(--text-main))' : '#fff' }}
        >
          TO<span className="text-primary not-italic font-medium">Barber</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-all duration-300"
              style={{ color: scrolled ? 'rgb(var(--text-muted))' : 'rgba(255,255,255,0.9)' }}
            >
              {link.name}
            </a>
          ))}

          <a
            href="#agendamento"
            className="px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-md bg-primary text-white hover:opacity-90"
          >
            AGENDAR AGORA
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 transition-colors duration-300"
          style={{ color: scrolled ? 'rgb(var(--text-main))' : '#fff' }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden shadow-2xl border-t"
            style={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border-main))' }}
          >
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors"
                  style={{ color: 'rgb(var(--text-main))' }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#agendamento"
                className="btn-primary text-center py-4"
                onClick={() => setIsOpen(false)}
              >
                AGENDAR AGORA
              </a>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
