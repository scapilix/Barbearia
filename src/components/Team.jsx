import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTeam = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      if (error) throw error;
      setTeam(data || []);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const next = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % team.length);
  }, [team.length]);

  const prev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + team.length) % team.length);
  }, [team.length]);

  // Auto-slide if more than 3
  useEffect(() => {
    if (team.length <= 3) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [team.length, next]);

  const visibleCount = 3;
  const getVisibleItems = () => {
    if (team.length <= visibleCount) return team;
    const items = [];
    for (let i = 0; i < visibleCount; i++) {
      items.push(team[(currentIndex + i) % team.length]);
    }
    return items;
  };

  if (loading) return null;
  if (team.length === 0) return null;

  return (
    <section id="equipa" className="py-24 bg-main">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Nossa Equipa</span>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 italic">Mestres da Arte</h2>
          <p className="text-muted font-light leading-relaxed">
            Uma equipa dedicada e apaixonada pela perfeição, focada em transformar a sua visão em realidade.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout" initial={false}>
              {getVisibleItems().map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="text-center group"
                >
                  <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-8 shadow-lg relative bg-secondary/50">
                    <img
                      src={member.photo_url || 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                      <a href="#" className="w-10 h-10 rounded-full bg-card border border-border-main text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-card border border-border-main text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <h4 className="font-serif text-2xl mb-2 text-dark group-hover:text-primary transition-colors">{member.name}</h4>
                  <p className="text-primary uppercase text-[10px] font-bold tracking-[0.2em] mb-4">{member.role}</p>
                  <p className="text-sm text-muted font-light leading-relaxed max-w-[280px] mx-auto italic border-t border-border-main pt-4 px-4 h-24 overflow-hidden text-ellipsis line-clamp-4">
                    {member.details ? `"${member.details}"` : '"Dedicada à excelência em cada detalhe."'}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {team.length > 3 && (
            <>
              <button 
                onClick={prev}
                className="absolute left-[-60px] top-1/2 -translate-y-1/2 p-4 text-gray-300 hover:text-primary transition-colors hidden lg:block"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={next}
                className="absolute right-[-60px] top-1/2 -translate-y-1/2 p-4 text-gray-300 hover:text-primary transition-colors hidden lg:block"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              
              <div className="flex justify-center gap-2 mt-12">
                {team.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Team;
