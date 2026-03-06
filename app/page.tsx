import type { Metadata } from 'next';
import { LandingClient } from './landing-client';

export const metadata: Metadata = {
  title: 'Leadmeta – B2B Lead Generation Tool',
  description: 'Find and manage B2B leads effortlessly with Leadmeta. Automate outreach, track results, and grow faster.',
  keywords: ['B2B leads', 'B2C leads', 'email finder', 'lead generation', 'sales leads', 'prospecting'],
  openGraph: {
    title: 'Leadmeta – B2B Lead Generation Tool',
    description: 'Find and manage B2B leads effortlessly.',
  },
};

export default function Home() {
  return <LandingClient />;
}
