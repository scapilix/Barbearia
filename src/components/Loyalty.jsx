import React from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, Crown } from 'lucide-react';

const Loyalty = () => {
  return (
    <section className="py-24 bg-main overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="bg-primary text-white rounded-[40px] p-8 md:p-20 relative overflow-hidden shadow-2xl">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 right-10 w-96 h-96 border-[40px] border-white rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-card rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="max-w-2xl text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-card/20 px-4 py-2 rounded-full mb-8"
              >
                <Crown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Platinum Membership</span>
              </motion.div>
              
              <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">
                Programa de <i className="italic text-main">Fidelidade VIP</i>
              </h2>
              <p className="text-white/80 text-lg mb-12 font-light leading-relaxed">
                A sua lealdade merece ser recompensada. Por cada visita, acumule pontos "Elegance" que podem ser trocados por serviços exclusivos ou produtos da nossa boutique.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="bg-card/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold mb-1">100€ = 10pts</div>
                  <div className="text-xs uppercase tracking-widest opacity-70">Conversão Direta</div>
                </div>
                <div className="bg-card/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold mb-1">-20% OFF</div>
                  <div className="text-xs uppercase tracking-widest opacity-70">A partir da 5ª Visita</div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-card border border-border-main p-10 rounded-[32px] text-main shadow-3xl w-full max-w-[400px] text-center"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Star className="w-10 h-10 text-primary fill-primary" />
              </div>
              <h3 className="font-bold text-2xl mb-4 tracking-tight">Comece a Acumular</h3>
              <p className="text-sm text-muted mb-10 leading-relaxed italic">
                Aderir é imediato e gratuito. Os seus primeiros 5 pontos são creditados na primeira reserva online.
              </p>
              <button className="w-full bg-main border border-border-main text-main py-5 rounded-custom font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-xl uppercase tracking-widest text-sm">
                Aderir ao Clube
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                <Gift className="w-3 h-3" />
                Prenda de Boas-vindas aguarda-a
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Loyalty;
