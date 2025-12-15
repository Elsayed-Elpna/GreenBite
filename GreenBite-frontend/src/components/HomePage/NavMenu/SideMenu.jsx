import React from "react";
import { NavLink } from "react-router-dom";

// components
import LogOutBtn from "@/components/HomePage/NavMenu/LogOutBtn";
// imgs
import logo from "@/assets/images/Logos/Verticallogo.svg";
import logo2 from "@/assets/images/Logos/pac man (1).png";

// icons
import { FaHome } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";

const SideMenu = () => {
  return (
    <div className="h-full w-full flex flex-col justify-between  border-r border-gray-200">
      <aside className=" bg-white h-full">
        <div className="p-2 font-bold text-xl ">
          <img src={logo} className="hidden md:hidden lg:block" />
          <img src={logo2} className="hidden md:block lg:hidden" />
        </div>
        <nav className="">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              `flex items-center justify-center px-4 py-2 rounded ${
                isActive
                  ? "bg-[#C2E66E] rounded-l-full ml-1 text-white"
                  : "text-gray-700 rounded-l-full ml-1 hover:bg-gray-100"
              }`
            }
          >
            <FaHome className="icon" />
            <span className="text-[14px] ml-2.5 hidden lg:inline">Home</span>
          </NavLink>

          <NavLink
            to="/home/testoo"
            className={({ isActive }) =>
              `flex items-center justify-center px-4 py-2 rounded ${
                isActive
                  ? "bg-[#C2E66E] rounded-l-full ml-1 text-white"
                  : "text-gray-700 rounded-l-full ml-1 hover:bg-gray-100"
              }`
            }
          >
            <GiHotMeal />
            <span className="text-[14px] ml-2.5 hidden lg:inline">
              Reicpe center
            </span>
          </NavLink>
        </nav>
      </aside>
      <div>
        <LogOutBtn />
      </div>
    </div>
  );
};

export default SideMenu;
