import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

const BASE_URL = siteConfig.domain.url;

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
        "/register",
        "/reset-password",
        "/en/cart",
        "/en/order",
        "/en/login",
        "/en/customer/",
        "/en/register",
        "/en/reset-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
