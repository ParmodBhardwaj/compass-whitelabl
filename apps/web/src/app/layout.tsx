import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: BRAND.productName,
  description: `${BRAND.productName} — ${BRAND.tagline}`,
};

/**
 * Root layout. Ships the legacy Inspinia CSS bundle verbatim under
 * public/legacy/ so all portal/admin pages inherit the same look. Brand
 * strings flow through @/lib/brand so the deployment can re-skin via env.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Legacy stylesheets — same order the legacy template loads them */}
        <link rel="stylesheet" href="/legacy/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/legacy/font-awesome/css/font-awesome.css" />
        <link rel="stylesheet" href="/legacy/css/animate.css" />
        <link rel="stylesheet" href="/legacy/css/jquery-ui.css" />
        <link rel="stylesheet" href="/legacy/css/style.css" />
        <link rel="stylesheet" href="/legacy/css/left-menu-custom.css" />
        <link rel="stylesheet" href="/legacy/frontend/css/stylesheet.css" />
      </head>
      <body className="fixed-sidebar pace-done">{children}</body>
    </html>
  );
}
