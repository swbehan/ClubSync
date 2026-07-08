import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import "./navbar.css";

const NAV_PAGES = {
  guest: [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
  ],
  member: [
    { to: "/member/member-dashboard", label: "Dashboard" },
    // { to: "/dues-status", label: "Dues" },
    // { to: "/events", label: "Events" },
  ],
  // treasurer: [ ... ],
  // admin: [ ... ],
};

export default function NavBar() {
  const { user } = useUser();
  const pages = NAV_PAGES[user?.role ?? "guest"] ?? NAV_PAGES.guest;

  return (
    <Navbar expand="lg" className="top-navbar">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/" className="top-navbar-brand">
          ClubSync
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="top-navbar-nav" />
        <Navbar.Collapse id="top-navbar-nav">
          <Nav className="me-auto">
            {pages.map((page) => (
              <Nav.Link
                as={NavLink}
                to={page.to}
                key={page.to}
                end={page.to === "/"}
              >
                {page.label}
              </Nav.Link>
            ))}
          </Nav>

          {user && (
            <Nav>
              <Nav.Link className="user-profile">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                  alt="Logged In Image"
                  className="image-style"
                />
                ({user.name})
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
