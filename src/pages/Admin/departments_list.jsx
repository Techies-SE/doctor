import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./styles/doctors.css";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faCalendarAlt,
  faFileMedical,
  faUserMd,
  faHospital,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  Trash2,
  X,
  Upload,
  User,
  Mail,
  Phone,
  Award,
  PlusIcon,
  PenBox,
} from "lucide-react";
import DepartmentDetails from "./department_details";

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const departmentsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [isLoading, setIsLoading] = useState(false);

  // New states for navigation
  const [viewingDetails, setViewingDetails] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  // Doctor modal states for quick add from departments list
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDepartmentForDoctor, setSelectedDepartmentForDoctor] =
    useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    phone_no: "",
    email: "",
    specialization: "",
    status: "active",
    department_id: "",
  });

  const handleOpenDoctorModal = (department) => {
    setSelectedDepartmentForDoctor(department);
    setNewDoctor({
      ...newDoctor,
      department_id: department.id,
    });
    setShowDoctorModal(true);
  };

  const handleDoctorInputChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const handleDoctorFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }
    try {
      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/doctors",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newDoctor),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the departments list to update doctor counts
      fetchDepartments();

      setShowDoctorModal(false);
      setNewDoctor({
        name: "",
        phone_no: "",
        email: "",
        specialization: "",
        status: "active",
        department_id: "",
      });
      alert("Doctor created successfully!");
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(`Failed to create doctor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample descriptions for departments (fallback if API returns null)
  const fallbackDescriptions = {
    Cardiology: "Diagnosis and treatment of heart diseases",
    Neurology: "Diagnosis and treatment of nervous system disorders",
    Pulmonology: "Treatment of respiratory tract diseases",
    Gastroenterology: "Diagnosis of digestive system disorders",
    Endocrinology: "Treatment of hormone-related conditions",
    Nephrology: "Diagnosis and treatment of kidney diseases",
    Hematology: "Study and treatment of blood disorders",
    Rheumatology: "Treatment of autoimmune diseases",
    Dermatology: "Diagnosis and treatment of skin conditions",
    Psychiatry: "Treatment of mental health disorders",
  };

  // Function to fetch departments
  const fetchDepartments = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }
    fetch("https://backend-pg-cm2b.onrender.com/departments/doctor-counts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.success && Array.isArray(responseData.data)) {
          console.log("Fetched department doctor counts:", responseData.data);
          // Map the data to our expected format
          const enhancedData = responseData.data.map((dept) => ({
            id: dept.department_id,
            name: dept.department_name,
            description:
              dept.description ||
              fallbackDescriptions[dept.department_name] ||
              "Department description",
            doctor_count: dept.doctor_count,
            image: dept.image,
          }));
          setDepartments(enhancedData);
        } else {
          console.error("Invalid response format:", responseData);
        }
      })
      .catch((error) =>
        console.error("Error fetching departments data:", error)
      );
  };

  useEffect(() => {
    // Fetch departments with doctor counts
    fetchDepartments();
  }, []);

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate("/");
    window.location.reload();
  };

  const handleInputChange = (e) => {
    setNewDepartment({ ...newDepartment, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading state

    const formData = new FormData();
    formData.append("name", newDepartment.name);
    formData.append("description", newDepartment.description);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/departments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // FormData will automatically set Content-Type to multipart/form-data
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdDepartment = await response.json();

      // Add the new department with doctor count of 0
      const enhancedDepartment = {
        ...createdDepartment.department,
        doctor_count: 0,
        image: createdDepartment.department.image, // Use the full URL from response
      };

      setDepartments([...departments, enhancedDepartment]);
      setShowModal(false);
      setNewDepartment({ name: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
      alert("Department created successfully!");
    } catch (error) {
      console.error("Error adding department:", error);
      alert(`Failed to create department: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sorting function
  const sortedDepartments = React.useMemo(() => {
    let sortableDepartments = [...departments];
    sortableDepartments.sort((a, b) => {
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
    return sortableDepartments;
  }, [departments, sortConfig]);

  const filteredDepartments = sortedDepartments.filter(
    (department) =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate the current departments to display
  const indexOfLastDepartment = currentPage * departmentsPerPage;
  const indexOfFirstDepartment = indexOfLastDepartment - departmentsPerPage;
  const currentDepartments = filteredDepartments.slice(
    indexOfFirstDepartment,
    indexOfLastDepartment
  );
  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

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
    const maxPagesToShow = 5; // Number of pages to show at once
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

  // Handle viewing department details - navigate to details page
  const handleViewDetails = (department) => {
    setSelectedDepartmentId(department.id);
    setViewingDetails(true);
  };

  // Handle returning to departments list
  const handleBackToList = () => {
    setViewingDetails(false);
    setSelectedDepartmentId(null);
    // Refresh departments list when returning
    fetchDepartments();
  };

  const handleDeleteDepartment = (departmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?\nYOU CANNOT UNDO THIS ACTION"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    fetch(`https://backend-pg-cm2b.onrender.com/departments/${departmentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        setDepartments(departments.filter((dept) => dept.id !== departmentId));
        alert("Department deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting department:", error);
        alert("Failed to delete department.");
      });
  };

  // If viewing details, show the DepartmentDetails component
  if (viewingDetails) {
    return (
      <div className="department-details-container">
        <DepartmentDetails
          departmentId={selectedDepartmentId}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // Main departments list view
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
            <img src="/img/profile.png" alt="Profile" id="profile-image" />
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

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faUserMd} id="sidebar-icon" />
            <Link to="/doctors" className="sidebar-link">
              Doctors
            </Link>
          </button>

          <button className="sidebar-btn active-tab">
            <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
            <Link to="/departments" className="sidebar-link">
              Departments
            </Link>
          </button>
        </div>

        <button className="sidebar-btn logout" onClick={logout}>
          <img
            src="/img/material-symbols_logout.png"
            alt="Logout Icon"
            id="sidebar-icon"
          />
          <span className="login-link">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div id="main-content-appointment">
        <div className="bg-white rounded-lg p-6 shadow font-sans">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-black text-2xl font-semibold">
              Department Info
            </h1>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(true)} className="uButton">
                + Department
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center justify-end mb-6">
            <div id="search-container-1">
              <Search size={18} className="search-icon-1" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-input"
              />
            </div>
            <button id="filter-button-1">
              <Filter size={13} className="filter-icon-1" /> Filter
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table-content" style={{ marginTop: "0px" }}>
              <thead>
                <tr className="hover:bg-gray-50 bg-gray-100 text-[#242222]">
                  {[
                    { key: "name", label: "Department Name", width: "25%" },
                    { key: "description", label: "Description", width: "45%" },
                    {
                      key: "doctor_count",
                      label: "Total Doctors",
                      width: "15%",
                    },
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
                            <ChevronUp
                              size={16}
                              className="ml-1 text-[#595959]"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="ml-1 text-[#595959]"
                            />
                          ))}
                      </div>
                    </th>
                  ))}
                  <th className="p-4 text-left" style={{ width: "15%" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-gray-500">
                      There's no department yet.
                    </td>
                  </tr>
                ) : (
                  currentDepartments.map((department) => (
                    <tr
                      key={department.id}
                      className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-300"
                    >
                      <td className="p-4 text-start text-[#595959]">
                        {department.name}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {department.description}
                      </td>
                      <td className="p-4 text-start text-[#595959]">
                        {department.doctor_count}
                      </td>
                      <td className="p-4 flex items-center space-x-5">
                        <PenBox
                          size={20}
                          className="cursor-pointer text-[#3BA092] hover:text-[#2A7E6C]"
                          onClick={() => handleViewDetails(department)}
                          title="View Details"
                        />
                        <PlusIcon
                          size={20}
                          className="cursor-pointer text-blue-800 hover:text-blue-900"
                          onClick={() => handleOpenDoctorModal(department)}
                          title="Add Doctor to Department"
                        />
                        <Trash2
                          size={20}
                          className="cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteDepartment(department.id)}
                          title="Delete Department"
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

          {/* Create Department Modal */}
          {showModal && (
            <div className="modal-overlay"style={{paddingTop: '60px'}}>
              <div className="modal-container">
                <div className="modal-header text-[#242222]">
                  <h2>Create New Department</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="close-btn-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleFormSubmit} className="modal-form">
                  <div className="form-group text-[#242222]">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newDepartment.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter department name"
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Description</label>
                    <input
                      type="text"
                      name="description"
                      value={newDepartment.description}
                      onChange={handleInputChange}
                      placeholder="Enter department description"
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Department Image</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        id="department-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="department-image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 relative"
                      >
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Department preview"
                              className="w-full h-full object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 hover:opacity-100 text-white flex flex-col items-center">
                                <Upload size={24} className="mb-1" />
                                <span className="text-xs">Change Image</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                              Click or drag image to upload
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              (JPEG, PNG, max 5MB)
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                    {imageFile && (
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                        <span>{imageFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="submit-btn flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Department"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Create Doctor Modal */}
          {showDoctorModal && selectedDepartmentForDoctor && (
            <div className="modal-overlay"style={{paddingTop: '60px'}}>
  <div className="modal-container">
    <div className="modal-header text-[#242222]">
      <h2>Create New Doctor for {selectedDepartmentForDoctor.name}</h2>
      <button
        onClick={() => setShowDoctorModal(false)}
        className="close-btn-1"
      >
        <X size={16} />
      </button>
    </div>

    {/* Scrollable body */}
    <div className="modal-body">
      <form onSubmit={handleDoctorFormSubmit} className="modal-form">
        <div className="form-group text-[#242222]">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={newDoctor.name}
            onChange={handleDoctorInputChange}
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
            onChange={handleDoctorInputChange}
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
            onChange={handleDoctorInputChange}
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
            onChange={handleDoctorInputChange}
            required
            placeholder="Enter specialization"
          />
        </div>
        <div className="form-group text-[#242222]">
          <label>Status</label>
          <select
            name="status"
            value={newDoctor.status}
            onChange={handleDoctorInputChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <input
          type="hidden"
          name="department_id"
          value={selectedDepartmentForDoctor.id}
        />
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Doctor"}
        </button>
      </form>
    </div>
  </div>
</div>

          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;