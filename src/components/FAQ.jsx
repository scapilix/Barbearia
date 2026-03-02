import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Qual a política de cancelamento?',
    answer: 'Solicitamos que qualquer cancelamento ou reagendamento seja feito com pelo menos 24 horas de antecedência. Cancelamentos tardios poderão estar sujeitos a uma taxa de reserva de 50%.'
  },
  {
    question: 'Como é garantida a higiene dos utensílios?',
    answer: 'A sua segurança é a nossa prioridade. Utilizamos um autoclave de grau médico (Classe B) para esterilizar todos os instrumentos metálicos. Materiais como limas e paus de laranjeira são rigorosamente descartáveis e individuais.'
  },
  {
    question: 'Têm serviços para noivas ou eventos?',
    answer: 'Sim, dispomos de pacotes Bridal Styling exclusivos que incluem consultoria de imagem para Barba, prova de design e acompanhamento personalizado para garantir que as suas mãos brilham no grande dia.'
  },
  {
    question: 'Quanto tempo dura uma Corte Degradê?',
    answer: 'Dada a precisão e detalhe deste serviço, a duração média é de 90 minutos. Este tempo permite um tratamento profundo das cutículas e a aplicação técnica perfeita do reforço.'
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-main">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Dúvidas Frequentes</span>
          <h2 className="font-serif text-4xl md:text-5xl">Perguntas <i className="text-primary italic font-normal">Frequentes</i></h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-card rounded-custom border border-border-main overflow-hidden shadow-sm open:ring-1 open:ring-primary/30 transition-all"
            >
              <summary className="list-none flex justify-between items-center p-6 md:p-8 cursor-pointer font-bold text-main select-none">
                <span className="text-sm md:text-base uppercase tracking-wider">{faq.question}</span>
                <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-8 md:px-8 md:pb-10 text-muted text-sm md:text-base leading-relaxed border-t border-border-main pt-4">
                {faq.answer}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
