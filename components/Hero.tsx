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
      className={`relative bg-navy overflow-hidden ${large ? "py-28 md:py-36" : "py-16 md:py-24"}`}
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
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-navy/70" />
        </>
      )}

      {/* Decorative background (shown when no video) */}
      {!videoSrc && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1
          className={`font-bold text-white leading-tight ${
            large ? "text-4xl md:text-5xl lg:text-6xl" : "text-3xl md:text-4xl lg:text-5xl"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
