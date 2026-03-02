import { useVideoConfig, useCurrentFrame, AbsoluteFill, interpolate, Easing, Img, spring, Series } from 'remotion';

// ─── Design tokens ────────────────────────────────────────────────
const GOLD = '#E1AE2D';
const DARK = '#0D0C0A';
const WHITE = '#F9F5EF';

// ─── Per-scene duration ───────────────────────────────────────────
const SCENE = 150; // ~5s per scene @ 30fps
// Total with -18 overlap × 2 = 414 frames ≈ 13.8s

// ─── Background photo with Ken Burns ─────────────────────────────
const SceneBg = ({ src, brightness = 0.38 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Remotion Img — ensures image is loaded before rendering */}
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          filter: `brightness(${brightness})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Gradient vignette ────────────────────────────────────────────
const Vignette = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(to bottom,
        rgba(13,12,10,0.50) 0%,
        rgba(13,12,10,0.08) 35%,
        rgba(13,12,10,0.08) 65%,
        rgba(13,12,10,0.72) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

// ─── Animated gold line ───────────────────────────────────────────
const GoldLine = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [delay, delay + 22], [0, 60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  return <div style={{ width, height: 1, background: GOLD }} />;
};

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

// ─────────────────────────────────────────────────────────────────
// SCENE 1: Full-screen opener
// ─────────────────────────────────────────────────────────────────
const Scene1 = ({ PHOTOS }) => (
  <AbsoluteFill style={{ background: DARK }}>
    <SceneBg src={PHOTOS[0]} brightness={0.35} />
    <Vignette />
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <FadeUp delay={0}>
        <p
          style={{
            color: GOLD,
            fontFamily: 'Georgia, serif',
            fontSize: 11,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Bem-vindo à Elegância
        </p>
      </FadeUp>

      <GoldLine delay={10} />

      <FadeUp delay={12}>
        <h1
          style={{
            color: WHITE,
            fontFamily: 'Georgia, serif',
            fontSize: 72,
            fontWeight: 400,
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '0.02em',
          }}
        >
          Arte das{' '}
          <span style={{ color: GOLD, fontStyle: 'italic' }}>Barba</span>
        </h1>
      </FadeUp>

      <FadeUp delay={24}>
        <p
          style={{
            color: 'rgba(249,245,239,0.65)',
            fontFamily: 'sans-serif',
            fontSize: 13,
            letterSpacing: '0.15em',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Corte Russa · Barber Art · Gel Extensions
        </p>
      </FadeUp>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ─────────────────────────────────────────────────────────────────
// SCENE 2: Split — text left, two floating photos right
// ─────────────────────────────────────────────────────────────────
const Scene2 = ({ PHOTOS, FLOAT_A, FLOAT_B }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Photo A slides from right
  const pA = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const xA = interpolate(pA, [0, 1], [140, 0]);
  const opA = pA;

  // Photo B slides a little later
  const pB = spring({ frame: frame - 26, fps, config: { damping: 200 } });
  const xB = interpolate(pB, [0, 1], [90, 0]);
  const opB = pB;

  return (
    <AbsoluteFill style={{ background: DARK }}>
      {/* Dark background — very dimmed so photos on the right pop */}
      <SceneBg src={PHOTOS[1]} brightness={0.12} />
      <Vignette />

      {/* Left dark gradient so text is always readable */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '52%', height: '100%',
          background: 'linear-gradient(to right, rgba(13,12,10,0.92) 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Photo A (larger, upper-right) ── */}
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: '50%',
          transform: `translateY(-60%) translateX(${xA}px)`,
          opacity: opA,
          width: 370,
          height: 495,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 48px 96px rgba(0,0,0,0.75)',
          border: '1px solid rgba(225,174,45,0.25)',
        }}
      >
        <Img
          src={FLOAT_A}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 55%, rgba(225,174,45,0.12) 100%)',
          }}
        />
      </div>

      {/* Gold offset frame behind photo A */}
      <div
        style={{
          position: 'absolute',
          right: 64,
          top: 'calc(50% - 260px)',
          width: 400,
          height: 524,
          border: `1px solid ${GOLD}`,
          opacity: opA * 0.3,
          borderRadius: 3,
          transform: `translateX(${xA * 0.4}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Photo B (smaller, lower-left of A) ── */}
      <div
        style={{
          position: 'absolute',
          right: 400,
          top: '50%',
          transform: `translateY(8%) translateX(${xB}px)`,
          opacity: opB,
          width: 230,
          height: 295,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 28px 64px rgba(0,0,0,0.70)',
          border: '1px solid rgba(225,174,45,0.18)',
        }}
      >
        <Img
          src={FLOAT_B}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* ── Left text column ── */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 0 0 100px',
          gap: 18,
          maxWidth: '50%',
        }}
      >
        <FadeUp delay={0}>
          <p
            style={{
              color: GOLD,
              fontFamily: 'sans-serif',
              fontSize: 10,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Experiência Premium
          </p>
        </FadeUp>

        <FadeUp delay={10}>
          <h2
            style={{
              color: WHITE,
              fontFamily: 'Georgia, serif',
              fontSize: 58,
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.18,
            }}
          >
            Perfeição<br />
            em cada{' '}
            <span style={{ color: GOLD, fontStyle: 'italic' }}>detalhe.</span>
          </h2>
        </FadeUp>

        <GoldLine delay={22} />

        <FadeUp delay={26}>
          <p
            style={{
              color: 'rgba(249,245,239,0.62)',
              fontFamily: 'sans-serif',
              fontSize: 13,
              letterSpacing: '0.06em',
              margin: 0,
              maxWidth: 360,
              lineHeight: 1.85,
            }}
          >
            Técnicas exclusivas aplicadas<br />
            por especialistas certificados,<br />
            num ambiente de puro luxo.
          </p>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// SCENE 3: Closing CTA
// ─────────────────────────────────────────────────────────────────
const Scene3 = ({ PHOTOS }) => {

  return (
    <AbsoluteFill style={{ background: DARK }}>
      <SceneBg src={PHOTOS[2]} brightness={0.28} />
      <Vignette />
      <AbsoluteFill style={{ background: 'rgba(13,12,10,0.32)', pointerEvents: 'none' }} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
        }}
      >
        <FadeUp delay={0}>
          <p
            style={{
              color: WHITE,
              fontFamily: 'Georgia, serif',
              fontSize: 44,
              fontWeight: 400,
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            TO<span style={{ color: GOLD, fontStyle: 'italic' }}>Beauty</span>
          </p>
        </FadeUp>

        <GoldLine delay={12} />

        <FadeUp delay={16}>
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 10,
              pointerEvents: 'auto', // Important so they can be clicked inside the Remotion Player
            }}
          >
            <a
              href="#agendamento"
              style={{
                background: GOLD,
                color: DARK,
                padding: '16px 40px',
                textDecoration: 'none',
                fontFamily: 'sans-serif',
                fontSize: 12,
                fontWeight: 'bold',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                borderRadius: '50px',
                transition: 'all 0.3s ease',
                boxShadow: `0 8px 32px rgba(225, 174, 45, 0.25)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(225, 174, 45, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(225, 174, 45, 0.25)`;
              }}
            >
              Marcar Serviço
            </a>
            
            <a
              href="#servicos"
              style={{
                background: 'transparent',
                color: WHITE,
                border: `1px solid ${GOLD}`,
                padding: '16px 40px',
                textDecoration: 'none',
                fontFamily: 'sans-serif',
                fontSize: 12,
                fontWeight: 'bold',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                borderRadius: '50px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(225, 174, 45, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Serviços
            </a>
          </div>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Main composition ────────────────────────────────────────────
export const BarberShowcase = ({ images }) => {
  // We no longer call useImage() here, since the Context Provider
  // from main.jsx does not pass through Remotion's Player boundary out of the box.

  const PHOTOS = [
    images.hero_bg1,
    images.hero_bg2,
    images.hero_bg3,
  ];

  const FLOAT_A = images.hero_float1; // spa Máquina
  const FLOAT_B = images.hero_float2; // salon interior detail

  return (
    <AbsoluteFill style={{ background: DARK }}>
      <Series>
        <Series.Sequence durationInFrames={SCENE} premountFor={20}>
          <Scene1 PHOTOS={PHOTOS} />
        </Series.Sequence>
        <Series.Sequence offset={-18} durationInFrames={SCENE} premountFor={20}>
          <Scene2 PHOTOS={PHOTOS} FLOAT_A={FLOAT_A} FLOAT_B={FLOAT_B} />
        </Series.Sequence>
        <Series.Sequence offset={-18} durationInFrames={SCENE} premountFor={20}>
          <Scene3 PHOTOS={PHOTOS} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
