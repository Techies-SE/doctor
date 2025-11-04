import React, { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import { useDoctorProfile } from "../../useDoctorProfile";
import "../../styles/style.css";
import { ChevronLeft } from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

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

  const displayValue = (val, fallback = "-") => val ?? fallback;

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

  if (loading) {
    return (
      <div className="app">
        {/* Navbar */}
        <Navbar />

        {/* Sidebar */}
        <Sidebar activeTab="patients" />

        {/* Loading Content */}
        <div className="main-content-container">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 200px)",
              gap: "24px",
            }}
          >
            {/* Spinner */}
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #68aaa0",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>

            {/* Loading Text */}
            <div
              style={{
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                Loading Patient Information
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Please wait while we retrieve the data...
              </p>
            </div>
          </div>

          {/* Add CSS animation */}
          <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        </div>
      </div>
    );
  }
  if (error || !patientData) {
    return (
      <div className="app">
        {/* Navbar */}
        <Navbar />

        {/* Sidebar */}
        <Sidebar activeTab="patients" />

        {/* Error Content */}
        <div className="main-content-container">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 200px)",
              padding: "40px",
            }}
          >
            {/* Error Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "48px",
                maxWidth: "500px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Error Icon */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>

              {/* Error Title */}
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                {error ? "Unable to Load Patient Data" : "Patient Not Found"}
              </h2>

              {/* Error Message */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  lineHeight: "1.6",
                }}
              >
                {error
                  ? `We encountered an error while loading the patient information.`
                  : "The patient data you're looking for could not be found."}
              </p>

              {/* Technical Details (collapsible) */}
              {error && (
                <details
                  style={{
                    marginTop: "16px",
                    marginBottom: "24px",
                    textAlign: "left",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#6b7280",
                      fontWeight: "500",
                      padding: "8px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                    }}
                  >
                    Technical Details
                  </summary>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "12px",
                      backgroundColor: "#fef2f2",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#991b1b",
                      fontFamily: "monospace",
                      wordBreak: "break-word",
                    }}
                  >
                    {error}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: "#3BA092",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#23635aff")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#3BA092")
                  }
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: "white",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                >
                  Back to Patients
                </button>
              </div>

              {/* Help Text */}
              <p
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "24px",
                }}
              >
                If the problem persists, please contact IT support
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <Navbar />

      {/* Sidebar */}
      <Sidebar activeTab="patients" />

      {/* Main Content */}
      <div className="main-content-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "25px 12px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "6px",
              fontSize: "18px",
              fontWeight: "500",
              color: "#68aaa0",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#eff6ff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Patients
          </button>
          <span>/</span>
          <span
            style={{ color: "#111827", fontWeight: "500", fontSize: "18px" }}
          >
            Patient Details
          </span>
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "2px solid #f3f4f6",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                {patientData.name}
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    fontWeight: "500",
                  }}
                >
                  HN: {hn_number}
                </span>
              </div>
            </div>

            {/* Blood Type Badge */}
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {displayValue(patientData.patient_data?.blood_type)}
            </div>
          </div>

          {/* Vital Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Age */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#eff6ff",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#1e40af",
                  fontWeight: "600",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Age
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#1e3a8a",
                  lineHeight: "1",
                }}
              >
                {calculateAge(patientData.patient_data?.date_of_birth)}
                <span
                  style={{
                    fontSize: "16px",
                    color: "#3b82f6",
                    fontWeight: "500",
                    marginLeft: "4px",
                  }}
                >
                  years
                </span>
              </div>
            </div>

            {/* Gender */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f3e8ff",
                borderRadius: "8px",
                border: "1px solid #d8b4fe",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b21a8",
                  fontWeight: "600",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Gender
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#581c87",
                  textTransform: "capitalize",
                }}
              >
                {displayValue(patientData.patient_data?.gender)}
              </div>
            </div>

            {/* Weight */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "500",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Weight
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {displayValue(patientData.patient_data?.weight)}{" "}
                <span style={{ fontSize: "14px", color: "#6b7280" }}>kg</span>
              </div>
            </div>

            {/* Height */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "500",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Height
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {displayValue(patientData.patient_data?.height)}{" "}
                <span style={{ fontSize: "14px", color: "#6b7280" }}>cm</span>
              </div>
            </div>

            {/* BMI with color coding */}
            <div
              style={{
                padding: "16px",
                backgroundColor: (() => {
                  const bmi = patientData.patient_data?.bmi;
                  if (!bmi) return "#f9fafb";
                  if (bmi < 18.5) return "#fef3c7";
                  if (bmi >= 18.5 && bmi < 25) return "#d1fae5";
                  if (bmi >= 25 && bmi < 30) return "#fed7aa";
                  return "#fecaca";
                })(),
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "500",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                BMI
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {displayValue(patientData.patient_data?.bmi)}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {(() => {
                    const bmi = patientData.patient_data?.bmi;
                    if (!bmi) return "";
                    if (bmi < 18.5) return "Underweight";
                    if (bmi >= 18.5 && bmi < 25) return "Normal";
                    if (bmi >= 25 && bmi < 30) return "Overweight";
                    return "Obese";
                  })()}
                </span>
              </div>
            </div>
          </div>
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
                  gridTemplateColumns: "2fr 1.5fr 1fr",
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
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  Status
                </span>
              </div>

              {activeResults.map((result, index) => {
                // ✅ Handle gender display logic
                let displayValue = result.value;
                if (result.lab_item_name === "Gender") {
                  displayValue =
                    result.value === 0
                      ? "Male"
                      : result.value === 1
                      ? "Female"
                      : "-";
                }

                const getStatusStyle = (status) => {
                  if (!status) return null;

                  const statusLower = status.toLowerCase();

                  // Handle Stage statuses
                  if (statusLower.includes("stage")) {
                    const stageNum = parseInt(
                      statusLower.match(/\d+/)?.[0] || "0"
                    );
                    if (stageNum <= 2) {
                      return {
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        text: status,
                      };
                    } else if (stageNum === 3) {
                      return {
                        backgroundColor: "#fed7aa",
                        color: "#9a3412",
                        text: status,
                      };
                    } else {
                      return {
                        backgroundColor: "#fecaca",
                        color: "#991b1b",
                        text: status,
                      };
                    }
                  }

                  // Handle other statuses
                  switch (statusLower) {
                    case "normal":
                      return {
                        backgroundColor: "#d1fae5",
                        color: "#065f46",
                        text: "Normal",
                      };
                    case "low":
                      return {
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        text: "Low",
                      };
                    case "high":
                      return {
                        backgroundColor: "#fed7aa",
                        color: "#9a3412",
                        text: "High",
                      };
                    case "very high":
                      return {
                        backgroundColor: "#fecaca",
                        color: "#991b1b",
                        text: "Very High",
                      };
                    case "dangerously high":
                    case "dangerously low":
                      return {
                        backgroundColor: "#fee2e2",
                        color: "#7f1d1d",
                        text: statusLower.includes("high")
                          ? "Dangerously High"
                          : "Dangerously Low",
                      };
                    default:
                      return {
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        text: status,
                      };
                  }
                };

                const statusStyle = getStatusStyle(result.lab_item_status);

                return (
                  <div key={index}>
                    {/* Main row with test name, result, and status */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1.5fr 1fr",
                        paddingTop: "12px",
                        paddingBottom: "8px",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#374151", fontWeight: "500" }}>
                        {result.lab_item_name}
                      </span>
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        {displayValue} {result.unit}
                      </span>
                      <div>
                        {statusStyle ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor: statusStyle.backgroundColor,
                              color: statusStyle.color,
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {statusStyle.text}
                          </span>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                            -
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reference range row (only show if normal_range exists) */}
                    {result.normal_range && (
                      <div
                        style={{
                          paddingBottom: "12px",
                          paddingLeft: "0px",
                          fontSize: "12px",
                          color: "#6b7280",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>Reference: </span>
                        <span>{result.normal_range}</span>
                      </div>
                    )}

                    {/* Border for items without reference range */}
                    {!result.normal_range && (
                      <div
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          paddingBottom: "12px",
                        }}
                      ></div>
                    )}
                  </div>
                );
              })}
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
                        backgroundColor: "#3BA092",
                        color: "white",
                        cursor: isApproving ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        !isApproving &&
                        (e.target.style.backgroundColor = "#3BA092")
                      }
                      onMouseOut={(e) =>
                        !isApproving &&
                        (e.target.style.backgroundColor = "#3BA092")
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
                        backgroundColor: isApproved ? "#d1fae5" : "#3BA092",
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
                        (e.target.style.backgroundColor = "#54bcaeff")
                      }
                      onMouseOut={(e) =>
                        !isApproved &&
                        !isApproving &&
                        (e.target.style.backgroundColor = "#3BA092")
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
