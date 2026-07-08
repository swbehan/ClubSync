import Nav from "react-bootstrap/Nav";
import { NavLink } from "react-router";

export default function SidebarNavItem({ page }) {
  return (
    <div>
      <Nav.Link as={NavLink} to={page.to} className="nav-item-link">
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
