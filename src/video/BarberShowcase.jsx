import {
  AbsoluteFill,
  interpolate,
  Easing,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";

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

export const BarberShowcase = () => {
  // Using a solid generic barbershop video from Pexels (Direct CDN)
  const videoUrl = "https://videos.pexels.com/video-files/3998429/3998429-hd_1920_1080_30fps.mp4";

  return (
    <AbsoluteFill style={{ background: DARK }}>
      <Video
        src={videoUrl}
        loop
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.35)", // Dim the video to emphasize the text
        }}
      />
      
      {/* Decorative Gradient Vignette */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom,
            rgba(13,12,10,0.50) 0%,
            rgba(13,12,10,0.08) 35%,
            rgba(13,12,10,0.08) 65%,
            rgba(13,12,10,0.72) 100%)`,
          pointerEvents: "none",
        }}
      />

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
            Bem-vindo à Elegância
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
            Corte Clássico · Degrade Fade · Barboterapia
          </p>
        </FadeUp>
        
        <FadeUp delay={60}>
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 40,
                pointerEvents: "auto",
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
                Marcar Serviço
              </a>
            </div>
          </FadeUp>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
