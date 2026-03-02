import React from 'react';
import { motion as Motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useImage } from '../hooks/useImage';

const AboutUs = () => {
  const { images } = useImage();
  
  return (
    <section id="sobre" className="py-24 bg-main overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <Motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="aspect-[4/5] rounded-custom overflow-hidden shadow-2xl relative z-10"
            >
              <img
                src={images.about_main}
                alt="High-end Alinhamento Perfeitoistry"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </Motion.div>
            
            {/* Decorative Element */}
            <Motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute -bottom-10 -right-10 w-72 h-72 rounded-custom overflow-hidden border-8 border-card shadow-2xl z-20 hidden md:block"
            >
              <img
                src={images.about_detail}
                alt="Process Detail"
                className="w-full h-full object-cover"
              />
            </Motion.div>
            
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl z-0"></div>
          </div>

          {/* Text Side */}
          <Motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Sobre o TO Barber</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">
              Onde Cada Detalhe <br />
              <i className="text-primary font-normal italic">Conta uma História</i>
            </h2>
            
            <div className="space-y-6 text-muted leading-relaxed mb-10">
              <p>
                Fundado com a visão de redefinir o conceito de Corte de luxo, o TO Barber Salon dedica-se à excelência em cada gesto. Especializamo-nos na técnica russa e em Barber art de alta performance.
              </p>
              <p>
                O nosso espaço foi concebido para ser um espaço moderno para cavalheiros, onde a sofisticação encontra a inovação. Utilizamos apenas produtos de classe mundial para garantir resultados impecáveis e duradouros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {[
                'Corte Degradê Certificada',
                'Ambiente Premium e Seguro',
                'Design Personalizado',
                'Esterilização de Grau Médico'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium text-main">{item}</span>
                </div>
              ))}
            </div>

            <button className="btn-dark flex items-center gap-3 group">
              Conheça a Nossa Equipa
              <Motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </Motion.span>
            </button>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
