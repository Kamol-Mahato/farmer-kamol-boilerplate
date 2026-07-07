import PolicyPage from "@/app/components/PolicyPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | Farmer Kamol",
  description:
    "Learn about Farmer Kamol's return, exchange, and refund policy for honey, ghee, mustard oil, and duck chicks.",
  alternates: {
    canonical: "/en/return-policy",
    languages: {
      bn: "/return-policy",
      en: "/en/return-policy",
    },
  },
};

const sections = [
  {
    title: "General Rules",
    content:
      "Since our honey, ghee, and mustard oil are food products, opened or used items cannot be returned for safety and hygiene reasons. Returns or exchanges are accepted only in the specific cases listed below.",
  },
  {
    title: "Eligible for Return/Exchange",
    content:
      "If a product arrives damaged (leakage, broken packaging), the wrong product was sent, or an expired product was sent — in these cases we guarantee a replacement or refund.",
  },
  {
    title: "Return Timeframe",
    content:
      "You must inform us within 24-48 hours of delivery. If possible, take photos or video before opening the packaging, as this makes verifying the complaint easier.",
  },
  {
    title: "Return Process",
    content:
      "Send a description of the issue along with photos/video to our WhatsApp (01737939688). Our team will review it and contact you within 24 hours. If the issue is confirmed, we will arrange a replacement or refund.",
  },
  {
    title: "Refund Method",
    content:
      "If a refund is approved, the amount will be returned within 3-7 business days depending on the payment method. For Cash on Delivery orders, the refund will be made via bKash or Nagad.",
  },
  {
    title: "Special Rules for Duck Chicks",
    content:
      "As these are live animals, the standard return/exchange rules do not apply to duck chicks. If a chick is found dead or seriously ill at the time of delivery, you must inform us within 24 hours of delivery with photo/video proof, and we will discuss a replacement or resolution. We are not liable for any harm resulting from inadequate care after delivery has been accepted.",
  },
  {
    title: "What Is Not Returnable",
    content:
      "Opened or used bottles of honey, ghee, and mustard oil; failed delivery due to an incorrect address provided by the customer; complaints reported more than 48 hours after delivery; and duck chicks that were delivered healthy, are not returnable.",
  },
  {
    title: "Contact",
    content:
      "If you have any questions about returns, contact us on WhatsApp (01737939688). Our farm: Sarail, Raiganj, Sirajganj.",
  },
];

export default function ReturnPolicyPageEn() {
  return (
    <PolicyPage title="Return Policy">
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