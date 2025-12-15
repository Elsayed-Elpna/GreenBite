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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} exact />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
          {/* <Route element={<PrivateRoute />}></Route> */}
          <Route path="/home" element={<HomeLayout />}>
            <Route index element={<DashBoardPage />} />
            <Route path="testoo" element={<Testoo />} />
            <Route path="testooo" element={<Testooo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
