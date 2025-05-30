import React, { useEffect } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  useEffect(() => {
    const ctx = document.getElementById("healthChart").getContext("2d");

    // Create chart instance
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
    });

    // Cleanup function to destroy chart instance when the component is unmounted
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
    navigate('/');
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
              src="/img/profile.png"
              alt="Profile"
              id="profile-image"
            />
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

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
            <Link to="/schedules" className="sidebar-link">
              Schedules
            </Link>
          </button>
        </div>

        <button className="sidebar-btn logout" onClick={logout}>
          <img src="/img/material-symbols_logout.png" alt="Logout Icon" id="sidebar-icon" />
          <span className="login-link">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div id="main-content">
        {/* Health Overview */}
        <div className="health-overview">
          <div className="health-card total-patients">
            <div className="card-top">
              <span className="label">Total Patients</span>
              <FontAwesomeIcon icon={faUser} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>1,284</h3>
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
                <h3>86</h3>
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
                <h3>42</h3>
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
                <h3>16</h3>
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
                <tr>
                  <td>Appointment</td>
                  <td>New appointment booked</td>
                  <td>John Doe</td>
                  <td>10 mins ago</td>
                  <td>
                    <Link to="/admin/appointments" className="view-all">
                      View
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>Patient</td>
                  <td>New patient registered</td>
                  <td>Jane Smith</td>
                  <td>25 mins ago</td>
                  <td>
                    <Link to="/admin/patients" className="view-all">
                      View
                    </Link>
                  </td>
                </tr>
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
