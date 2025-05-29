import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import "../../styles/doctorDashboard.css";
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

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentDetails, setDepartmentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
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
      const response = await fetch("https://backend-pg-cm2b.onrender.com/doctors", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDoctor),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdDoctor = await response.json();

      // Refresh department details if we're viewing that department
      if (
        showDetailModal &&
        departmentDetails?.id === selectedDepartmentForDoctor?.id
      ) {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const updatedResponse = await fetch(
          `https://backend-pg-cm2b.onrender.com/departments/${departmentDetails.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const updatedData = await updatedResponse.json();
        setDepartmentDetails(updatedData);
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

  useEffect(() => {
    if (departmentDetails?.image && showDetailModal) {
      // Be more specific to target the department image
      const imgElement = document.querySelector(".department-image");
      if (imgElement) {
        console.log(
          "Image dimensions check:",
          imgElement.getBoundingClientRect()
        );
        console.log("Image natural dimensions:", {
          naturalWidth: imgElement.naturalWidth,
          naturalHeight: imgElement.naturalHeight,
        });
      }
    }
  }, [departmentDetails, showDetailModal]);
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate('/');
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

  // Handle image upload for existing department
  const handleDepartmentImageUpload = (departmentId, file) => {
    if (!file) return;
    setIsImageUploading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    fetch(`https://backend-pg-cm2b.onrender.com/departments/image/upload/${departmentId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Image upload successful, response:", data);

        // Use whichever URL is available, with preference for the full URL
        const imageUrl = data.imageUrl || data.image;

        // Ensure we have a full URL
        const fullImageUrl = imageUrl.startsWith("https")
          ? imageUrl
          : `https://backend-pg-cm2b.onrender.com/${
              imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl
            }`;

        console.log("Setting new image URL:", fullImageUrl);

        // Update both state values with the same full URL
        setDepartmentDetails((prevDetails) => ({
          ...prevDetails,
          image: fullImageUrl,
          imageUrl: fullImageUrl,
        }));

        setDepartments((prevDepartments) =>
          prevDepartments.map((dept) =>
            dept.id === departmentId ? { ...dept, image: fullImageUrl } : dept
          )
        );

        setIsImageUploading(false);
        alert("Department image updated successfully");
      })
      .catch((error) => {
        console.error("Error uploading department image:", error);
        setIsImageUploading(false);
        alert("Failed to upload department image. Please try again.");
      });
  };

  // Handle image deletion for department
  const deleteDepartmentImage = (departmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this department image?"
    );
    if (!confirmDelete) return;

    setIsImageUploading(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    fetch(`https://backend-pg-cm2b.onrender.com/departments/image/delete/${departmentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Image deletion successful:", data);

        // Update the department details with no image
        setDepartmentDetails({
          ...departmentDetails,
          image: null,
        });

        // Also update the department in the departments list
        setDepartments(
          departments.map((dept) =>
            dept.id === departmentId ? { ...dept, image: null } : dept
          )
        );

        setIsImageUploading(false);

        // Show success message
        alert("Department image removed successfully");
      })
      .catch((error) => {
        console.error("Error deleting department image:", error);
        setIsImageUploading(false);
        alert("Failed to remove department image. Please try again.");
      });
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
      const response = await fetch("https://backend-pg-cm2b.onrender.com/departments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // FormData will automatically set Content-Type to multipart/form-data
      });

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

  // Update the handleViewDetails function to use the imageUrl
  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    // Fetch department details including doctors
    fetch(`https://backend-pg-cm2b.onrender.com/departments/${department.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Department details:", data);

        // Always prioritize the full URL if available
        if (data.imageUrl) {
          // Use the full URL directly
          data.image = data.imageUrl;
        }
        // If only a relative path is provided, construct the full URL
        else if (data.image && !data.image.startsWith("https")) {
          data.image = `https://backend-pg-cm2b.onrender.com/${
            data.image.startsWith("/") ? data.image.substring(1) : data.image
          }`;
        }

        console.log("Final image URL set:", data.image);
        setDepartmentDetails(data);
        setShowDetailModal(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching department details:", error);
        setIsLoading(false);
        alert("Failed to fetch department details.");
      });
  };

  const handleDeleteDepartment = (departmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?\nYOU CANNOT UNDO THIS ACTION"
    );
    if (!confirmDelete) return;

    fetch(`https://backend-pg-cm2b.onrender.com/departments/${departmentId}`, {
      method: "DELETE",
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

          <button className="sidebar-btn">
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

          <button className="sidebar-btn active-tab">
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
      <div className="main-content-department">
        <div
          className="table-container p-6 font-sans"
          style={{ marginTop: "150px" }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-black">Department Info</h1>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(true)} className="uButton">
                + Department
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex items-center border border-gray-300 rounded-full w-[200px] h-8 px-3 py-2 mr-4 bg-[#E8F9F1]">
              <Search size={18} className="text-[#3BA092]" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-2 outline-none bg-transparent w-full placeholder-[#969696] text-[#969696]"
              />
            </div>
            <button className="flex items-center bg-transparent border rounded-full border-[#3BA092] w-[158px] h-8 px-4 py-2 rounded hover:bg-gray-50 text-xs text-[#969696]">
              <Filter size={18} className="mr-2 text-[#3BA092]" /> Filter by
              Date
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
            <div className="modal-overlay">
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
                      //type="text"
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
                      //type="text"
                      name="description"
                      value={newDepartment.description}
                      onChange={handleInputChange}
                      required
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

          {/* Department Details Modal */}
          {showDetailModal && departmentDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Department Details
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-t-teal-600 border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
                        <span className="text-gray-500">
                          Loading department details...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Department Header */}
                      <div className="flex items-start mb-8 gap-6">
                        {/* Department Image with Upload Option */}
                        <div className="flex-shrink-0">
                          <div className="relative cursor-pointer group">
                            {isImageUploading ? (
                              <div className="w-28 h-28 bg-gray-100 rounded-lg shadow-sm flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-t-teal-600 border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
                              </div>
                            ) : departmentDetails.image ? (
                              <img
                                src={
                                  departmentDetails.imageUrl ||
                                  (departmentDetails.image &&
                                  departmentDetails.image.startsWith("http")
                                    ? departmentDetails.image
                                    : departmentDetails.image
                                    ? `https://backend-pg-cm2b.onrender.com/${
                                        departmentDetails.image.startsWith("/")
                                          ? departmentDetails.image.substring(1)
                                          : departmentDetails.image
                                      }`
                                    : "/api/placeholder/120/120")
                                }
                                alt={departmentDetails.name}
                                className="w-40 h-40 object-contain rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/api/placeholder/120/120";
                                }}
                              />
                            ) : (
                              <div className="w-28 h-28 bg-gray-100 rounded-lg shadow-sm flex items-center justify-center">
                                <span className="text-xs text-gray-400">
                                  No Image
                                </span>
                              </div>
                            )}

                            {/* Image Upload Overlay - Only show if not currently uploading */}
                            {!isImageUploading && (
                              <label
                                htmlFor="department-image-upload"
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer"
                              >
                                <div className="opacity-0 group-hover:opacity-100 text-white flex flex-col items-center transition-opacity duration-200">
                                  <Upload size={20} className="mb-1" />
                                  <span className="text-xs font-medium">
                                    Update Image
                                  </span>
                                </div>
                              </label>
                            )}
                            <input
                              type="file"
                              id="department-image-upload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleDepartmentImageUpload(
                                    departmentDetails.id,
                                    file
                                  );
                                }
                              }}
                              disabled={isImageUploading}
                            />
                          </div>
                          {departmentDetails.image && !isImageUploading && (
                            <button
                              className="mt-2 text-xs text-teal-600 flex items-center justify-center w-full bg-transparent border-none cursor-pointer hover:text-teal-700 transition-colors"
                              onClick={() =>
                                deleteDepartmentImage(departmentDetails.id)
                              }
                            >
                              <Trash2 size={12} className="mr-1" />
                              Remove Image
                            </button>
                          )}
                        </div>

                        {/* Department Info */}
                        <div className="flex-grow">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {departmentDetails.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {departmentDetails.description ||
                              "No description available"}
                          </p>
                          <div className="flex gap-4">
                            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 flex items-center">
                              <span className="font-medium mr-1">ID:</span>{" "}
                              {departmentDetails.id}
                            </div>
                            <div className="px-3 py-1 bg-teal-50 rounded-full text-sm text-teal-700 flex items-center">
                              <User size={14} className="mr-1" />
                              <span className="font-medium mr-1">
                                Doctors:
                              </span>{" "}
                              {departmentDetails.doctors
                                ? departmentDetails.doctors.length
                                : 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Doctors Section */}
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <User size={18} className="mr-2 text-teal-600" />
                          Doctors in Department
                        </h4>

                        {departmentDetails.doctors &&
                        departmentDetails.doctors.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {departmentDetails.doctors.map((doctor, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-5 transition-all duration-200 bg-white hover:shadow-md cursor-pointer"
                              >
                                <p className="font-semibold text-gray-800 mb-3 text-lg">
                                  {doctor.name}
                                </p>

                                <div className="mt-2 text-sm">
                                  <p className="text-gray-700 flex items-center mb-2">
                                    <Award
                                      size={14}
                                      className="mr-2 text-teal-600 flex-shrink-0"
                                    />
                                    <span className="text-gray-500 mr-1">
                                      Specialization:
                                    </span>{" "}
                                    {doctor.specialization}
                                  </p>

                                  <p className="text-gray-700 flex items-center mb-2">
                                    <Mail
                                      size={14}
                                      className="mr-2 text-teal-600 flex-shrink-0"
                                    />
                                    <span className="text-gray-500 mr-1">
                                      Email:
                                    </span>
                                    <a
                                      href={`mailto:${doctor.email}`}
                                      className="text-teal-600 underline hover:text-teal-700"
                                    >
                                      {doctor.email}
                                    </a>
                                  </p>

                                  <p className="text-gray-700 flex items-center">
                                    <Phone
                                      size={14}
                                      className="mr-2 text-teal-600 flex-shrink-0"
                                    />
                                    <span className="text-gray-500 mr-1">
                                      Phone:
                                    </span>{" "}
                                    {doctor.phone_no}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <div className="text-gray-400 mb-2">
                              <User size={24} className="mx-auto mb-2" />
                            </div>
                            <p className="text-gray-500">
                              No doctors assigned to this department.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Doctor Modal */}
          {showDoctorModal && selectedDepartmentForDoctor && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header text-[#242222]">
                  <h2>
                    Create New Doctor for {selectedDepartmentForDoctor.name}
                  </h2>
                  <button
                    onClick={() => setShowDoctorModal(false)}
                    className="close-btn-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleDoctorFormSubmit} className="modal-form">
                  <div className="form-group text-[#242222]">
                    <label>Name</label>
                    <input
                      //type="text"
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
                      //type="text"
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
                      //type="email"
                      name="email"
                      value={newDoctor.email}
                      onChange={handleDoctorInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  {/* <div className="form-group text-[#242222]">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={newDoctor.password}
                  onChange={handleDoctorInputChange}
                  required
                  placeholder="Enter password"
                />
              </div> */}
                  <div className="form-group text-[#242222]">
                    <label>Specialization</label>
                    <input
                      //type="text"
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
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Doctor"}
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

export default Departments;
