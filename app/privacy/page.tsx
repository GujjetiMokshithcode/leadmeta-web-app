import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Leadmeta',
  description: 'Learn how Leadmeta handles your data. We prioritize privacy and do not store your search results or extracted emails.',
  alternates: {
    canonical: 'https://leadmeta.me/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <p className="text-lg font-semibold">
            <span className="font-bold">Lead</span>
            <span className="font-light italic text-white/80">meta</span>
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/70 mb-2">Leadmeta – Find Verified B2B & B2C Emails in Seconds</p>
            <p className="text-white/50">Last updated: March 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p className="text-white/70 leading-relaxed">
              Welcome to Leadmeta. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit our
              website and use our services, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
            <p className="text-white/70 leading-relaxed">
              We collect minimal data to provide our service:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li><strong className="text-white">Search Queries:</strong> The descriptions you enter to generate search strategies (not stored permanently)</li>
              <li><strong className="text-white">Technical Data:</strong> Basic browser information for service functionality</li>
            </ul>
            <p className="text-white/70 leading-relaxed">
              <strong className="text-white">Important:</strong> We do NOT store email addresses found through searches.
              All lead data is processed in real-time and delivered directly to your browser. We have no database of
              extracted emails.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
            <p className="text-white/70 leading-relaxed">
              We use your data solely to provide our service:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Generate AI-powered search queries based on your descriptions</li>
              <li>Execute searches via third-party APIs (Google Search via Serper)</li>
              <li>Extract and verify email addresses from public search results</li>
              <li>Display results directly in your browser</li>
            </ul>
            <p className="text-white/70 leading-relaxed">
              We do not sell, rent, or share your data with third parties for marketing purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Data Security</h2>
            <p className="text-white/70 leading-relaxed">
              We have implemented appropriate security measures to prevent your personal data from being
              accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal
              data to those employees, agents, contractors, and other third parties who have a business need
              to know.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Third-Party Services</h2>
            <p className="text-white/70 leading-relaxed">
              Our service integrates with the following third-party APIs:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li><strong className="text-white">Groq AI:</strong> For generating search queries using Llama 3.3 70B model</li>
              <li><strong className="text-white">Serper API:</strong> For Google search results</li>
              <li><strong className="text-white">Google DNS:</strong> For client-side email verification (MX record checks)</li>
            </ul>
            <p className="text-white/70 leading-relaxed">
              These services only receive the minimum data necessary to perform their functions.
              Your search descriptions are sent to Groq for query generation, and search queries are sent to Serper.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Your Rights</h2>
            <p className="text-white/70 leading-relaxed">
              Under certain circumstances, you have rights under data protection laws in relation to your
              personal data, including the right to:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Cookies</h2>
            <p className="text-white/70 leading-relaxed">
              We use essential cookies to ensure our website functions properly. We may also use analytics
              cookies to understand how visitors interact with our website. You can set your browser to
              refuse all or some browser cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Data Retention</h2>
            <p className="text-white/70 leading-relaxed">
              Leadmeta is designed with privacy in mind:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Search queries are processed in real-time and not stored</li>
              <li>Email addresses found are never stored on our servers</li>
              <li>Results are delivered directly to your browser session only</li>
              <li>No user accounts or persistent user data is maintained</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="text-white/70">
              Email: <a href="mailto:privacy@leadmeta.me" className="text-white hover:underline">privacy@leadmeta.me</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
            <p className="text-white/70 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by
              posting the new privacy policy on this page and updating the "Last updated" date.
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
