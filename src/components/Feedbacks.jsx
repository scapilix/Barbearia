import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Patrícia Duarte',
    role: 'Cliente Verificada',
    text: 'A barboterapia mudou o meu visual. O detalhe e a perfeição que a equipa coloca no trabalho é algo único. O espaço é puro conforto!',
    stars: 5,
    avatar: 'https://i.pravatar.cc/150?u=patricia'
  },
  {
    name: 'Margarida Santos',
    role: 'Cliente Habitual',
    text: 'Melhor experiência de Spa Pedicure. O ambiente é tão calmo e elegante que me sinto num verdadeiro retiro. Recomendo vivamente!',
    stars: 5,
    avatar: 'https://i.pravatar.cc/150?u=margarida'
  },
  {
    name: 'Carolina Silva',
    role: 'Cliente Verificada',
    text: 'A nail art superou as minhas expectativas. Mostrei uma foto e o resultado ficou ainda melhor. Um serviço de excelência e muito profissionalismo.',
    stars: 5,
    avatar: 'https://i.pravatar.cc/150?u=carolina'
  }
];

const Feedbacks = () => {
  return (
    <section id="feedback" className="py-24 bg-main overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Testemunhos</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">
              O Que as Nossas <br />
              <i className="text-primary font-normal italic">Clientes Dizem</i>
            </h2>
            
            <div className="bg-card p-10 rounded-[32px] border border-border-main relative">
              <Quote className="absolute top-8 right-8 text-primary/10 w-24 h-24 rotate-180" />
              
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" 
                  alt="Google" 
                  className="h-6"
                />
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <div>
                  <div className="flex text-primary mb-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-primary" />)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-main">
                    4.9 / 5 Baseado em 861 Avaliações
                  </div>
                </div>
              </div>
              
              <p className="text-lg italic text-main leading-relaxed font-light mb-8 relative z-10">
                "A TO Barber é mais do que uma barbearia, é um clube de cavalheiros elevado ao máximo nível. A atenção aos detalhes é incomparável."
              </p>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-primary rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="Client" />
                </div>
                <div>
                  <div className="font-bold text-sm">Helena Matos</div>
                  <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Fashion Curator</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-custom border border-border-main shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex text-primary">
                    {[...Array(review.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Google Verified</span>
                </div>
                <p className="text-sm text-muted mb-6 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
                    <img src={review.avatar} alt={review.name} />
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase tracking-tight">{review.name}</div>
                    <div className="text-[10px] text-muted">{review.role}</div>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedbacks;
