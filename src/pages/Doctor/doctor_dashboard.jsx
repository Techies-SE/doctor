import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/dashboard.css";
import Chart from "chart.js/auto";
import DetailsPage from "../Doctor/patients_detailspage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalLabTests, setTotalLabTests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // State for showing details page
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    let completedRequests = 0;
    const totalRequests = 4;

    const checkAllComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        setLoading(false);
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

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  const handleBackToDashboard = () => {
    setShowDetails(false);
    setSelectedPatient(null);
  };

  // If showing details page, render it
  if (showDetails && selectedPatient) {
    return (
      <DetailsPage
        hn_number={selectedPatient.hn_number}
        lab_test_id={selectedPatient.lab_test_id}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar />

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
                {recentActivity.map((patient, index) => (
                  <tr key={`${patient.lab_test_id}-${index}`}>
                    <td>{patient.patient_name}</td>
                    <td>{patient.hn_number}</td>
                    <td>
                      {new Date(patient.test_date).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(patient)}
                        className="view-all"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "inherit",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
