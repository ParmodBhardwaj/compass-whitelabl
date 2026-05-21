'use client';
import type { ReactNode } from 'react';
import { AdminTopHeader } from '@/components/legacy/AdminTopHeader';
import { AdminSidebar } from '@/components/legacy/AdminSidebar';
import { Footer } from '@/components/legacy/Footer';

/**
 * Admin shell. The left sidebar is dynamic — driven by the legacy
 * `store_modules` table per the user's selected portal in the header. See
 * `AdminSidebar.tsx`. Layout responsibilities:
 *   • Fix the sidebar at left (240px) with internal scroll so all modules
 *     stay reachable regardless of viewport height.
 *   • Apply the Inspinia dark-navy palette to match the legacy PHP admin.
 *   • Push page content past the fixed sidebar.
 *   • Toggle `mini-navbar` mode when the hamburger fires.
 */
const ADMIN_SHELL_CSS = `
  .admin-shell .navbar-static-side {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 2;
    background: #2f4050 !important;
    color: #a7b1c2;
  }
  .admin-shell .admin-sidebar-logo {
    flex-shrink: 0;
    padding: 18px 20px;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: #2f4050;
  }
  .admin-shell .admin-sidebar-scroll {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    background: #2f4050;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.18) transparent;
  }
  .admin-shell .admin-sidebar-scroll::-webkit-scrollbar { width: 8px; }
  .admin-shell .admin-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
  .admin-shell .admin-sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
  }
  .admin-shell .admin-sidebar-scroll:hover::-webkit-scrollbar-thumb {
    background: rgba(226, 35, 26, 0.55);
  }
  .admin-shell .admin-sidebar-scroll ul.metismenu {
    margin: 0;
    padding: 0;
    list-style: none;
    background: #2f4050 !important;
  }
  /* Override left-menu-custom.css's forced-white sidebar inside the admin scope */
  .admin-shell .navbar-default.navbar-static-side,
  .admin-shell .navbar-default.navbar-static-side .nav,
  .admin-shell .navbar-default.navbar-static-side > .sidebar-collapse,
  .admin-shell .admin-sidebar-scroll .sidebar-collapse {
    background: #2f4050 !important;
  }
  /* Menu items */
  .admin-shell .navbar-default.navbar-static-side .nav > li > a,
  .admin-shell .admin-sidebar-scroll .nav > li > a {
    color: #a7b1c2 !important;
    background: transparent !important;
    padding: 14px 20px !important;
    font-size: 13px;
    display: block;
    text-decoration: none;
    border-left: 4px solid transparent;
    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
  }
  .admin-shell .navbar-default.navbar-static-side .nav > li > a:hover,
  .admin-shell .navbar-default.navbar-static-side .nav > li > a:focus,
  .admin-shell .admin-sidebar-scroll .nav > li > a:hover,
  .admin-shell .admin-sidebar-scroll .nav > li > a:focus {
    color: #fff !important;
    background: #293846 !important;
  }
  /* Active item — red accent border on the left */
  .admin-shell .navbar-default.navbar-static-side .nav > li.active,
  .admin-shell .admin-sidebar-scroll .nav > li.active {
    background: #293846 !important;
  }
  .admin-shell .navbar-default.navbar-static-side .nav > li.active > a,
  .admin-shell .admin-sidebar-scroll .nav > li.active > a {
    color: #fff !important;
    background: #293846 !important;
    border-left-color: #e2231a !important;
    font-weight: 600;
  }
  /* Nested submenu items */
  .admin-shell .admin-sidebar-scroll .nav-second-level {
    background: #293846 !important;
    padding: 0 !important;
    margin: 0 !important;
    list-style: none;
  }
  .admin-shell .admin-sidebar-scroll .nav-second-level > li > a {
    padding-left: 52px !important;
    font-size: 12px;
  }
  .admin-shell .admin-sidebar-logout {
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: #2f4050;
  }
  .admin-shell .admin-sidebar-logout a {
    display: block;
    padding: 14px 20px;
    color: #a7b1c2;
    text-decoration: none;
    font-size: 13px;
  }
  .admin-shell .admin-sidebar-logout a:hover {
    background: rgba(226, 35, 26, 0.1);
    color: #fff;
  }
  /* Push page content past the fixed 240px sidebar */
  .admin-shell #page-wrapper {
    margin-left: 240px;
    min-height: 100vh;
  }
  /* Mini-navbar mode (collapsed) — sidebar shrinks to 70px and labels hide */
  body.mini-navbar .admin-shell .navbar-static-side { width: 70px; }
  body.mini-navbar .admin-shell #page-wrapper { margin-left: 70px; }
  body.mini-navbar .admin-shell .admin-sidebar-scroll .nav-label,
  body.mini-navbar .admin-shell .admin-sidebar-logout .nav-label,
  body.mini-navbar .admin-shell .admin-sidebar-logo-text {
    display: none;
  }
`;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div id="wrapper" className="admin-shell">
      <style dangerouslySetInnerHTML={{ __html: ADMIN_SHELL_CSS }} />

      <AdminSidebar />

      <div id="page-wrapper" className="gray-bg">
        <div className="row border-bottom">
          <AdminTopHeader />
        </div>
        {children}
        <Footer />
      </div>
    </div>
  );
}
