export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Leadmeta</h1>
            <p className="text-xs text-muted-foreground">Lead Discovery Engine</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Powered by Serper API</p>
      </div>
    </header>
  );
}
