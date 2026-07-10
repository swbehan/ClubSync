import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import ProtectedRoute from "./pages/auth/ProtectedRoute.jsx";
import BasePage from "./pages/basepage/BasePage.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
import AboutPage from "./pages/about/AboutPage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import RegisterPage from "./pages/auth/register/RegisterPage.jsx";
import MemberDashboard from "./pages/member/member-dashboard/MemberDashboard.jsx";
import GroupForm from "./pages/treasurer/group-form/GroupForm.jsx";
import TreasurerDashboard from "./pages/treasurer/treasurer-dashboard/TreasurerDashboard.jsx";
import AdminDashboard from "./pages/admin/admindashboard/AdminDashboard.jsx";
import EventList from "./pages/events/event-list/EventList.jsx";

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
          <Route element={<ProtectedRoute />}>
            <Route
              path="/member/member-dashboard"
              element={<MemberDashboard />}
            />
            <Route path="/events" element={<EventList />} />
          </Route>

          {/* Treasurer Role Pages */}
          <Route element={<ProtectedRoute allow={["treasurer", "admin"]} />}>
            <Route
              path="/treasurer/treasurer-dashboard"
              element={<TreasurerDashboard />}
            />
            <Route path="/treasurer/group-form" element={<GroupForm />} />
          </Route>

          {/* Admin Role Pages */}
          <Route element={<ProtectedRoute allow={["admin"]} />}>
            <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BasePage>
    </BrowserRouter>
  </StrictMode>
);
