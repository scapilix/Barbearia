import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload, Save, Check, RefreshCw } from 'lucide-react';
import { useImage } from '../hooks/useImage';

const ImageUploadGroup = ({ title, description, imageKeys, currentImages, onUpload }) => {
  return (
    <div className="card p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-dark">{title}</h3>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imageKeys.map((item) => (
          <div key={item.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-dark">{item.label}</span>
            </div>
            
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-border-main group">
              {currentImages[item.key] ? (
                <img 
                  src={currentImages[item.key]} 
                  alt={item.label} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-medium">Sem imagem</span>
                </div>
              )}
              
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                <Upload size={24} className="text-white mb-2" />
                <span className="text-white text-sm font-medium">Alterar Imagem</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onUpload(item.key, e)} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminImages = () => {
  const { images, updateImage, resetImages } = useImage();
  const [successMsg, setSuccessMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleImageUpload = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 5MB recommend for not overloading local/supabase)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem é muito grande. O tamanho máximo permitido é 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64data = reader.result;
      try {
        await updateImage(key, base64data);
        setSuccessMsg('Imagem atualizada com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        console.error("Error updating image:", err);
        alert("Erro ao atualizar imagem.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = async () => {
    if (!confirm('Tem a certeza que deseja restaurar as imagens de origem? Todas as personalizações serão perdidas.')) {
      return;
    }
    try {
      setIsResetting(true);
      await resetImages();
      setSuccessMsg('Imagens de origem restauradas!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error resetting images:", err);
      alert("Erro ao restaurar imagens.");
    } finally {
      setIsResetting(false);
    }
  };

  const sections = [
    {
      title: "Página Principal (Hero)",
      description: "Imagens que aparecem no topo do site e na galeria flutuante.",
      keys: [
        { key: 'hero_bg1', label: 'Background 1 (Nude/Minimal)' },
        { key: 'hero_bg2', label: 'Background 2 (Emerald/BarberArt)' },
        { key: 'hero_bg3', label: 'Background 3 (Rose/Extensões)' },
        { key: 'hero_float1', label: 'Inlay 1 (Golden Accents)' },
        { key: 'hero_float2', label: 'Inlay 2 (Classic Red)' }
      ]
    },
    {
      title: "Sobre Nós",
      description: "Imagens que apresentam o conceito e detalhes do salão.",
      keys: [
        { key: 'about_main', label: 'Imagem Principal (Salão/Conceito)' },
        { key: 'about_detail', label: 'Detalhe (Trabalho de precisão)' }
      ]
    },
    {
      title: "Serviços",
      description: "Imagens representativas dos serviços oferecidos.",
      keys: [
        { key: 'service_1', label: 'Serviço 1 (Corte Russa)' },
        { key: 'service_2', label: 'Serviço 2 (Barber Art Ouro)' },
        { key: 'service_3', label: 'Serviço 3 (Extensões Gel)' },
        { key: 'service_4', label: 'Serviço 4 (Máquina Spa)' }
      ]
    },
    {
      title: "Equipa (Profissionais)",
      description: "Imagens para exemplificar o talento ou as profissionais.",
      keys: [
        { key: 'team_1', label: 'Profissional / Estilo 1' },
        { key: 'team_2', label: 'Profissional / Estilo 2' },
        { key: 'team_3', label: 'Profissional / Estilo 3' }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Gestor de Imagens</h1>
          <p className="text-muted text-sm mt-1">Personalize as fotografias de todos os setores do seu projeto Barbers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg"
            >
              <Check size={16} />
              {successMsg}
            </motion.div>
          )}

          <button 
            onClick={handleReset}
            disabled={isResetting}
            className="btn-secondary flex items-center gap-2 hover:bg-slate-200"
          >
            <RefreshCw size={16} className={isResetting ? "animate-spin" : ""} />
            Restaurar Originais
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map(section => (
          <ImageUploadGroup 
            key={section.title}
            title={section.title}
            description={section.description}
            imageKeys={section.keys}
            currentImages={images}
            onUpload={handleImageUpload}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminImages;
