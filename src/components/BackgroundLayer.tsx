import { useState, useEffect, useRef } from "react";

type BackgroundType = "color" | "image" | "video" | "animation";

interface BackgroundLayerProps {
  background: string;
  isDark: boolean;
}

interface BackgroundConfig {
  type: BackgroundType;
  value: string;
}

const BACKGROUND_CONFIGS: Record<string, BackgroundConfig> = {
  "gradient-blue": { type: "animation", value: "gradient-blue" },
  "gradient-purple": { type: "animation", value: "gradient-purple" },
  "gradient-sunset": { type: "animation", value: "gradient-sunset" },
  "gradient-ocean": { type: "animation", value: "gradient-ocean" },
  "gradient-forest": { type: "animation", value: "gradient-forest" },
  "gradient-fire": { type: "animation", value: "gradient-fire" },
  particles: { type: "animation", value: "particles" },
  waves: { type: "animation", value: "waves" },
};

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ background, isDark }) => {
  const [loadStage, setLoadStage] = useState<"blur" | "image" | "video">("blur");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isUrl = background.startsWith("http") || background.startsWith("data:");
  const isVideo = background.endsWith(".mp4") || background.endsWith(".webm");
  const isAnimated = BACKGROUND_CONFIGS[background]?.type === "animation";
  const animationType = BACKGROUND_CONFIGS[background]?.value;

  useEffect(() => {
    setLoadStage("blur");
    setVideoLoaded(false);
  }, [background]);

  const handleImageLoad = () => {
    setLoadStage("image");
  };

  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
    setLoadStage("video");
  };

  const renderAnimation = () => {
    switch (animationType) {
      case "gradient-blue":
        return <GradientAnimation colors={["#1e3a5f", "#3b82f6", "#1e3a5f"]} />;
      case "gradient-purple":
        return <GradientAnimation colors={["#4c1d95", "#8b5cf6", "#4c1d95"]} />;
      case "gradient-sunset":
        return <GradientAnimation colors={["#7c2d12", "#f97316", "#7c2d12"]} />;
      case "gradient-ocean":
        return <GradientAnimation colors={["#0c4a6e", "#0ea5e9", "#0c4a6e"]} />;
      case "gradient-forest":
        return <GradientAnimation colors={["#14532d", "#22c55e", "#14532d"]} />;
      case "gradient-fire":
        return <GradientAnimation colors={["#7f1d1d", "#ef4444", "#7f1d1d"]} />;
      case "particles":
        return <ParticlesAnimation isDark={isDark} />;
      case "waves":
        return <WavesAnimation isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Blur placeholder */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          loadStage === "blur" ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        }}
      />

      {/* Static color background */}
      {!isUrl && !isAnimated && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: background,
            opacity: isDark ? 1 : 0.9,
          }}
        />
      )}

      {/* Image background with progressive loading */}
      {isUrl && !isVideo && (
        <>
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              loadStage !== "blur" ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${background})`,
              opacity: isDark ? 0.8 : 1,
              filter: loadStage === "blur" ? "blur(20px)" : "none",
              transform: loadStage === "blur" ? "scale(1.1)" : "scale(1)",
            }}
            onLoad={handleImageLoad}
          />
          {loadStage !== "blur" && (
            <img
              key={background}
              src={background}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0 }}
              onLoad={handleImageLoad}
            />
          )}
        </>
      )}

      {/* Video background */}
      {isUrl && isVideo && (
        <>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            onCanPlayThrough={handleVideoCanPlay}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ opacity: isDark ? 0.7 : 1 }}
          >
            <source src={background} type={background.endsWith(".webm") ? "video/webm" : "video/mp4"} />
          </video>
          {loadStage === "blur" && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${background.replace(/\.(mp4|webm)$/, "-poster.jpg")})`,
                filter: "blur(20px)",
                transform: "scale(1.1)",
              }}
            />
          )}
        </>
      )}

      {/* Animated background */}
      {isAnimated && (
        <div className="absolute inset-0" style={{ opacity: isDark ? 0.9 : 1 }}>
          {renderAnimation()}
        </div>
      )}

      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? "bg-slate-900/30" : "bg-white/10"
        }`}
      />
    </div>
  );
};

const GradientAnimation: React.FC<{ colors: string[] }> = ({ colors }) => {
  return (
    <div
      className="absolute inset-0 animate-gradient"
      style={{
        background: `linear-gradient(-45deg, ${colors.join(", ")})`,
        backgroundSize: "400% 400%",
      }}
    />
  );
};

const ParticlesAnimation: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number }>>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const initParticles = () => {
      particlesRef.current = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      }));
    };
    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)";
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

const WavesAnimation: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill={isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}
          fillOpacity="1"
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </path>
      </svg>
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill={isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.15)"}
          fillOpacity="1"
          d="M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animate
            attributeName="d"
            dur="15s"
            repeatCount="indefinite"
            values="M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,224L48,234.7C96,245,192,267,288,256C384,245,480,192,576,181.3C672,171,768,203,864,224C960,245,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </path>
      </svg>
    </div>
  );
};
