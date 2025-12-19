import logo from "@/assets/images/logos/Circularlogo.png";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="!bg-[#7eb685] text-white py-2">
      <div className="flex items-center justify-center gap-2 font-semibold">
        <span>© 2025 GreenBite</span>
        <Link to="/">
          <img src={logo} alt="GreenBite logo" className="h-10 w-auto" />
        </Link>
      </div>
    </footer>
  );
}
