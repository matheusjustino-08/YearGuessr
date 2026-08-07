'use client';

export function FloatingEraElements({ era }: { era: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      
      {/* Medieval Era (< 1500): Torch Light Embers & Flame Glow */}
      {era === 'era-medieval' && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-600/15 via-orange-600/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-amber-700/10 blur-3xl animate-pulse" />
          {/* Animated Embers */}
          <div className="amber-ember top-[80%] left-[20%] w-2 h-2" style={{ animationDelay: '0s' }} />
          <div className="amber-ember top-[85%] left-[45%] w-1.5 h-1.5" style={{ animationDelay: '1.2s' }} />
          <div className="amber-ember top-[75%] left-[75%] w-2.5 h-2.5" style={{ animationDelay: '2.4s' }} />
          <div className="amber-ember top-[90%] left-[85%] w-2 h-2" style={{ animationDelay: '3.6s' }} />
        </>
      )}

      {/* Renaissance Era (1500 - 1799): Venetian Golden Stars & Aura */}
      {era === 'era-renaissance' && (
        <>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-yellow-500/15 via-amber-500/5 to-transparent blur-3xl" />
          <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
          {/* Golden Twinkling Sparkles */}
          <div className="golden-star top-[20%] left-[15%]" style={{ animationDelay: '0s' }} />
          <div className="golden-star top-[35%] left-[80%]" style={{ animationDelay: '1.5s' }} />
          <div className="golden-star top-[65%] left-[25%]" style={{ animationDelay: '3s' }} />
          <div className="golden-star top-[70%] left-[70%]" style={{ animationDelay: '4.5s' }} />
        </>
      )}

      {/* Industrial Era (1800 - 1899): Iron Smoke, Copper Glow & Steam */}
      {era === 'era-industrial' && (
        <>
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-slate-500/10 via-zinc-600/5 to-transparent blur-2xl" />
          <div className="steam-layer-1" />
          <div className="steam-layer-2" />
        </>
      )}

      {/* Silent Film / Early 20th (1900 - 1949): Sepia Projector Light Beam & Vignette */}
      {era === 'era-early20th' && (
        <>
          <div className="projector-light-beam" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
        </>
      )}

      {/* Golden Era / 60s & 70s (1950 - 1979): Floating Warm Bokeh Spheres */}
      {era === 'era-golden' && (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-amber-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-orange-500/15 rounded-full blur-[100px]" />
          {/* Floating Bokeh Bubbles */}
          <div className="bokeh-bubble top-[30%] left-[10%] w-24 h-24 bg-amber-500/15" style={{ animationDelay: '0s' }} />
          <div className="bokeh-bubble top-[55%] left-[80%] w-32 h-32 bg-orange-500/15" style={{ animationDelay: '2.5s' }} />
          <div className="bokeh-bubble top-[75%] left-[30%] w-20 h-20 bg-amber-400/15" style={{ animationDelay: '5s' }} />
        </>
      )}

      {/* Retrowave 80s & 90s (1980 - 1999): Synthwave Neon Flares */}
      {era === 'era-retro' && (
        <>
          <div className="absolute top-0 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/4 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      )}

      {/* Modern Era (2000+): Cyberpunk Aurora Wave & Neon Flares */}
      {era === 'era-modern' && (
        <>
          <div className="aurora-wave-1" />
          <div className="aurora-wave-2" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/15 rounded-full blur-[140px]" />
        </>
      )}

    </div>
  );
}
