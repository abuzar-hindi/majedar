import { apiRequest } from "./client";

/**
 * Submit an authenticated customer complaint, suggestion, or query message.
 * Customer authentication is verified via HttpOnly cookie; customer details
 * are automatically populated from the account.
 *
 * @param {{ type: 'complaint'|'suggestion'|'query', message: string }} data
 */
export async function submitContactMessage(data) {
  return apiRequest("/contact", {
    method: "POST",
    body: data,
  });
}
