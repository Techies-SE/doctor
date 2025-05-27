import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [isDoctor, setIsDoctor] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    try{
      const endpoint = isDoctor ? "https://backend-pg-cm2b.onrender.com/login/doctors" : "https://backend-pg-cm2b.onrender.com/login/admins";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store authentication data
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);

      // Redirect based on role
      navigate(data.user.role === 'doctor' ? "/dashboard" : "/patient");
    }catch(e){
      setError(e.message || "An error occurred during login");
    }finally{
      setIsLoading(false);
    }
    //navigate(isDoctor ? "/dashboard" : "/patient");
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
      {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          name="staffid"
          placeholder="Staff-ID"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a href="#" className="forgot-password">
          Forgot Password?
        </a>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        
      </form>
    </div>
  );
};

export default Login;
