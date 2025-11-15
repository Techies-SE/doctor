import { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  FlaskConical,
  Calendar,
  AlertCircle
} from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DetailsPage from "../Doctor/patients_detailspage";

const DoctorDashboard = () => {
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalLabTests, setTotalLabTests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Quick actions state
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("today");
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showQuickReview) {
        if (e.key === "Escape") {
          setShowQuickReview(false);
        } else if (e.key === "ArrowRight" || e.key === "Enter") {
          handleNextPatient();
        } else if (e.key === "ArrowLeft") {
          handlePreviousPatient();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showQuickReview, currentReviewIndex, filteredActivity]);

  // Fetch dashboard data
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
        console.error("Error fetching lab tests count:", err);
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
        const enrichedData = (activityData.data || []).map((item) => ({
          ...item,
          days_waiting: Math.floor(
            (new Date() - new Date(item.test_date)) / (1000 * 60 * 60 * 24)
          ),
        }));
        setRecentActivity(enrichedData);
        setFilteredActivity(enrichedData);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
      } finally {
        checkAllComplete();
      }
    };

    fetchTotalAppointments();
    fetchTotalPatients();
    fetchTotalLabTests();
    fetchRecentActivity();
  }, []);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
    console.log("clicked!");
    console.log(patient);
  };

  // Filter logic
  useEffect(() => {
    let filtered = [...recentActivity];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.hn_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterMode) {
      case "today":
        filtered = filtered.filter((p) => p.days_waiting === 0);
        break;
      case "older":
        filtered = filtered.filter((p) => p.days_waiting >= 2);
        break;
    }

    filtered.sort((a, b) => new Date(b.test_date) - new Date(a.test_date));

    setFilteredActivity(filtered);
  }, [searchQuery, filterMode, recentActivity]);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleQuickReview = (patient, index) => {
    setSelectedPatient(patient);
    setCurrentReviewIndex(index);
    setShowQuickReview(true);
  };

  const handleApprove = () => {
    setReviewedToday((prev) => prev + 1);
    alert(`Approved lab results for ${selectedPatient.patient_name}`);
    handleNextPatient();
  };

  const handleBackToDashboard = () => {
    setShowDetails(false);
    setSelectedPatient(null);
  };

  const handleNextPatient = () => {
    if (currentReviewIndex < filteredActivity.length - 1) {
      const nextIndex = currentReviewIndex + 1;
      setCurrentReviewIndex(nextIndex);
      setSelectedPatient(filteredActivity[nextIndex]);
    } else {
      setShowQuickReview(false);
    }
  };

  const handlePreviousPatient = () => {
    if (currentReviewIndex > 0) {
      const prevIndex = currentReviewIndex - 1;
      setCurrentReviewIndex(prevIndex);
      setSelectedPatient(filteredActivity[prevIndex]);
    }
  };

  const toggleRowSelection = (labTestId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(labTestId)) {
      newSelected.delete(labTestId);
    } else {
      newSelected.add(labTestId);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkApprove = () => {
    setReviewedToday((prev) => prev + selectedRows.size);
    setSelectedRows(new Set());
    alert(`Approved ${selectedRows.size} lab results`);
  };

  const handleStartReviewSession = () => {
    if (filteredActivity.length > 0) {
      handleQuickReview(filteredActivity[0], 0);
    }
  };

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
    <div id="app">
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar activeTab="dashboard" />
      {/* Main Content - adjusted for sidebar */}
      <div style={{ marginLeft: "240px", paddingTop: "100px" }}>
        <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  Total Patients
                </span>
                <div
                  style={{
                    backgroundColor: "#dbeafe",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <Users size={24} color="#3b82f6" />
                </div>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {loading ? "..." : totalPatients}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#10b981",
                  marginTop: "4px",
                  margin: 0,
                }}
              >
                Active patients
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  Pending Reviews
                </span>
                <div
                  style={{
                    backgroundColor: "#fed7aa",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <FlaskConical size={24} color="#f97316" />
                </div>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {loading ? "..." : totalLabTests}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#f97316",
                  marginTop: "4px",
                  margin: 0,
                }}
              >
                Lab results to review
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  Appointments
                </span>
                <div
                  style={{
                    backgroundColor: "#e9d5ff",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <Calendar size={24} color="#a855f7" />
                </div>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {loading ? "..." : totalAppointments}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "4px",
                  margin: 0,
                }}
              >
                Today
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  Waiting 2+ Days
                </span>
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <AlertCircle size={24} color="#ef4444" />
                </div>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {recentActivity.filter((p) => p.days_waiting >= 2).length}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  marginTop: "4px",
                  margin: 0,
                }}
              >
                Need attention
              </p>
            </div>
          </div>

          {/* Lab Results Table */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  Recent Lab Tests
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                {/* Search */}
                <div
                  style={{ position: "relative", flex: "1", minWidth: "250px" }}
                >
                  <Search
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search patient or HN number..."
                    style={{
                      paddingLeft: "40px",
                      paddingRight: "16px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      width: "90%",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>

                {/* Quick Filters */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setFilterMode("all")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        filterMode === "all" ? "#37a192" : "#f3f4f6",
                      color: filterMode === "all" ? "white" : "#374151",
                    }}
                  >
                    All ({recentActivity.length})
                  </button>
                  <button
                    onClick={() => setFilterMode("today")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        filterMode === "today" ? "#37a192" : "#f3f4f6",
                      color: filterMode === "today" ? "white" : "#374151",
                    }}
                  >
                    Today (
                    {recentActivity.filter((p) => p.days_waiting === 0).length})
                  </button>
                  <button
                    onClick={() => setFilterMode("older")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        filterMode === "older" ? "#37a192" : "#f3f4f6",
                      color: filterMode === "older" ? "white" : "#374151",
                    }}
                  >
                    2+ Days (
                    {recentActivity.filter((p) => p.days_waiting >= 2).length})
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedRows.size > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: "#dbeafe",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#374151" }}>
                    {selectedRows.size} selected
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleBulkApprove}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#16a34a",
                        color: "white",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✓ Approve Selected
                    </button>
                    <button
                      onClick={() => setSelectedRows(new Set())}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#e5e7eb",
                        color: "#374151",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Patient Name
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      HN Number
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Lab Test Date
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Time Waiting
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Quick Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "white" }}>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          padding: "32px 24px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        Loading lab tests...
                      </td>
                    </tr>
                  ) : filteredActivity.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          padding: "32px 24px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        No lab results match your filters
                      </td>
                    </tr>
                  ) : (
                    filteredActivity.map((patient, index) => (
                      <tr
                        key={patient.lab_test_id}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          backgroundColor: "white",
                        }}
                      >
                        <td style={{ padding: "16px 24px" }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#111827",
                            }}
                          >
                            {patient.patient_name}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontSize: "14px", color: "#374151" }}>
                            {patient.hn_number}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontSize: "14px", color: "#111827" }}>
                            {new Date(patient.test_date).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {getTimeAgo(patient.test_date)}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "14px",
                              color:
                                patient.days_waiting >= 2
                                  ? "#ea580c"
                                  : "#6b7280",
                              fontWeight:
                                patient.days_waiting >= 2 ? "500" : "normal",
                            }}
                          >
                            {patient.days_waiting >= 2 && (
                              <Clock
                                style={{ width: "16px", height: "16px" }}
                              />
                            )}
                            {patient.days_waiting === 0
                              ? "Today"
                              : `${patient.days_waiting}d waiting`}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleViewDetails(patient)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#37a192",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "500",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              Quick Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
};

export default DoctorDashboard;
