import type { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard - Leadmeta',
  description: 'Stop wasting hours on cold lead research. Leadmeta instantly finds and extracts verified B2B & B2C emails from across the web.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
