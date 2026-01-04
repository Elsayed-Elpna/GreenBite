import React from "react";
import { NavLink, Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/hooks/settings/useProfile";

// components
import LogOutBtn from "@/components/HomePage/NavMenu/LogOutBtn";
// imgs
import logo from "@/assets/images/Logos/Verticallogo.png";

// icons
import { FaHome } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineFoodBank } from "react-icons/md";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!user,
    staleTime: Infinity,
  });
  const navigate = useNavigate();

  if (!user || isLoading || !data) return null;

  const { first_name, last_name, profile: { avatar } = {} } = data;

  const handelLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="navbar bg-base-100 flex flex-row-reverse justify-between items-center  ">
      {/* profile */}
      <div className="dropdown dropdown-end hidden lg:flex gap-2 justify-between items-center mr-5">
        <div className="flex gap-1 items-center">
          <span className="text-[16px] font-semibold text-[#374151] capitalize">
            {first_name}{" "}
          </span>
          <span className="text-[16px] font-semibold text-[#374151] capitalize">
            {last_name}
          </span>
        </div>
        <div>
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src={
                  avatar ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                }
              />
            </div>
          </div>
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {/* Profile */}
            <li>
              <NavLink
                to="/profile"
                className="
            relative flex items-center px-4 py-3 rounded-xl
            transition-all duration-300 ease-in-out
            text-gray-700 hover:bg-gray-50 hover:translate-x-1
          "
              >
                <span
                  className="absolute left-0 w-1 h-full bg-[#7eb685]
            transition-all duration-300 scale-y-0
            group-hover:scale-y-100 origin-center rounded-r-full"
                />

                <FaUser className="relative z-10" />
                <span className="relative z-10 ml-3 text-[15px] font-medium">
                  Profile
                </span>
              </NavLink>
            </li>

            {/* Settings */}
            <li>
              <NavLink
                to="/user/settings"
                className="
            relative flex items-center px-4 py-3 rounded-xl
            transition-all duration-300 ease-in-out
            text-gray-700 hover:bg-gray-50 hover:translate-x-1
          "
              >
                <FaCog className="relative z-10" />
                <span className="relative z-10 ml-3 text-[15px] font-medium">
                  Settings
                </span>
              </NavLink>
            </li>

            {/* Logout */}
            <li>
              <button
                type="button"
                onClick={handelLogout}
                className="
            relative w-full flex items-center px-4 py-3 rounded-xl
            transition-all duration-300 ease-in-out
            text-red-600 hover:bg-red-50 hover:translate-x-1
          "
              >
                <FaSignOutAlt className="relative z-10" />
                <span className="relative z-10 ml-3 text-[15px] font-medium">
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
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
              <details className="group">
                <summary
                  className="
        relative flex items-center px-4 py-3 rounded-xl
        transition-all duration-300 ease-in-out
        text-gray-700 hover:bg-gray-50 hover:translate-x-1
        cursor-pointer
      "
                >
                  <span
                    className="absolute left-0 w-1 h-full bg-[#7eb685]
        transition-all duration-300 scale-y-0
        group-hover:scale-y-100 origin-center rounded-r-full"
                  />

                  <FaUser className="relative z-10 transition-all duration-300 group-hover:scale-110" />

                  <div className="flex gap-1 items-center">
                    <span className="text-[16px] font-semibold text-[#374151] capitalize">
                      {first_name}{" "}
                    </span>
                    <span className="text-[16px] font-semibold text-[#374151] capitalize">
                      {last_name}
                    </span>
                  </div>
                </summary>

                {/* dropdown items */}
                <ul className="mt-2 space-y-1 pl-2">
                  {/* Profile */}
                  <li>
                    <NavLink
                      to="/profile"
                      className="
            relative flex items-center px-4 py-3 rounded-xl
            transition-all duration-300 ease-in-out
            text-gray-700 hover:bg-gray-50 hover:translate-x-1
          "
                    >
                      <span
                        className="absolute left-0 w-1 h-full bg-[#7eb685]
            transition-all duration-300 scale-y-0
            group-hover:scale-y-100 origin-center rounded-r-full"
                      />

                      <FaUser className="relative z-10" />
                      <span className="relative z-10 ml-3 text-[15px] font-medium">
                        Profile
                      </span>
                    </NavLink>
                  </li>

                  {/* Settings */}
                  <li>
                    <NavLink
                      to="/user/settings"
                      className="
            relative flex items-center px-4 py-3 rounded-xl
            transition-all duration-300 ease-in-out
            text-gray-700 hover:bg-gray-50 hover:translate-x-1
          "
                    >
                      <FaCog className="relative z-10" />
                      <span className="relative z-10 ml-3 text-[15px] font-medium">
                        Settings
                      </span>
                    </NavLink>
                  </li>

                  {/* Logout */}
                  <li>
                    <button
                      type="button"
                      onClick={handelLogout}
                      className="
            relative w-full flex items-center px-4 py-3 rounded-xl
            transition-all duration-300 ease-in-out
            text-red-600 hover:bg-red-50 hover:translate-x-1
          "
                    >
                      <FaSignOutAlt className="relative z-10" />
                      <span className="relative z-10 ml-3 text-[15px] font-medium">
                        Logout
                      </span>
                    </button>
                  </li>
                </ul>
              </details>
            </li>
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
                to="/home/recipes"
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-[#7eb685] to-[#7eb685] text-white shadow-md transform translate-x-1"
                      : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                  }`
                }
              >
                <span className="absolute left-0 w-1 h-full bg-[#7eb685] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center rounded-r-full" />
                <GiHotMeal className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="relative z-10 text-[15px] ml-3 font-medium">
                  Recipe Center
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
      <div className="navbar-center ml-5 hidden lg:flex">
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
              to="/home/recipes"
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
                Recipe Center
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
