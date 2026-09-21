"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { resendOtp } from "../../lib/api";
import { toast } from "react-toastify";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const redirectPath = searchParams.get("redirect") || "/orderanddine";

  const { verifyOtp, isAuthenticated } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Update email if query param changes
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email.trim()) {
      setErrorMsg("Please provide your email address.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });
      toast.success("Email verified successfully! Welcome to Majedaar.", {
        autoClose: 2500,
      });
      router.replace(redirectPath);
    } catch (err) {
      setErrorMsg(
        err?.message || "Invalid or expired verification code. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!email.trim()) {
      setErrorMsg("Please enter your email address to receive a new code.");
      return;
    }

    setErrorMsg("");
    setInfoMsg("");
    setResending(true);

    try {
      const res = await resendOtp({
        email: email.trim(),
        type: "email_verification",
      });
      setInfoMsg(
        res?.message || "A new 6-digit verification code has been dispatched."
      );
      setResendCooldown(60);
      toast.info("Verification code resent!", { autoClose: 2500 });
    } catch (err) {
      setErrorMsg(
        err?.message || "Unable to resend verification code. Please try again shortly."
      );
    } finally {
      setResending(false);
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
            Check Your Inbox
          </h1>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-stone-700">
              {email || "your email address"}
            </span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Info Alert */}
        {infoMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
            {infoMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              autoFocus
              className={`${inputClass} tracking-widest text-center text-xl font-mono font-bold`}
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
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Email</span>
            )}
          </button>
        </form>

        {/* Resend Action */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col items-center gap-2 text-xs">
          <p className="text-stone-500">Didn&apos;t receive the code?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className={`font-bold transition-colors ${resendCooldown > 0 || resending
              ? "text-stone-400 cursor-not-allowed"
              : "text-[#C85A17] hover:underline"
              }`}
          >
            {resending
              ? "Sending code..."
              : resendCooldown > 0
                ? `Resend Code in ${resendCooldown}s`
                : "Resend Code Now"}
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-stone-500 hover:text-[#1B3B2B] transition-colors"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#FAF8F5] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
