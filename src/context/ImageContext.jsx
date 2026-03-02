import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Chaves para as imagens principais do site
const defaultImages = {
  hero_bg1: 'https://images.unsplash.com/photo-1599351431202-18153fd58d7c?q=80&w=1920&auto=format&fit=crop?q=80&w=1920&auto=format&fit=crop',
  hero_bg2: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1920&auto=format&fit=crop?q=80&w=1920&auto=format&fit=crop',
  hero_bg3: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop?q=80&w=1920&auto=format&fit=crop',
  hero_float1: 'https://images.unsplash.com/photo-1532710093739-9470acdf8754?q=80&w=900&auto=format&fit=crop?q=80&w=900&auto=format&fit=crop',
  hero_float2: 'https://images.unsplash.com/photo-1599351431202-18153fd58d7c?q=80&w=1920&auto=format&fit=crop?q=80&w=900&auto=format&fit=crop',

  about_main: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1000&auto=format&fit=crop?q=80&w=1000&auto=format&fit=crop', 
  about_detail: 'https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=800&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop', 

  service_1: 'https://images.unsplash.com/photo-1599351431202-18153fd58d7c?q=80&w=1920&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',
  service_2: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1920&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',
  service_3: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',
  service_4: 'https://images.unsplash.com/photo-1532710093739-9470acdf8754?q=80&w=900&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',

  team_1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',
  team_2: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',
  team_3: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop?q=80&w=800&auto=format&fit=crop',
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

