import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-8 w-8">
        {/* Shadow layer */}
        <svg
            viewBox="0 0 24 24"
            className="absolute top-0.5 left-0.5 h-8 w-8 text-black/20 dark:text-black/40"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        </svg>
        {/* Main pin layer */}
        <svg
            viewBox="0 0 24 24"
            className="absolute top-0 left-0 h-8 w-8"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" fill="hsl(var(--primary-foreground))" />
        </svg>
      </div>
      <span className="font-headline text-2xl font-bold">
        MithilaCab
      </span>
    </div>
  );
}
