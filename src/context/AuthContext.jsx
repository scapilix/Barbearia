import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent login
    const storedUser = localStorage.getItem('tobarber_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userId, pin) => {
    try {
      setLoading(true);
      if (!userId || !pin) throw new Error('Dados inválidos');

      // Fetch user matching the id and pin from team_members
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', userId)
        .eq('pin_code', pin)
        .single();
        
      if (error || !data) {
        throw new Error('PIN incorreto.');
      }

      // Format the user session object
      const sessionUser = {
        id: data.id,
        name: data.name,
        role: data.role,
        access_level: data.access_level || 'employee',
        color: data.color || '#3B82F6',
        photo_url: data.photo_url
      };

      setUser(sessionUser);
      localStorage.setItem('tobarber_user', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
      
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const setupPin = async (userId, newPin) => {
    try {
      setLoading(true);
      if (!userId || !newPin || newPin.trim().length === 0) throw new Error('Palavra-passe inválida');

      const { data, error } = await supabase
        .from('team_members')
        .update({ pin_code: newPin })
        .eq('id', userId)
        .select()
        .single();

      if (error || !data) throw new Error('Erro ao configurar o PIN.');

      // Login equivalent
      const sessionUser = {
        id: data.id,
        name: data.name,
        role: data.role,
        access_level: data.access_level || 'employee',
        color: data.color || '#3B82F6',
        photo_url: data.photo_url
      };

      setUser(sessionUser);
      localStorage.setItem('tobarber_user', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };

    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tobarber_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, setupPin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
