import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctorProfile } from "../../useDoctorProfile";
import "./styles/patientlist.css";
import { FiInfo } from "react-icons/fi";
import DetailsPage from "./patients_detailspage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

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

const PatientList = () => {
  const { doctorData } = useDoctorProfile(); // Get doctor data from the hook
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredPatients = sortedPatients.filter(
    (patient) =>
      patient.hn_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Search and Filter */}
          <div className="flex items-center justify-end mb-6">
            <div id="search-container-1">
              <Search size={18} className="search-icon-1" />
              <input
                type="text"
                placeholder="Search Patients ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-input"
              />
            </div>
            <button id="filter-button-1">
              <Filter size={13} className="filter-icon-1" /> Filter
            </button>
          </div>

          <div id="table-wrapper">
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
                <thead>
                  <tr id="table-header">
                    {[
                      { key: "name", label: "Patient Name", width: "25%" },
                      { key: "hn_number", label: "HN Number", width: "20%" },
                      {
                        key: "lab_test_date",
                        label: "Lab Test Date",
                        width: "20%",
                      },
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
                      style={{ width: "15%", textAlign: "center" }}
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
                      >
                        <td id="table-cell">{patient.name}</td>
                        <td id="table-cell">{patient.hn_number}</td>
                        <td id="table-cell">{patient.lab_test_date}</td>
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
