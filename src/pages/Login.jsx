import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, KeyRound, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { login, setupPin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, role, photo_url, color, pin_code, access_level')
          .order('access_level', { ascending: true }) // Admins first
          .order('name', { ascending: true });
          
        if (!error && data) {
          setTeamMembers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPin('');
    setError('');
    // If PIN is null, empty string, or '0000', ask to setup a new one
    if (!member.pin_code || member.pin_code === '0000') {
      setIsSetupMode(true);
    } else {
      setIsSetupMode(false);
    }
  };

  const handleBack = () => {
    setSelectedMember(null);
    setPin('');
    setError('');
  };

  const attemptLogin = async (currentPin) => {
    setLoading(true);
    setError('');

    let res;
    if (isSetupMode) {
      res = await setupPin(selectedMember.id, currentPin);
    } else {
      res = await login(selectedMember.id, currentPin);
    }

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Erro ao iniciar sessão.');
      setPin('');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim().length === 0) {
      setError('Por favor, introduza a sua palavra-passe.');
      return;
    }
    attemptLogin(pin);
  };

  if (loading && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!selectedMember ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-dark mb-3 tracking-tight">Portal da Equipa</h1>
              <p className="text-muted">Selecione o seu perfil para entrar</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {teamMembers.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMemberSelect(m)}
                  className="card p-5 w-36 sm:w-44 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 group text-center border-2 border-transparent hover:shadow-lg"
                  style={{ ':hover': { borderColor: m.color || '#3B82F6' } }}
                >
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-[3px] shadow-sm transform group-hover:scale-105 transition-transform duration-300" style={{ borderColor: m.color || '#3B82F6' }} />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-sm text-3xl font-bold text-white transform group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: m.color || '#3B82F6' }}>
                      {m.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-dark text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{m.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted uppercase tracking-widest mt-1">{m.access_level === 'admin' ? 'Admin' : m.role || 'Profissional'}</p>
                  </div>
                </button>
              ))}
            </div>
            {teamMembers.length === 0 && !loading && (
              <div className="text-center text-muted p-12 bg-white rounded-3xl border border-border-main">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                Nenhum membro da equipa registado.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="pinpad"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md relative"
          >
            <button 
              onClick={handleBack}
              className="absolute -top-16 left-0 flex items-center gap-2 text-muted hover:text-dark font-medium transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border-main"
            >
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-border-main text-center relative overflow-hidden">
              
              {/* Top Banner Color */}
              <div className="absolute top-0 inset-x-0 h-24 opacity-20" style={{ backgroundColor: selectedMember.color || '#3B82F6' }}></div>

              <div className="relative z-10 flex flex-col items-center mb-8">
                {selectedMember.photo_url ? (
                  <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md text-3xl font-bold text-white border-4 border-white mb-4" style={{ backgroundColor: selectedMember.color || '#3B82F6' }}>
                    {selectedMember.name?.charAt(0) || 'U'}
                  </div>
                )}
                <h2 className="text-xl font-bold text-dark">{selectedMember.name.split(' ')[0]}</h2>
                <div className="inline-block mt-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-widest" style={{ color: selectedMember.color || '#3B82F6' }}>
                  {isSetupMode ? 'Criar Acesso' : 'Log In'}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
                <p className="text-muted text-sm font-medium">
                  {isSetupMode ? 'Crie a sua nova palavra-passe' : 'Insira a sua palavra-passe'}
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center justify-center gap-2 font-medium">
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}

                <div className="flex flex-col gap-3">
                  <input
                    type="password"
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    placeholder="Palavra-passe"
                    className="luxury-input text-center text-xl tracking-widest py-4 border-2"
                    style={{ borderColor: pin.length > 0 ? (selectedMember.color || '#1A1A1E') : undefined }}
                  />
                  <button 
                    type="submit" 
                    disabled={loading || pin.length === 0}
                    className="w-full h-14 bg-dark text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{ backgroundColor: selectedMember.color || '#1A1A1E' }}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>{isSetupMode ? 'Guardar e Entrar' : 'Entrar'} <ArrowRight size={20} /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
