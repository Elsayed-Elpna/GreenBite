import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashBoardPage from "./pages/HomePages/DashBoardHome";
import HomeLayout from "./layouts/HomeLayout";
// import PrivateRoute from "./utils/PrivateRoute";

import Testoo from "./pages/HomePages/testoo";
import Testooo from "./pages/HomePages/testooo";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} exact />
          <Route path="/login" element={<LoginPage />} />
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
