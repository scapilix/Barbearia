import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ShieldCheck, MapPin, ParkingCircle, CreditCard, Euro } from 'lucide-react';

const amenities = [
  { icon: <Coffee className="w-6 h-6" />, title: 'Lounge & Bar', desc: 'Desfrute de café premium, chás biológicos ou champanhe durante o seu serviço.' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Segurança Total', desc: 'Esterilização em autoclave de grau médico e materiais 100% descartáveis.' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Localização Central', desc: 'Acesso fácil numa zona de prestígio, com estrada acessível para todos.' },
  { icon: <ParkingCircle className="w-6 h-6" />, title: 'Estacionamento Privado', desc: 'Parque gratuito exclusivo para clientes no local.' }
];

const payments = [
  { icon: <CreditCard className="w-4 h-4" />, name: 'Cartão Crédito/Débito' },
  { icon: <Euro className="w-4 h-4" />, name: 'Multibanco & Numerário' },
  { icon: <div className="font-bold text-[10px]">NFC</div>, name: 'Apple & Google Pay' }
];

const Amenities = () => {
  return (
    <section className="py-24 bg-main">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Conforto & Facilidade</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">
              A Sua Comodidade é a <br />
              <i className="text-primary font-normal italic">Nossa Prioridade</i>
            </h2>
            <p className="text-muted leading-relaxed mb-12 max-w-lg">
              Queremos que cada visita seja um retiro de luxo. Desde a facilidade de estacionamento à tecnologia de pagamentos sem contacto, cada detalhe foi otimizado para si.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {payments.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border-main shadow-sm text-[10px] font-bold uppercase tracking-wider text-main">
                  <span className="text-primary">{p.icon}</span>
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {amenities.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-10 rounded-[24px] border border-border-main hover:border-primary/30 transition-all hover:shadow-xl group"
              >
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-3 tracking-tight">{item.title}</h4>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Amenities;
