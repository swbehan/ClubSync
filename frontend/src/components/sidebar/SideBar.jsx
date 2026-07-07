import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink } from 'react-router'; 
import Offcanvas from "react-bootstrap/Offcanvas";
import "./sidebar.css";
import { useNavigate } from "react-router";
import { useUser } from "../../context/UserContext.jsx";

export default function SideBar() {
  const { user, setUser } = useUser();
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
        <Navbar.Brand className="brand-name" href="/">
          GroupSync
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="sidebar-nav" className="d-lg-none" />

        <Navbar.Offcanvas
          id="sidebar-nav"
          aria-labelledby="sidebar-label"
          placement="start"
          className="h-100"
        >
          <Offcanvas.Header closeButton className="d-lg-none">
            <Offcanvas.Title id="sidebar-label" className="brand-name">
              GroupSync
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className="p-0 w-100">
            <Nav className="flex-column w-100">
              {user ? (
                <>
                  <Nav.Link className="user-welcome">
                    Welcome ({user.name})!
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout} className="nav-item-link">
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link as={NavLink} to="/login" className="nav-item-link">
                  Login
                </Nav.Link>
              )}

              <Nav.Link as={NavLink} to="/about" className="nav-item-link">
                About
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
