import { Outlet } from "react-router-dom";
import SideMenu from "../components/HomePage/NavMenu/SideMenu";
import "./HomeLayout.css";
const HomeLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-100">
      {/* Left Sidebar */}
      <aside className="hidden lg:block col-span-2 bg-gray-200 p-4">
        <SideMenu />
      </aside>

      {/* Main Content */}
      <main className="col-span-12 lg:col-span-8 bg-white p-6">
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block col-span-2 bg-gray-200 p-4">
        <SideMenu />
      </aside>
    </div>
  );
};

export default HomeLayout;
