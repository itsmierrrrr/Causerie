import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/chat");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="glow-orb orb-a" />
      <div className="glow-orb orb-b" />

      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign In</h1>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing In..." : "Sign In"}
        </button>

        <p className="switch-link">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
