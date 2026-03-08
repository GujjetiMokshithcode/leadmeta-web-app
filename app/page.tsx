import type { Metadata } from 'next';
import { LandingClient } from './landing-client';

export const metadata: Metadata = {
  title: 'Leadmeta – Find Verified B2B & B2C Emails in Seconds',
  description: 'Stop wasting hours on cold lead research. Leadmeta instantly finds and extracts verified B2B & B2C emails from across the web — powered by AI. Perfect for sales teams, freelancers, and growth hackers who want more replies, less grinding.',
  keywords: ['B2B leads', 'B2C leads', 'email finder', 'lead generation', 'sales leads', 'prospecting'],
  openGraph: {
    title: 'Leadmeta – Find Verified B2B & B2C Emails in Seconds',
    description: 'Stop wasting hours on cold lead research. Leadmeta instantly finds and extracts verified B2B & B2C emails from across the web — powered by AI. Perfect for sales teams, freelancers, and growth hackers who want more replies, less grinding.',
  },
};

export default function Home() {
  return <LandingClient />;
}
