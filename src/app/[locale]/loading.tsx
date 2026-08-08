export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
        Carregando sinal do passado...
      </p>
    </div>
  );
}
