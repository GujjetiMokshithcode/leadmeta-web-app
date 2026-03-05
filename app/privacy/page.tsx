'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
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
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-white/50">Last updated: March 2024</p>
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
              We may collect, use, store and transfer different kinds of personal data about you which we have 
              grouped together as follows:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li><strong className="text-white">Usage Data:</strong> Information about how you use our website and services</li>
              <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong className="text-white">Search Data:</strong> Search queries you submit to find leads</li>
              <li><strong className="text-white">Contact Data:</strong> Email addresses extracted from public search results</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
            <p className="text-white/70 leading-relaxed">
              We use your data to provide and improve our services, including:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li>Processing your search queries and delivering results</li>
              <li>Verifying email addresses for deliverability</li>
              <li>Improving our search algorithms and user experience</li>
              <li>Analyzing usage patterns to enhance our platform</li>
              <li>Communicating with you about service updates</li>
            </ul>
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
              Our service integrates with third-party APIs to provide search functionality:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li><strong className="text-white">Serper API:</strong> For Google search results</li>
              <li><strong className="text-white">AI Services:</strong> For query generation and optimization</li>
              <li><strong className="text-white">DNS Services:</strong> For email verification</li>
            </ul>
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
              We will only retain your personal data for as long as necessary to fulfill the purposes we 
              collected it for. Search results and extracted data are processed in real-time and are not 
              permanently stored on our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="text-white/70">
              Email: <a href="mailto:privacy@leadmeta.com" className="text-white hover:underline">privacy@leadmeta.com</a>
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
      <footer className="border-t border-white/10 bg-black/20 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Leadmeta. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
