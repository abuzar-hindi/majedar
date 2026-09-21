"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/orderanddine";

  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authLoading, redirectPath, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg("");
    if (isUnverified) setIsUnverified(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsUnverified(false);

    if (!formData.email || !formData.password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success("Welcome back!", { autoClose: 2000 });
      router.replace(redirectPath);
    } catch (err) {
      const message = err?.message || "Login failed. Please verify your credentials.";
      setErrorMsg(message);

      // Detect unverified email error from backend
      if (
        err?.status === 403 ||
        err?.status === 401 ||
        message.toLowerCase().includes("verify your email")
      ) {
        if (message.toLowerCase().includes("verify your email")) {
          setIsUnverified(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all";

  return (
    <div className="min-h-[85vh] bg-[#FAF8F5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B]">
            Welcome Back
          </h1>
          <p className="text-xs text-stone-500 mt-1.5">
            Sign in to track orders, save details, and enjoy delicious meals
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed ${isUnverified
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
          >
            <p className="font-semibold">{errorMsg}</p>
            {isUnverified && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[11px] text-amber-800">
                  Verification code needed?
                </span>
                <Link
                  href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                  className="font-bold text-[#1B3B2B] underline hover:text-[#C85A17]"
                >
                  Verify Email Now &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className={inputClass}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[#C85A17] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={inputClass}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-600">
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/signup${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
            className="font-bold text-[#1B3B2B] hover:text-[#C85A17] underline transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#FAF8F5] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
