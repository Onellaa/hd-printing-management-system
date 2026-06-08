import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "DB" },
  { to: "/customers", label: "Customers", icon: "CU" },
  { to: "/items", label: "Items", icon: "IT" },
  { to: "/invoices", label: "Invoices", icon: "IN" },
  { to: "/purchase-orders", label: "Purchase Orders", icon: "PO" },
  { to: "/payments-cheques", label: "Cheques & Payments", icon: "CP" },
  { to: "/reports", label: "Reports", icon: "RP" },
  { to: "/settings", label: "Settings", icon: "ST" },
];

export const Sidebar = () => (
  <aside className="sidebar">
    <div className="brand-block">
      <div className="brand-mark">
        <span className="brand-mark-accent">H</span>
        <span>D</span>
      </div>
      <div>
        <p className="sidebar-eyebrow">HD Printing & Packaging</p>
        <h1>PVT LTD</h1>
      </div>
    </div>

    <nav className="sidebar-nav">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>

    <div className="sidebar-help-card">
      <p className="sidebar-help-title">Need Help?</p>
      <p className="sidebar-help-text">
        Our support team is here to help with invoicing and operations.
      </p>
      <button className="help-button">Contact Support</button>
    </div>
  </aside>
);
