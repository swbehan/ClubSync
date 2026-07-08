import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import SidebarNavItem from "./SidebarNavItem.jsx";
import "./sidebar.css";
import { useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import { ROLE_ACCESS } from "./roleTabs.js";

export default function SideBar() {
  const { user, setUser } = useUser();
  const pages = ROLE_ACCESS[user?.role ?? "guest"] ?? ROLE_ACCESS.guest;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }

    setUser(null);
    navigate("/");
  };

  return (
    <Navbar
      expand="lg"
      className="nav-bar-outer-container position-fixed top-0 start-0 bottom-0 flex-column align-items-start"
    >
      <Container className="flex-column align-items-start h-100 p-0">
        <Navbar.Toggle aria-controls="sidebar-nav" className="d-lg-none" />

        <Navbar.Offcanvas
          id="sidebar-nav"
          aria-labelledby="sidebar-label"
          placement="start"
          className="h-100"
        >
          <Offcanvas.Body className="p-0 w-100">
            <Nav className="flex-column w-100">
              {pages.map((page) => (
                <SidebarNavItem key={page.to} page={page} />
              ))}

              {user && (
                <Nav.Link
                  onClick={handleLogout}
                  className="nav-item-link log-out"
                >
                  <hr />
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/320/320140.png"
                    alt="Logout image"
                    className="image-style"
                  />
                  Logout
                </Nav.Link>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
