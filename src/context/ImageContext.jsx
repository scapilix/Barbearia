import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Chaves para as imagens principais do site
const defaultImages = {
  hero_bg1: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=1920',
  hero_bg2: 'https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?auto=compress&cs=tinysrgb&w=1920',
  hero_bg3: 'https://images.pexels.com/photos/2068884/pexels-photo-2068884.jpeg?auto=compress&cs=tinysrgb&w=1920',
  hero_float1: 'https://images.pexels.com/photos/896695/pexels-photo-896695.jpeg?auto=compress&cs=tinysrgb&w=900',
  hero_float2: 'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=900',

  about_main: 'https://images.pexels.com/photos/896695/pexels-photo-896695.jpeg?auto=compress&cs=tinysrgb&w=1000', 
  about_detail: 'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800', 

  service_1: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=800',
  service_2: 'https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?auto=compress&cs=tinysrgb&w=800',
  service_3: 'https://images.pexels.com/photos/2085118/pexels-photo-2085118.jpeg?auto=compress&cs=tinysrgb&w=800',
  service_4: 'https://images.pexels.com/photos/2068884/pexels-photo-2068884.jpeg?auto=compress&cs=tinysrgb&w=800',

  team_1: 'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800',
  team_2: 'https://images.pexels.com/photos/1826960/pexels-photo-1826960.jpeg?auto=compress&cs=tinysrgb&w=800',
  team_3: 'https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?auto=compress&cs=tinysrgb&w=800',
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

