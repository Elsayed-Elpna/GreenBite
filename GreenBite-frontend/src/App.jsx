import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashBoardHome from "./pages/HomePages/DashBoardHome";
import HomeLayout from "./layouts/HomeLayout";
import RegisterPage from "./pages/RegisterPage";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword/RequestResetEmail";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import ResetSuccess from "./pages/ForgotPassword/ResetSuccess";
import NotFound from "./pages/NotFound";
import FoodLog from "./pages/HomePages/FoodLog/FoodLog";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Activate from "./pages/Activate";
import WasteLog from "./pages/HomePages/WasteLog/WasteLog";
import GenerateRecipesPage from "./pages/HomePages/Recipes/GenerateRecipesPage";
import MyMealsPage from "./pages/HomePages/Meals/MyMealsPage";
import SubscriptionRoute from "@/routes/SubscriptionRoute";
import AdminRoute from "@/routes/AdminRoute";
import UserLayout from "./layouts/UserLayout";
import Settings from "./pages/user/Settings";
import MealPlansListPage from "./pages/HomePages/MealPlans/MealPlansListPage";
import GenerateMealPlanPage from "./pages/HomePages/MealPlans/MealPlanPage";
import MealPlanDetailPage from "./pages/HomePages/MealPlans/MealPlanDetailPage";
import Pricing from "./pages/Pricing/Pricing";
import PaymentResult from "@/pages/payment/PaymentResult";
import Marketplace from "./pages/HomePages/Market/MarketPage";
import CheckoutPage from "./pages/HomePages/Market/CheckoutPage";
import BuyerOrdersPage from "./pages/HomePages/Market/BuyerOrdersPage";
import SellerOrdersPage from "./pages/HomePages/Market/SellerOrdersPage";
import ReportsPage from "./pages/reports/ReportsPage";
import { Toaster } from "react-hot-toast";
import ProfileLayout from "@/layouts/ProfileLayout";
import UserInfo from "@/pages/marketplace/UserInfo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <div className="App" data-theme="light">
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="top-center" reverseOrder={false} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} exact />
            <Route path="/verify" element={<EmailVerification />} />
            <Route path="/activate/:uid/:token" element={<Activate />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-success" element={<ResetSuccess />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/password/reset/confirm/:uid/:token"
                element={<ResetPassword />}
              />
            </Route>

            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/result" element={<PaymentResult />} />

            <Route element={<ProtectedRoute />}>
              {/* /User */}
              <Route path="/user" element={<UserLayout />}>
                {/* /User/Profile */}
                <Route path="profile" element={<ProfileLayout />}>
                  <Route index element={<UserInfo />} />
                  {/* SubscriptionRoute*/}
                  <Route element={<SubscriptionRoute />}>
                    <Route path="seller" element={<SellerOrdersPage />} />
                  </Route>
                  <Route path="buyer" element={<BuyerOrdersPage />} />
                  {/* AdminRoute*/}
                  <Route element={<AdminRoute />}>
                    <Route path="reports">
                      <Route index element={<ReportsPage />} />
                    </Route>
                  </Route>
                </Route>
                {/* /User/settings */}
                <Route path="settings" element={<Settings />} />
              </Route>
              {/* --------------------------------------- */}
              <Route path="/home" element={<HomeLayout />}>
                {/* /home */}
                <Route index element={<DashBoardHome />} />

                {/* /home/foodlog */}
                <Route path="foodlog">
                  <Route index element={<FoodLog />} />
                </Route>

                <Route path="wastelog">
                  <Route index element={<WasteLog />} />
                </Route>

                <Route path="recipes">
                  <Route index element={<GenerateRecipesPage />} />
                </Route>
                <Route path="mymeals">
                  <Route index element={<MyMealsPage />} />
                </Route>

                <Route path="mealplans">
                  <Route index element={<MealPlansListPage />} />
                  <Route path="generate" element={<GenerateMealPlanPage />} />
                  <Route path=":id" element={<MealPlanDetailPage />} />
                </Route>

                <Route path="marketplace">
                  <Route index element={<Marketplace />} />
                  <Route
                    path="checkout/:listingId"
                    element={<CheckoutPage />}
                  />
                  <Route path="orders/buyer" element={<BuyerOrdersPage />} />
                  <Route path="orders/seller" element={<SellerOrdersPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
