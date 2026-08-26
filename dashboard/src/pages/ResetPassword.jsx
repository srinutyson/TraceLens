import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../api.js";

const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-base)"
};

const wordmarkStyle = {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "27px",
    fontWeight: 600,
    letterSpacing: "-0.02em"
};

const cardStyle = {
    background: "var(--bg-surface-2)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "24px",
    width: "360px"
};

const labelStyle = {
    color: "var(--text-secondary)",
    fontSize: "13px",
    display: "block",
    marginBottom: "4px"
};

const inputStyle = {
    background: "var(--bg-base)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box"
};

const buttonStyle = {
    background: "var(--accent)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "var(--bg-base)",
    fontSize: "13px",
    padding: "8px 12px",
    width: "100%",
    cursor: "pointer",
    marginTop: "8px"
};

const linkButtonStyle = {
    background: "transparent",
    border: "none",
    color: "var(--accent)",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0,
    marginTop: "16px"
};

export function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromForgot = location?.state?.email;
    const emailIsLocked = Boolean(emailFromForgot);

    const [email, setEmail] = useState(emailFromForgot || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Reset failed");
                return;
            }

            navigate("/login", { state: { email } });

        } catch (error) {
            console.error(error);
            setError("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyle}>
            <h1 style={wordmarkStyle}>
                <span style={{ color: "var(--text-primary)" }}>Trace</span>
                <span style={{ color: "var(--accent)" }}>Lens</span>
            </h1>
            <div style={cardStyle}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 500, marginTop: 0 }}>
                    Reset your password
                </h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "14px" }}>
                        <label htmlFor="email" style={labelStyle}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="email"
                            disabled={emailIsLocked}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                        <label htmlFor="otp" style={labelStyle}>Reset code</label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(event) => setOtp(event.target.value)}
                            placeholder="6-digit code"
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                        <label htmlFor="newPassword" style={labelStyle}>New password</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="new password"
                            minLength={8}
                            required
                            style={inputStyle}
                        />
                    </div>
                    {error && (
                        <p style={{ color: "var(--span-error)", fontSize: "13px" }}>{error}</p>
                    )}
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? "Resetting..." : "Reset password"}
                    </button>
                </form>
                <button type="button" style={linkButtonStyle} onClick={() => navigate("/login")}>
                    Back to login
                </button>
            </div>
        </div>
    );
}