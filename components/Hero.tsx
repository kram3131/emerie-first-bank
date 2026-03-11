interface HeroProps {
  title: string;
  subtitle?: string;
  large?: boolean;
  videoSrc?: string;
  children?: React.ReactNode;
}

export default function Hero({ title, subtitle, large = false, videoSrc, children }: HeroProps) {
  return (
    <section
      className={`relative bg-navy overflow-hidden grain-overlay ${
        large ? "py-32 md:py-40" : "py-20 md:py-28"
      }`}
    >
      {/* Video background */}
      {videoSrc && (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40" />
        </>
      )}

      {/* Decorative background (shown when no video) */}
      {!videoSrc && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1
          className={`font-light text-white leading-[1.1] tracking-tight ${
            large
              ? "text-4xl md:text-5xl lg:text-7xl"
              : "text-3xl md:text-4xl lg:text-5xl"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 md:mt-8 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
