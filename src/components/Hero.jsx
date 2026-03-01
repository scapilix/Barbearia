import React, { Suspense, lazy } from 'react';
import { motion as Motion } from 'framer-motion';
import { useImage } from '../hooks/useImage';

const VideoPlayer = lazy(() => import('../video/VideoPlayer'));

const Hero = () => {
  const { images } = useImage();

  return (
    <section id="inicio" className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen Remotion Video */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <img
              src={images.hero_bg1}
              alt="Luxury Salon Interior"
              className="w-full h-full object-cover brightness-[0.25]"
            />
          }
        >
          <VideoPlayer />
        </Suspense>
      </div>

      {/* Scroll Indicator */}
      <Motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-60 z-10"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
      </Motion.div>
    </section>
  );
};

export default Hero;
