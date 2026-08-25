import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "16px 20px", boxSizing: "border-box", minWidth: 0 }}>
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;