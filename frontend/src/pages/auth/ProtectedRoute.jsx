import { Navigate, Outlet } from "react-router";
import { useUser } from "../../context/UserContext.jsx";

export default function ProtectedRoute({ allow }) {
  const { user, loading } = useUser();

  // checking session
  if (loading) return null;
  // user is logged out
  if (!user) return <Navigate to="/login" replace />;
  // logged in, wrong role
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />; 
}
