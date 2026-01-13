import f1 from "@/assets/images/landing/landing1.jpg";
import f2 from "@/assets/images/landing/landing2.jpeg";
import f3 from "@/assets/images/landing/landing3.webp";
import f4 from "@/assets/images/landing/landing4.webp";
import f5 from "@/assets/images/landing/landing5.avif";
import f6 from "@/assets/images/landing/landing6.jpg";

export default function Features() {
  const features = [
    {
      image: f1,
      title: "Log and organize food before it goes to waste.",
      link: "Track Your Leftovers",
    },
    {
      image: f2,
      title: "Get smart reuse tips and leftover-based recipes.",
      link: "Reuse & Recipe Ideas",
    },
    {
      image: f3,
      title: "AI suggests the best way to use each item.",
      link: "AI Reuse Recommendations",
    },
    {
      image: f4,
      title: "Plan meals smarter with what you already have.",
      link: "Find Meal plans",
    },
    {
      image: f5,
      title: "Detect spoilage early and save food in time.",
      link: "Upload photo now",
    },
    {
      image: f6,
      title: "Buy surplus food from your local community.",
      link: "View marketplace",
    },
  ];

  return (
    <section id="offers" className="py-8 text-center max-w-[95vw] mx-auto">
      <p className="text-green-600 font-semibold">OUR FEATURES</p>
      <h2 className="text-3xl font-bold mb-10">What we offer to our users.</h2>
      <div className="grid md:grid-cols-3 gap-12 px-6">
        {features.map((feature, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden">
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full h-94 object-cover"
            />

            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-6">
              <p className="font-semibold text-gray-800 text-md mb-3">
                {feature.title}
              </p>
              <a
                href="#"
                className="text-green-500 font-medium text-sm hover:text-green-800 inline-flex items-center"
              >
                {feature.link} →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
