"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateCustomerProfile,
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  getPublicDeliveryZones,
} from "../../lib/api";
import { toast } from "react-toastify";

const PREDEFINED_INSTRUCTIONS = [
  "Call on arrival",
  "Leave at the gate",
  "Don't ring the bell",
  "Other",
];

const INITIAL_ADDRESS_FORM = {
  label: "Home",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  area: "",
  landmark: "",
  deliveryZoneId: "",
  deliveryInstructions: "Call on arrival",
  deliveryInstructionOther: "",
  isDefault: false,
};

export default function MyProfile() {
  const { customer, isAuthenticated, loading, logout, updateCustomerState } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'addresses'

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [zones, setZones] = useState([]);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(INITIAL_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Sync profile form when customer changes
  useEffect(() => {
    if (customer) {
      setProfileName(customer.name || "");
      setProfilePhone(customer.phone || "");
    }
  }, [customer]);

  // Load delivery zones
  useEffect(() => {
    getPublicDeliveryZones()
      .then((data) => {
        setZones(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  // Load addresses
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingAddresses(true);
    try {
      const list = await getCustomerAddresses();
      setAddresses(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    } finally {
      setLoadingAddresses(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated, loadAddresses]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-stone-500">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[70vh] max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="font-hero text-2xl font-bold text-[#1B3B2B] mb-2">
          Profile Access
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Please sign in to view and manage your account details.
        </p>
        <Link
          href="/login?redirect=/my-profile"
          className="px-6 py-2.5 rounded-full bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initials = (customer.name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!profileName.trim() || profileName.trim().length < 2) {
      toast.error("Name must be at least 2 characters long.");
      return;
    }
    if (profilePhone && profilePhone.trim().length < 7) {
      toast.error("Phone number must be at least 7 digits.");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateCustomerProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });
      updateCustomerState(updated);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Open address modal for new address
  const handleAddNewAddress = () => {
    const parts = (customer.name || "").split(" ");
    setAddressForm({
      ...INITIAL_ADDRESS_FORM,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      phone: customer.phone || "",
      email: customer.email || "",
      deliveryZoneId: zones[0]?._id || "",
      isDefault: addresses.length === 0,
    });
    setEditingAddressId(null);
    setShowAddressModal(true);
  };

  // Open address modal for editing
  const handleEditAddress = (addr) => {
    setAddressForm({
      label: addr.label || "Home",
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      phone: addr.phone || "",
      email: addr.email || "",
      address: addr.address || "",
      area: addr.area || "",
      landmark: addr.landmark || "",
      deliveryZoneId: addr.deliveryZoneId || "",
      deliveryInstructions: addr.deliveryInstructions || "Call on arrival",
      deliveryInstructionOther: addr.deliveryInstructionOther || "",
      isDefault: Boolean(addr.isDefault),
    });
    setEditingAddressId(addr._id);
    setShowAddressModal(true);
  };

  // Save address (add or update)
  const handleSaveAddress = async (e) => {
    e?.preventDefault();
    if (!addressForm.firstName.trim() || !addressForm.lastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }
    if (!addressForm.phone.trim() || addressForm.phone.trim().length < 7) {
      toast.error("A valid phone number is required.");
      return;
    }
    if (!addressForm.address.trim() || addressForm.address.trim().length < 3) {
      toast.error("Street address is required.");
      return;
    }
    if (
      addressForm.deliveryInstructions === "Other" &&
      !addressForm.deliveryInstructionOther.trim()
    ) {
      toast.error('Please specify details for "Other" delivery instructions.');
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        label: addressForm.label.trim() || "Home",
        firstName: addressForm.firstName.trim(),
        lastName: addressForm.lastName.trim(),
        phone: addressForm.phone.trim(),
        email: addressForm.email.trim() || null,
        address: addressForm.address.trim(),
        area: addressForm.area.trim() || null,
        landmark: addressForm.landmark.trim() || null,
        deliveryZoneId: addressForm.deliveryZoneId || null,
        deliveryInstructions: addressForm.deliveryInstructions || null,
        deliveryInstructionOther:
          addressForm.deliveryInstructions === "Other"
            ? addressForm.deliveryInstructionOther.trim()
            : null,
        isDefault: Boolean(addressForm.isDefault),
      };

      let updatedList;
      if (editingAddressId) {
        updatedList = await updateCustomerAddress(editingAddressId, payload);
        toast.success("Address updated successfully!");
      } else {
        updatedList = await addCustomerAddress(payload);
        toast.success("New address added successfully!");
      }

      setAddresses(Array.isArray(updatedList) ? updatedList : []);
      setShowAddressModal(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(addressId);
    try {
      const updatedList = await deleteCustomerAddress(addressId);
      setAddresses(Array.isArray(updatedList) ? updatedList : []);
      toast.success("Address removed.");
    } catch (err) {
      toast.error(err?.message || "Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  };

  // Set as default address
  const handleSetDefault = async (addressId) => {
    try {
      const updatedList = await setDefaultCustomerAddress(addressId);
      setAddresses(Array.isArray(updatedList) ? updatedList : []);
      toast.success("Default address updated.");
    } catch (err) {
      toast.error(err?.message || "Failed to set default address.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h1 className="font-hero text-2xl sm:text-3xl font-bold text-[#1B3B2B] tracking-wide">
              My Profile
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage your personal details and saved delivery addresses
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 px-4 py-1.5 rounded-full border border-rose-200 bg-rose-50/60 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === "profile"
                ? "text-[#1B3B2B] border-b-2 border-[#1B3B2B]"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            Account Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === "addresses"
                ? "text-[#1B3B2B] border-b-2 border-[#1B3B2B]"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <span>Address Book</span>
            {addresses.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                {addresses.length}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB 1: Account Details ── */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
              <div className="w-16 h-16 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center font-hero font-bold text-xl select-none shadow-2xs">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-[#11261B]">
                  {customer.name}
                </h2>
                <p className="text-xs text-stone-500">{customer.email}</p>
                <div className="mt-1.5">
                  {customer.emailVerified ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span>✓</span> Verified Account
                    </span>
                  ) : (
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(customer.email)}`}
                      className="text-[10px] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors"
                    >
                      <span>⚠</span> Unverified · Verify Now &rarr;
                    </Link>
                  )}
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  id="edit-profile-btn"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#1B3B2B] bg-[#E3EFE8]/70 hover:bg-[#E3EFE8] border border-[#1B3B2B]/20 transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Registered email cannot be edited)</span>
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    disabled
                    className="w-full p-3 bg-stone-100 border border-stone-200 rounded-xl font-medium text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={20}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    disabled={savingProfile}
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileName(customer.name || "");
                      setProfilePhone(customer.phone || "");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95 transition-all shadow-xs disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {savingProfile ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Full Name
                  </span>
                  <p className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl font-medium text-stone-800">
                    {customer.name}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Email Address
                  </span>
                  <p className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl font-medium text-stone-800">
                    {customer.email}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </span>
                  <p className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl font-medium text-stone-800">
                    {customer.phone || "Not provided"}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <Link
                href="/my-orders"
                className="text-xs font-bold text-[#1B3B2B] hover:text-[#C85A17] flex items-center gap-1 transition-colors"
              >
                <span>View Past Orders</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Change Password
              </Link>
            </div>
          </div>
        )}

        {/* ── TAB 2: Address Book ── */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-600">
                Save your home, office, and preferred delivery addresses for quick 1-click checkout.
              </p>
              <button
                type="button"
                id="add-address-btn"
                onClick={handleAddNewAddress}
                className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Address</span>
              </button>
            </div>

            {loadingAddresses ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                <div className="animate-spin w-6 h-6 border-2 border-[#1B3B2B] border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs text-stone-500">Loading saved addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/90 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-stone-800 mb-1">No Saved Addresses</h3>
                <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
                  Add your delivery locations once, and select them seamlessly when placing food orders.
                </p>
                <button
                  type="button"
                  onClick={handleAddNewAddress}
                  className="px-5 py-2 rounded-full text-xs font-bold text-[#1B3B2B] bg-[#E3EFE8] hover:bg-[#d5e7dd] transition-colors cursor-pointer"
                >
                  + Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isAddrDefault = Boolean(addr.isDefault);
                  const zoneMatch = zones.find((z) => z._id === addr.deliveryZoneId);

                  return (
                    <div
                      key={addr._id}
                      className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isAddrDefault
                          ? "border-[#1B3B2B]/40 shadow-xs ring-1 ring-[#1B3B2B]/20"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                            {addr.label || "Address"}
                          </span>
                          {isAddrDefault && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E3EFE8] text-[#1B3B2B] border border-[#1B3B2B]/20">
                              ★ Default
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-stone-900 mb-0.5">
                          {addr.firstName} {addr.lastName}
                        </h4>
                        <p className="text-xs text-stone-500 mb-2">
                          📞 {addr.phone}
                        </p>

                        <p className="text-xs text-stone-700 leading-relaxed font-medium">
                          {addr.address}
                        </p>
                        {addr.area && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            Area: {addr.area}
                          </p>
                        )}
                        {addr.landmark && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            Landmark: {addr.landmark}
                          </p>
                        )}
                        {zoneMatch && (
                          <p className="text-[11px] text-[#1B3B2B] font-semibold mt-1">
                            Zone: {zoneMatch.name} (₹{zoneMatch.deliveryFee} fee)
                          </p>
                        )}
                        {addr.deliveryInstructions && (
                          <p className="text-[11px] text-[#C85A17] font-medium mt-1">
                            Note: {addr.deliveryInstructions}
                            {addr.deliveryInstructionOther && ` (${addr.deliveryInstructionOther})`}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(addr)}
                            className="font-semibold text-stone-600 hover:text-[#1B3B2B] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === addr._id}
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === addr._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                        {!isAddrDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr._id)}
                            className="font-bold text-[#1B3B2B] hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Address Create / Edit Modal ── */}
      {showAddressModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !savingAddress && setShowAddressModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C85A17] block">
                  Address Book
                </span>
                <h3 className="font-hero text-xl font-bold text-[#11261B]">
                  {editingAddressId ? "Edit Saved Address" : "Add New Address"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !savingAddress && setShowAddressModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              {/* Address Label Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Address Tag
                </label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm((p) => ({ ...p, label: lbl }))}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        addressForm.label === lbl
                          ? "bg-[#1B3B2B] text-white shadow-2xs"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Street Address & Flat / House No <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressForm.address}
                  onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Flat No, Building Name, Street / Road..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B] resize-none"
                />
              </div>

              {/* Area & Landmark */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={addressForm.area}
                    onChange={(e) => setAddressForm((p) => ({ ...p, area: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                </div>
              </div>

              {/* Delivery Zone Selection */}
              {zones.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Delivery Zone
                  </label>
                  <select
                    value={addressForm.deliveryZoneId}
                    onChange={(e) => setAddressForm((p) => ({ ...p, deliveryZoneId: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  >
                    <option value="">Select a delivery zone</option>
                    {zones.map((z) => (
                      <option key={z._id} value={z._id}>
                        {z.name} (₹{z.deliveryFee} delivery fee)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Delivery Instructions
                </label>
                <select
                  value={addressForm.deliveryInstructions}
                  onChange={(e) => setAddressForm((p) => ({ ...p, deliveryInstructions: e.target.value }))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                >
                  {PREDEFINED_INSTRUCTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {addressForm.deliveryInstructions === "Other" && (
                  <input
                    type="text"
                    required
                    placeholder="Specify delivery instructions..."
                    value={addressForm.deliveryInstructionOther}
                    onChange={(e) =>
                      setAddressForm((p) => ({ ...p, deliveryInstructionOther: e.target.value }))
                    }
                    className="w-full mt-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B3B2B]/20 focus:border-[#1B3B2B]"
                  />
                )}
              </div>

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#1B3B2B] focus:ring-[#1B3B2B]"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Set as my default delivery address
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  disabled={savingAddress}
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#11261B] active:scale-95 transition-all shadow-xs disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {savingAddress ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingAddressId ? "Update Address" : "Save Address"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}