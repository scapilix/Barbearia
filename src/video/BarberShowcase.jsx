import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Easing,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Series,
  Img,
} from "remotion";

const GOLD = "#E1AE2D";
const DARK = "#0D0C0A";
const WHITE = "#F9F5EF";

// ─── Spring fade-up container ─────────────────────────────────────
const FadeUp = ({ children, delay = 0, style = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [28, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Animated gold line ───────────────────────────────────────────
const GoldLine = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [delay, delay + 22], [0, 60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  return <div style={{ width, height: 1, background: GOLD, margin: "20px 0" }} />;
};

// ─── Reusable Image Scene with Ken Burns ───────────────
const ImageScene = ({ src }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.15], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          filter: "brightness(0.25)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Main Sequence Composition ────────────────────────────────────
export const BarberShowcase = () => {
  // URLs for 4 barbershop photos (to bypass mp4 loading issues on Vercel)
  const photos = [
    "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "https://images.pexels.com/photos/2068884/pexels-photo-2068884.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&w=1920",
  ];

  // Each scene lasts 150 frames (5 seconds at 30fps)
  const SCENE_DURATION = 150;

  return (
    <AbsoluteFill style={{ background: DARK }}>
      
      {/* Background Media Sequence */}
      <AbsoluteFill>
        <Series>
          <Series.Sequence durationInFrames={SCENE_DURATION}>
            <ImageScene src={photos[0]} />
          </Series.Sequence>
          
          <Series.Sequence durationInFrames={SCENE_DURATION}>
            <ImageScene src={photos[1]} />
          </Series.Sequence>
          
          <Series.Sequence durationInFrames={SCENE_DURATION}>
            <ImageScene src={photos[2]} />
          </Series.Sequence>

          <Series.Sequence durationInFrames={SCENE_DURATION}>
            <ImageScene src={photos[3]} />
          </Series.Sequence>
        </Series>
      </AbsoluteFill>
      
      {/* Decorative Gradient Vignette overlay on top of all media */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom,
            rgba(13,12,10,0.50) 0%,
            rgba(13,12,10,0.01) 35%,
            rgba(13,12,10,0.01) 65%,
            rgba(13,12,10,0.80) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Static Overlay Text */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FadeUp delay={10}>
          <p
            style={{
              color: GOLD,
              fontFamily: "Georgia, serif",
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            A Excelência do Corte
          </p>
        </FadeUp>

        <GoldLine delay={20} />

        <FadeUp delay={25}>
          <h1
            style={{
              color: WHITE,
              fontFamily: "Georgia, serif",
              fontSize: 80,
              fontWeight: 400,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Arte da{" "}
            <span style={{ color: GOLD, fontStyle: "italic" }}>Barbearia</span>
          </h1>
        </FadeUp>

        <FadeUp delay={40}>
          <p
            style={{
              color: "rgba(249,245,239,0.65)",
              fontFamily: "sans-serif",
              fontSize: 16,
              letterSpacing: "0.15em",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Um ambiente exclusivo para cavalheiros.
          </p>
        </FadeUp>
        
        <FadeUp delay={60}>
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 40,
                pointerEvents: "auto", // allow clicking
              }}
            >
              <a
                href="#agendamento"
                style={{
                  background: GOLD,
                  color: DARK,
                  padding: "16px 40px",
                  textDecoration: "none",
                  fontFamily: "sans-serif",
                  fontSize: 12,
                  fontWeight: "bold",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  borderRadius: "50px",
                  boxShadow: `0 8px 32px rgba(225, 174, 45, 0.25)`,
                }}
              >
                Agendar Agora
              </a>
            </div>
          </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
