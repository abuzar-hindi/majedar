// Future REST API calls should live here so pages and components stay independent from transport details.
// The current admin experience intentionally reads from lib/mock-data.js only.
export const adminApi = {
  orders: { list: async () => [] },
  bookings: { list: async () => [] },
  menu: { list: async () => [] },
};
