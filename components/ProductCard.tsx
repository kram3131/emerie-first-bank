import Link from "next/link";

interface ProductCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent?: "gold" | "teal" | "navy";
}

const accentStyles = {
  gold: "bg-gold/10 text-gold",
  teal: "bg-teal/10 text-teal",
  navy: "bg-navy/10 text-navy",
};

export default function ProductCard({
  title,
  description,
  href,
  icon,
  accent = "gold",
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl border border-border p-8 transition-all hover:shadow-lg hover:border-gold/30 hover:-translate-y-1"
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${accentStyles[accent]}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy mb-2 group-hover:text-gold-dark transition-colors">
        {title}
      </h3>
      <p className="text-sm text-body leading-relaxed">{description}</p>
      <div className="mt-4 text-sm font-medium text-gold group-hover:text-gold-dark transition-colors flex items-center gap-1">
        Learn More
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
