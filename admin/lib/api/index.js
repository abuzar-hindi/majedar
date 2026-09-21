export * from "./client";
export * from "./auth";
export * from "./categories";
export * from "./menu";
export * from "./delivery-zones";
export * from "./orders";
export * from "./reviews";
export * from "./payments";

import * as auth from "./auth";
import * as categories from "./categories";
import * as menu from "./menu";
import * as deliveryZones from "./delivery-zones";
import * as orders from "./orders";
import * as reviews from "./reviews";
import * as payments from "./payments";

export const adminApi = {
  auth,
  categories,
  menu,
  deliveryZones,
  orders,
  reviews,
  payments,
};

export default adminApi;

