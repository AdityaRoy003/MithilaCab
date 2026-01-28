import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
        <svg
            viewBox="0 0 64 64"
            className="h-9 w-9"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="carBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "hsl(var(--primary) / 0.7)" }} />
                </linearGradient>
                <linearGradient id="carWindow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "hsl(var(--foreground) / 0.2)" }} />
                    <stop offset="100%" style={{ stopColor: "hsl(var(--foreground) / 0.5)" }} />
                </linearGradient>
                <filter id="dropShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" />
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g style={{ filter: "url(#dropShadow)" }}>
                {/* Car Shadow */}
                <ellipse cx="32" cy="52" rx="18" ry="4" fill="hsl(var(--foreground) / 0.2)" />

                {/* Wheels */}
                <circle cx="18" cy="45" r="7" fill="hsl(var(--foreground) / 0.8)" />
                <circle cx="18" cy="45" r="3" fill="hsl(var(--card))" />
                <circle cx="46" cy="45" r="7" fill="hsl(var(--foreground) / 0.8)" />
                <circle cx="46" cy="45" r="3" fill="hsl(var(--card))" />

                {/* Car Body */}
                <path
                    d="M58,45H6 C3,45 2,42 2,39 L2,28 C2,25 4,23 7,23 L12,23 C14,18 18,15 22,15 L42,15 C48,15 52,20 54,24 L60,24 C62,24 63,25 63,27 L63,39 C63,42 61,45 58,45 Z"
                    fill="url(#carBody)"
                    stroke="hsl(var(--primary) / 0.5)"
                    strokeWidth="1.5"
                />

                {/* Windows */}
                <path
                    d="M20,24 L20,36 L40,36 L44,24 Z"
                    transform="skewX(20) translate(2, -11)"
                    fill="url(#carWindow)"
                    stroke="hsl(var(--foreground) / 0.3)"
                    strokeWidth="1"
                />

                {/* Lights */}
                <rect x="5" y="28" width="4" height="6" rx="2" fill="hsl(0 84% 60% / 0.8)" />
                <rect x="55" y="28" width="4" height="6" rx="2" fill="hsl(30 100% 50% / 0.9)" />
            </g>
        </svg>
      <span className="font-headline text-2xl font-bold">
        MithilaCab
      </span>
    </div>
  );
}
