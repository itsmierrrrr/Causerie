import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
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
      const payload = {
        ...form,
        username: form.username.trim() || undefined,
      };
      const { data } = await api.post("/auth/register", payload);
      login(data);
      navigate("/chat");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="glow-orb orb-a" />
      <div className="glow-orb orb-b" />

      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">Start messaging</p>
        <h1>Create Account</h1>

        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>
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
          Username (optional)
          <input
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="letters, numbers, underscore"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            minLength={6}
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Account"}
        </button>

        <p className="switch-link">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
