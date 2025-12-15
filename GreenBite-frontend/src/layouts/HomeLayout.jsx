import { Outlet } from "react-router-dom";
import SideMenu from "../components/HomePage/NavMenu/SideMenu";
import "@/layouts/HomeLayout.css";
import RightMenu from "@/components/HomePage/NavMenu/RightMenu";

const HomeLayout = () => {
  return (
    <div className="layout">
      {/* Left Sidebar */}
      <div className="left-sidebar h-screen">
        <SideMenu />
      </div>

      {/* Main Content */}
      <div className="center-content">
        <Outlet />
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar h-screen">
        <RightMenu />
      </div>
    </div>
  );
};

export default HomeLayout;
