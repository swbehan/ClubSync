import Nav from "react-bootstrap/Nav";
import { Link, useLocation } from "react-router";

export default function SidebarNavItem({ page }) {
  const { pathname } = useLocation();

  const isActive = page.role
    ? pathname.split("/")[1] === page.role
    : pathname === page.to;

  return (
    <div>
      <Nav.Link
        as={Link}
        to={page.to}
        className={`nav-item-link ${isActive ? "active" : ""}`}
      >
        {page.imageSrc && (
          <img src={page.imageSrc} alt={page.alt} className="image-style" />
        )}
        {page.label}
      </Nav.Link>

      {page.children &&
        page.children.map((child) => (
          <SidebarNavItem key={child.to} page={child} />
        ))}
    </div>
  );
}
