import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useDoctorProfile } from "../useDoctorProfile";
import "../styles/style.css";

const DetailsPage = () => {
  const { hn_number, lab_test_id } = useParams(); // Extract both parameters
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { doctorData } = useDoctorProfile();
  const [recommendation, setRecommendation] = useState("");
  const [selected, setSelected] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [recommendationId, setRecommendationId] = useState(null);
  const [recommendationStatus, setRecommendationStatus] = useState("pending"); // Add status state

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `https://backend-pg-cm2b.onrender.com/patients/${hn_number}/${lab_test_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Patient data:", data);
        setPatientData(data);

        // Set recommendation from the API response
        if (data.recommendations && data.recommendations.length > 0) {
          const recommendationData = data.recommendations[0];
          const status = recommendationData.status || "pending";

          // Show doctor_recommendation if approved, otherwise show generated_recommendation
          const displayRecommendation =
            status === "approved"
              ? recommendationData.doctor_recommendation ||
                recommendationData.generated_recommendation
              : recommendationData.generated_recommendation;

          setRecommendation(displayRecommendation || "");
          setRecommendationId(recommendationData.id || null);
          setRecommendationStatus(status);
        }
      } catch (err) {
        console.error("Error fetching patient details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hn_number && lab_test_id) {
      fetchPatientDetails();
    }
  }, [hn_number, lab_test_id]);

  const handleSelect = (type) => {
    setSelected(type);
    // You can modify this logic based on your needs
    const selectedText = recommendation;
    setRecommendation(selectedText || "");
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/recommendations/${recommendationId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ doctor_recommendation: recommendation }),
        }
      );

      if (response.ok) {
        alert("Recommendation approved and sent.");
        setRecommendationStatus("approved"); // Update status after successful approval
      } else {
        throw new Error("Failed to approve recommendation");
      }
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

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Check if recommendation is approved
  const isApproved = recommendationStatus === "approved";

  if (loading) return <div>Loading...</div>;
  if (error || !patientData) return <div>Error: {error || "No data"}</div>;

  // Prepare lab tests data from API response
  const labTests = [];

  // Add main lab test
  if (patientData.lab_test) {
    labTests.push({
      title: patientData.lab_test.test_name,
      date: new Date(patientData.lab_test.lab_test_date).toLocaleDateString(),
      details: patientData.lab_test.results.map(
        (result) =>
          `${result.lab_item_name}: ${result.value}${
            result.unit ? " " + result.unit : ""
          } (${result.normal_range || "N/A"}) - ${
            result.lab_item_status || "N/A"
          }`
      ),
    });
  }

  // Add other tests from the same day
  if (patientData.other_tests_same_day) {
    patientData.other_tests_same_day.forEach((test) => {
      labTests.push({
        title: test.test_name,
        date: new Date(test.lab_test_date).toLocaleDateString(),
        details: test.results.map(
          (result) =>
            `${result.lab_item_name}: ${result.value}${
              result.unit ? " " + result.unit : ""
            } (${result.normal_range || "N/A"}) - ${
              result.lab_item_status || "N/A"
            }`
        ),
      });
    });
  }

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
            <Link to="/patients" className="patients-link">
              Patients
            </Link>
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
          <Link to="/" className="logout-link">
            Logout
          </Link>
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content-container">
        <div className="patient-info-box">
          <h1>Patient Information</h1>
          <h3>{patientData.name}</h3>
          <p>
            {displayValue(patientData.patient_data?.gender)},{" "}
            {calculateAge(patientData.patient_data?.date_of_birth)} years |
            HN-Number: {hn_number}
          </p>
          <p>Phone: {displayValue(patientData.phone_no)}</p>
          <p>
            Blood Type: {displayValue(patientData.patient_data?.blood_type)}
          </p>
          <p>Weight: {displayValue(patientData.patient_data?.weight)} kg</p>
          <p>Height: {displayValue(patientData.patient_data?.height)} cm</p>
          <p>BMI: {displayValue(patientData.patient_data?.bmi)}</p>
        </div>

        <div className="lab-section">
          <h3>Lab Results</h3>
          <div className="lab-result-list">
            {labTests.length > 0 ? (
              labTests.map((test, index) => (
                <LabCard
                  key={index}
                  title={`${test.title} (${test.date})`}
                  details={test.details}
                />
              ))
            ) : (
              <p>No lab results available</p>
            )}
          </div>
        </div>

        <div className="recommendation-compare">
          <h3>AI Generated Recommendation</h3>
          <div className="recommendation-cards">
            <div
              className={`recommendation-card ${
                selected === "rule" ? "selected" : ""
              }`}
              onClick={() => handleSelect("rule")}
            >
              <textarea
                readOnly
                value={
                  patientData.recommendations &&
                  patientData.recommendations.length > 0
                    ? patientData.recommendations[0].generated_recommendation // Always show original AI
                    : "No recommendation available"
                }
              ></textarea>
            </div>
          </div>
        </div>

        <div className="improved-section">
          <h3>
            {isApproved
              ? "Approved Recommendation"
              : "You can improve the recommendation here"}
          </h3>
          {isApproved && (
            <div
              className="status-indicator"
              style={{
                color: "#28a745",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              ✓ This recommendation has been approved and sent
            </div>
          )}
          <textarea
            className="improved-textarea"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            readOnly={isApproved} // Make read-only if approved
            style={{
              backgroundColor: isApproved ? "#f8f9fa" : "white",
              cursor: isApproved ? "not-allowed" : "text",
            }}
            placeholder={
              isApproved
                ? "Approved recommendation"
                : "Edit AI recommendation if needed"
            }
          />
          {!isApproved && (
            <div className="btn-group">
              <button
                onClick={handleApprove}
                disabled={isApproving || !recommendation}
              >
                {isApproving ? "Approving..." : "Approve & Send"}
              </button>
            </div>
          )}
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
