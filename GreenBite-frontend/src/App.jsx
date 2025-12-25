import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashBoardPage from "./pages/HomePages/DashBoardHome";
import HomeLayout from "./layouts/HomeLayout";
import RegisterPage from "./pages/RegisterPage";
// import PrivateRoute from "./utils/PrivateRoute";
import NotFound from "./pages/NotFound";
import Testoo from "./pages/HomePages/testoo";
import Testooo from "./pages/HomePages/testooo";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <div className="App">
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
