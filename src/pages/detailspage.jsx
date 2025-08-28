import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useDoctorProfile } from "../useDoctorProfile";
import "../styles/style.css";
const DetailsPage = () => {
  const { hn_number } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { doctorData } = useDoctorProfile();
  const [recommendation, setRecommendation] = useState("");
  const [selected, setSelected] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [recommendationId, setRecommendationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `https://backend-pg-cm2b.onrender.com/doctors/${hn_number}/lab-test`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setPatientData(data);
        setRecommendation(data.lab_test?.generated_recommendation || "");
        setRecommendationId(data.lab_test?.recommendation_id || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [hn_number]);

  const handleSelect = (type) => {
    setSelected(type);
    const selectedText =
      type === "rule"
        ? patientData.lab_test?.rule_based
        : patientData.lab_test?.llm_based;
    setRecommendation(selectedText || "");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/recommendations/${recommendationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ generated_recommendation: recommendation }),
        }
      );

      if (!response.ok) throw new Error("Error saving recommendation");

      const updated = await response.json();
      if (updated.success) alert("Recommendation saved successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const token = localStorage.getItem("authToken");
      await fetch(
        `https://backend-pg-cm2b.onrender.com/recommendations/${recommendationId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Recommendation approved and sent.");
    } catch (err) {
      alert("Error approving recommendation.");
    } finally {
      setIsApproving(false);
    }
  };

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate("/");
    window.location.reload();
  };

  const displayValue = (val, fallback = "N/A") => val ?? fallback;

  if (loading) return <div>Loading...</div>;
  if (error || !patientData) return <div>Error: {error || "No data"}</div>;

  const hardcodedLabTests = [
    {
      title: "Complete Blood Count",
      details: [
        "WBC: 6.0 x10^3/uL (4.0-10.0)",
        "RBC: 5.2 x10^6/uL (4.2-5.9)",
        "Hemoglobin: 13.5 g/dL (13.0-17.0)"
      ]
    },
    {
      title: "Liver Function Test",
      details: [
        "ALT: 25 U/L (7-56)",
        "AST: 20 U/L (10-40)"
      ]
    },
    {
      title: "Kidney Function Test",
      details: [
        "Creatinine: 1.0 mg/dL (0.6-1.2)",
        "BUN: 14 mg/dL (7-20)"
      ]
    },
    {
      title: "Lipid Profile",
      details: [
        "Total Cholesterol: 190 mg/dL (<200)",
        "HDL: 55 mg/dL (>40)",
        "LDL: 110 mg/dL (<130)",
        "Triglycerides: 150 mg/dL (<150)"
      ]
    }
  ];

  return (
    <div className="app">
      {/* Navbar */}
      <nav id="navbar">
        <div id="navbar-left">
          <div id="logo-circle"></div>
          <span id="mfu-text">MFU</span>
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
              {doctorData ? `Dr. ${doctorData.name}` : "Loading..."}
            </span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside id="sidebar">
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
            />
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

        <button className="sidebar-btn logout" onClick={logout}>
          <img
            src="/img/material-symbols_logout.png"
            alt="Logout Icon"
            className="sidebar-icon"
          />
          <Link to="/" className="logout-link">Logout</Link>
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content-container">
        <div className="patient-info-box">
          <h1>Patient Information</h1>
          <h3>{patientData.name}</h3>
          <p>
            {patientData.patient_data?.gender}, {patientData.patient_data?.age} years | HN-Number: {hn_number}
          </p>
        </div>

        <div className="lab-section">
          <h3>Latest Lab Results</h3>
          <div className="lab-result-list">
            {hardcodedLabTests.map((test, index) => (
              <LabCard key={index} title={test.title} details={test.details} />
            ))}
          </div>
        </div>

        <div className="recommendation-compare">
          <h3>AI Recommendation</h3>
          {/* <p className="error-msg">Please select one preferred recommendation.</p> */}
          <div className="recommendation-cards">
            <div
              className={`recommendation-card ${selected === "rule" ? "selected" : ""}`}
              onClick={() => handleSelect("rule")}
            >
              {/* <h4>Rule-Based Recommendation</h4> */}
              <textarea readOnly value={patientData.lab_test?.rule_based || ""}></textarea>
              <button>Select & Apply</button>
            </div>
            {/* <div
              className={`recommendation-card ${selected === "llm" ? "selected" : ""}`}
              onClick={() => handleSelect("llm")}
            >
              <h4>LLM-Based Recommendation (Gemma)</h4>
              <textarea readOnly value={patientData.lab_test?.llm_based || ""}></textarea>
              <button>Select</button> 
            </div>*/}
          </div>
        </div>

        <div className="improved-section">
          <h3>Improved Recommendation</h3>
          <textarea
            className="improved-textarea"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          ></textarea>
          <div className="btn-group">
            {/* <button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button> */}
            <button onClick={handleApprove} disabled={isApproving || !recommendation}>
              {isApproving ? "Approving..." : "Approve & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LabCard = ({ title, details }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="lab-card">
      <div className="lab-card-header" onClick={() => setOpen(!open)}>
        {title}
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="lab-details">
          {details.map((detail, index) => (
            <p key={index}>{detail}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailsPage;
