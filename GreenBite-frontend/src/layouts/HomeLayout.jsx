import { Outlet } from "react-router-dom";
import NavBar from "@/components/HomePage/Layout/NavBar";
import MyCarousel from "@/components/HomePage/Layout/MyCarousel";
import Footer from "@/components/HomePage/Layout/Footer";

const HomeLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F4F2] overflow-x-hidden">
      {/* Navbar */}
      <header className="w-full bg-white  sticky top-0 z-50 h-[72px]">
        <NavBar />
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6 items-start">
            {/* Content */}
            <section className="flex-1 min-w-0">
              <Outlet />
            </section>

            {/* Right Menu (Desktop only) */}
            <aside className="hidden xl:block w-[280px] shrink-0">
              <div className="sticky h-[800px]">
                <MyCarousel />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className=" bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default HomeLayout;
