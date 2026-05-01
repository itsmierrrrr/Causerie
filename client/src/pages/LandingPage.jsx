import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";

const LandingPage = () => {
  return (
    <div className="landing-shell">
      <div className="landing-bg landing-bg-a" />
      <div className="landing-bg landing-bg-b" />

      <header className="landing-nav animate-in animate-delay-1">
        <div className="brand-mark">Causerie</div>
        <div className="nav-actions">
          <Link className="nav-link" to="/login">
            Sign In
          </Link>
          <Link className="nav-cta" to="/register">
            Get Started
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero-panel">
          <div className="landing-hero animate-in animate-delay-2">
            <p className="eyebrow">Realtime private messaging</p>
            <h1>Chat with people instantly through a clean, simple interface.</h1>
            <p className="landing-copy">
              Create your account, claim a unique username, search for others, and start a direct
              conversation with realtime message updates.
            </p>
            <div className="landing-actions">
              <Link className="hero-button primary" to="/register">
                Create Account
              </Link>
              <Link className="hero-button secondary" to="/login">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="hero-visual animate-in animate-delay-3">
            <div className="hero-image-frame float-slow">
              <img src={heroImage} alt="Layered chat platform illustration" />
            </div>
            <div className="hero-stats">
              <div className="stat-card float-gentle">
                <strong>Realtime</strong>
                <span>Socket.IO delivery</span>
              </div>
              <div className="stat-card float-gentle float-delay-1">
                <strong>Unique</strong>
                <span>Editable usernames</span>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card feature-image-card animate-in animate-delay-4">
            <img src="/chat-wave.svg" alt="Messaging bubbles illustration" />
            <div>
              <span>01</span>
              <h2>Realtime chat</h2>
              <p>Messages update instantly through Socket.IO without needing to refresh the page.</p>
            </div>
          </article>
          <article className="feature-card feature-image-card animate-in animate-delay-5">
            <img src="/user-card.svg" alt="User profile illustration" />
            <div>
              <span>02</span>
              <h2>Unique usernames</h2>
              <p>Each account gets a unique handle that can be updated later without duplication.</p>
            </div>
          </article>
          <article className="feature-card animate-in animate-delay-6">
            <img src="/search-connect.svg" alt="Search and connect illustration" />
            <span>03</span>
            <h2>Search & connect</h2>
            <p>Find users by username or name and begin a private 1:1 conversation quickly.</p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
