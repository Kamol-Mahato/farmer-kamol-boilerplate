import PolicyPage from "@/app/components/PolicyPage";
import { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig"

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.brand.nameEn}`,
  description:
    `Learn how ${siteConfig.brand.nameEn} collects, uses, and protects your personal information — read our full privacy policy.`,
  alternates: {
    canonical: "/en/privacy-policy",
    languages: {
      bn: "/privacy-policy",
      en: "/en/privacy-policy",
    },
  },
};

const sections = [
  {
    title: "Introduction",
    content:
      `${siteConfig.brand.nameEn} ("we", "us") values the privacy of users of our website www.${siteConfig.domain.host}. This policy explains what information we collect, how we use it, and how we protect it. By using our website, you agree to this policy.`,
  },
  {
    title: "Information We Collect",
    content:
      "When you place an order, we collect: your name, phone number, delivery address, and details of the products ordered. If you choose an online payment method (bKash/Nagad/Rocket), we only keep a record of whether the payment was completed — we do not collect or store any PIN, password, or sensitive financial information, since payment is completed directly through your bKash/Nagad/Rocket app.",
  },
  {
    title: "How We Use Information",
    content:
      "We use your information to process orders and complete delivery, to send order confirmations and status updates via WhatsApp, to provide customer support, and to handle returns/exchanges when needed. We do not contact you for marketing purposes without your consent.",
  },
  {
    title: "Information Sharing",
    content:
      "We do not sell your personal information to third parties. Information necessary to complete your order (name, address, phone number) is shared only with our courier partner, so your product can be delivered correctly.",
  },
  {
    title: "Cookies & Local Storage",
    content:
      "Our website uses local storage to save your cart information in your browser, so your cart items aren't lost if you refresh the page. If you're logged in, necessary cookies are used to keep your session active. You can control these through your browser settings, though this may prevent some website features (like the cart) from working properly.",
  },
  {
    title: "Data Security",
    content:
      "We take reasonable technical measures to protect your information. However, no data transmission over the internet is 100% secure, so we cannot guarantee absolute security.",
  },
  {
    title: "Children's Privacy",
    content:
      "Our website does not knowingly collect any information from individuals under 18. If a parent believes we may have their child's information, please contact us.",
  },
  {
    title: "Your Rights",
    content:
      "You may request to view, correct, or delete the information we've collected about you — contact us through the details below and we'll act on it as quickly as possible.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this privacy policy as needed. Any changes will be posted on this page, so we recommend checking it periodically.",
  },
  {
    title: "Contact",
    content:
      `If you have any questions about privacy, please contact us on WhatsApp (${siteConfig.contact.phoneDisplay}). Our farm: ${siteConfig.address.villageEn}, ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}.`,
  },
];

export default function PrivacyPolicyPageEn() {
  return (
    <PolicyPage title="Privacy Policy">
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