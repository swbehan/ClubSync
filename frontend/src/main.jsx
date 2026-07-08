import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import BasePage from "./pages/basepage/BasePage.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
import AboutPage from "./pages/about/AboutPage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import RegisterPage from "./pages/auth/register/RegisterPage.jsx";
import MemberDashboard from "./pages/member/member-dashboard/MemberDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <BasePage>
        <Routes>
          {/* User is not signed in yet (Guest Pages) */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Member Role Pages */}
          <Route
            path="/member/member-dashboard"
            element={<MemberDashboard />}
          />
        </Routes>
      </BasePage>
    </BrowserRouter>
  </StrictMode>
);
