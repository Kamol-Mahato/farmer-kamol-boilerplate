import { MetadataRoute } from "next";

const BASE_URL = "https://www.farmerkamol.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api/",
        "/cart",
        "/order",
        "/login",
        "/agent",
        "/customer/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}