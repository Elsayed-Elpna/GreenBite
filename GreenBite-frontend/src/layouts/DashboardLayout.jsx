import { Outlet } from "react-router-dom";
import SideMenu from "../components/DashBoardPage/SideMenu";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <SideMenu className="sidebar m-auto" />
      <p className="text-red">Dashboard</p>
      <main className="dashboard-content">
        <Outlet />
        <SideMenu className="sidebar m-auto" />
      </main>
    </div>
  );
};

export default DashboardLayout;
