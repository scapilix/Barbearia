import React from 'react';
import { Instagram, Youtube, Mail, MapPin, Phone, ArrowUpRight, LogIn } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contactos" className="bg-main border-t border-border-main pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="font-serif text-3xl italic tracking-wide text-dark">
                TO <span className="text-primary not-italic font-medium">Barber</span>
              </span>
            </div>
            <p className="text-muted leading-relaxed mb-6 max-w-sm">
              Tradição, estética e precisão. Elevamos o barbeio e corte a uma forma de arte num ambiente exclusivo.
            </p>
            <div className="flex gap-4">
              {[Instagram, Youtube, Mail].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-main border border-border-main flex items-center justify-center text-main hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Col */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-main">Explorar</h5>
            <ul className="space-y-4 text-sm font-medium text-muted">
              {['Início', 'Serviços', 'Sobre nós', 'Equipa', 'Galeria'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link.toLowerCase().replace(' ', '')}`} 
                    className="hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    {link}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-main">Contactos</h5>
            <ul className="space-y-6 text-sm font-medium text-muted">
              <li className="flex gap-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Rua da Elegância, nº 123<br />1250-100 Lisboa, Portugal</span>
              </li>
              <li className="flex gap-4">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>+351 912 345 678</span>
              </li>
              <li className="flex gap-4">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>contact@tobarber.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-main">Newsletter</h5>
            <p className="text-muted text-xs mb-6 font-light">
              Subscreva para receber convites exclusivos para eventos e promoções sazonais.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Seu email" 
                className="w-full bg-card border-none rounded-l-custom px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
              <button className="bg-primary text-white px-6 rounded-r-custom hover:opacity-90 transition-all font-bold text-sm">
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border-main flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted font-bold uppercase tracking-widest">
          <p>© 2026 TO Barber. Todos os direitos reservados.</p>
          <div className="flex gap-6 items-center flex-wrap justify-center">
            <a href="#" className="hover:text-primary">Privacidade</a>
            <a href="#" className="hover:text-primary">Termos</a>
            <a href="#" className="hover:text-primary">Cookies</a>
            <div className="w-px h-3 bg-border-main hidden md:block"></div>
            <a href="/admin" className="hover:text-primary flex items-center gap-1 text-primary">
              <LogIn size={12} /> Login Profissional
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
