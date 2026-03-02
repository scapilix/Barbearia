import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { BarberShowcase } from './BarberShowcase';
import { useImage } from '../hooks/useImage';

const TOTAL_FRAMES = 414;

const VideoPlayer = () => {
  const { images } = useImage();
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Player
      component={BarberShowcase}
      inputProps={{ images }}
      durationInFrames={TOTAL_FRAMES}
      compositionWidth={dims.w}
      compositionHeight={dims.h}
      fps={30}
      style={{
        width: '100%',
        height: '100%',
      }}
      autoPlay
      loop
      controls={false}
      clickToPlay={false}
    />
  );
};

export default VideoPlayer;
