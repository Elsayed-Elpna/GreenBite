import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashBoardPage from "./pages/DashBoardPages/DashBoardHome";
import DashboardLayout from "./layouts/DashboardLayout";
// import PrivateRoute from "./utils/PrivateRoute";

import Testoo from "./pages/DashBoardPages/testoo";
import Testooo from "./pages/DashBoardPages/testooo";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} exact />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route element={<PrivateRoute />}></Route> */}
          <Route path="/dashboard" element={<DashboardLayout />}>
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
