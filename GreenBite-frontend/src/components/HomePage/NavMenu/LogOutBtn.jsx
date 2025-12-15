import React from "react";
import { IoIosLogOut } from "react-icons/io";

const LogOutBtn = () => {
  return (
    <div className="flex items-center justify-center rounded-l-full ml-1 bg-[#F9F4F2] px-4 py-2 rounded mb-5">
      <IoIosLogOut className="text-[#8A8C90]" />

      <button className="hidden lg:inline text-[14px] text-[#8A8C90] ml-2.5  ">
        Logout
      </button>
    </div>
  );
};

export default LogOutBtn;
