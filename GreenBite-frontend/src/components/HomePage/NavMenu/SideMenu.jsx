import { NavLink } from "react-router-dom";
import "./SideMenu.css";
const SideMenu = () => {
  return (
    <aside className="sidebar" id="sidebar">
      <NavLink to="." end>
        Dashboard
      </NavLink>
      <NavLink to="testoo">test</NavLink>
      <NavLink to="testooo">Test 2</NavLink>
    </aside>
  );
};

export default SideMenu;
