import logo from "@/assets/images/logos/Circularlogo.png";

export default function Footer() {
  return (
    <footer className="!bg-[#7eb685] text-white py-2">
      <div className="flex items-center justify-center gap-2 font-semibold">
        <span>© 2025 GreenBite</span>

        <img
          src={logo}
          alt="GreenBite logo"
          className="h-10 w-auto"
        />
      </div>
    </footer>
  );
}
