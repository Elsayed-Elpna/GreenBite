import React from "react";
import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-react";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import logo from "@/assets/images/Logos/pac man (1).png";
function ProfileCard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const handelLogout = () => {
    logout();
    navigate("/", { replace: true });
  };
  return (
    <div className=" w-full flex items-center justify-start mb-7 ">
      <div className="mr-3">
        <Dropdown
          inline
          arrowIcon={false}
          clearTheme
          label={
            <div className="flex items-center  ali gap-3 cursor-pointer">
              <img
                src={logo}
                alt="profile"
                className="h-15 w-15 rounded-full"
              />

              <div className="leading-tight">
                <p className="text-lg font-semibold text-gray-900">
                  {`${user.first_name}  ${user.last_name}`}
                </p>
                <p className="text-sm text-gray-400">Admin</p>
              </div>
            </div>
          }
        >
          <DropdownItem className="bg-red! cursor-pointer">
            Dashboard
          </DropdownItem>
          <DropdownItem className="cursor-pointer">Settings</DropdownItem>
          <DropdownItem className="cursor-pointer">Earnings</DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={handelLogout} className="cursor-pointer">
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}

export default ProfileCard;
