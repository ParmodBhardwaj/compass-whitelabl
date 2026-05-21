import type { ReactNode } from 'react';
import { TopHeader } from '@/components/legacy/TopHeader';
import { Sidebar } from '@/components/legacy/Sidebar';
import { Footer } from '@/components/legacy/Footer';

/**
 * Mirrors the legacy Inspinia layout exactly:
 *   <div id="wrapper">
 *     <nav class="navbar-default navbar-static-side">…sidebar…</nav>
 *     <div id="page-wrapper" class="gray-bg">
 *       <div class="row border-bottom"><nav class="navbar navbar-static-top">…header…</nav></div>
 *       …main content…
 *       <div class="footer">…</div>
 *     </div>
 *   </div>
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="page-wrapper" className="gray-bg">
        <div className="row border-bottom">
          <TopHeader />
        </div>
        {children}
        <Footer />
      </div>
    </div>
  );
}
