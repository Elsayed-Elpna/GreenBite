import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/HomePage/Layout/NavBar";
import Footer from "@/components/HomePage/Layout/Footer";

function UserLayout() {
  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <header className="w-full bg-white  sticky top-0 z-50 h-[72px]">
        <NavBar />
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto w-full ">
          <div className="flex gap-6 items-start">
            {/* Content */}
            <section className="flex-1 min-w-0">
              <Outlet />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className=" bg-white">
        <Footer />
      </footer>
    </div>
  );
}

export default UserLayout;
