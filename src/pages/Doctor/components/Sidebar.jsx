import React from "react";
import { Link, useNavigate } from "react-router-dom";

const UserCircle = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="10" r="3"></circle>
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
  </svg>
);

const Sidebar = ({ activeTab = "dashboard" }) => {
  const navigate = useNavigate();

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate("/");
    window.location.reload();
  };

  return (
    <aside id="sidebar">
      <div className="sidebar-container">
        <button
          className={`sidebar-btn ${
            activeTab === "dashboard" ? "active-tab" : ""
          }`}
        >
          <img
            src="/img/ChartLineUp.png"
            alt="Dashboard Icon"
            className="sidebar-icon"
          />
          <Link to="/dashboard" className="dashboard-link">
            Dashboard
          </Link>
        </button>
        <button
          className={`sidebar-btn ${
            activeTab === "patients" ? "active-tab" : ""
          }`}
        >
          <img
            src="/img/UsersThree.png"
            alt="Patients Icon"
            className="sidebar-icon"
          />
          <Link to="/patientlists" className="patients-link">
            Patients
          </Link>
        </button>
        <button
          className={`sidebar-btn ${
            activeTab === "profile" ? "active-tab" : ""
          }`}
        >
          <UserCircle size={24} className="sidebar-icon" />
          <Link to="/profile" className="patients-link">
            Profile
          </Link>
        </button>
      </div>
      <button className="sidebar-btn logout" onClick={logout}>
        <img
          src="/img/material-symbols_logout.png"
          alt="Logout Icon"
          className="sidebar-icon"
        />
        <Link to="/" className="logout-link">
          Logout
        </Link>
      </button>
    </aside>
  );
};

export default Sidebar;
