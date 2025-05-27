import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useDoctorProfile } from "../useDoctorProfile";
// import "../styles/patientlist.css";

const DetailsPage = () => {
  const { hn_number, lab_test_id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { doctorData } = useDoctorProfile();
  const [isBlurred, setIsBlurred] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/doctors/${hn_number}/lab-test/${lab_test_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPatientData(data);
        setRecommendation(data.lab_test?.generated_recommendation || "");
        setIsApproved(data.lab_test?.recommendation_status === "approved");
      } catch (err) {
        console.error("Error fetching patient details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [hn_number, lab_test_id]);

  const handleModify = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      console.log("Auth Token:", token); // Debug token
      if (!token) throw new Error("No authentication token found");
      if (!lab_test_id) throw new Error("lab_test_id is missing");
      const response = await fetch(
        `http://localhost:3000/recommendations/${lab_test_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ generated_recommendation: recommendation }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      // Update the local state with the response data
      if (data.success) {
        const updatedData = {
          ...patientData,
          lab_test: {
            ...patientData.lab_test,
            generated_recommendation: recommendation,
            updated_at: data.data.updated_at,
          },
        };
        setPatientData(updatedData);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error saving recommendation:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRecommendation(patientData.lab_test?.generated_recommendation || "");
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const token = localStorage.getItem("authToken");
      console.log("Auth Token:", token); // Debug token
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(
        `http://localhost:3000/recommendations/${lab_test_id}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      // Update the local state with the response data
      if (data.success) {
        const updatedData = {
          ...patientData,
          lab_test: {
            ...patientData.lab_test,
            recommendation_status: "approved",
            updated_at: data.data.updated_at,
          },
        };
        setPatientData(updatedData);
        setIsApproved(true);
      }
    } catch (err) {
      console.error("Error approving recommendation:", err);
      setError(err.message);
      // You might want to show an error message to the user here
    } finally {
      setIsApproving(false);
    }
  };

  const displayValue = (value, fallback = "N/A") => {
    return value ?? fallback;
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("normal")) return "normal";
    if (lowerStatus.includes("high") || lowerStatus.includes("dangerously"))
      return "high";
    if (lowerStatus.includes("low")) return "low";
    return "";
  };

  if (loading) {
    return <div className="loading-message">Loading patient details...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!patientData) {
    return <div className="error-message">Patient data not found</div>;
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle"></div>
          <span className="mfu-text">MFU</span>{" "}
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
              {doctorData ? `Dr. ${doctorData.name}` : "Loading..."}
            </span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-container">
          <button className="sidebar-btn">
            <img
              src="/img/ChartLineUp.png"
              alt="Dashboard Icon"
              className="sidebar-icon"
            />
            <Link to="/dashboard" className="dashboard-link">
              Dashboard
            </Link>
          </button>
          <button className="sidebar-btn active-tab">
            <img
              src="/img/UsersThree.png"
              alt="Patients Icon"
              className="sidebar-icon"
            />{" "}
            Patients
          </button>
          <button className="sidebar-btn">
            <img
              src="/img/Calendar.png"
              alt="Calendar Icon"
              className="sidebar-icon"
            />
            <Link to="/calendar" className="calendar-link">
              Calendar
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

      {/* Main Content */}
      <div className={`main-content ${isBlurred ? "blur-background" : ""}`}>
        {/* Patient Header */}
        <div className="patient-header">
          <div className="patient-info">
            <h2>{displayValue(patientData.name)}</h2>
            <p>
              {displayValue(patientData.patient_data?.gender, "Unknown gender")}
              ,
              {patientData.patient_data?.age
                ? ` ${patientData.patient_data.age} years`
                : " Unknown age"}{" "}
              | HN-Number: #{displayValue(patientData.hn_number)}
            </p>
          </div>
        </div>

        {/* Health Stats */}
        <div className="health-stats">
          {patientData.lab_test?.results?.map((result, index) => (
            <div className="health-card" key={index}>
              <h3>{displayValue(result.lab_item_name)}</h3>
              <p className="measurement">
                {displayValue(result.value)} {displayValue(result.unit)}
              </p>
              <p className={`status ${getStatusClass(result.lab_item_status)}`}>
                {displayValue(result.lab_item_status)}
              </p>
            </div>
          ))}
        </div>

        {/* Lab Results & AI Recommendation */}
        <div className="lab-ai-section">
          <div className="latest-lab">
            <h3>Latest Lab Results</h3>
            <LabCard
              title={displayValue(patientData.lab_test?.test_name)}
              details={
                patientData.lab_test?.results?.map(
                  (result) =>
                    `${result.lab_item_name}: ${result.value} ${result.unit} (${result.normal_range})`
                ) || ["No lab results available"]
              }
            />
          </div>

          <div className="ai-recommendation-container">
            <div className="ai-recommendation">
              <div className="recommendation-header">
                <h3>AI Recommendation</h3>
                {isApproved && <span className="approved-tag">Approved</span>}
              </div>

              {isEditing ? (
                <div className="editing-area">
                  <textarea
                    className="recommendation-textarea"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    rows="8"
                  ></textarea>
                  <div className="button-group">
                    <button
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      className="save-btn"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    {displayValue(
                      patientData.lab_test?.generated_recommendation,
                      "No recommendation available"
                    )}
                  </p>
                  <div className="button-group">
                    <button
                      className={`approve-btn ${isApproved ? "approved" : ""}`}
                      onClick={handleApprove}
                      disabled={isApproved || isApproving}
                    >
                      {isApproving
                        ? "Approving..."
                        : isApproved
                        ? "Approved"
                        : "Approve"}
                    </button>
                    <button
                      className="modify-btn"
                      onClick={handleModify}
                      disabled={isApproving}
                    >
                      Modify
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="previous-messages">
              <h3>Previously Sent Messages</h3>
              <p>
                {patientData.lab_test?.recommendation_status === "sent"
                  ? `Sent on ${new Date(
                      patientData.lab_test.recommendation_updated_at
                    ).toLocaleString()}`
                  : "No previous recommendations sent."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// LabCard Component
const LabCard = ({ title, details }) => (
  <div className="lab-card">
    <input type="checkbox" id={`${title}-toggle`} className="lab-checkbox" />
    <label htmlFor={`${title}-toggle`} className="lab-toggle">
      {title}
      <span className="arrow"></span>
    </label>
    <div className="lab-details">
      {details.map((detail, index) => (
        <p key={index}>{detail}</p>
      ))}
    </div>
  </div>
);

export default DetailsPage;
