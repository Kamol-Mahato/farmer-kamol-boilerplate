import PolicyPage from "@/app/components/PolicyPage";
import { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig"

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.brand.nameEn}`,
  description:
    `Read the terms and conditions for using the ${siteConfig.brand.nameEn} website, placing orders, payment, and delivery.`,
  alternates: {
    canonical: "/en/terms",
    languages: {
      bn: "/terms",
      en: "/en/terms",
    },
  },
};

const sections = [
  {
    title: "Introduction & Agreement",
    content:
      `By using the website www.${siteConfig.domain.host}, you agree to the terms below. Please read the full terms before placing an order.`,
  },
  {
    title: "Use of the Website",
    content:
      "This website may only be used for lawful purposes. Any fraudulent, harmful, or illegal use of the website is prohibited.",
  },
  {
    title: "Products & Pricing",
    content:
      "The prices of honey, ghee, and mustard oil are as shown on the website. Since these are natural products, slight variations in color or texture may occur between batches, which does not affect product quality. We reserve the right to change prices without prior notice. If stock is limited, orders may be cancelled or adjusted, and the customer will be informed.",
  },
  {
    title: "Special Terms for Duck Chicks",
    content:
      "The price of duck chicks is not fixed — it's determined through discussion based on age and size. Orders must be confirmed via WhatsApp. As these are live animals, full payment must be completed before delivery. Whether delivery is possible to your area will be confirmed after checking your location. In case of delay or unintentional harm during transport of live animals, we will assist as best we can, but full liability cannot be guaranteed.",
  },
  {
    title: "Orders & Payment",
    content:
      "We accept Cash on Delivery (COD). If you choose the online payment option, you must send money directly to the bKash, Nagad, or Rocket number shown at checkout. Orders cannot be processed without completed payment (except for duck chicks and COD orders).",
  },
  {
    title: "Delivery",
    content:
      "Delivery within Dhaka costs 75 taka per kg (minimum 60 taka), and outside Dhaka 120 taka per kg (minimum 100 taka). Delivery timeframes are approximate and may be slightly delayed due to weather or logistical reasons. Providing an accurate address and phone number is the customer's responsibility.",
  },
  {
    title: "Intellectual Property",
    content:
      `All content, logos, images, and videos on this website are the property of ${siteConfig.brand.nameEn}. Copying or reuse without permission is prohibited.`,
  },
  {
    title: "Limitation of Liability",
    content:
      `${siteConfig.brand.nameEn} makes every effort to supply accurate, quality products. However, we are not liable for damages arising from unintentional errors or uncontrollable circumstances (such as natural disasters or courier delays).`,
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to change these terms as needed. Updated terms take effect as soon as they are published on this page.",
  },
  {
    title: "Governing Law",
    content:
      "These terms are governed by the laws of Bangladesh.",
  },
  {
    title: "Contact",
    content:
      `If you have any questions about these terms, contact us on WhatsApp (${siteConfig.contact.phoneDisplay}). Our farm: ${siteConfig.address.villageEn}, ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}.`,
  },
];

export default function TermsPageEn() {
  return (
    <PolicyPage title="Terms & Conditions">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            {section.title}
          </h2>
          <p className="text-gray-600">{section.content}</p>
        </div>
      ))}
    </PolicyPage>
  );
}