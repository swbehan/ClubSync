import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import BasePage from "./pages/BasePage.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";
//import RegisterPage from "./pages/RegisterPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <BasePage>
        <Routes>
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BasePage>
    </BrowserRouter>
  </StrictMode>
);
