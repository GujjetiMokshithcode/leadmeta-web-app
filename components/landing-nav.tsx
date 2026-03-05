'use client';

import Link from 'next/link';
import Image from 'next/image';

export function LandingNavbar() {

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full">
      <div className="px-5">
        <div className="flex items-center justify-between h-10 w-fit gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <div className="relative w-6 h-6">
              <Image
                src="/logo-icon.png"
                alt="Leadmeta"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-base font-semibold">
              <span className="font-bold text-white">Lead</span>
              <span className="font-light italic text-white/80">meta</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="#features" 
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link 
              href="/privacy" 
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              const searchInput = document.querySelector('textarea');
              searchInput?.focus();
            }}
            className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-full hover:bg-white/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-transparent">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo-icon.png"
                  alt="Leadmeta"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold">
                <span className="font-bold text-white">Lead</span>
                <span className="font-light italic text-white/80">meta</span>
              </span>
            </Link>
            <p className="text-sm text-white/50">
              Discover leads from Google search results in seconds.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-white/50 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/50 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@leadmeta.com" className="text-sm text-white/50 hover:text-white transition-colors">
                  support@leadmeta.com
                </a>
              </li>
              <li>
                <a href="mailto:legal@leadmeta.com" className="text-sm text-white/50 hover:text-white transition-colors">
                  legal@leadmeta.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {currentYear} Leadmeta. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-white/40 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
