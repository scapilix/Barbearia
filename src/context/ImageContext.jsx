import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Chaves para as imagens principais do site
const defaultImages = {
  hero_bg1: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=1920&auto=format&fit=crop',
  hero_bg2: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1920&auto=format&fit=crop',
  hero_bg3: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=1920&auto=format&fit=crop',
  hero_float1: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?q=80&w=900&auto=format&fit=crop',
  hero_float2: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=900&auto=format&fit=crop',

  about_main: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1000&auto=format&fit=crop', 
  about_detail: 'https://images.unsplash.com/photo-1516975080661-46bca194f509?q=80&w=800&auto=format&fit=crop', 

  service_1: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=800&auto=format&fit=crop',
  service_2: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop',
  service_3: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=800&auto=format&fit=crop',
  service_4: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?q=80&w=800&auto=format&fit=crop',

  team_1: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop',
  team_2: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?q=80&w=800&auto=format&fit=crop',
  team_3: 'https://images.unsplash.com/photo-1588516999521-43030079545c?q=80&w=800&auto=format&fit=crop',
};

const ImageContext = createContext(null);
export { ImageContext };

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState(defaultImages);

  useEffect(() => {
    const fetchCustomImages = async () => {
      const { data, error } = await supabase
        .from('site_images')
        .select('image_key, image_url');
      
      if (error) {
        console.error('Error fetching custom images:', error);
        return;
      }

      if (data && data.length > 0) {
        const customMapped = data.reduce((acc, curr) => ({
          ...acc,
          [curr.image_key]: curr.image_url
        }), {});
        setImages(prev => ({ ...prev, ...customMapped }));
      }
    };

    fetchCustomImages();
  }, []);

  const updateImage = async (key, base64data) => {
    // 1. Update state immediately for responsiveness
    setImages(prev => ({ ...prev, [key]: base64data }));

    // 2. Persist to Supabase
    const { error } = await supabase
      .from('site_images')
      .upsert({ image_key: key, image_url: base64data }, { onConflict: 'image_key' });

    if (error) {
      console.error('Failed to save to Supabase:', error);
      alert('Erro: Falha ao guardar a imagem permanentemente na base de dados.');
    }
  };

  const resetImages = async () => {
    // 1. Reset state
    setImages(defaultImages);

    // 2. Clear from Supabase
    const { error } = await supabase
      .from('site_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (error) {
      console.error('Failed to reset images in Supabase:', error);
    }
  };

  return (
    <ImageContext.Provider value={{ images, updateImage, resetImages, defaultImages }}>
      {children}
    </ImageContext.Provider>
  );
};

