import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Something went wrong");
                return;
            }

            setMessage(data.message);
            setTimeout(() => {
                navigate("/reset-password", { state: { email } });
            }, 1500);

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
                    Forgot your password?
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                    Enter your email and we'll send you a reset code.
                </p>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "14px" }}>
                        <label htmlFor="email" style={labelStyle}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="email"
                            required
                            style={inputStyle}
                        />
                    </div>
                    {error && (
                        <p style={{ color: "var(--span-error)", fontSize: "13px" }}>{error}</p>
                    )}
                    {message && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{message}</p>
                    )}
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? "Sending..." : "Send reset code"}
                    </button>
                </form>
                <button type="button" style={linkButtonStyle} onClick={() => navigate("/login")}>
                    Back to login
                </button>
            </div>
        </div>
    );
}