import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Hero MotoCorp',
  description: 'Hero Compass employee portal',
};

/**
 * Root layout that ships the legacy Inspinia / Hero CSS bundle verbatim
 * (downloaded under public/legacy/). All portal/admin pages inherit these
 * stylesheets, so the look matches http://heronewlanding.local.com/ 1:1.
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
