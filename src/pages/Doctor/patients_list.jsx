import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctorProfile } from "../../useDoctorProfile";
import "./styles/patientlist.css";
import DetailsPage from "./patients_detailspage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const Search = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const Filter = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const ChevronUp = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const ChevronDown = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const getRelativeTime = (dateString) => {
  if (!dateString || dateString === "N/A") return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const PatientList = () => {
  const { doctorData } = useDoctorProfile(); // Get doctor data from the hook
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | pending | approved | rejected
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [prioritySort, setPrioritySort] = useState(true); // Pending first
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [popupIndex, setPopupIndex] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [sortConfig, setSortConfig] = useState({
    key: "hn_number",
    direction: "ascending",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientsPerPage = 10;

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
    console.log(patient);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedPatient(null);
  };

  // Fetch patients data from the backend
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        // DON'T clear patients here - keep showing old data while loading

        const response = await fetch(
          `https://backend-pg-cm2b.onrender.com/doctors/patients-lab-tests`,
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

        const result = await response.json();
        console.log("API Response:", result);

        if (result.success) {
          const formattedPatients = result.data.map((patient) => {
            const testDate = patient.test_date;

            return {
              id: patient.lab_test_id || 0,
              patient_id: patient.patient_id || 0,
              lab_test_id: patient.lab_test_id || 0,
              name: patient.patient_name || "Unknown Patient",
              hn_number: patient.hn_number || "N/A",
              lab_test: patient.lab_test_name || "N/A",
              lab_test_date: testDate ? testDate.split("T")[0] : "N/A",
              status: patient.recommendation_status || "N/A",
            };
          });

          console.log("Formatted patients:", formattedPatients);
          setPatients(formattedPatients); // Only set patients when data arrives
        } else {
          throw new Error(result.message || "Failed to fetch patients");
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError(err.message);
        setPatients([]); // Only clear on error
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    setSortConfig({ key: "status", direction: "ascending" });
  }, []); // Empty dependency - only fetch once on mount
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate("/");
    window.location.reload();
  };

  const sortedPatients = React.useMemo(() => {
    let sortablePatients = [...patients];
    sortablePatients.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sortablePatients;
  }, [patients, sortConfig]);

  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(search) || p.hn_number.includes(search);
        const matchesPending = !showOnlyPending || p.status === "pending";
        const matchesStatus =
          filterStatus === "all" || p.status === filterStatus;
        return matchesSearch && matchesPending && matchesStatus;
      })
      .sort((a, b) => {
        // Priority sorting (pending first)
        if (prioritySort) {
          const order = { pending: 1, rejected: 2, approved: 3 };
          return (order[a.status] || 4) - (order[b.status] || 4);
        }
        // Normal column sorting
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
  }, [
    patients,
    searchTerm,
    showOnlyPending,
    filterStatus,
    sortConfig,
    prioritySort,
  ]);

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleSort = (column) => {
    let direction = "ascending";
    if (sortConfig.key === column && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: column, direction });
    setPrioritySort(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const maxPagesToShow = 5;
    let pages = [];

    if (totalPages <= maxPagesToShow) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages.map((page, index) =>
      page === "..." ? (
        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
          ...
        </span>
      ) : (
        <button
          key={`page-${index}`}
          onClick={() => handlePageChange(page)}
          className={`pButton ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  const handleClickOutside = (event) => {
    if (
      !event.target.closest("[data-action-popup]") &&
      !event.target.closest("[data-action-icon]")
    ) {
      setPopupIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (showDetails && selectedPatient) {
    return (
      <DetailsPage
        hn_number={selectedPatient.hn_number}
        lab_test_id={selectedPatient.lab_test_id}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div id="app">
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar activeTab="patients" />

      {/* Main Content */}
      <div id="main-content-patient">
        <div className="bg-white rounded-lg p-8 shadow font-sans mt-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-black text-2xl font-semibold">Patient List</h1>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Row 1: Search and Status Filter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <div id="search-container-1" style={{ width: "90%" }}>
                <Search size={18} className="search-icon-1" />
                <input
                  type="text"
                  placeholder="Search Patients ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  id="search-input"
                />
              </div>

              <select
                style={{ width: "10%" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                id="filter-button-1"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* NEW: Priority Sort Toggle - sorts pending patients first */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    type="checkbox"
                    checked={prioritySort}
                    onChange={(e) => setPrioritySort(e.target.checked)}
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: "1px",
                      padding: 0,
                      margin: "-1px",
                      overflow: "hidden",
                      clip: "rect(0, 0, 0, 0)",
                      whiteSpace: "nowrap",
                      borderWidth: 0,
                    }}
                  />
                  <div
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "9999px",
                      backgroundColor: prioritySort ? "#2563eb" : "#d1d5db",
                      transition: "background-color 0.2s",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "2px",
                        width: "20px",
                        height: "20px",
                        backgroundColor: "white",
                        borderRadius: "9999px",
                        transform: prioritySort
                          ? "translateX(20px)"
                          : "translateX(0)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Priority Sort (Pending First)
                </span>
              </label>

              {/* NEW: View Only Pending Toggle - filters to show only pending patients */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    type="checkbox"
                    checked={showOnlyPending}
                    onChange={(e) => setShowOnlyPending(e.target.checked)}
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: "1px",
                      padding: 0,
                      margin: "-1px",
                      overflow: "hidden",
                      clip: "rect(0, 0, 0, 0)",
                      whiteSpace: "nowrap",
                      borderWidth: 0,
                    }}
                  />
                  <div
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "9999px",
                      backgroundColor: showOnlyPending ? "#f59e0b" : "#d1d5db",
                      transition: "background-color 0.2s",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "2px",
                        width: "20px",
                        height: "20px",
                        backgroundColor: "white",
                        borderRadius: "9999px",
                        transform: showOnlyPending
                          ? "translateX(20px)"
                          : "translateX(0)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  View Only Pending
                </span>
              </label>

              {/* NEW: Results counter showing filtered patient count */}
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: "14px",
                  color: "#4b5563",
                }}
              >
                Showing{" "}
                <span style={{ fontWeight: "600" }}>
                  {filteredPatients.length}
                </span>{" "}
                patients
              </div>
            </div>
          </div>
          <div
            id="table-wrapper"
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
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
                    Loading Patient Data
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    Please wait while we retrieve the information...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div id="error-message">Error loading patients: {error}</div>
            ) : (
              <table id="table-content">
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f9fafb",
                    zIndex: 10,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <tr id="table-header">
                    {[
                      { key: "name", label: "Patient Name", width: "25%" },
                      { key: "hn_number", label: "HN Number", width: "20%" },
                      {
                        key: "lab_test_date",
                        label: "Lab Test Date",
                        width: "20%",
                      },
                      { key: "status", label: "Status", width: "10%" },
                    ].map((column) => (
                      <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        id="table-header-cell"
                        style={{ width: column.width }}
                      >
                        <div id="table-header-content">
                          {column.label}
                          {sortConfig.key === column.key &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={16} id="sort-icon" />
                            ) : (
                              <ChevronDown size={16} id="sort-icon" />
                            ))}
                        </div>
                      </th>
                    ))}
                    <th
                      id="table-header-cell"
                      style={{ width: "30%", textAlign: "center" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.length === 0 ? (
                    <tr>
                      <td colSpan="5" id="empty-table-message">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((patient, index) => (
                      <tr
                        key={`${patient.hn_number}-${patient.lab_test_id}-${index}`}
                        id="table-row"
                        style={{
                          backgroundColor:
                            patient.status === "pending"
                              ? "#fffbeb"
                              : "transparent",
                        }}
                      >
                        <td id="table-cell">{patient.name}</td>
                        <td id="table-cell">{patient.hn_number}</td>
                        <td id="table-cell">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <span style={{ color: "#111827" }}>
                              {patient.lab_test_date}
                            </span>
                            <span
                              style={{ fontSize: "12px", color: "#6b7280" }}
                            >
                              {getRelativeTime(patient.lab_test_date)}
                            </span>
                          </div>
                        </td>

                        <td id="table-cell" style={{ textAlign: "start" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {patient.status === "pending" && (
                              <>
                                <Clock size={20} color="#f0ad4e" />
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: "#d97706",
                                    fontWeight: "500",
                                  }}
                                >
                                  Pending
                                </span>
                              </>
                            )}
                            {patient.status === "approved" && (
                              <>
                                <CheckCircle size={20} color="#3BA092" />
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: "#059669",
                                    fontWeight: "500",
                                  }}
                                >
                                  Approved
                                </span>
                              </>
                            )}
                            {patient.status !== "pending" &&
                              patient.status !== "approved" && (
                                <>
                                  <XCircle size={20} color="#d9534f" />
                                  <span
                                    style={{
                                      fontSize: "14px",
                                      color: "#dc2626",
                                      fontWeight: "500",
                                    }}
                                  >
                                    Rejected
                                  </span>
                                </>
                              )}
                          </div>
                        </td>

                        <td
                          id="table-cell relative"
                          style={{ width: "15%", textAlign: "center" }}
                        >
                          <button
                            onClick={() => handleViewDetails(patient)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#3BA092",
                              textDecoration: "underline",
                              fontSize: "14px",
                              padding: 0,
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Add CSS animation */}
            <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                      }
                    `}</style>
          </div>

          {!loading && !error && filteredPatients.length > 0 && (
            <div id="pagination-container">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                id="pButton"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                id="pButton"
              >
                Previous
              </button>
              {renderPagination()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                id="pButton"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                id="pButton"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
