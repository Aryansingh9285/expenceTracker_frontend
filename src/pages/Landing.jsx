import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-logo">FinTrack</div>
        <Link to="/login" className="nav-login-btn">Login</Link>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">Track Your</span>
            <span className="title-line highlight">Expenses</span>
            <span className="title-line">Smartly</span>
          </h1>
          <p className="hero-subtitle">
            Take control of your finances with FinTrack. 
            Visualize spending, track budgets, and achieve your financial goals 
            with beautiful charts and insightful analytics.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="cta-button primary">
              Get Started Free
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">💰</div>
            <div className="card-text">
              <span className="card-label">Total Income</span>
              <span className="card-value">$12,450</span>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">📊</div>
            <div className="card-text">
              <span className="card-label">Expenses</span>
              <span className="card-value">$4,320</span>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">📈</div>
            <div className="card-text">
              <span className="card-label">Savings</span>
              <span className="card-value">$8,130</span>
            </div>
          </div>
          <div className="chart-preview">
            <div className="chart-bar" style={{ "--height": "60%" }}></div>
            <div className="chart-bar" style={{ "--height": "80%" }}></div>
            <div className="chart-bar" style={{ "--height": "45%" }}></div>
            <div className="chart-bar" style={{ "--height": "90%" }}></div>
            <div className="chart-bar" style={{ "--height": "70%" }}></div>
            <div className="chart-bar" style={{ "--height": "55%" }}></div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="features-title">Why Choose FinTrack?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Budget Tracking</h3>
            <p>Set budgets and track your spending to stay on top of your finances.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Visual Analytics</h3>
            <p>Beautiful charts and graphs help you understand your spending patterns.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and stored securely. Only you can access it.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Updates</h3>
            <p>See your expenses update in real-time as you add transactions.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2024 FinTrack. Track your expenses smarter.</p>
      </footer>
    </div>
  );
}

