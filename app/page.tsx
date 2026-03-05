import type { Metadata } from 'next';
import { LandingClient } from './landing-client';

export const metadata: Metadata = {
  title: 'Leadmeta - Home For All B2C Leads And B2B Leads',
  description: 'Discover B2B and B2C leads instantly. AI-powered email finder that extracts verified business emails from Google search. Build your prospect list in seconds.',
  keywords: ['B2B leads', 'B2C leads', 'email finder', 'lead generation', 'sales leads', 'prospecting'],
  openGraph: {
    title: 'Leadmeta - Home For All B2C Leads And B2B Leads',
    description: 'Discover B2B and B2C leads instantly. AI-powered email finder that extracts verified business emails.',
  },
};

export default function Home() {
  return <LandingClient />;
}
