import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";
import { useDoctorProfile } from "../useDoctorProfile";
import "../styles/patientlist.css";

// Import icons (assuming you're using react-feather or similar)
// If you don't have these icons, you'll need to import them from your icon library
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

const MoreVertical = ({ size, className, onClick }) => (
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
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
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

  // Fetch patients data from the backend
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      try {
        setLoading(true);
        const response = await fetch(
          `https://backend-pg-cm2b.onrender.com/doctors/patients-lab-tests`,
          {
            headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        if (result.success) {
          const formattedPatients = result.data.map((patient) => ({
            id: patient.patient_id,
            lab_test_id: patient.lab_test_id,
            name: patient.patient_name,
            hn_number: patient.hn_number,
            lab_test: patient.lab_test_name,
            lab_test_date: patient.lab_test_date.split("T")[0],
          }));

          setPatients(formattedPatients);
        } else {
          throw new Error(result.message || "Failed to fetch patients");
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorData?.id]);
const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate('/');
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
        <span key={index} className="px-2 text-gray-500">
          ...
        </span>
      ) : (
        <button
          key={page}
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

  const handleViewDetails = (patient) => {
    // Navigate to patient details page
    //window.location.href = `/patient-details/${patient.id}`;
    //window.location.href = `/patient-details/${patient.id}`;
    // window.location.href = `/patient-details/${patient.hn_number}`;
  };

  return (
    <div id="app">
      {/* Navbar */}
      <nav id="navbar">
        <div id="navbar-left">
          <div id="logo-circle"></div>
          <span id="mfu-text">MFU </span>
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
              {doctorData ? `${doctorData.name}` : "Loading..."}
            </span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside id="sidebar">
        <div className="sidebar-container">
          <button className="sidebar-btn">
            <img src="/img/ChartLineUp.png" alt="Dashboard Icon" className="sidebar-icon" /> 
            <Link to="/dashboard" className="dashboard-link">Dashboard</Link>
          </button>
          <button className="sidebar-btn active-tab">
            <img src="/img/UsersThree.png" alt="Patients Icon" className="sidebar-icon" />Patients
          </button>
          <button className="sidebar-btn">
            <img src="/img/Calendar.png" alt="Calendar Icon" className="sidebar-icon" />
                <Link to="/calendar" className="calendar-link">Calendar</Link>
          </button>
        </div>
      
          <button className="sidebar-btn logout" onClick={logout}>
            <img src="/img/material-symbols_logout.png" alt="Logout Icon" className="sidebar-icon" />
              <span className="login-link">Logout</span>
          </button>
      </aside>

      {/* Main Content */}
      <div id="main-content">
        <div className="table-container font-sans">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-black">Patient List</h1>
          </div>

          <div className="flex items-center mb-6">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="filter-button">
              <Filter size={18} className="filter-icon" /> Filter by Date
            </button>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-message">Loading patient data...</div>
            ) : error ? (
              <div className="error-message">
                Error loading patients: {error}
              </div>
            ) : (
              <table className="table-content">
                <thead>
                  <tr className="table-header">
                    {[
                      { key: "name", label: "Patient Name", width: "25%" },
                      { key: "hn_number", label: "HN Number", width: "20%" },
                      { key: "lab_test", label: "Lab Test", width: "20%" },
                      {
                        key: "lab_test_date",
                        label: "Lab Test Date",
                        width: "20%",
                      },
                    ].map((column) => (
                      <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        className="table-header-cell"
                        style={{ width: column.width }}
                      >
                        <div className="table-header-content">
                          {column.label}
                          {sortConfig.key === column.key &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={16} className="sort-icon" />
                            ) : (
                              <ChevronDown size={16} className="sort-icon" />
                            ))}
                        </div>
                      </th>
                    ))}
                    <th className="table-header-cell" style={{ width: "15%" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table-message">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((patient, index) => (
                      <tr key={patient.id} className="table-row">
                        <td className="table-cell">{patient.name}</td>
                        <td className="table-cell">{patient.hn_number}</td>
                        <td className="table-cell">{patient.lab_test}</td>
                        <td className="table-cell">{patient.lab_test_date}</td>
                        <td className="table-cell relative">
                          <MoreVertical
                            size={25}
                            data-action-icon
                            className="action-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setButtonPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.right - 110,
                              });
                              setPopupIndex(
                                popupIndex === index ? null : index
                              );
                            }}
                          />
                          {popupIndex === index &&
                            createPortal(
                              <div
                                data-action-popup
                                className="action-popup"
                                style={{
                                  top: `${buttonPosition.top}px`,
                                  left: `${buttonPosition.left}px`,
                                }}
                              >
                                <Link
                                  to={`/details/${patient.hn_number}/lab-test/${patient.lab_test_id}`}
                                  // state={{
                                  //   patientId: patient.id,
                                  //   patientName: patient.name,
                                  //   hnNumber: patient.hn_number,
                                  //   labTest: patient.lab_test,
                                  //   labTestDate: patient.lab_test_date
                                  // }}
                                  className="action-button"
                                >
                                  View Details
                                </Link>
                              </div>,
                              document.body
                            )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!loading && !error && filteredPatients.length > 0 && (
            <div className="pagination-container">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pButton"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pButton"
              >
                Previous
              </button>
              {renderPagination()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pButton"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pButton"
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
