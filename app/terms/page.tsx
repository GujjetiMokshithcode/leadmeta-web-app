'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <h1 className="text-lg font-semibold">
            <span className="font-bold">Lead</span>
            <span className="font-light italic text-white/80">meta</span>
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-white/50">Last updated: March 2024</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-white/70 leading-relaxed">
              By accessing and using Leadmeta, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p className="text-white/70 leading-relaxed">
              Leadmeta is a lead discovery platform that helps users find business email addresses from 
              publicly available sources through search engine results. Our service includes:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>AI-powered search query generation</li>
              <li>Email extraction from search results</li>
              <li>Email verification services</li>
              <li>Export and download functionality</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Acceptable Use</h2>
            <p className="text-white/70 leading-relaxed">
              You agree to use Leadmeta only for lawful purposes. You must not:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Use the service for spamming or unsolicited bulk emails</li>
              <li>Violate any applicable anti-spam laws (CAN-SPAM, GDPR, etc.)</li>
              <li>Harvest emails for malicious purposes</li>
              <li>Attempt to circumvent any rate limits or restrictions</li>
              <li>Resell or redistribute the service without permission</li>
              <li>Use automated scripts to abuse the service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Email Compliance</h2>
            <p className="text-white/70 leading-relaxed">
              You are solely responsible for ensuring that your use of email addresses obtained through 
              Leadmeta complies with all applicable laws, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>CAN-SPAM Act (United States)</li>
              <li>GDPR (European Union)</li>
              <li>CASL (Canada)</li>
              <li>Other applicable anti-spam and privacy regulations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Data Accuracy</h2>
            <p className="text-white/70 leading-relaxed">
              While we strive to provide accurate information, Leadmeta makes no warranties about the 
              accuracy, completeness, or reliability of the email addresses or data obtained through our 
              service. All data is extracted from publicly available sources and may be outdated or incorrect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed">
              The Leadmeta service, including its original content, features, and functionality, is owned 
              by Leadmeta and is protected by international copyright, trademark, patent, trade secret, 
              and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              In no event shall Leadmeta, its directors, employees, partners, agents, suppliers, or 
              affiliates be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Indemnification</h2>
            <p className="text-white/70 leading-relaxed">
              You agree to defend, indemnify, and hold harmless Leadmeta and its licensees and licensors 
              from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising 
              from your use of the service or violation of these terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Termination</h2>
            <p className="text-white/70 leading-relaxed">
              We may terminate or suspend your access immediately, without prior notice or liability, for 
              any reason whatsoever, including without limitation if you breach the Terms. Upon termination, 
              your right to use the service will cease immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to modify or replace these terms at any time. If a revision is material, 
              we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-white/70">
              Email: <a href="mailto:legal@leadmeta.com" className="text-white hover:underline">legal@leadmeta.com</a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Leadmeta. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
