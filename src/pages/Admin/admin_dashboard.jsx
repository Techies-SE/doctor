import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/doctorDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faCalendarAlt,
  faUserMd,
  faFileMedical,
  faHospital,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let completedRequests = 0;
    const totalRequests = 5;

    const checkAllComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        setLoading(false); // ✅ Set loading to false when all requests complete
      }
    };

    const fetchTotalAppointments = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/active-appointments",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!countResponse.ok) {
          throw new Error(
            `HTTP ${countResponse.status}: ${countResponse.statusText}`
          );
        }

        const countData = await countResponse.json();
        setTotalAppointments(countData.total_appointments || 0);
      } catch (err) {
        console.error("Error fetching appointments count:", err);
        setError(
          (prev) => prev || `Error loading appointments: ${err.message}`
        );
      } finally {
        checkAllComplete();
      }
    };

    const fetchTotalPatients = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/active-patients",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!countResponse.ok) {
          throw new Error(
            `HTTP ${countResponse.status}: ${countResponse.statusText}`
          );
        }

        const countData = await countResponse.json();
        setTotalPatients(countData.active_patients || 0);
      } catch (err) {
        console.error("Error fetching patients count:", err);
        setError((prev) => prev || `Error loading patients: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    const fetchTotalDoctors = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/active-doctors",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!countResponse.ok) {
          throw new Error(
            `HTTP ${countResponse.status}: ${countResponse.statusText}`
          );
        }

        const countData = await countResponse.json();
        setTotalDoctors(countData.total_doctors || 0);
      } catch (err) {
        console.error("Error fetching doctors count:", err);
        setError((prev) => prev || `Error loading doctors: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    const fetchTotalDepartments = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/active-departments",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!countResponse.ok) {
          throw new Error(
            `HTTP ${countResponse.status}: ${countResponse.statusText}`
          );
        }

        const countData = await countResponse.json();
        setTotalDepartments(countData.total_departments || 0);
      } catch (err) {
        console.error("Error fetching departments count:", err);
        setError((prev) => prev || `Error loading departments: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    const fetchRecentActivity = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const activityResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/activity",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!activityResponse.ok) {
          throw new Error(
            `HTTP ${activityResponse.status}: ${activityResponse.statusText}`
          );
        }

        const activityData = await activityResponse.json();
        setRecentActivity(activityData || []);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        setError((prev) => prev || `Error loading activity: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    // Start all fetch operations
    fetchTotalAppointments();
    fetchTotalPatients();
    fetchTotalDoctors();
    fetchTotalDepartments();
    fetchRecentActivity();
  }, []);
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
  // Helper function to format the timestamp
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    // For older dates, show the actual date
    return created.toLocaleDateString();
  };
  const getRouteForActivityType = (type) => {
    switch (type.toLowerCase()) {
      case "department":
        return "/departments";
      case "patient":
        return "/patient";
      case "appointment":
        return "/appointments";
      case "doctor":
        return "/doctors";
      default:
        return "/admindashboard"; // fallback to dashboard
    }
  };
  if (loading) {
    return (
      <div>
        {/* Navbar */}
        <nav id="navbar">
          <div id="navbar-left">
            <div id="logo-circle"></div>
            <span id="mfu-text">MFU </span>
            <span id="wellness-text">Wellness Center</span>
          </div>
          <div id="navbar-right">
            <button id="notification-btn">
              <FontAwesomeIcon icon={faBell} id="icon" />
            </button>
            <div id="profile">
              <img src="/img/profile.png" alt="Profile" id="profile-image" />
              <span id="profile-name">Admin</span>
            </div>
          </div>
        </nav>
        {/* Sidebar */}
        <aside id="sidebar">
          <div className="sidebar-container">
            <button className="sidebar-btn active-tab">
              <img
                src="/img/ChartLineUp.png"
                alt="Dashboard Icon"
                id="sidebar-icon"
              />
              <Link to="/admindashboard" className="sidebar-link">
                Dashboard
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faUser} id="sidebar-icon" />
              <Link to="/patient" className="sidebar-link">
                Patients
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faCalendarAlt} id="sidebar-icon" />
              <Link to="/appointments" className="sidebar-link">
                Appointments
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faUserMd} id="sidebar-icon" />
              <Link to="/doctors" className="sidebar-link">
                Doctors
              </Link>
            </button>

            {/* <button className="sidebar-btn">
              <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
              <Link to="/recommendations" className="sidebar-link">
                Recommendations
              </Link>
            </button> */}

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
              <Link to="/departments" className="sidebar-link">
                Departments
              </Link>
            </button>

            {/* <button className="sidebar-btn">
              <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
              <Link to="/schedules" className="sidebar-link">
                Schedules
              </Link>
            </button> */}
          </div>

          <button className="sidebar-btn logout" onClick={logout}>
            <img
              src="/img/material-symbols_logout.png"
              alt="Logout Icon"
              id="sidebar-icon"
            />
            <span className="login-link">Logout</span>
          </button>
        </aside>
        <div id="main-content">
          <div className="content-area">
            <div className="w-full h-screen p-8 bg-white">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {/* Navbar */}
        <nav id="navbar">
          <div id="navbar-left">
            <div id="logo-circle"></div>
            <span id="mfu-text">MFU </span>
            <span id="wellness-text">Wellness Center</span>
          </div>
          <div id="navbar-right">
            <button id="notification-btn">
              <FontAwesomeIcon icon={faBell} id="icon" />
            </button>
            <div id="profile">
              <img src="/img/profile.png" alt="Profile" id="profile-image" />
              <span id="profile-name">Admin</span>
            </div>
          </div>
        </nav>
        {/* Sidebar */}
        <aside id="sidebar">
          <div className="sidebar-container">
            <button className="sidebar-btn active-tab">
              <img
                src="/img/ChartLineUp.png"
                alt="Dashboard Icon"
                id="sidebar-icon"
              />
              <Link to="/admindashboard" className="sidebar-link">
                Dashboard
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faUser} id="sidebar-icon" />
              <Link to="/patient" className="sidebar-link">
                Patients
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faCalendarAlt} id="sidebar-icon" />
              <Link to="/appointments" className="sidebar-link">
                Appointments
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faUserMd} id="sidebar-icon" />
              <Link to="/doctors" className="sidebar-link">
                Doctors
              </Link>
            </button>

            {/* <button className="sidebar-btn">
              <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
              <Link to="/recommendations" className="sidebar-link">
                Recommendations
              </Link>
            </button> */}

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
              <Link to="/departments" className="sidebar-link">
                Departments
              </Link>
            </button>

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
              <Link to="/schedules" className="sidebar-link">
                Schedules
              </Link>
            </button>
          </div>

          <button className="sidebar-btn logout" onClick={logout}>
            <img
              src="/img/material-symbols_logout.png"
              alt="Logout Icon"
              id="sidebar-icon"
            />
            <span className="login-link">Logout</span>
          </button>
        </aside>
        <div id="main-content">
          <div className="content-area">
            <div className="w-full h-screen p-8 bg-white text-red-500">
              Error: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* Navbar */}
      <nav id="navbar">
        <div id="navbar-left">
          <div id="logo-circle"></div>
          <span id="mfu-text">MFU </span>
          <span id="wellness-text">Wellness Center</span>
        </div>
        <div id="navbar-right">
          <button id="notification-btn">
            <FontAwesomeIcon icon={faBell} id="icon" />
          </button>
          <div id="profile">
            <img src="/img/profile.png" alt="Profile" id="profile-image" />
            <span id="profile-name">Admin</span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside id="sidebar">
        <div className="sidebar-container">
          <button className="sidebar-btn active-tab">
            <img
              src="/img/ChartLineUp.png"
              alt="Dashboard Icon"
              id="sidebar-icon"
            />
            Dashboard
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faUser} id="sidebar-icon" />
            <Link to="/patient" className="sidebar-link">
              Patients
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarAlt} id="sidebar-icon" />
            <Link to="/appointments" className="sidebar-link">
              Appointments
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faUserMd} id="sidebar-icon" />
            <Link to="/doctors" className="sidebar-link">
              Doctors
            </Link>
          </button>

          {/* <button className="sidebar-btn">
            <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
            <Link to="/recommendations" className="sidebar-link">
              Recommendations
            </Link>
          </button> */}

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
            <Link to="/departments" className="sidebar-link">
              Departments
            </Link>
          </button>

          {/* <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
            <Link to="/schedules" className="sidebar-link">
              Schedules
            </Link>
          </button> */}
        </div>

        <button className="sidebar-btn logout" onClick={logout}>
          <img
            src="/img/material-symbols_logout.png"
            alt="Logout Icon"
            id="sidebar-icon"
          />
          <span className="login-link">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div id="main-content-dashboard">
        {/* Health Overview */}
        <div className="health-overview">
          <div className="health-card total-patients">
            <div className="card-top">
              <span className="label">Total Patients</span>
              <FontAwesomeIcon icon={faUser} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalPatients}</h3>
              </div>
              <div className="info">
                <p>+12% from last month</p>
              </div>
            </div>
          </div>

          <div className="health-card critical-cases">
            <div className="card-top">
              <span className="label">Active Appointments</span>
              <FontAwesomeIcon icon={faCalendarAlt} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalAppointments}</h3>
              </div>
              <div className="info">
                <p>This week</p>
              </div>
            </div>
          </div>

          <div className="health-card appointments">
            <div className="card-top">
              <span className="label">Doctors</span>
              <FontAwesomeIcon icon={faUserMd} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalDoctors}</h3>
              </div>
              <div className="info">
                <p>Active</p>
              </div>
            </div>
          </div>

          <div className="health-card lab-results">
            <div className="card-top">
              <span className="label">Departments</span>
              <FontAwesomeIcon icon={faHospital} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalDepartments}</h3>
              </div>
              <div className="info">
                <p>Specialties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="patient-list-card">
          <div className="text-content">
            <div className="patient-header">
              <h3>Recent Activity</h3>
              <div className="patient-controls">
                <input type="text" placeholder="Search..." />
                <button className="filter-btn">
                  <img
                    src="/img/Funnel.png"
                    alt="Filter Icon"
                    className="filter-icon"
                  />{" "}
                  Filter
                </button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.type}</td>
                      <td>{activity.description}</td>
                      <td>{activity.user_name}</td>
                      <td>{formatTimeAgo(activity.created_at)}</td>
                      <td>
                        <Link
                          to={getRouteForActivityType(activity.type)}
                          className="view-all"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {loading
                        ? "Loading activities..."
                        : "No recent activity found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Stats and Quick Actions */}
        <div className="health-trends-container">
          <div className="trends-card">
            <div className="trends-header">
              <h3>System Statistics</h3>
              <select className="month-select">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <canvas id="healthChart"></canvas>
          </div>

          <div className="conditions-card">
            <div className="conditions-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="condition-items">
              <Link
                to="/admin/patients/add"
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faUser} /> Add New Patient
              </Link>
              <Link
                to="/admin/appointments/create"
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faCalendarAlt} /> Create Appointment
              </Link>
              <Link
                to="/admin/doctors/add"
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faUserMd} /> Add New Doctor
              </Link>
              <Link
                to="/admin/schedules/create"
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faCalendarDay} /> Create Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
