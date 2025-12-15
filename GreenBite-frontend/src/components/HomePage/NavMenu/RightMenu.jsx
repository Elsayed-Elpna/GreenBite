import React from "react";
// customthem
import { ThemeProvider } from "flowbite-react";
import profileTheme from "@/theme/ProfileCardtheme";
// components
import ProfileCard from "./ProfileCard";
import RecommendedMenu from "./RecommendedMenu";

const RightMenu = () => {
  return (
    <div className="flex flex-col bg-[#F9F4F2] p-7 h-screen">
      <ThemeProvider theme={profileTheme}>
        <ProfileCard />
      </ThemeProvider>
      <RecommendedMenu />
    </div>
  );
};

export default RightMenu;
