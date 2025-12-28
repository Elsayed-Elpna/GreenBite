import React from "react";
import { NavLink, Link } from "react-router-dom";

// components
import LogOutBtn from "@/components/HomePage/NavMenu/LogOutBtn";
// imgs
import logo from "@/assets/images/Logos/Verticallogo.png";

// icons
import { FaHome } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineFoodBank } from "react-icons/md";

const NavBar = () => {
  return (
    <div className="navbar bg-base-100 flex flex-row-reverse justify-between">
      {/* mobile menu */}
      <div className="navbar-start flex justify-end">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden hover:scale-110 transition-transform duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-3 w-56 p-3 shadow-2xl border border-gray-100 space-y-1"
          >
            <li>
              <NavLink
                to="/home"
                end
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-md transform translate-x-1"
                      : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                  }`
                }
              >
                <span className="absolute left-0 w-1 h-full bg-[#7eb685] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center rounded-r-full" />
                <FaHome
                  className={`relative z-10 transition-all duration-300 ${({
                    isActive,
                  }) =>
                    isActive
                      ? "scale-110"
                      : "group-hover:scale-110 group-hover:rotate-12"}`}
                />
                <span className="relative z-10 text-[15px] ml-3 font-medium">
                  Home
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/home/foodlog"
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-md transform translate-x-1"
                      : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                  }`
                }
              >
                <span className="absolute left-0 w-1 h-full bg-[#7eb685] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center rounded-r-full" />
                <GiHotMeal className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="relative z-10 text-[15px] ml-3 font-medium">
                  Food Log
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/home/wastelog"
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-md transform translate-x-1"
                      : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                  }`
                }
              >
                <span className="absolute left-0 w-1 h-full bg-[#7eb685] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center rounded-r-full" />
                <MdOutlineFoodBank className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="relative z-10 text-[15px] ml-3 font-medium">
                  Waste Log
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/home/ai-recipes"
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-[#C2E66E] to-[#a8cc5e] text-white shadow-md transform translate-x-1"
                      : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                  }`
                }
              >
                <span className="absolute left-0 w-1 h-full bg-[#C2E66E] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center rounded-r-full" />
                <GiHotMeal className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="relative z-10 text-[15px] ml-3 font-medium">
                  AI Recipes
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* links */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                `relative flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-300 ease-in-out overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-lg shadow-[#7eb685]/50 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                }`
              }
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out scale-0 group-hover:scale-100 rounded-full bg-gradient-to-r from-[#7eb685]/10 to-[#6aa571]/10" />
              <FaHome className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10 text-[14px] ml-2.5 font-medium">
                Home
              </span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/home/foodlog"
              className={({ isActive }) =>
                `relative flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-300 ease-in-out overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-lg shadow-[#7eb685]/50 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                }`
              }
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out scale-0 group-hover:scale-100 rounded-full bg-gradient-to-r from-[#7eb685]/10 to-[#6aa571]/10" />
              <GiHotMeal className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10 text-[14px] ml-2.5 font-medium">
                Food Log
              </span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/home/wastelog"
              className={({ isActive }) =>
                `relative flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-300 ease-in-out overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-lg shadow-[#7eb685]/50 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                }`
              }
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out scale-0 group-hover:scale-100 rounded-full bg-gradient-to-r from-[#7eb685]/10 to-[#6aa571]/10" />
              <MdOutlineFoodBank className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10 text-[14px] ml-2.5 font-medium">
                Waste Log
              </span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/home/ai-recipes"
              className={({ isActive }) =>
                `relative flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-300 ease-in-out overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-[#C2E66E] to-[#a8cc5e] text-white shadow-lg shadow-[#C2E66E]/50 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                }`
              }
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out scale-0 group-hover:scale-100 rounded-full bg-gradient-to-r from-[#C2E66E]/10 to-[#a8cc5e]/10" />
              <GiHotMeal className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10 text-[14px] ml-2.5 font-medium">
                AI Recipes
              </span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div>
        <Link to="/">
          <img src={logo} className="w-50" alt="Logo" />
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
