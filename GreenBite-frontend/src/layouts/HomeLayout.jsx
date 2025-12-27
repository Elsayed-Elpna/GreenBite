import { Outlet } from "react-router-dom";
import SideMenu from "../components/HomePage/NavMenu/SideMenu";
import "@/layouts/HomeLayout.css";
import RightMenu from "@/components/HomePage/RightMenu/RightMenu";

const HomeLayout = () => {
  return (
    <div className="layout">
      {/* Left Sidebar */}
      <div className="left-sidebar ">
        <SideMenu />
      </div>

      {/* Main Content */}
      <div className="center-content bg-[#F9F4F2]">
        <Outlet />
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar ">
        <RightMenu />
      </div>
    </div>
  );
};

export default HomeLayout;
