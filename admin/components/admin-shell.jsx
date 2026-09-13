"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems, adminProfile } from "@/lib/mock-data";

// ── SVG Icons ────────────────────────────────────────────────────────────────
function Icon({ name, size = 16 }) {
  const paths = {
    dashboard:  "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    orders:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    bookings:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    menu:       "M4 6h16M4 10h16M4 14h16M4 18h16",
    customers:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    payments:   "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    messages:   "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    settings:   "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    logout:     "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    chevron:    "M9 5l7 7-7 7",
    close:      "M6 18L18 6M6 6l12 12",
    menu_open:  "M4 6h16M4 12h16M4 18h16",
    bell:       "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

// ── Breadcrumb label from pathname ────────────────────────────────────────────
function breadcrumbLabel(pathname) {
  if (pathname === "/dashboard") return "Dashboard";
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last || last === "dashboard") return "Dashboard";
  // Capitalize each word, replace dashes
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Sidebar nav ───────────────────────────────────────────────────────────────
function SidebarNav({ pathname, onClose }) {
  return (
    <nav className="side-nav" aria-label="Main navigation">
      <p className="nav-label">Workspace</p>
      {navItems.map((item) => {
        const isParentActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const showChildren = item.children && isParentActive;
        return (
          <div key={item.label}>
            <Link
              href={item.href}
              className={`nav-link ${isParentActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="nav-icon">
                <Icon name={item.icon} size={15} />
              </span>
              <span>{item.label}</span>
              {item.badge ? (
                <span className="nav-badge">{item.badge}</span>
              ) : null}
            </Link>
            {showChildren && (
              <div className="sub-nav">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={pathname === child.href ? "sub-active" : ""}
                    onClick={onClose}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="admin-frame">
      {/* Sidebar */}
      <aside className={`sidebar ${drawerOpen ? "sidebar-open" : ""}`}>
        {/* Brand */}
        <div className="brand-block">
          <Link href="/dashboard" className="brand-mark" onClick={closeDrawer}>
            <span className="brand-emblem">M</span>
            <span>
              <strong>Majedaar</strong>
              <small>Restaurant Office</small>
            </span>
          </Link>
          <button
            className="drawer-close"
            aria-label="Close menu"
            onClick={closeDrawer}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Nav */}
        <SidebarNav pathname={pathname} onClose={closeDrawer} />

        {/* Footer */}
        <div className="sidebar-footer">
          <Link href="/dashboard/profile" className="profile-mini" onClick={closeDrawer}>
            <span className="avatar avatar-small">{adminProfile.initials}</span>
            <span>
              <strong>{adminProfile.name}</strong>
              <small>{adminProfile.role}</small>
            </span>
            <span className="chevron">
              <Icon name="chevron" size={13} />
            </span>
          </Link>
          <button className="logout-link" type="button">
            <Icon name="logout" size={15} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <button
          className="drawer-backdrop"
          aria-label="Close navigation"
          onClick={closeDrawer}
        />
      )}

      {/* Main column */}
      <div className="main-column">
        {/* Top header */}
        <header className="top-header">
          <button
            className="menu-trigger"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu_open" size={22} />
          </button>

          <div className="breadcrumb">
            <span>Majedaar</span>
            <b>/</b>
            <strong>{breadcrumbLabel(pathname)}</strong>
          </div>

          <div className="header-actions">
            <button className="icon-button" aria-label="Notifications">
              <Icon name="bell" size={16} />
            </button>
            <span className="header-divider" />
            <span className="header-date">{today}</span>
          </div>
        </header>

        {/* Page */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}