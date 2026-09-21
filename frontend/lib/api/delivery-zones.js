import { apiRequest } from "./client";

/**
 * Public delivery zones API calls
 */

export async function getPublicDeliveryZones() {
  const response = await apiRequest("/delivery-zones", {
    method: "GET",
  });
  return response?.data?.zones || [];
}
