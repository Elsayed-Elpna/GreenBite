import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import logo from "@/assets/images/logos/Verticallogo.png";
import { AuthContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useContext } from "react";

export default function AppNavbar() {
  const navLinkClass =
    "!text-white hover:!text-white transform hover:scale-110 transition-transform duration-200 ease-in-out";
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Navbar fluid className="!bg-white">
      <NavbarBrand>
        <img src={logo} className="mr-3 h-10 sm:h-12" alt="GreenBite logo" />
      </NavbarBrand>

      <div className="flex md:order-2 items-center gap-3">
        {!isAuthenticated && (
          <Link
            to="/register"
            className="!bg-[#7eb685] !text-white px-8 py-3 rounded-full hover:!bg-[#6da574] transition-colors cursor-pointer"
          >
            Sign up
          </Link>
        )}

        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-8 !bg-[#7eb685] px-8 py-4 rounded-[15px]">
            <NavbarLink as={Link} to="/home" active className={navLinkClass}>
              Home
            </NavbarLink>

            <span className="text-white">|</span>

            {!isAuthenticated && (
              <NavbarLink as={Link} to="/login" className={navLinkClass}>
                Login
              </NavbarLink>
            )}
            {!isAuthenticated && <span className="text-white">|</span>}

            <NavbarLink href="/#vision" className={navLinkClass}>
              Our Vision
            </NavbarLink>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-2 md:hidden mt-2 bg-[#7eb685] rounded-[15px] p-4">
          <NavbarLink href="#" className={navLinkClass}>
            Home
          </NavbarLink>
          <NavbarLink href="/login" className={navLinkClass}>
            Login
          </NavbarLink>
          <NavbarLink href="#vision" className={navLinkClass}>
            Our Vision
          </NavbarLink>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
}
