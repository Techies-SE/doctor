import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [isDoctor, setIsDoctor] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    navigate(isDoctor ? "/dashboard" : "/admin-dashboard");
  };

  return (
    <div className="login-container">
      <div className="logo-circle"></div>
      <div className="logo-text">
        <span style={{ color: "#3BA092", fontWeight: "bold" }}>MFU</span>{" "}
        <span style={{ color: "#C0B257" }}>Wellness Center</span>
      </div>

      {/* Toggle Switch */}
      <div className="toggle-container">
        <span className="toggle-text admin-text">Admin</span>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isDoctor}
            onChange={() => setIsDoctor(!isDoctor)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-text doctor-text">Doctor</span>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="staffid"
          placeholder="Staff-ID"
          className="input-field"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input-field"
          required
        />
        <a href="#" className="forgot-password">
          Forgot Password?
        </a>
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
