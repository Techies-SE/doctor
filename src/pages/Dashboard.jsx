import React, { useEffect } from "react";
import "../styles/dashboard.css"; // Import your styles
import Chart from "chart.js/auto";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell,faHeartbeat,faSyringe,faLungs} from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
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

  return (
    <div>
    {/* Navbar */}
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-circle"></div>
        <div className="logo-text">
          <span className="mfu-text">MFU</span>{" "}
          <span className="wellness-text">Wellness Center</span>
        </div>
      </div>
      <div className="navbar-right">
        <button className="notification-btn">
        <FontAwesomeIcon icon={faBell} className="icon" />
        </button>
        <div className="profile">
          <img src="/img/profile.png" alt="Profile" className="profile-image" />
          <span className="profile-name">Dr. Smith</span>
        </div>
      </div>
    </nav>

    {/* Sidebar */}
    <aside className="sidebar">
      <div className="sidebar-container">
        <button className="sidebar-btn active-tab">
          <img src="/img/ChartLineUp.png" alt="Dashboard Icon" className="sidebar-icon" /> Dashboard
        </button>
        <button className="sidebar-btn">
          <img src="/img/UsersThree.png" alt="Patients Icon" className="sidebar-icon" />
          <Link to="/patients" className="doctorPanel-link">Patients</Link>
        </button>
        <button className="sidebar-btn">
          <img src="/img/Calendar.png" alt="Calendar Icon" className="sidebar-icon" />
          <Link to="/calendar" className="calendar-link">Calendar</Link>
        </button>
      </div>

      <button className="sidebar-btn logout">
        <img src="/img/material-symbols_logout.png" alt="Logout Icon" className="sidebar-icon" />
        <Link to="/" className="login-link">Logout</Link>
      </button>
    </aside>

    {/* Main Content */}
    <div className="main-content">
      {/* Health Overview */}
      <div className="health-overview">
        <div className="health-card total-patients">
          <div className="card-top">
            <span className="label">Total Patients</span>
            <img src="/img/user.png" alt="Total Patients Icon" className="health-icon" />
          </div>
          <div className="card-bottom">
            <div className="number">
              <h3>284</h3>
            </div>
            <div className="info">
              <p>+10% from last month</p>
            </div>
          </div>
        </div>

        <div className="health-card critical-cases">
          <div className="card-top">
            <span className="label">Critical Cases</span>
            <img src="/img/Warning.png" alt="Critical Cases Icon" className="health-icon" />
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
            <img src="/img/appointment icon.png" alt="Appointments Icon" className="health-icon" />
          </div>
          <div className="card-bottom">
            <div className="number">
              <h3>42</h3>
            </div>
            <div className="info">
              <p>Today</p>
            </div>
          </div>
        </div>

        <div className="health-card lab-results">
          <div className="card-top">
            <span className="label">Lab Results</span>
            <img src="/img/Flask.png" alt="Lab Results Icon" className="health-icon" />
          </div>
          <div className="card-bottom">
            <div className="number">
              <h3>16</h3>
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
            <h3>Patient Lists</h3>
            <div className="patient-controls">
              <input type="text" placeholder="Search Patient..." />
              <button className="filter-btn">
                <img src="/img/Funnel.png" alt="Filter Icon" className="filter-icon" /> Filter
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Patients</th>
                <th>HN-Number</th>
                <th>Age</th>
                <th>Status</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Som Chai</td>
                <td>#000000001</td>
                <td>32</td>
                <td>Normal</td>
                <td>2025-04-02</td>
                <td>
                  <Link to="/patients" className="view-all">View Details</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Trends and Common Conditions */}
      <div className="health-trends-container">
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
      </div>
    </div>
  </div>
);
};

export default Dashboard;