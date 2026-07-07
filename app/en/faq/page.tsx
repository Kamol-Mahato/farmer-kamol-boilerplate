import PolicyPage from "@/app/components/PolicyPage";
import { Metadata } from "next";
import { safeJsonLd } from "@/lib/jsonLd"

export const metadata: Metadata = {
  title: "FAQ | Farmer Kamol",
  description:
    "Common questions about Farmer Kamol's products, orders, delivery, and returns. Learn about our pure honey, ghee, mustard oil, and duck chicks from Sirajganj.",
  alternates: {
    canonical: "/en/faq",
    languages: {
      bn: "/faq",
      en: "/en/faq",
    },
  },
};

const faqGroups = [
  {
    category: "About Farmer Kamol",
    items: [
      {
        q: "What is Farmer Kamol?",
        a: "Farmer Kamol is an agricultural brand based in Sarail, Raiganj, Sirajganj, delivering pure honey, ghee, mustard oil, and duck chicks directly from the farm to customers, with no middlemen.",
      },
      {
        q: "Do Farmer Kamol's products come from your own farm?",
        a: "Yes. Farmer Kamol's products are sourced from our own farm and trusted suppliers. Videos of our production and sourcing process are published on our YouTube channel.",
      },
      {
        q: "Where can I watch Farmer Kamol's videos?",
        a: "We regularly publish videos of the farm, honey collection, mustard oil production, and other farming content on our YouTube channel and Facebook page.",
      },
      {
        q: "What products does Farmer Kamol sell?",
        a: "We currently supply pure honey, ghee, mustard oil, and seasonal duck chicks. More farm products will be added in the future.",
      },
      {
        q: "Why buy from Farmer Kamol?",
        a: "We place the highest priority on farm-based production, transparency, and customer trust. We regularly share information and videos about our products' source, collection, and preparation.",
      },
      {
        q: "What is Farmer Kamol's goal?",
        a: "Our goal is to deliver safe, pure agricultural products directly to customers and to spread farming knowledge to everyone.",
      },
      {
        q: "Can I see your farm's activities online?",
        a: "Yes. We regularly publish videos of various farm activities, production processes, and educational farming content on our Facebook and YouTube channels.",
      },
    ],
  },
  {
    category: "About Our Products",
    items: [
      {
        q: "What flower is your honey from?",
        a: "We primarily supply mustard flower honey, collected seasonally.",
      },
      {
        q: "How can I tell if honey is pure?",
        a: "The best way to identify pure honey is to check the source and the seller's credibility. Farmer Kamol publishes real videos of honey collection and processing, so customers get a clear picture of the production process.",
      },
      {
        q: "Does crystallized honey mean it's fake?",
        a: "No. Natural honey can crystallize depending on temperature and flower source. This is not always a sign of being fake.",
      },
      {
        q: "How long can honey be stored?",
        a: "Honey stays good for a long time if stored in a clean, dry container. Keep it away from direct sunlight and excess moisture.",
      },
      {
        q: "How should I store mustard oil?",
        a: "Mustard oil should be stored in a covered container in a cool, dry place. This keeps its quality intact for a long time.",
      },
      {
        q: "Does a strong smell mean the mustard oil is pure?",
        a: "Mustard oil naturally has a pungent smell. However, purity shouldn't be judged based on smell alone.",
      },
      {
        q: "Where do your products come from?",
        a: "All our products come from our own farm in Raiganj, Sirajganj. You can watch the production process on our YouTube channel.",
      },
      {
        q: "Are your products adulteration-free?",
        a: "Yes. No sugar or syrup is mixed into our honey, no vegetable oil is in our ghee, and our mustard oil is made through a proper cold-pressed process.",
      },
      {
        q: "How is your ghee made?",
        a: "Our ghee is made from local cow's milk using a traditional method, with no artificial ingredients.",
      },
      {
        q: "Are eggs available right now?",
        a: "Eggs are currently out of stock. We're working to resume supply soon — follow our Facebook and YouTube pages for updates.",
      },
      {
        q: "How do I order duck chicks?",
        a: "The price of duck chicks varies by age and size, so there's no fixed price. To order, please contact us directly on WhatsApp — price and quantity will be settled through discussion. We'll confirm whether delivery is possible to your location, and payment must be completed before delivery.",
      },
    ],
  },
  {
    category: "Orders & Payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Add your preferred products to the cart on the website and confirm your order from the checkout page. You'll receive a confirmation message on WhatsApp after ordering.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept Cash on Delivery (COD). You can also choose the online payment option at checkout, where a bKash, Nagad, or Rocket number is shown (with a copy button) — send money there to complete payment. Direct gateway payment will be added in the future.",
      },
      {
        q: "How will I get order updates?",
        a: "Order confirmation and delivery status are sent via WhatsApp. You can also track your order by logging into your account dashboard on the website.",
      },
      {
        q: "Do I need to create an account to order?",
        a: "No. You can order as a guest. However, creating an account lets you easily view your order history and status in the future.",
      },
      {
        q: "What should I do after making a payment?",
        a: "After completing payment via bKash, Nagad, or Rocket, keep the transaction number. Our team may request it for verification if needed.",
      },
      {
        q: "Is Cash on Delivery available across Bangladesh?",
        a: "Cash on Delivery is available in most areas. However, advance payment may be required for certain products or locations.",
      },
    ],
  },
  {
    category: "Delivery",
    items: [
      {
        q: "How much is the delivery charge?",
        a: "Delivery within Dhaka costs 75 taka per kg (minimum 60 taka), and outside Dhaka costs 120 taka per kg (minimum 100 taka). The exact charge is shown at checkout.",
      },
      {
        q: "Do you deliver honey and mustard oil across all of Bangladesh?",
        a: "Yes. We deliver honey, mustard oil, and other approved products across Bangladesh via courier service.",
      },
      {
        q: "How will I know my order is confirmed?",
        a: "Once an order is successfully placed, confirmation is sent via WhatsApp or phone call.",
      },
      {
        q: "How long does delivery take?",
        a: "Delivery is usually completed within 2-5 business days after order confirmation; timing may vary slightly depending on distance.",
      },
      {
        q: "Which areas do you deliver to?",
        a: "We deliver across all of Bangladesh via courier service.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What should I do if I receive a damaged product?",
        a: "Let us know on WhatsApp within 24-48 hours of delivery, including photos/video if possible. See our Return Policy for detailed terms.",
      },
      {
        q: "Can I exchange a wrongly delivered product?",
        a: "Yes, if the wrong product was sent, we take full responsibility and will resend the correct product at no extra cost.",
      },
    ],
  },
  {
    category: "Farm & Contact",
    items: [
      {
        q: "Where is your farm located?",
        a: "Our farm is located in Sarail village, Raiganj Upazila, Sirajganj District.",
      },
      {
        q: "How can I contact you?",
        a: "WhatsApp/Phone: 01737939688. You can also message our Facebook and YouTube (@FarmerKamol) pages.",
      },
    ],
  },
];

export default function FaqPageEn() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      <PolicyPage title="Frequently Asked Questions">
  <div className="space-y-4">
    {faqGroups.map((group) => (
      <details
        key={group.category}
        className="border border-gray-200 rounded-lg bg-white shadow-sm"
      >
        <summary className="cursor-pointer px-5 py-4 font-semibold text-lg text-green-700">
          {group.category}
        </summary>

        <div className="px-5 pb-5">
          <div className="space-y-3">
            {group.items.map((item) => (
              <details
                key={item.q}
                className="border-b border-gray-100 pb-3"
              >
                <summary className="cursor-pointer font-medium text-gray-900 py-2">
                  {item.q}
                </summary>

                <p className="text-gray-600 mt-2 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </details>
    ))}
  </div>
</PolicyPage>
    </>
  );
}