import p1 from "@/assets/images/landing/qualityrecipe.svg";
import p2 from "@/assets/images/landing/greenmarket.svg";
import p3 from "@/assets/images/landing/zerowaste.svg";

export default function Vision() {
  const visionItems = [
    { title: "Quality Recipes", image: p1, description: "Discover creative recipes to reuse leftovers and reduce waste." },
    { title: "Green Marketplace", image: p2, description: "Buy and sell surplus food in your local community sustainably." },
    { title: "Zero Food Waste", image: p3, description: "Take actionable steps to reduce food waste in everyday life." }
  ];

  return (
    <section id="vision" className="py-16 bg-gray-50">
      <div className="max-w-[95vw] mx-auto px-6 text-center">
        <p className="text-green-600 font-semibold tracking-wide">OUR VISION</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-12 mt-2">
          We help thousands of people reduce food waste
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {visionItems.map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow transform hover:-translate-y-2 duration-300 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
