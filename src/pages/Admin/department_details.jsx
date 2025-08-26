import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronLeft } from "lucide-react";
import {
  faBell,
  faUser,
  faCalendarAlt,
  faUserMd,
  faHospital,
  faTrashAlt,
  faUpload,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  Trash2,
  X,
  Upload,
  User,
  Mail,
  Phone,
  Award,
  PlusIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./styles/department_details.css";


const DepartmentDetails = ({ departmentId, onBack }) => {
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);

  // New doctor modal states
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    phone_no: "",
    email: "",
    specialization: "",
    status: "active",
    department_id: "",
  });
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);

  // Fetch department details on component mount
  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `https://backend-pg-cm2b.onrender.com/departments/${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch department details");
        }

        const data = await response.json();

        // Handle image URL properly
        if (data.imageUrl) {
          data.image = data.imageUrl;
        } else if (data.image && !data.image.startsWith("https")) {
          data.image = `https://backend-pg-cm2b.onrender.com/${
            data.image.startsWith("/") ? data.image.substring(1) : data.image
          }`;
        }

        setDepartment(data);
        setNewDoctor((prev) => ({ ...prev, department_id: departmentId }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching department details:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDepartmentDetails();
  }, [departmentId]);

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate("/");
    window.location.reload();
  };

  // Handle navigation back to departments list
  const handleBack = () => {
    onBack();
  };

  // Handle image upload for department
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setImageUploadError(
        "Invalid file type. Please upload a JPEG, PNG, or GIF."
      );
      return;
    }

    if (file.size > maxSize) {
      setImageUploadError("File is too large. Maximum size is 5MB.");
      return;
    }

    setIsImageUploading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setImageUploadError("Authentication token not found.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/departments/image/upload/${departmentId}`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const responseData = await response.json();
      const imageUrl = responseData.imageUrl || responseData.image;
      const fullImageUrl = imageUrl.startsWith("https")
        ? imageUrl
        : `https://backend-pg-cm2b.onrender.com/${
            imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl
          }`;

      setDepartment((prevDepartment) => ({
        ...prevDepartment,
        image: fullImageUrl,
        imageUrl: fullImageUrl,
      }));

      setImageUploadError(null);
      setIsImageUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageUploadError(error.message);
      setIsImageUploading(false);
    }
  };

  // Handle image deletion for department
  const handleRemoveImage = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this department image?"
    );
    if (!confirmDelete) return;

    setIsImageUploading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setImageUploadError("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/departments/image/delete/${departmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove image");
      }

      setDepartment((prevDepartment) => ({
        ...prevDepartment,
        image: null,
        imageUrl: null,
      }));

      setImageUploadError(null);
      setIsImageUploading(false);
    } catch (error) {
      console.error("Error removing image:", error);
      setImageUploadError(error.message);
      setIsImageUploading(false);
    }
  };

  // Handle doctor modal
  const handleOpenDoctorModal = () => {
    setShowDoctorModal(true);
  };

  const handleDoctorInputChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const handleDoctorFormSubmit = async (e) => {
    e.preventDefault();
    setIsDoctorLoading(true);

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

      // Refresh department details to show new doctor
      const updatedResponse = await fetch(
        `https://backend-pg-cm2b.onrender.com/departments/${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const updatedData = await updatedResponse.json();

      // Handle image URL for updated data
      if (updatedData.imageUrl) {
        updatedData.image = updatedData.imageUrl;
      } else if (updatedData.image && !updatedData.image.startsWith("https")) {
        updatedData.image = `https://backend-pg-cm2b.onrender.com/${
          updatedData.image.startsWith("/")
            ? updatedData.image.substring(1)
            : updatedData.image
        }`;
      }

      setDepartment(updatedData);
      setShowDoctorModal(false);
      setNewDoctor({
        name: "",
        phone_no: "",
        email: "",
        specialization: "",
        status: "active",
        department_id: departmentId,
      });
      alert("Doctor created successfully!");
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(`Failed to create doctor: ${error.message}`);
    } finally {
      setIsDoctorLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="department-details-container">
        <div className="loading-state">Loading department details...</div>
      </div>
    );
  }

  // Error state
  if (error || !department) {
    return (
      <div className="department-details-container">
        <button onClick={handleBack} className="back-button">
          <ChevronLeft size={20} className="mr-1" />
          Back to Departments
        </button>
        <div className="error-state">
          {error || "Department not found or error loading details."}
        </div>
      </div>
    );
  }

  return (
    <div className="department-details-container">
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
              />
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
        <div id="main-content-department-details">
          <div className="bg-white rounded-lg p-6 shadow font-sans">
            {/* Back Button */}
            <button onClick={handleBack} className="back-button mb-2">
              <ChevronLeft size={20} className="mr-1" />
              Back to Departments
            </button>

            <div className="detail-card">
              {/* Department Header Section */}
              <div className="profile-header">
                <div className="profile-image-container">
                  <input
                    type="file"
                    id="department-image-upload"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="department-image-upload"
                    className="profile-image-wrapper"
                  >
                    <img
                      src={department.image || "/api/placeholder/120/120"}
                      className="profile-image text-gray-800"
                      alt="Department"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/120/120";
                      }}
                    />
                    <div className="profile-image-overlay">
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="upload-icon"
                      />
                      <span>Upload Photo</span>
                    </div>
                  </label>
                  {department.image && !isImageUploading && (
                    <button
                      onClick={handleRemoveImage}
                      className="remove-image-button"
                      title="Remove department image"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  )}
                </div>
                {imageUploadError && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2"
                    role="alert"
                  >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{imageUploadError}</span>
                  </div>
                )}

                <div className="profile-info">
                  <h1 className="doctor-name text-gray-500">
                    {department.name}
                  </h1>
                  <p className="doctor-specialization">
                    {department.description || "No description available"}
                  </p>
                  <div className="contact-info">
                    <p>Department ID: {department.id}</p>
                    <p>
                      Total Doctors:{" "}
                      {department.doctors ? department.doctors.length : 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctors Section */}
              <div className="card-section">
                <div className="card-header">
                  <h2 className="card-title text-gray-700">
                    Doctors in Department
                  </h2>
                  <button
                    className="add-button"
                    onClick={handleOpenDoctorModal}
                  >
                    <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                    Add New Doctor
                  </button>
                </div>
                <div className="card-content">
                  {department.doctors && department.doctors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {department.doctors.map((doctor, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-5 transition-all duration-200 bg-white hover:shadow-md"
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
                              <span className="text-gray-500 mr-1">Email:</span>
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
                              <span className="text-gray-500 mr-1">Phone:</span>{" "}
                              {doctor.phone_no}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      No doctors assigned to this department.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Create Doctor Modal */}
            {showDoctorModal && (
              <div className="modal-overlay">
                <div className="modal-container">
                  <div className="modal-header text-[#242222]">
                    <h2>Create New Doctor for {department.name}</h2>
                    <button
                      onClick={() => setShowDoctorModal(false)}
                      className="close-btn-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <form
                    onSubmit={handleDoctorFormSubmit}
                    className="modal-form"
                  >
                    <div className="form-group text-[#242222]">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newDoctor.name}
                        onChange={handleDoctorInputChange}
                        required
                        placeholder="Enter doctor's name"
                        style={{ width: "95%" }}
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
                        style={{ width: "95%" }}
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
                        style={{ width: "95%" }}
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
                        style={{ width: "95%" }}
                      />
                    </div>
                    <div className="form-group text-[#242222]">
                      <label>Status</label>
                      <select
                        name="status"
                        value={newDoctor.status}
                        onChange={handleDoctorInputChange}
                        required
                        style={{ width: "100%" }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isDoctorLoading}
                    >
                      {isDoctorLoading ? "Creating..." : "Create Doctor"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;
