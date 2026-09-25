export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md rounded-lg border border-border bg-surface p-8">
        <p className="text-3xl tracking-tight">
          <span className="font-bold">Aman</span>
          <span className="mx-1 font-serif text-[1.15em] font-normal italic">&amp;</span>
          <span className="font-normal">Partners</span>
        </p>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Titre en Manrope 700</h1>
        <p className="mt-2 text-muted">Texte courant en Manrope 400</p>
        <p className="mt-1 font-semibold text-muted">Texte courant en Manrope 600</p>
        <div className="mt-6 h-10 rounded-md border border-border-strong" />
        <button
          type="button"
          className="mt-6 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
        >
          Bouton
        </button>
      </div>
    </main>
  );
}
