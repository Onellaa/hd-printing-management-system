import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

export const DashboardLayout = () => (
  <div className="app-shell">
    <Sidebar />
    <main className="main-content">
      <Header />
      <Outlet />
    </main>
  </div>
);

