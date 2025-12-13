import { Outlet } from "react-router-dom";
import SideMenu from "../components/HomePage/NavMenu/SideMenu";
import "./HomeLayout.css";
const HomeLayout = () => {
  return (
    <div className="w-screen min-h-screen grid grid-cols-[1fr_3fr_1fr]">
      {/* Left Sidebar */}
      <div className="col-start-1 col-end-2">
        <SideMenu />
      </div>

      {/* Main Content */}
      <div className="col-start-2 col-end-3">
        <Outlet />
      </div>

      {/* Right Sidebar */}
      <div className="col-start-3 col-end-4">
        <SideMenu />
      </div>
    </div>
  );
};

export default HomeLayout;
