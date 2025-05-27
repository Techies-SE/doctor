import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Clock, CheckCircle2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faCalendarAlt,
  faFileMedical,
  faUserMd,
  faHospital,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
//import "../../styles/style.css";

const RecommendationDetails = ({ recommendationId, onBack }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchRecommendationDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const response = await fetch(
          `http://localhost:3000/recommendations/${recommendationId}`,
          {
             method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
          }
        );
        const result = await response.json();

        if (response.ok) {
          setRecommendation(result);
        } else {
          setError(result.error || "Recommendation not found");
        }
      } catch (err) {
        setError("Failed to fetch recommendation details");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationDetails();
  }, [recommendationId]);

  const handleSendRecommendation = async () => {
    setIsSending(true);
    try {
      const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
      const response = await fetch(
        "http://localhost:3000/recommendations/send-recommendation",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recommendationId: recommendationId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setRecommendation((prev) => ({
          ...prev,
          status: "sent",
        }));
        alert("Recommendation sent successfully");
      } else {
        alert(`Failed to send: ${result.message}`);
      }
    } catch (err) {
      console.error("Error sending recommendation:", err);
      alert("Network error when sending recommendation");
    } finally {
      setIsSending(false);
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "sent":
        return (
          <span className="flex items-center text-blue-600">
            <Send size={16} className="mr-1" /> Sent
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center text-green-600">
            <CheckCircle2 size={16} className="mr-1" /> Approved
          </span>
        );
      default:
        return (
          <span className="flex items-center text-amber-600">
            <Clock size={16} className="mr-1" /> Pending
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="main-content">
        <Navbar />
        <Sidebar />
        <div className="content-area">
          <div className="table-container font-sans flex justify-center items-center h-64">
            Loading recommendation details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <Navbar />
        <Sidebar />
        <div className="content-area">
          <div className="table-container font-sans flex justify-center items-center h-64 text-red-600">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="main-content">
        <Navbar />
        <Sidebar />
        <div className="content-area">
          <div className="table-container font-sans flex justify-center items-center h-64">
            Recommendation not found
          </div>
        </div>
      </div>
    );
  }

  const patientData = recommendation.patient?.data || {};
  const labResults = recommendation.lab_results || [];

  return (
    <div
      className="main-content-recommendationDetail"
      style={{ marginTop: "300px" }}
    >
      <Navbar />
      <Sidebar />
      <div className="content-area">
        <div className="table-container-rec font-sans">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-black">Recommendation Details</h1>
            <button onClick={onBack} className="cancel-button">
              <ArrowLeft size={16} className="mr-1" /> Back to List
            </button>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              padding: "1.5rem",
            }}
          >
            {/* Patient Information */}
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "#242222",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "0.5rem",
                }}
              >
                Patient Information
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    HN Number
                  </p>
                  <p style={{ color: "#242222" }}>
                    {recommendation.patient?.hn_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Name
                  </p>
                  <p style={{ color: "#242222" }}>
                    {recommendation.patient?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Gender
                  </p>
                  <p style={{ color: "#242222" }}>
                    {patientData.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Age
                  </p>
                  <p style={{ color: "#242222" }}>{patientData.age || "N/A"}</p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Blood Type
                  </p>
                  <p style={{ color: "#242222" }}>
                    {patientData.blood_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    BMI
                  </p>
                  <p style={{ color: "#242222" }}>{patientData.bmi || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "#242222",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "0.5rem",
                }}
              >
                Doctor Information
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Doctor
                  </p>
                  <p style={{ color: "#242222" }}>
                    {recommendation.doctor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Specialization
                  </p>
                  <p style={{ color: "#242222" }}>
                    {recommendation.doctor?.specialization || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Department
                  </p>
                  <p style={{ color: "#242222" }}>
                    {recommendation.doctor?.department || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Lab Test Information */}
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "#242222",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "0.5rem",
                }}
              >
                Lab Test Information
              </h2>
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "#595959",
                  }}
                >
                  Test Name
                </p>
                <p style={{ color: "#242222", marginBottom: "0.5rem" }}>
                  {recommendation.lab_test?.test_name || "N/A"}
                </p>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "#595959",
                  }}
                >
                  Test Date
                </p>
                <p style={{ color: "#242222" }}>
                  {formatDate(recommendation.lab_test?.lab_test_date)}
                </p>
              </div>

              <h3
                style={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "#595959",
                  marginBottom: "0.5rem",
                }}
              >
                Lab Results
              </h3>
              {labResults.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", backgroundColor: "white" }}>
                    <thead>
                      <tr
                        style={{ backgroundColor: "#f3f4f6", color: "#242222" }}
                      >
                        <th
                          style={{ padding: "0.5rem 1rem", textAlign: "left" }}
                        >
                          Test Item
                        </th>
                        <th
                          style={{ padding: "0.5rem 1rem", textAlign: "left" }}
                        >
                          Value
                        </th>
                        <th
                          style={{ padding: "0.5rem 1rem", textAlign: "left" }}
                        >
                          Normal Range
                        </th>
                        <th
                          style={{ padding: "0.5rem 1rem", textAlign: "left" }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResults.map((result, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid #e5e7eb" }}
                        >
                          <td style={{ padding: "0.5rem 1rem" }}>
                            {result.lab_item_name || "N/A"}
                          </td>
                          <td style={{ padding: "0.5rem 1rem" }}>
                            {result.lab_item_value || "N/A"} {result.unit || ""}
                          </td>
                          <td style={{ padding: "0.5rem 1rem" }}>
                            {result.normal_range || "N/A"}
                          </td>
                          <td style={{ padding: "0.5rem 1rem" }}>
                            {result.lab_item_status || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "#6b7280" }}>No lab results available</p>
              )}
            </div>

            {/* Recommendation */}
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "#242222",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "0.5rem",
                }}
              >
                Recommendation
              </h2>
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "#595959",
                  }}
                >
                  Status
                </p>
                <div style={{ marginTop: "0.25rem" }}>
                  <StatusIcon status={recommendation.status} />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "#595959",
                  }}
                >
                  AI Recommendation
                </p>
                <div
                  style={{
                    marginTop: "0.25rem",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.375rem",
                    border: "1px solid #e5e7eb",
                    color: "#242222",
                  }}
                >
                  {recommendation.generated_recommendation ||
                    "No recommendation available"}
                </div>
              </div>
              {recommendation.doctor_recommendation && (
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      color: "#595959",
                    }}
                  >
                    Doctor's Notes
                  </p>
                  <div
                    style={{
                      marginTop: "0.25rem",
                      padding: "0.75rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.375rem",
                      border: "1px solid #e5e7eb",
                      color: "#242222",
                    }}
                  >
                    {recommendation.doctor_recommendation}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                columnGap: "0.75rem",
              }}
            >
              {recommendation.status === "pending" && (
                <button
                  onClick={handleSendRecommendation}
                  style={{
                    backgroundColor: isSending ? "#3BA092" : "#3BA092",
                    opacity: isSending ? 0.5 : 1,
                    cursor: isSending ? "not-allowed" : "pointer",
                    color: "white",
                    fontWeight: 500,
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                  disabled={isSending}
                >
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={16} style={{ marginRight: "0.5rem" }} /> Send
                      Recommendation
                    </>
                  )}
                </button>
              )}
              <button onClick={onBack} className="cancel-button">
              <ArrowLeft size={16} className="mr-1" /> Back to List
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => (
  <nav className="navbar">
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
        <img src="/img/profile.png" alt="Profile" className="profile-image" />
        <span className="profile-name">Admin</span>
      </div>
    </div>
  </nav>
);

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-container">
      <button className="sidebar-btn">
        <img
          src="/img/ChartLineUp.png"
          alt="Dashboard Icon"
          className="sidebar-icon"
        />
        <Link to="/admindashboard" className="sidebar-link">
          Dashboard
        </Link>
      </button>

      <button className="sidebar-btn">
        <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
        <Link to="/patient" className="sidebar-link">
          Patients
        </Link>
      </button>

      <button className="sidebar-btn">
        <FontAwesomeIcon icon={faCalendarAlt} className="sidebar-icon" />
        <Link to="/appointments" className="sidebar-link">
          Appointments
        </Link>
      </button>

      <button className="sidebar-btn">
        <FontAwesomeIcon icon={faUserMd} className="sidebar-icon" />
        <Link to="/doctors" className="sidebar-link">
          Doctors
        </Link>
      </button>

      <button className="sidebar-btn active-tab">
        <FontAwesomeIcon icon={faFileMedical} className="sidebar-icon" />
        <Link to="/recommendations" className="sidebar-link">
          Recommendations
        </Link>
      </button>

      <button className="sidebar-btn">
        <FontAwesomeIcon icon={faHospital} className="sidebar-icon" />
        <Link to="/departments" className="sidebar-link">
          Departments
        </Link>
      </button>

      <button className="sidebar-btn">
        <FontAwesomeIcon icon={faCalendarDay} className="sidebar-icon" />
        <Link to="/schedules" className="sidebar-link">
          Schedules
        </Link>
      </button>
    </div>

    <button className="sidebar-btn logout">
      <img
        src="/img/material-symbols_logout.png"
        alt="Logout Icon"
        className="sidebar-icon"
      />
      <Link to="/" className="login-link">
        Logout
      </Link>
    </button>
  </aside>
);

export default RecommendationDetails;
