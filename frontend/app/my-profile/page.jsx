"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export default function MyProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "Hamza",
    lastName: "Sheikh",
    email: "hamza@example.com",
    phone: "+91 79054 04619",
    street: "Ram Path, Sahabganj",
    city: "Faizabad",
    state: "Uttar Pradesh",
    pincode: "224001",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    toast("Profile updated successfully", { autoClose: 2000, hideProgressBar: true, icon: false });
  };

  const inputBase = "w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all disabled:text-stone-400 disabled:bg-stone-50";

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-5 border-b border-stone-200 flex items-end justify-between gap-3">
          <div>
            <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">My Profile</h1>
            <p className="text-xs text-stone-500 mt-1">Manage your personal information</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-[#1B3B2B] border border-stone-300 hover:border-[#1B3B2B] px-4 py-1.5 rounded-full transition-colors bg-white"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-14 h-14 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center font-hero font-bold text-xl select-none">
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <div>
            <p className="font-bold text-base text-[#1B3B2B]">{form.firstName} {form.lastName}</p>
            <p className="text-xs text-stone-500">{form.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} disabled={!editing} className={inputBase} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} disabled={!editing} className={inputBase} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} disabled={!editing} className={inputBase} />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} className={inputBase} />
          </div>

          <hr className="border-stone-100" />

          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Delivery Address</p>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Street</label>
            <input name="street" value={form.street} onChange={handleChange} disabled={!editing} className={inputBase} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">City</label>
              <input name="city" value={form.city} onChange={handleChange} disabled={!editing} className={inputBase} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} disabled={!editing} className={inputBase} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">State</label>
            <input name="state" value={form.state} onChange={handleChange} disabled={!editing} className={inputBase} />
          </div>

          {editing && (
            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-stone-400 mt-8">
          Sign-in and real profile sync will be available in a future update.
        </p>
      </div>
    </div>
  );
}