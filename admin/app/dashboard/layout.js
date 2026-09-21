"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin-shell";
import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/logo";

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Logo variant="mark" className="h-10 w-auto" alt="Majedaar Office" />
          </div>
          <p style={{ color: "var(--ink-mid)", fontSize: "13px", fontWeight: 600 }}>Loading Majedaar Office...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
