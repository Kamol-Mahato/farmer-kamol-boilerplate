import { safeJsonLd } from "@/lib/jsonLd"
import { siteConfig } from "@/lib/siteConfig"

export default function OrganizationSchema({ lang }: { lang: "bn" | "en" }) {
  const isEn = lang === "en"

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.brand.name,
    image: `${siteConfig.domain.url}${siteConfig.domain.logo}`,
    url: isEn ? `${siteConfig.domain.url}/en` : siteConfig.domain.url,
    telephone: siteConfig.contact.phone,
    priceRange: siteConfig.business.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: isEn ? siteConfig.address.localityEn : siteConfig.address.locality,
      addressRegion: isEn ? siteConfig.address.regionEn : siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    description: isEn ? siteConfig.seo.descriptionEn : siteConfig.seo.description,
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.youtube,
      siteConfig.social.instagram,
      siteConfig.social.tiktok,
      `https://wa.me/${siteConfig.contact.whatsapp}`,
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.address.latitude,
      longitude: siteConfig.address.longitude,
    },
    foundingDate: siteConfig.brand.foundingYear,
    founder: {
      "@type": "Person",
      name: siteConfig.brand.founderName,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: siteConfig.business.openingHours.days,
      opens: siteConfig.business.openingHours.opens,
      closes: siteConfig.business.openingHours.closes,
    },
    slogan: isEn ? siteConfig.brand.sloganEn : siteConfig.brand.slogan,
    paymentAccepted: siteConfig.business.paymentAccepted,
    currenciesAccepted: siteConfig.business.currenciesAccepted,
    areaServed: "Bangladesh",
    knowsLanguage: ["bn", "en"],
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
  )
}
