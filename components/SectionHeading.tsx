interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeading({ title, subtitle, centered = true }: SectionHeadingProps) {
  return (
    <div className={`mb-10 md:mb-12 ${centered ? "text-center" : ""}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-navy">{title}</h2>
      {subtitle && (
        <p className={`mt-3 text-body-light max-w-2xl leading-relaxed ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-4 h-1 w-16 bg-gold rounded-full ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
