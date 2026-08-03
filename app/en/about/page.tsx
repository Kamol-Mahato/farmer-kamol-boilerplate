"use client"
import { siteConfig } from "@/lib/siteConfig"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPageEn() {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
    2: false,
    3: false,
  })
  const toggle = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <main className="pt-14 sm:pt-10 pb-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex justify-center gap-3 sm:gap-5 mb-10">
        {["header-1st-about.jpg", "header-2nd-about.jpg", "header-3rd-about.jpg"].map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl shadow-md w-1/3 aspect-[4/3] ring-1 ring-green-100 group"
          >
            <Image
              src={`/uploads/${img}`}
              alt={`${siteConfig.brand.nameEn} farm photo ${i + 1} - ${siteConfig.address.regionEn}`}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 33vw, 300px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-green-900 mb-10">
        About Us
      </h1>

      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-16">
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex-shrink-0 mx-auto md:mx-0 group">
          <Image
              src="/uploads/kamol.png"
              alt={`${siteConfig.brand.nameEn} - ${siteConfig.brand.founderName}, Founder`}
              width={192}
              height={192}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg ring-4 ring-yellow-400/70 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌾 Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              I'm Kamol. I graduated in Bengali Literature, but my real identity isn't found on the pages of a book — it's in the soil of Sarail village, Raiganj, Sirajganj. I call myself a "person of the soil" — even while working in Dhaka, my roots stayed in the village fields, on the farm.
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[0] ? "block" : "hidden"}`}>
              <p>
              While working at a courier company in Dhaka, I saw how desperately city people searched for a bottle of pure honey or adulteration-free ghee. Yet in our village, these gifts of nature are right at hand. {siteConfig.brand.nameEn} was born to close that gap — straight from the farm to your door, with no middlemen.
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">Our Mission</h3>
                <p>To deliver pure, adulteration-free natural food products, produced through a transparent process, directly from the farmer's home to every home in Bangladesh.</p>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">Our Vision</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Build a reliable market for rural farmers</li>
                  <li>Fight adulteration by delivering genuinely pure products</li>
                  <li>Make farming appealing to the new generation through modern content and e-commerce</li>
                  <li>One day return fully to our family land to farm full-time</li>
                </ul>
              </div>
              <p className="font-semibold text-green-800">
              We show the production process of every one of our products on our{" "}
               <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-600 transition"
              >
                YouTube
              </a>{" "}
                channel{" "}
                <Link href="/en" className="underline hover:text-yellow-600 transition">
                  {siteConfig.brand.youtubeHandle}
                </Link>
                — transparency is the foundation of our trust.
              </p>
            </div>
            <button
              onClick={() => toggle(0)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[0] ? "\u25b2 Show less" : "\u25be Read more"}
            </button>
          </div>
        </section>
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">🌱 What Is Integrated Farming?</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Integrated farming means running crop cultivation, fish farming, livestock rearing, poultry, and other agricultural activities together on the same land or farm, in a way where the waste of one becomes the benefit of another.
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[1] ? "block" : "hidden"}`}>
              <p>
                In other words, every part of farming is connected into a cycle. This makes it possible to achieve diverse production and maximum profit using minimal land and capital.
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">Core Concept of Integrated Farming</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Diverse output: vegetables, fish, milk, eggs, meat, and more from a single farm.</li>
                  <li>Waste reuse: cow dung becomes fertilizer, duck droppings feed fish, crop straw feeds livestock.</li>
                  <li>Lower costs: less need to buy outside fertilizer and feed.</li>
                  <li>Multiple income sources: diverse production lowers the farmer's risk and raises income.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">\ud83d\udfe2 Benefits of Integrated Farming</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Economically profitable: income from multiple sources at once.</li>
                  <li>Reduces risk: if one output is affected, others can offset the loss.</li>
                  <li>Protects the environment through organic fertilizer: less chemical fertilizer and pesticide use.</li>
                  <li>Creates employment: several people from a family or village can be involved.</li>
                  <li>Meets nutritional needs: milk, eggs, fish, vegetables — all from the same place.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">\ud83d\udfe2 What Can Integrated Farming Include?</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Crop cultivation (rice, vegetables, fruit)</li>
                  <li>Fish farming</li>
                  <li>Duck, chicken, pigeon rearing</li>
                  <li>Cattle, goat, buffalo rearing</li>
                  <li>Vermicompost / organic fertilizer production</li>
                  <li>Beekeeping</li>
                  <li>Solar energy use (for irrigation or electricity)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">\ud83d\udfe2 Why It Matters in Bangladesh</h3>
                <p>
                  Farmland in Bangladesh is shrinking while food demand keeps rising. Integrated farming allows more output from less land, lowers farmers' costs, reduces the national nutrition gap, and strengthens the rural economy.
                </p>
              </div>
              <p className="font-semibold text-green-800">
                \ud83d\udc49 Integrated farming = one plot, one farm \u2192 many outputs + lower cost + higher profit
              </p>
            </div>
            <button
              onClick={() => toggle(1)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[1] ? "\u25b2 Show less" : "\u25be Read more"}
            </button>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
          <Image
              src="/uploads/about-1st-sub.jpg"
              alt={`Integrated farming - ${siteConfig.brand.nameEn}, ${siteConfig.address.regionEn}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-sm font-bold">Integrated Farming</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
          <Image
              src="/uploads/about-2nd-sub.jpg"
              alt={`Livestock rearing - ${siteConfig.brand.nameEn} farm, ${siteConfig.address.regionEn}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-sm font-bold">Livestock</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">\ud83d\udc04 Livestock Rearing</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Livestock rearing is a key part of integrated farming. It's not just for milk, meat, or eggs — it also plays a major role in economic self-reliance and in producing fertilizer and organic energy.
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[2] ? "block" : "hidden"}`}>
              <p>
                From ordinary village families to modern farmers, more and more people are now taking up livestock rearing as a profession.
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">What Our Work Includes:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cattle and buffalo rearing: for milk, dung, and organic fertilizer.</li>
                  <li>Goat and sheep rearing: a low-cost, fast route to financial gain.</li>
                  <li>Duck and poultry rearing: eggs and meat production plus extra income.</li>
                  <li>Veterinary advice and vaccination: regular care for animal health and disease prevention.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">Benefits of Livestock Rearing:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Helps meet a family's nutritional needs.</li>
                  <li>Contributes to fertilizer and organic energy production.</li>
                  <li>Supports women's employment and family finances.</li>
                  <li>Plays a major role in rural economic development.</li>
                </ul>
              </div>
              <p className="font-semibold text-green-800">
                "Livestock isn't just an asset — with proper care, it becomes the foundation of success."
              </p>
            </div>
            <button
              onClick={() => toggle(2)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[2] ? "\u25b2 Show less" : "\u25be Read more"}
            </button>
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 order-2 md:order-1">
            <h2 className="text-xl font-bold text-green-800 mb-3">\ud83c\udf3e Crop Cultivation</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Crop cultivation is the backbone of our agriculture-based economy. Seasonal and year-round crop farming is one of the core pillars of integrated farming.
            </p>
            <div className={`text-gray-700 leading-relaxed space-y-4 mt-2 ${expanded[3] ? "block" : "hidden"}`}>
              <p>
                Through modern methods and proper management, we can ensure higher yields from smaller plots of land.
              </p>
              <div>
                <h3 className="font-bold text-green-900 mb-1">What Our Work Includes:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Rice, wheat, maize: improved techniques for these staple food grains.</li>
                  <li>Vegetables (gourd, ridge gourd, tomato, papaya, beans, eggplant): profitable in both nutrition and market value.</li>
                  <li>Grass cultivation (Napier/Guinea): planned production for livestock feed.</li>
                  <li>Organic fertilizer and irrigation management: eco-friendly farming alongside increased output.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">Benefits of Crop Cultivation:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensures nutritional security.</li>
                  <li>Increases income through market sales.</li>
                  <li>Indirectly supports livestock and fish farming.</li>
                  <li>Ensures sustainable use of land.</li>
                </ul>
              </div>
              <p className="font-semibold text-green-800">
                "A dream sown in seed, a golden harvest grown in sweat."
              </p>
            </div>
            <button
              onClick={() => toggle(3)}
              className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700 transition"
            >
              {expanded[3] ? "\u25b2 Show less" : "\u25be Read more"}
            </button>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl shadow-md w-full md:w-64 aspect-[4/3] flex-shrink-0 group ring-1 ring-green-100">
          <Image
              src="/uploads/about-3rd-sub.jpg"
              alt={`Crop cultivation - ${siteConfig.brand.nameEn} farm, ${siteConfig.address.regionEn}`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-sm font-bold">Crop Cultivation</span>
            </div>
          </div>
        </section>
      </div>

      <div className="text-center mt-16">
        <Link href="/en" className="text-green-800 font-bold hover:text-yellow-600 transition">
        \u2190 Back to {siteConfig.brand.nameEn} Homepage
        </Link>
      </div>
    </main>
  )
}
