import React from "react";
import { NavLink, Link } from "react-router-dom";

// components
import LogOutBtn from "@/components/HomePage/NavMenu/LogOutBtn";
// imgs
import logo from "@/assets/images/Logos/Verticallogo.png";
import logo2 from "@/assets/images/Logos/pac man (1).png";

// icons
import { FaHome } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineFoodBank } from "react-icons/md";

const SideMenu = () => {
  return (
    <div className="h-full w-full flex flex-col justify-between  border-r border-gray-200">
      <aside className=" bg-white h-full">
        <div className="p-2 font-bold text-xl ">
          <Link to="/">
            <img src={logo} className="hidden md:hidden lg:block" />
            <img src={logo2} className="hidden md:block lg:hidden" />
          </Link>
        </div>
        <nav className="">
          <NavLink
            to="/home/mymeals"
            end
            className={({ isActive }) =>
              `flex items-center justify-center px-4 py-2 rounded ${
                isActive
                  ? "bg-[#7eb685] rounded-l-full ml-1 text-white"
                  : "text-gray-700 rounded-l-full ml-1 hover:bg-gray-100"
              }`
            }
          >
            <FaHome className="icon" />
            <span className="text-[14px] ml-2.5 hidden lg:inline">Home</span>
          </NavLink>

          <NavLink
            to="/home/foodlog"
            className={({ isActive }) =>
              `flex items-center justify-center px-4 py-2 rounded ${
                isActive
                  ? "bg-[#7eb685] rounded-l-full ml-1 text-white"
                  : "text-gray-700 rounded-l-full ml-1 hover:bg-gray-100"
              }`
            }
          >
            <GiHotMeal />
            <span className="text-[14px] ml-2.5 hidden lg:inline">
              Food Log
            </span>
          </NavLink>
          <NavLink
            to="/home/wastelog"
            className={({ isActive }) =>
              `flex items-center justify-center px-4 py-2 rounded ${
                isActive
                  ? "bg-[#7eb685] rounded-l-full ml-1 text-white"
                  : "text-gray-700 rounded-l-full ml-1 hover:bg-gray-100"
              }`
            }
          >
            <MdOutlineFoodBank />
            <span className="text-[14px] ml-2.5 hidden lg:inline">
              Waste Log
            </span>
          </NavLink>
          <NavLink
            to="/home/recipes"
            className={({ isActive }) =>
              `flex items-center justify-center px-4 py-2 rounded ${
                isActive
                  ? "bg-[#7eb685] rounded-l-full ml-1 text-white"
                  : "text-gray-700 rounded-l-full ml-1 hover:bg-gray-100"
              }`
            }
          >
            <GiHotMeal />
            <span className="text-[14px] ml-2.5 hidden lg:inline">
              Recipe center
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
