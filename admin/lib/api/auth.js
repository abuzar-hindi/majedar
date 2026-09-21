import { apiRequest } from "./client";

export async function loginAdmin({ email, password }) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return res?.data?.admin;
}

export async function logoutAdmin() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function getAdminMe() {
  const res = await apiRequest("/auth/me", {
    method: "GET",
  });
  return res?.data?.admin;
}
