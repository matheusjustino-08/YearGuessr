'use client';

export function FloatingEraElements({ era }: { era: string }) {
  // Ultra subtle ambient glow accents per era (no intrusive large icons)
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
    </div>
  );
}
