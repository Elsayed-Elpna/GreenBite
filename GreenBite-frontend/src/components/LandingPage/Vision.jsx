import p1 from "@/assets/images/landing/qualityrecipe.svg";
import p2 from "@/assets/images/landing/greenmarket.svg";
import p3 from "@/assets/images/landing/zerowaste.svg";

export default function Vision() {
  return (
    <section id="vision" className="py-8">
      <div className="max-w-[95vw] mx-auto px-6 text-center">
        <p className="text-green-600 font-semibold">OUR VISION</p>
        <h2 className="text-3xl font-bold mb-10 py-2">
          We help thousands of people reduce food waste.
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: "Quality Recipes", image: p1 },
            { title: "Green market place", image: p2 },
            { title: "Zero Food Waste", image: p3 }
          ].map(item => (
            <div key={item.title} className="bg-[#DEEDE0] p-8 rounded-xl">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-contain mb-4"
              />
              <h3 className="font-semibold text-lg">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
