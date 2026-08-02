import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/siteConfig"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brand.name} - ${siteConfig.brand.slogan}`,
    short_name: siteConfig.brand.name,
    description: siteConfig.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: siteConfig.theme.primary,
    icons: [
      {
        src: siteConfig.domain.logo,
        sizes: "192x192",
        type: "image/png",
      },
    ],
  }
}
