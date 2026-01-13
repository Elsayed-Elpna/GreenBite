import { motion as Motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  User,
  ShieldUser,
  Store,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

function Sidebar({ isSubscribed, isAdmin }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/user/profile",
    },

    {
      id: "orders",
      label: "My Orders",
      icon: ShoppingBag,
      path: "/user/profile/buyer",
    },

    ...(isSubscribed
      ? [
          {
            id: "Incoming-Orders",
            label: "Incoming Orders",
            icon: Store,
            path: "/user/profile/seller",
          },
        ]
      : []),

    ...(isAdmin
      ? [
          {
            id: "reports",
            label: "Reports",
            icon: ShieldUser,
            path: "/user/profile/reports",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ================= Mobile Arrow ================= */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50
                   bg-[#7eb685] text-white p-2 rounded-r-xl shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ================= Mobile Overlay ================= */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* ================= Mobile Sidebar ================= */}
      <Motion.aside
        initial={{ x: -260 }}
        animate={{ x: mobileOpen ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="lg:hidden fixed z-50 top-0 left-0 h-screen w-64
                   bg-white shadow-xl"
      >
        <SidebarContent
          menuItems={menuItems}
          expanded
          onNavigate={() => setMobileOpen(false)}
        />
      </Motion.aside>

      {/* ================= Desktop Sidebar (زي ما هو) ================= */}
      <Motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-white shadow-xl"
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <SidebarContent menuItems={menuItems} expanded={!collapsed} />
      </Motion.aside>
    </>
  );
}

/* ================= Sidebar Content ================= */
function SidebarContent({ menuItems, expanded, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.id} to={item.path} end onClick={onNavigate}>
              {({ isActive }) => (
                <Motion.div
                  whileHover={{ x: 4 }}
                  className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#7eb685] to-[#6aa571] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  {expanded && (
                    <Motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm"
                    >
                      {item.label}
                    </Motion.span>
                  )}

                  {isActive && (
                    <Motion.div
                      layoutId="active-pill"
                      className="absolute right-2 w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </Motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
