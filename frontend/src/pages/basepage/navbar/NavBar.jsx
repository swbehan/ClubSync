import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink, useLocation } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import "./navbar.css";

const ROLE_VIEWS = ["member", "treasurer", "admin"];

const NAV_PAGES = {
  guest: [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
  ],
  member: [
    { to: "/member/member-dashboard", label: "Dashboard" },
    { to: "/member/dues-status", label: "Dues" },
    { to: "/member/events", label: "Events" },
    { to: "/member/my-rsvps", label: "My RSVPs" },
  ],
  treasurer: [
    { to: "/treasurer/treasurer-dashboard", label: "Dashboard" },
    { to: "/treasurer/group-form", label: "Group Form" },
    { to: "/treasurer/review-dues", label: "Dues Review" },
  ],
  admin: [{ to: "/admin/admin-dashboard", label: "Dashboard" }],
};

export default function NavBar() {
  const { user } = useUser();
  const { pathname } = useLocation();
  const segment = pathname.split("/")[1];
  const view = ROLE_VIEWS.includes(segment) ? segment : "guest";
  const pages = NAV_PAGES[view] ?? NAV_PAGES.guest;

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
                ({`${user.firstName} ${user.lastName}`})
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
