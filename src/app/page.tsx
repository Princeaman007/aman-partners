export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold">Aman &amp; Partners</h1>
        <p className="mt-2 text-muted">Texte secondaire</p>
        <div className="mt-6 h-10 rounded-md border border-border-strong" />
        <button
          type="button"
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Bouton
        </button>
      </div>
    </main>
  );
}
