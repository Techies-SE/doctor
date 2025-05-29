import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/doctorDashboard.css";
import { useNavigate } from 'react-router-dom';
import {
  faBell,
  faUser,
  faCalendarAlt,
  faFileMedical,
  faUserMd,
  faHospital,
  faCalendarDay,
  faSearch,
  faFilter,
  faChevronUp,
  faChevronDown,
  faTrashAlt,
  faEdit,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import DoctorDetails from "./doctordetails";

const Doctors = () => {
  // State for doctors list and filtering
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    phone_no: "",
    email: "",
    specialization: "",
    status: "",
    department_id: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({
    key: "doctor_name",
    direction: "ascending",
  });
  const [departments, setDepartments] = useState([]);

  // State for doctor details view
  const [viewingDetails, setViewingDetails] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Fetch doctors and departments
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    fetch("https://backend-pg-cm2b.onrender.com/doctors-with-departments", { headers })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch doctors");
        return response.json();
      })
      .then((data) => {
        setDoctors(data);
      })
      .catch((error) => console.error("Error fetching doctors data:", error));

    fetch("https://backend-pg-cm2b.onrender.com/departments", { headers })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch departments");
        return response.json();
      })
      .then((data) => {
        setDepartments(data);
      })
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  // Handle input changes for new doctor form
  const handleInputChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };
  
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate('/');
    window.location.reload();
  };

  // Handle form submission for new doctor
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    console.log("Auth Token", token);
    if (!token) throw new Error("No Authentication token found");

    fetch("https://backend-pg-cm2b.onrender.com/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newDoctor),
    })
      .then((response) => response.json())
      .then(() => {
        return fetch("https://backend-pg-cm2b.onrender.com/doctors-with-departments", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((response) => response.json())
      .then((updatedData) => {
        setDoctors(updatedData);
        setShowModal(false);
        setNewDoctor({
          name: "",
          phone_no: "",
          email: "",
          specialization: "",
          status: "active",
          department_id: 1,
        });
      })
      .catch((error) => console.error("Error adding doctor:", error));
  };

  // Sorting functionality
  const sortedDoctors = React.useMemo(() => {
    let sortableDoctors = [...doctors];
    sortableDoctors.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sortableDoctors;
  }, [doctors, sortConfig]);

  // Filter doctors based on search term
  const filteredDoctors = sortedDoctors.filter(
    (doctor) =>
      doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctor_specialization
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  // Handle sorting
  const handleSort = (column) => {
    let direction = "ascending";
    if (sortConfig.key === column && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: column, direction });
  };

  // Handle page changes
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render pagination controls
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
        <span key={index} className="pagination-dots">
          ...
        </span>
      ) : (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`pButton ${currentPage === page ? "active" : ""}`}
        >
          {page}
        </button>
      )
    );
  };

  // Handle viewing doctor details
  const handleViewDetails = (doctor) => {
    setSelectedDoctorId(doctor.doctor_id);
    setViewingDetails(true);
  };

  // Handle returning to doctors list
  const handleBackToList = () => {
    setViewingDetails(false);
    setSelectedDoctorId(null);
  };

  // Handle deleting a doctor
  const handleDeleteDoctor = (doctorID) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?\nYOU CANNOT UNDO THIS ACTION"
    );
    if (!confirmDelete) return;
    const token = localStorage.getItem("authToken");
    console.log("Auth Token:", token);
    if (!token) throw new Error("No authentication token found");
    fetch(
      `https://backend-pg-cm2b.onrender.com/doctors/${doctorID}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then(() => {
        setDoctors(doctors.filter((doctor) => doctor.doctor_id !== doctorID));
        alert("Doctor deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor.");
      });
  };

  // If viewing details, show the DoctorDetails component
  if (viewingDetails) {
    return (
      <div className="doctor-details-container">
        <DoctorDetails doctorId={selectedDoctorId} onBack={handleBackToList} />
      </div>
    );
  }

  // Main doctors list view
  return (
    <div>
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
              src="/img/profile.png"
              alt="Profile"
              id="profile-image"
            />
            <span id="profile-name">Admin</span>
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
              id="sidebar-icon"
            />{" "}
            <Link to="/admindashboard" className="sidebar-link">
              Dashboard
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faUser} id="sidebar-icon" />
            <Link to="/patient" className="sidebar-link">
              Patients
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarAlt} id="sidebar-icon" />
            <Link to="/appointments" className="sidebar-link">
              Appointments
            </Link>
          </button>

          <button className="sidebar-btn active-tab">
            <FontAwesomeIcon icon={faUserMd} id="sidebar-icon" />
            <Link to="/doctors" className="sidebar-link">
              Doctors
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
            <Link to="/recommendations" className="sidebar-link">
              Recommendations
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
            <Link to="/departments" className="sidebar-link">
              Departments
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
            <Link to="/schedules" className="sidebar-link">
              Schedules
            </Link>
          </button>
        </div>

        <button className="sidebar-btn logout" onClick={logout}>
          <img src="/img/material-symbols_logout.png" alt="Logout Icon" id="sidebar-icon" />
          <span className="login-link">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content-doctor" style={{ marginTop: "250px" }}>
        <div className="table-container p-6 font-sans">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-black">Doctor Info</h1>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(true)} className="uButton">
                + New Doctor
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex items-center border border-gray-300 rounded-full w-[200px] h-8 px-3 py-2 mr-4 bg-[#E8F9F1]">
              <FontAwesomeIcon icon={faSearch} className="text-[#3BA092]" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-2 outline-none bg-transparent w-full placeholder-[#969696] text-[#969696]"
              />
            </div>
            <button className="flex items-center bg-transparent border rounded-full border-[#3BA092] w-[158px] h-8 px-4 py-2 rounded hover:bg-gray-50 text-xs text-[#969696]">
              <FontAwesomeIcon
                icon={faFilter}
                className="mr-2 text-[#3BA092]"
              />{" "}
              Filter by Date
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table-content" style={{ marginTop: "0px" }}>
              <thead>
                <tr className="hover:bg-gray-50 bg-gray-100 text-[#242222]">
                  {[
                    { key: "doctor_name", label: "Doctor Name", width: "15%" },
                    {
                      key: "doctor_specialization",
                      label: "Specialization",
                      width: "15%",
                    },
                    { key: "department", label: "Department", width: "15%" },
                    {
                      key: "doctor_phone_no",
                      label: "Phone Number",
                      width: "15%",
                    },
                    {
                      key: "doctor_email",
                      label: "Email Address",
                      width: "20%",
                    },
                    { key: "status", label: "Status", width: "10%" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="p-4 text-center cursor-pointer hover:bg-gray-200"
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center justify-between">
                        {column.label}
                        {sortConfig.key === column.key &&
                          (sortConfig.direction === "ascending" ? (
                            <FontAwesomeIcon
                              icon={faChevronUp}
                              className="ml-1 text-[#595959]"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="ml-1 text-[#595959]"
                            />
                          ))}
                      </div>
                    </th>
                  ))}
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-gray-500">
                      There's no doctor yet.
                    </td>
                  </tr>
                ) : (
                  currentDoctors.map((doctor, index) => (
                    <tr
                      key={doctor.doctor_id}
                      className={`
                       hover:bg-gray-50 transition-colors duration-150
                       border-b border-gray-300
                      
                    `}
                    >
                      <td className="p-4 text-start text-[#595959]">
                        {doctor.doctor_name}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {doctor.doctor_specialization}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {doctor.department}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {doctor.doctor_phone_no}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {doctor.doctor_email}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {doctor.status}
                      </td>
                      <td className="p-4 items-center">
                        <FontAwesomeIcon
                          icon={faEdit}
                          className="cursor-pointer text-[#3BA092] hover:text-[#2A7E6C]"
                          style={{ marginRight: "10px" }}
                          onClick={() => handleViewDetails(doctor)}
                          title="View Details"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          className="cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteDoctor(doctor.doctor_id)}
                          title="Delete Doctor"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6 gap-2">
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

          {/* New Doctor Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header text-[#242222]">
                  <h2>Create New Doctor</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="close-btn-1"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <form onSubmit={handleFormSubmit} className="modal-form">
                  <div className="form-group text-[#242222]">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newDoctor.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter doctor's name"
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phone_no"
                      value={newDoctor.phone_no}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newDoctor.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={newDoctor.specialization}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter specialization"
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Status</label>
                    <select
                      name="status"
                      value={newDoctor.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Department</label>
                    <select
                      name="department_id"
                      value={newDoctor.department_id}
                      onChange={(e) =>
                        setNewDoctor({
                          ...newDoctor,
                          department_id: e.target.value
                            ? Number(e.target.value)
                            : "",
                        })
                      }
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="submit-btn">
                    Create Doctor
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
