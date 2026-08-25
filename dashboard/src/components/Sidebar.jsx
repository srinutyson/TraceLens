import { NavLink, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
function Sidebar() {
    const { projectId } = useParams();

    const tracesTo = projectId ? `/projects/${projectId}/traces` : "/projects";
    const evaluationsTo = projectId ? `/projects/${projectId}/evaluations` : "/projects";
    const keysTo = projectId ? `/projects/${projectId}/keys` : "/projects";

    const navItemStyle = ({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "var(--radius)",
        fontSize: "13px",
        textDecoration: "none",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        background: isActive ? "var(--bg-surface-2)" : "transparent"
    });

    return (
        <div style={{
            width: "var(--sidebar-width)",
            flexShrink: 0,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border)",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            minHeight: "100vh",
            boxSizing: "border-box"
        }}>
            <Link  to = "/projects" style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "24px",
                padding: "0 4px",
                textDecoration : "none",
                cursor : "pointer"
            }}>
                <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>
                    TraceLens
                </span>
            </Link>

            <NavLink to={tracesTo} style={navItemStyle}>
                Traces
            </NavLink>
            <NavLink to={evaluationsTo} style={navItemStyle}>
                Evaluations
            </NavLink>
            <NavLink to={keysTo} style={navItemStyle}>
                API Keys
            </NavLink>
        </div>
    );
}

export default Sidebar;