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
// import PrivateRoute from "./utils/PrivateRoute";
import NotFound from "./pages/NotFound";
import FoodLog from "./pages/HomePages/FoodLog/FoodLog";
import FoodLogEdit from "./pages/HomePages/FoodLog/FoodLogEdit";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Activate from "./pages/Activate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5,
    },
  },
});

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} exact />
            <Route path="*" element={<NotFound />} />
            <Route path="/verify" element={<EmailVerification />} />
            <Route path="/activate/:uid/:token" element={<Activate />} />
            {/* public routes user cant access after login */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            {/* ProtectedRoute user can access after login  */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomeLayout />}>
                {/* /home */}
                <Route index element={<DashBoardPage />} />

                {/* /home/foodlog */}
                <Route path="foodlog">
                  <Route index element={<FoodLog />} />
                  <Route path="edit" element={<FoodLogEdit />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
