import { apiRequest } from "./client";

/**
 * Customer authentication and profile API calls
 */

export async function customerSignup({ name, email, phone, password }) {
  return apiRequest("/customer-auth/signup", {
    method: "POST",
    body: { name, email, phone, password },
  });
}

export async function customerLogin({ email, password }) {
  return apiRequest("/customer-auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function customerLogout() {
  return apiRequest("/customer-auth/logout", {
    method: "POST",
  });
}

export async function getCustomerMe() {
  return apiRequest("/customer-auth/me", {
    method: "GET",
  });
}

export async function verifyEmail({ email, otp }) {
  return apiRequest("/customer-auth/verify-email", {
    method: "POST",
    body: { email, otp },
  });
}

export async function resendOtp({ email, type = "email_verification" }) {
  return apiRequest("/customer-auth/resend-otp", {
    method: "POST",
    body: { email, type },
  });
}

export async function forgotPassword({ email }) {
  return apiRequest("/customer-auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword({ email, otp, newPassword }) {
  return apiRequest("/customer-auth/reset-password", {
    method: "POST",
    body: { email, otp, newPassword },
  });
}

export async function updateCustomerProfile({ name, phone }) {
  const response = await apiRequest("/customer-auth/profile", {
    method: "PATCH",
    body: { name, phone },
  });
  return response?.data?.customer || response?.data;
}

export async function getCustomerAddresses() {
  const response = await apiRequest("/customer-auth/addresses", {
    method: "GET",
  });
  return response?.data?.addresses || [];
}

export async function addCustomerAddress(addressData) {
  const response = await apiRequest("/customer-auth/addresses", {
    method: "POST",
    body: addressData,
  });
  return response?.data?.addresses || response?.data;
}

export async function updateCustomerAddress(addressId, addressData) {
  const response = await apiRequest(`/customer-auth/addresses/${addressId}`, {
    method: "PATCH",
    body: addressData,
  });
  return response?.data?.addresses || response?.data;
}

export async function deleteCustomerAddress(addressId) {
  const response = await apiRequest(`/customer-auth/addresses/${addressId}`, {
    method: "DELETE",
  });
  return response?.data?.addresses || response?.data;
}

export async function setDefaultCustomerAddress(addressId) {
  const response = await apiRequest(`/customer-auth/addresses/${addressId}/default`, {
    method: "PATCH",
  });
  return response?.data?.addresses || response?.data;
}
