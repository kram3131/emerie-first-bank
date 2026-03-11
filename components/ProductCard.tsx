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
      className="group relative block bg-white rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105 ${accentStyles[accent]}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy mb-2 group-hover:text-gold-dark transition-colors">
        {title}
      </h3>
      <p className="text-sm text-body leading-relaxed">{description}</p>
      <div className="mt-4 text-sm font-medium text-gold group-hover:text-gold-dark transition-colors flex items-center gap-1">
        Learn More
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      {/* Gold bottom accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
    </Link>
  );
}
