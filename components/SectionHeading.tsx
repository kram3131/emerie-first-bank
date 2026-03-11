interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  variant?: "default" | "editorial" | "label" | "minimal";
  label?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  variant = "default",
  label,
}: SectionHeadingProps) {
  if (variant === "editorial") {
    return (
      <div className="mb-10 md:mb-14">
        <div className="flex items-center gap-6 mb-4">
          <h2 className="text-3xl md:text-4xl font-light text-navy tracking-tight whitespace-nowrap">
            {title}
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        {subtitle && (
          <p className="text-body-light max-w-xl leading-relaxed">{subtitle}</p>
        )}
      </div>
    );
  }

  if (variant === "label") {
    return (
      <div className={`mb-10 md:mb-14 ${centered ? "text-center" : ""}`}>
        {label && (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold-dark text-xs font-semibold uppercase tracking-widest rounded-full mb-4`}
          >
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            {label}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-navy">{title}</h2>
        {subtitle && (
          <p
            className={`mt-3 text-body-light max-w-2xl leading-relaxed ${
              centered ? "mx-auto" : ""
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`mb-8 md:mb-10 ${centered ? "text-center" : ""}`}>
        <h2 className="text-2xl md:text-3xl font-bold text-navy">{title}</h2>
        {subtitle && (
          <p
            className={`mt-3 text-body-light max-w-2xl leading-relaxed ${
              centered ? "mx-auto" : ""
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Default variant - centered with gold underline
  return (
    <div className={`mb-10 md:mb-12 ${centered ? "text-center" : ""}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-navy">{title}</h2>
      {subtitle && (
        <p
          className={`mt-3 text-body-light max-w-2xl leading-relaxed ${
            centered ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-4 h-1 w-16 bg-gold rounded-full ${
          centered ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
