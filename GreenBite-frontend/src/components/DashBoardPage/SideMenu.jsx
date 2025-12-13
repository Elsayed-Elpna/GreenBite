import { NavLink } from "react-router-dom";

const SideMenu = () => {
  return (
    <aside className="sidebar">
      <NavLink to="." end>
        Dashboard
      </NavLink>
      <NavLink to="testoo">Test 1</NavLink>
      <NavLink to="testooo">Test 2</NavLink>
    </aside>
  );
};

export default SideMenu;
