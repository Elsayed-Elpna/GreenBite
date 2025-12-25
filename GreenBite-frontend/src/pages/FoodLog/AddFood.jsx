import AppNavbar from "@/components/LandingPage/Navbar";
import AdvertisementPanel from "@/components/FoodLog/AdvertisementPanel";
import FoodLogForm from "@/components/FoodLog/FoodLogForm";

export default function AddFood() {
  return (
    <div className="bg-white px-7">
      <AppNavbar />
      <AdvertisementPanel />
      <FoodLogForm />
    </div>
  );
}
