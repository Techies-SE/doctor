import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useDoctorProfile } from "../../useDoctorProfile";
import "../../styles/style.css";
import { ChevronLeft } from "lucide-react";

const DetailsPage = ({ hn_number, lab_test_id, onBack }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { doctorData } = useDoctorProfile();
  const [recommendation, setRecommendation] = useState("");
  const [selected, setSelected] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [recommendationId, setRecommendationId] = useState(null);
  const [recommendationStatus, setRecommendationStatus] = useState("pending");
  const [activeTab, setActiveTab] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
        setPatientData(data);

        // Set initial active tab
        if (data.lab_test?.test_name) {
          setActiveTab(data.lab_test.test_name);
        }

        if (data.recommendations && data.recommendations.length > 0) {
          const recommendationData = data.recommendations[0];
          const status = recommendationData.status || "pending";

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hn_number && lab_test_id) {
      fetchPatientDetails();
    }
  }, [hn_number, lab_test_id]);

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
        setRecommendationStatus("approved");
        setIsEditing(false);
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

  const isApproved = recommendationStatus === "approved";

  if (loading) return <div>Loading...</div>;
  if (error || !patientData) return <div>Error: {error || "No data"}</div>;

  // Organize all lab tests
  const allLabTests = [];
  if (patientData.lab_test) {
    allLabTests.push(patientData.lab_test);
  }
  if (patientData.other_tests_same_day) {
    allLabTests.push(...patientData.other_tests_same_day);
  }

  // Get active test results
  const activeTest =
    allLabTests.find((test) => test.test_name === activeTab) || allLabTests[0];
  const activeResults = activeTest?.results || [];

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
            <Link to="/patientlists" className="patients-link">
              Patients
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
        <button
          onClick={onBack}
          className="back-button"
          style={{ paddingBottom: 10 }}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Patients
        </button>
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

        {/* Content Sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {/* Lab Tests Section - New Design */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              padding: "24px",
              height: "680px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#111827",
              }}
            >
              Lab Tests
            </h2>

            {/* Test Category Tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              {allLabTests.map((test) => (
                <button
                  key={test.test_name}
                  onClick={() => setActiveTab(test.test_name)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor:
                      activeTab === test.test_name ? "#e8f9f2" : "#f9fafb",
                    color: activeTab === test.test_name ? "#68aaa0" : "#6b7280",
                    transition: "all 0.2s",
                  }}
                >
                  {test.test_name}
                </button>
              ))}
            </div>

            {/* Test Results Table */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #e5e7eb",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  Test
                </span>
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  Result
                </span>
              </div>

              {activeResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span style={{ color: "#374151" }}>
                    {result.lab_item_name}
                  </span>
                  <span style={{ color: "#111827", fontWeight: "500" }}>
                    {result.value} {result.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Section - New Design */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "24px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  marginBottom: "24px",
                  color: "#111827",
                }}
              >
                AI Recommendation
              </h2>

              {/* Editable Recommendation Area */}
              <div
                style={{
                  flex: 1,
                  marginBottom: "24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {isEditing ? (
                  <textarea
                    style={{
                      flex: 1,
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #2563eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      resize: "none",
                      fontFamily: "inherit",
                      lineHeight: "1.5",
                      color: "#374151",
                    }}
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Edit the recommendation..."
                  />
                ) : (
                  <div
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      lineHeight: "1.5",
                      color: "#374151",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    {recommendation || "No recommendation available"}
                  </div>
                )}
              </div>
              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", flex: 0 }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset to original recommendation if needed
                        const originalRec =
                          patientData.recommendations?.[0]
                            ?.generated_recommendation;
                        if (recommendationStatus === "pending" && originalRec) {
                          setRecommendation(originalRec);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        color: "#374151",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#f9fafb")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "8px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        cursor: isApproving ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        !isApproving &&
                        (e.target.style.backgroundColor = "#1d4ed8")
                      }
                      onMouseOut={(e) =>
                        !isApproving &&
                        (e.target.style.backgroundColor = "#2563eb")
                      }
                    >
                      {isApproving ? "Approving..." : "Approve & Send"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={isApproved}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        color: "#374151",
                        cursor: isApproved ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        opacity: isApproved ? 0.5 : 1,
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        !isApproved &&
                        (e.target.style.backgroundColor = "#f9fafb")
                      }
                      onMouseOut={(e) =>
                        !isApproved &&
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      Modify Recommendation
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isApproved || isApproving}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "8px",
                        backgroundColor: isApproved ? "#d1fae5" : "#2563eb",
                        color: isApproved ? "#065f46" : "white",
                        cursor:
                          isApproved || isApproving ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        !isApproved &&
                        !isApproving &&
                        (e.target.style.backgroundColor = "#1d4ed8")
                      }
                      onMouseOut={(e) =>
                        !isApproved &&
                        !isApproving &&
                        (e.target.style.backgroundColor = "#2563eb")
                      }
                    >
                      {isApproved
                        ? "✓ Approved"
                        : isApproving
                        ? "Approving..."
                        : "Approve & Send"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
