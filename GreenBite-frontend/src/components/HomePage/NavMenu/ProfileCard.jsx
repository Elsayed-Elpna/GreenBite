import React from "react";
import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-react";

import logo from "@/assets/images/Logos/pac man (1).png";
function ProfileCard() {
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
                <p className="text-lg font-semibold text-gray-900">John Doe</p>
                <p className="text-sm text-gray-400">Admin</p>
              </div>
            </div>
          }
        >
          <DropdownItem>Dashboard</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownItem>Earnings</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Logout</DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}

export default ProfileCard;
