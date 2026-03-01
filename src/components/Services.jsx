import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useImage } from '../hooks/useImage';

const Services = () => {
  const { images } = useImage();

  const services = [
    {
      title: 'Corte Clássico',
      price: '15€',
      duration: '45 min',
      description: 'Corte tradicional à tesoura ou máquina, com acabamento perfeito e styling.',
      image: images.service_1
    },
    {
      title: 'Corte Degradê / Fade',
      price: '18€',
      duration: '45 min',
      description: 'Corte moderno com transição suave (fade) na navalha e finalização de topo.',
      image: images.service_2
    },
    {
      title: 'Barba com Toalha Quente',
      price: '15€',
      duration: '45 min',
      description: 'Ritual clássico de barboterapia com toalha quente, espuma aromática e massagem facial.',
      image: images.service_3
    },
    {
      title: 'Combo Corte + Barba',
      price: '30€',
      duration: '90 min',
      description: 'A experiência completa de cuidado masculino com corte detalhado e barboterapia.',
      image: images.service_4
    }
  ];

  return (
    <section id="servicos" className="py-24 bg-main">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Os Nossos Serviços</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Uma Experiência Clássica de <br />
              <i className="text-primary font-normal italic">Puro Cuidado</i>
            </h2>
          </div>
          <p className="text-muted max-w-sm mb-2 text-sm">
            Cada serviço é adaptado ao seu estilo, utilizando apenas barboterapia e pomadas das melhores marcas do mercado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card group rounded-custom overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-border-main"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute top-4 right-4 bg-card/90 border border-border-main backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-main shadow-sm">
                  {service.price}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-serif text-xl mb-3 text-dark group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted text-sm mb-6 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border-main">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                  <a href="#agendamento" className="text-xs font-bold text-dark border-b-2 border-primary/30 group-hover:border-primary transition-all pb-1 uppercase tracking-wider">
                    Reservar
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
