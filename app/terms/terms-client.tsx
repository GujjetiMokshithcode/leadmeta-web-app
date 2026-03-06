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
            <p className="text-xl text-white/70 mb-2">Leadmeta - Home For All B2C Leads And B2B Leads</p>
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
              Leadmeta is a lead discovery tool that uses AI to generate search queries and extract
              publicly available email addresses from Google search results. Our service includes:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>AI-powered search query generation (using Groq AI with Llama 3.3 70B)</li>
              <li>Google search execution via Serper API</li>
              <li>Email extraction from public search results</li>
              <li>Client-side email verification (syntax, disposable domains, MX records)</li>
              <li>CSV export functionality for your search results</li>
            </ul>
            <p className="text-white/70 leading-relaxed">
              <strong className="text-white">No Storage:</strong> Leadmeta does not store search queries,
              results, or extracted emails. All processing happens in real-time and data is delivered
              directly to your browser.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Acceptable Use</h2>
            <p className="text-white/70 leading-relaxed">
              You agree to use Leadmeta only for lawful purposes. You must not:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Use the service for spamming, phishing, or sending unsolicited bulk emails</li>
              <li>Violate any applicable anti-spam laws (CAN-SPAM, GDPR, CASL, etc.)</li>
              <li>Use extracted emails for harassment, fraud, or any illegal activities</li>
              <li>Attempt to circumvent rate limits or abuse the service</li>
              <li>Use automated scripts or bots to access the service</li>
              <li>Resell or redistribute access to the service without authorization</li>
            </ul>
            <p className="text-white/70 leading-relaxed">
              You are solely responsible for ensuring your use of extracted email addresses complies
              with all applicable laws and regulations in your jurisdiction.
            </p>
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
            <h2 className="text-2xl font-semibold">5. Data Accuracy & Limitations</h2>
            <p className="text-white/70 leading-relaxed">
              Leadmeta makes no warranties about the accuracy, completeness, or reliability of the email
              addresses or data obtained through our service:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>All data is extracted from publicly available Google search results</li>
              <li>Email addresses may be outdated, incorrect, or no longer in use</li>
              <li>Verification checks (syntax, MX records) do not guarantee deliverability</li>
              <li>Search results depend on third-party APIs and search engine availability</li>
              <li>We do not control or verify the content of external websites</li>
            </ul>
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
            <h2 className="text-2xl font-semibold">9. Service Availability</h2>
            <p className="text-white/70 leading-relaxed">
              Leadmeta is provided "as is" without guarantees of availability:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>We do not guarantee uninterrupted access to the service</li>
              <li>Service may be temporarily unavailable for maintenance or updates</li>
              <li>Third-party API failures (Groq, Serper) may affect functionality</li>
              <li>We reserve the right to modify or discontinue the service at any time</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Termination</h2>
            <p className="text-white/70 leading-relaxed">
              We may terminate or suspend access immediately, without prior notice, for violations of
              these Terms or any unlawful use of the service. Upon termination, your right to use the
              service will cease immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-white/70">
              Email: <a href="mailto:legal@leadmeta.me" className="text-white hover:underline">legal@leadmeta.me</a>
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
