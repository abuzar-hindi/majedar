"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { submitContactMessage } from "../lib/api";
import { toast } from "react-toastify";

const NewsLetter = () => {
  const { customer, isAuthenticated } = useAuth();

  const [type, setType] = useState("suggestion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your message, complaint, or suggestion.");
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        type,
        message: message.trim(),
      });

      setSubmittedSuccess(true);
      setMessage("");
      toast.success("Thank you! Your feedback has been received and our team will review it.");
    } catch (err) {
      const errorMsg =
        err?.message ||
        "Could not send your message at this moment. Please try again later.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-[#FAF8F5] py-12 sm:py-16 border-t border-stone-200/80" id="feedback-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1B3B2B]">
            Complaints, Suggestions &amp; Queries
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-lg mx-auto">
            Share your dining experience, report an issue, or send us your suggestions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs">
          {submittedSuccess ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                ✓
              </div>
              <h3 className="font-hero text-lg font-bold text-[#11261B] mb-1">
                Message Received!
              </h3>
              <p className="text-xs text-stone-500 mb-6 max-w-md mx-auto">
                Thank you for helping us improve Majedaar. Our management reviews all feedback promptly.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#11261B] transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmitHandler} className="space-y-4">
              {/* Type Selector Pills */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Feedback Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "complaint", label: "Complaint", color: "rose" },
                    { id: "suggestion", label: "Suggestion", color: "emerald" },
                    { id: "query", label: "Query / Help", color: "blue" },
                  ].map((cat) => {
                    const isSelected = type === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setType(cat.id)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${isSelected
                          ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-2xs"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your suggestion, complaint, or inquiry in detail..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#1B3B2B] focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-stone-400">
                  {isAuthenticated
                    ? "✓ Sending as verified account: " + (customer?.name || customer?.email)
                    : "Please provide your contact info so we can follow up."}
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  {submitting ? "Sending..." : "Submit Message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsLetter;
