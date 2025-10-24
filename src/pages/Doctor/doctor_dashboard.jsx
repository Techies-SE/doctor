import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/dashboard.css";
import Chart from "chart.js/auto";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faHeartbeat,
  faSyringe,
  faLungs,
} from "@fortawesome/free-solid-svg-icons";
import { useDoctorProfile } from "../../useDoctorProfile";

const Dashboard = () => {
  const { doctorData } = useDoctorProfile();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalLabTests, setTotalLabTests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // State for all dashboard data

  // Fetch all dashboard data
  useEffect(() => {
    let completedRequests = 0;
    const totalRequests = 4;

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
          "https://backend-pg-cm2b.onrender.com/dashboard/doctor-appointments",
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
          "https://backend-pg-cm2b.onrender.com/dashboard/doctor-patients",
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

    const fetchTotalLabTests = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/doctor-review",
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
        setTotalLabTests(countData.total_appointments || 0);
      } catch (err) {
        console.error("Error fetching doctors count:", err);
        setError((prev) => prev || `Error loading doctors: ${err.message}`);
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
          "https://backend-pg-cm2b.onrender.com/dashboard/doctor-recent",
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
        setRecentActivity(activityData.data || []);
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
    fetchTotalLabTests();
    fetchRecentActivity();
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Patient Trends",
            data: [200, 220, 250, 280, 300],
            borderColor: "blue",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

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
            <img
              src={doctorData?.image || "/img/profile.png"}
              alt="Profile"
              id="profile-image"
            />
            <span id="profile-name">
              {doctorData ? `${doctorData.name}` : "Loading..."}
            </span>
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
              className="sidebar-icon"
            />{" "}
            Dashboard
          </button>
          <button className="sidebar-btn">
            <img
              src="/img/UsersThree.png"
              alt="Patients Icon"
              className="sidebar-icon"
            />
            <Link to="/patientlists" className="doctorPanel-link">
              Patient
            </Link>
          </button>
          {/* <button className="sidebar-btn">
            <img
              src="/img/Calendar.png"
              alt="Calendar Icon"
              className="sidebar-icon"
            />
            <Link to="/calendar" className="calendar-link">
              Calendar
            </Link>
          </button> */}
        </div>

        <button className="sidebar-btn logout" onClick={logout}>
          <img
            src="/img/material-symbols_logout.png"
            alt="Logout Icon"
            id="sidebar-icon"
          />
          <Link to="/" className="logout-link">
            Logout
          </Link>
        </button>
      </aside>

      {/* Main Content */}
      <div id="main-content-dashboard">
        {/* Health Overview */}
        <div className="health-overview">
          <div className="health-card total-patients">
            <div className="card-top">
              <span className="label">Total Patients</span>
              <img
                src="/img/user.png"
                alt="Total Patients Icon"
                className="health-icon"
              />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalPatients}</h3>
              </div>
              <div className="info">
                <p>+10% from last month</p>
              </div>
            </div>
          </div>

          <div className="health-card critical-cases">
            <div className="card-top">
              <span className="label">Critical Cases</span>
              <img
                src="/img/Warning.png"
                alt="Critical Cases Icon"
                className="health-icon"
              />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>28</h3>
              </div>
              <div className="info">
                <p>+5% from last month</p>
              </div>
            </div>
          </div>

          <div className="health-card appointments">
            <div className="card-top">
              <span className="label">Appointments</span>
              <img
                src="/img/appointment icon.png"
                alt="Appointments Icon"
                className="health-icon"
              />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalAppointments}</h3>
              </div>
              <div className="info">
                <p>Today</p>
              </div>
            </div>
          </div>

          <div className="health-card lab-results">
            <div className="card-top">
              <span className="label">Lab Results</span>
              <img
                src="/img/Flask.png"
                alt="Lab Results Icon"
                className="health-icon"
              />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalLabTests}</h3>
              </div>
              <div className="info">
                <p>Pending Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="patient-list-card">
          <div className="text-content">
            <div className="patient-header">
              <h3>Recent Lab Tests</h3>
              <div className="patient-controls">
                <input type="text" placeholder="Search Patient..." />
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
                  <th>Patient Name</th>
                  <th>HN-Number</th>
                  <th>Lab Test Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((patient, index) => {
                  console.log("Patient:", patient);
                  return (
                    <tr key={`${patient.lab_test_id}-${index}`}>
                      <td>{patient.patient_name}</td>
                      <td>{patient.hn_number}</td>
                      <td>
                        {new Date(patient.test_date).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          to={`/details/${patient.hn_number}/${patient.lab_test_id}`}
                          className="view-all"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Trends and Common Conditions */}
        {/* <div className="health-trends-container">
        <div className="trends-card">
          <div className="trends-header">
            <h3>Health Trends</h3>
            <select className="month-select">
              <option>Last Month</option>
              <option>This Month</option>
            </select>
          </div>
          <canvas id="healthChart"></canvas>
        </div>

        <div className="conditions-card">
          <div className="conditions-header">
            <h3>Common Conditions</h3>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="condition-items">
            <div className="condition-item">
            <FontAwesomeIcon icon={faHeartbeat} /> Hypertension
              <p>32%</p>
            </div>
            <div className="condition-item">
              <FontAwesomeIcon icon={faSyringe} /> Diabetes
              <p>28%</p>
            </div>
            <div className="condition-item">
            <FontAwesomeIcon icon={faLungs} /> Asthma
              <p>15%</p>
            </div>
          </div>
        </div>
      </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
