import { routeConfig } from "./route.config";
import { hasAccess } from "../access/access.helper";

export const buildSidebarMenu = (user) => {
  return routeConfig
    .filter(r => r.meta?.label)
    .filter(r => hasAccess(r.meta, user))
    .reduce((acc, r) => {
      const section = r.meta.section || "Lainnya";
      acc[section] ??= [];
      acc[section].push(r);
      return acc;
    }, {});
};
