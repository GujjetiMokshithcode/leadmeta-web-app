'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-8">
            <Image
              src="/logo.png"
              alt="Leadmeta"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Powered by Serper API</p>
      </div>
    </header>
  );
}
