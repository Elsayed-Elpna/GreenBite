import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashBoardPage from "./pages/HomePages/DashBoardHome";
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

import UserLayout from "./layouts/UserLayout";
import Settings from "./pages/user/Settings";

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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} exact />
            <Route path="/verify" element={<EmailVerification />} />
            <Route path="/activate/:uid/:token" element={<Activate />} />
            {/* public routes user cant access after login */}
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
            {/* ProtectedRoute user can access after login  */}
            <Route element={<ProtectedRoute />}>
              {/* /User */}
              <Route path="/user" element={<UserLayout />}>
                <Route path="settings" element={<Settings />} />
              </Route>
              {/* --------------------------------------- */}
              <Route path="/home" element={<HomeLayout />}>
                {/* /home */}
                <Route index element={<MyMealsPage />} />

                {/* /home/foodlog */}
                <Route path="foodlog">
                  <Route index element={<FoodLog />} />
                </Route>
                {/* /home/wastelog */}
                <Route path="wastelog">
                  <Route index element={<WasteLog />} />
                </Route>

                <Route path="recipes">
                  <Route index element={<GenerateRecipesPage />} />
                </Route>
                <Route path="mymeals">
                  <Route index element={<MyMealsPage />} />
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
