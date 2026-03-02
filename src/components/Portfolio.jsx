import React from 'react';
import { motion } from 'framer-motion';
import { useImage } from '../hooks/useImage';

const Portfolio = () => {
  const { images } = useImage();

  const portfolioImages = [
    {
      src: images.hero_bg1,
      category: 'Corte Russa',
      title: 'Minimalist Nude'
    },
    {
      src: images.hero_bg2,
      category: 'Barber Art',
      title: 'Emerald Luxury'
    },
    {
      src: images.hero_bg3,
      category: 'Extensões',
      title: 'Stiletto Rose'
    },
    {
      src: images.hero_float1,
      category: 'Barber Art',
      title: 'Golden Accents'
    },
    {
      src: images.hero_float2,
      category: 'Máquina',
      title: 'Classic Red'
    },
    {
      src: images.about_detail,
      category: 'Corte Russa',
      title: 'Perfect Finish'
    }
  ];
  return (
    <section id="galeria" className="py-24 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-20">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-bold tracking-[0.4em] text-xs uppercase mb-4 block"
        >
          Portfólio de Assinatura
        </motion.span>
        <h2 className="font-serif text-4xl md:text-5xl italic font-light tracking-wide">
          Onde a Visão se torna <i className="text-primary font-normal not-italic underline decoration-1 underline-offset-8">Obra de Arte</i>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 max-w-7xl mx-auto">
        {portfolioImages.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`group relative overflow-hidden rounded-custom cursor-pointer ${index % 3 === 1 ? 'md:mt-12' : ''}`}
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
              <span className="text-primary text-[10px] uppercase tracking-[0.3em] mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {item.category}
              </span>
              <h4 className="font-serif text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                {item.title}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-24 text-center">
        <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mb-8">Siga-nos no Instagram para mais inspiração</p>
        <div className="flex justify-center gap-4">
          <div className="w-12 h-[1px] bg-primary/30 my-auto"></div>
          <span className="font-serif italic text-2xl text-primary">@tobeautysalon</span>
          <div className="w-12 h-[1px] bg-primary/30 my-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
