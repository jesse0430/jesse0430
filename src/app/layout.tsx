import type { Metadata } from 'next';
import React from 'react';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Next.js MUI Redux Saga App',
  description: 'App Router + MUI + Redux Toolkit + Saga',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

