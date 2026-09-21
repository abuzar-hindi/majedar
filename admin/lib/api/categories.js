import { apiRequest } from "./client";

export async function getAdminCategories() {
  const res = await apiRequest("/admin/categories");
  return res?.data?.categories || [];
}

export async function createCategory(data) {
  const res = await apiRequest("/admin/categories", {
    method: "POST",
    body: data,
  });
  return res?.data?.category;
}

export async function updateCategory(id, data) {
  const res = await apiRequest(`/admin/categories/${id}`, {
    method: "PATCH",
    body: data,
  });
  return res?.data?.category;
}

export async function deleteCategory(id) {
  const res = await apiRequest(`/admin/categories/${id}`, {
    method: "DELETE",
  });
  return res?.data;
}
