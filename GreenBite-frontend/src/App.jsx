import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";

/* ---------------- (NO lazy) ---------------- */
import HomeLayout from "./layouts/HomeLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import SubscriptionRoute from "@/routes/SubscriptionRoute";
import AdminRoute from "@/routes/AdminRoute";
import UserLayout from "./layouts/UserLayout";
import Settings from "./pages/user/Settings";
import ProfileLayout from "@/layouts/ProfileLayout";

/* ---------------- lazy 100% ---------------- */
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const Activate = lazy(() => import("./pages/Activate"));
const ForgotPassword = lazy(() =>
  import("./pages/ForgotPassword/RequestResetEmail")
);
const ResetPassword = lazy(() =>
  import("./pages/ForgotPassword/ResetPassword")
);
const ResetSuccess = lazy(() => import("./pages/ForgotPassword/ResetSuccess"));
const Pricing = lazy(() => import("./pages/Pricing/Pricing"));
const PaymentResult = lazy(() => import("@/pages/payment/PaymentResult"));
const NotFound = lazy(() => import("./pages/NotFound"));

/* ---------------- lazy dashboard ---------------- */
const DashBoardHome = lazy(() => import("./pages/HomePages/DashBoardHome"));
const FoodLog = lazy(() => import("./pages/HomePages/FoodLog/FoodLog"));
const WasteLog = lazy(() => import("./pages/HomePages/WasteLog/WasteLog"));
const GenerateRecipesPage = lazy(() =>
  import("./pages/HomePages/Recipes/GenerateRecipesPage")
);
const MyMealsPage = lazy(() => import("./pages/HomePages/Meals/MyMealsPage"));
const MealPlansListPage = lazy(() =>
  import("./pages/HomePages/MealPlans/MealPlansListPage")
);
const GenerateMealPlanPage = lazy(() =>
  import("./pages/HomePages/MealPlans/MealPlanPage")
);
const MealPlanDetailPage = lazy(() =>
  import("./pages/HomePages/MealPlans/MealPlanDetailPage")
);

/* ---------------- lazy marketplace ---------------- */
const Marketplace = lazy(() => import("./pages/HomePages/Market/MarketPage"));
const CheckoutPage = lazy(() =>
  import("./pages/HomePages/Market/CheckoutPage")
);
const BuyerOrdersPage = lazy(() =>
  import("./pages/HomePages/Market/BuyerOrdersPage")
);
const SellerOrdersPage = lazy(() =>
  import("./pages/HomePages/Market/SellerOrdersPage")
);
const UserInfo = lazy(() => import("@/pages/marketplace/UserInfo"));

/* ---------------- lazy admin ---------------- */
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage"));

/* ---------------- React Query ---------------- */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

/* ---------------- Skeleton ---------------- */
function AppSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex w-52 flex-col gap-4">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    </div>
  );
}

/* ================= APP ================= */
function App() {
  return (
    <div className="App" data-theme="light">
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" reverseOrder={false} />
        <BrowserRouter>
          <Suspense fallback={<AppSkeleton />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
                <Route path="/user" element={<UserLayout />}>
                  <Route path="profile" element={<ProfileLayout />}>
                    <Route index element={<UserInfo />} />

                    <Route element={<SubscriptionRoute />}>
                      <Route path="seller" element={<SellerOrdersPage />} />
                    </Route>

                    <Route path="buyer" element={<BuyerOrdersPage />} />

                    <Route element={<AdminRoute />}>
                      <Route path="reports" element={<ReportsPage />} />
                    </Route>
                  </Route>

                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="/home" element={<HomeLayout />}>
                  <Route index element={<DashBoardHome />} />
                  <Route path="foodlog" element={<FoodLog />} />
                  <Route path="wastelog" element={<WasteLog />} />
                  <Route path="recipes" element={<GenerateRecipesPage />} />
                  <Route path="mymeals" element={<MyMealsPage />} />

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
                    <Route
                      path="orders/seller"
                      element={<SellerOrdersPage />}
                    />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
