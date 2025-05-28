import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/dashboard.css";
import Chart from "chart.js/auto";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHeartbeat, faSyringe, faLungs } from '@fortawesome/free-solid-svg-icons';
import { useDoctorProfile } from "../useDoctorProfile";

const Dashboard = () => {
  const { doctorData } = useDoctorProfile();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  
  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    patientCount: 0,
    appointmentsCount: 0,
    labResultsCount: 0,
    recentPatients: [],
    loading: true,
    error: null
  });

  // Fetch all dashboard data
  useEffect(() => {
    
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No authentication token found");
        // Fetch all data in parallel
        const [patientsRes, appointmentsRes, labResultsRes, recentPatientsRes] = await Promise.all([
          fetch(`https://backend-pg-cm2b.onrender.com/doctors/patient-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`https://backend-pg-cm2b.onrender.com/doctors/appointments-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`https://backend-pg-cm2b.onrender.com/doctors/pending-lab-results-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`https://backend-pg-cm2b.onrender.com/doctors/recent-lab-tests`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Check all responses
        if (!patientsRes.ok || !appointmentsRes.ok || !labResultsRes.ok || !recentPatientsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        // Parse all responses
        const [patientsData, appointmentsData, labResultsData, recentPatientsData] = await Promise.all([
          patientsRes.json(),
          appointmentsRes.json(),
          labResultsRes.json(),
          recentPatientsRes.json()
        ]);

        setDashboardData({
          patientCount: patientsData.patient_count,
          appointmentsCount: appointmentsData.scheduled_appointment_count,
          labResultsCount: labResultsData.count,
          recentPatients: recentPatientsData.data || [],
          loading: false,
          error: null
        });
      } catch (err) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    };

    fetchDashboardData();
  }, [doctorData?.id]);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{
          label: "Patient Trends",
          data: [200, 220, 250, 280, 300],
          borderColor: "blue",
          borderWidth: 2,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
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
    navigate('/');
    window.location.reload();
  };

  if (dashboardData.loading) return <div className="loading">Loading dashboard...</div>;
  if (dashboardData.error) return <div className="error">Error: {dashboardData.error}</div>;

  return (
    <div>
      {/* Navbar */}
      <nav id="navbar">
        <div className="navbar-left">
          <div className="logo-circle"></div>
          <span className="mfu-text">MFU </span>
          <span className="wellness-text">Wellness Center</span>
        </div>
        <div className="navbar-right">
          <button className="notification-btn">
            <FontAwesomeIcon icon={faBell} className="icon" />
          </button>
          <div className="profile">
            <img 
              src={doctorData?.image || "/img/profile.png"} 
              alt="Profile" 
              className="profile-image" 
            />
            <span className="profile-name">
              {doctorData ? `${doctorData.name}` : 'Loading...'}
            </span>
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
            <Link to="/patientlists" className="doctorPanel-link">Patients</Link>
          </button>
          <button className="sidebar-btn">
            <img src="/img/Calendar.png" alt="Calendar Icon" className="sidebar-icon" />
            <Link to="/calendar" className="calendar-link">Calendar</Link>
          </button>
        </div>

        <button className="sidebar-btn logout" onClick={logout}>
          <img src="/img/material-symbols_logout.png" alt="Logout Icon" className="sidebar-icon" />
          <span className="login-link">Logout</span>
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
                <h3>{dashboardData.patientCount}</h3>
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
                <h3>{dashboardData.appointmentsCount}</h3>
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
                <h3>{dashboardData.labResultsCount}</h3>
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
                  <img src="/img/Funnel.png" alt="Filter Icon" className="filter-icon" /> Filter
                </button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Patients</th>
                  <th>HN-Number</th>
                  <th>Test Name</th>
                  <th>Test Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentPatients.map((patient, index) => {
                  console.log("Patient:", patient);
                  return(
                  <tr key={index}>
                    <td>{patient.patient_name}</td>
                    <td>{patient.hn_number}</td>
                    <td>{patient.test_name}</td>
                    <td>{new Date(patient.lab_test_date).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/details/${patient.hn_number}/lab-test/${patient.id}`} className="view-all">View Details</Link>
                    </td>
                  </tr>
                )})}
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


  