"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div style={{ marginBottom: "22px", display: "flex", justifyContent: "center" }}>
        <Logo variant="full" className="h-12 w-auto" alt="Majedaar Restaurant" />
      </div>
      <section className="login-panel">
        <h1>Welcome back.</h1>
        <p className="login-copy">Sign in to manage your restaurant with ease.</p>

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #F87171",
              color: "#991B1B",
              fontSize: "12.5px",
              padding: "10px 14px",
              borderRadius: "4px",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              placeholder="admin@majedar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              autoComplete="email"
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
              autoComplete="current-password"
            />
          </label>
          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          >
            {submitting ? "Signing in..." : "Sign in to office"}
          </button>
        </form>
      </section>
    </main>
  );
}
