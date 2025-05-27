import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrashAlt,
  faEdit,
  faUpload,
  faBell,
  faUser,
  faCalendarAlt,
  faFileMedical,
  faUserMd,
  faHospital,
  faCalendarDay,
  faExclamationTriangle,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/doctordetails.css";

const DoctorDetails = ({ doctorId, onBack }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // New states for schedules
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    schedule_id: null,
  });

  const [addScheduleLoading, setAddScheduleLoading] = useState(false);
  const [addScheduleError, setAddScheduleError] = useState(null);

  const [profileImage, setProfileImage] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);

  // Days for dropdown
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch doctor details and image on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Auth Token:", token);
        if (!token) throw new Error("No authentication token found");
        // Fetch doctor schedules
        const scheduleResponse = await fetch(
          `https://backend-pg-cm2b.onrender.com/schedule/doctor/${doctorId}`
        );

        if (!scheduleResponse.ok) {
          throw new Error("Failed to fetch doctor schedules");
        }

        const scheduleData = await scheduleResponse.json();

        // Fetch doctor details including image URL
        const doctorResponse = await fetch(
          `https://backend-pg-cm2b.onrender.com/doctors/${doctorId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!doctorResponse.ok) {
          throw new Error("Failed to fetch doctor details");
        }

        const doctorData = await doctorResponse.json();

        // Combine the data
        setDoctor({
          ...scheduleData.doctor,
          imageUrl: doctorData.imageUrl,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  // Method to handle image upload
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

    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setImageUploadError("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/image/upload/${doctorId}`,
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

      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        imageUrl: responseData.imageUrl,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      setImageUploadError(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageUploadError(error.message);
    }
  };

  // Method to remove profile image
  const handleRemoveImage = async () => {
    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/image/delete/${doctorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove image");
      }

      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        imageUrl: null,
      }));

      setProfileImage(null);
      setImageUploadError(null);
    } catch (error) {
      console.error("Error removing image:", error);
      setImageUploadError(error.message);
    }
  };

  // Handle navigation back to doctors list
  const handleBack = () => {
    // setSelectedDoctorId(null);
    // setCurrentRoute("doctors");
    onBack(); // Simply call the onBack callback
  };

  // Open delete confirmation modal
  const handleDeleteTimeSlot = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setDeleteError(null);
  };

  // Confirm and execute time slot deletion
  const confirmDeleteTimeSlot = async () => {
    if (!selectedTimeSlot) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/schedule/doctor/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day_of_week: selectedTimeSlot.day_of_week,
            start_time: selectedTimeSlot.start_time,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete time slot");
      }

      const updatedSchedules = doctor.schedules.filter(
        (schedule) =>
          schedule.day_of_week !== selectedTimeSlot.day_of_week ||
          schedule.start_time !== selectedTimeSlot.start_time
      );

      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        schedules: updatedSchedules,
      }));

      setSelectedTimeSlot(null);
    } catch (error) {
      console.error("Error deleting time slot:", error);
      setDeleteError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel time slot deletion
  const cancelDeleteTimeSlot = () => {
    setSelectedTimeSlot(null);
    setDeleteError(null);
  };

  // Method to handle opening add schedule modal
  const handleAddNewSchedule = () => {
    setIsAddingSchedule(true);
    setAddScheduleError(null);
    setNewSchedule({
      day_of_week: "",
      start_time: "",
      end_time: "",
    });
  };

  // Method to handle opening edit schedule modal
  const handleEditSchedule = (schedule) => {
    setIsEditingSchedule(true);
    setAddScheduleError(null);
    setNewSchedule({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      schedule_id: schedule.schedule_id,
    });
  };

  // Method to update new/edit schedule state
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Method to cancel adding schedule
  const cancelAddSchedule = () => {
    setIsAddingSchedule(false);
    setAddScheduleError(null);
  };

  // Method to cancel editing schedule
  const cancelEditSchedule = () => {
    setIsEditingSchedule(false);
    setAddScheduleError(null);
  };

  // Method to confirm and add new schedule
  const confirmAddSchedule = async () => {
    if (
      !newSchedule.day_of_week ||
      !newSchedule.start_time ||
      !newSchedule.end_time
    ) {
      setAddScheduleError("Please fill in all schedule fields");
      return;
    }

    setAddScheduleLoading(true);
    setAddScheduleError(null);

    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/schedule/doctor/${doctorId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day_of_week: newSchedule.day_of_week,
            start_time: newSchedule.start_time + ":00",
            end_time: newSchedule.end_time + ":00",
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add time slot");
      }

      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        schedules: [
          ...(prevDoctor.schedules || []),
          {
            day_of_week: newSchedule.day_of_week,
            start_time: newSchedule.start_time,
            end_time: newSchedule.end_time,
          },
        ],
      }));

      setIsAddingSchedule(false);
    } catch (error) {
      console.error("Error adding time slot:", error);
      setAddScheduleError(error.message);
    } finally {
      setAddScheduleLoading(false);
    }
  };

  // Method to confirm and update schedule
  const confirmUpdateSchedule = async () => {
    if (
      !newSchedule.day_of_week ||
      !newSchedule.start_time ||
      !newSchedule.end_time ||
      !newSchedule.schedule_id
    ) {
      console.error("Validation failed", {
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        schedule_id: newSchedule.schedule_id,
      });
      setAddScheduleError("Please fill in all schedule fields");
      return;
    }

    const formatTimeToHHmmss = (time) => {
      if (time.split(":").length === 3) {
        return time;
      }

      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}:00`;
    };

    setAddScheduleLoading(true);
    setAddScheduleError(null);

    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/schedule/doctor/id=${doctorId}/schedule/id=${newSchedule.schedule_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day_of_week: newSchedule.day_of_week,
            start_time: formatTimeToHHmmss(newSchedule.start_time),
            end_time: formatTimeToHHmmss(newSchedule.end_time),
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update time slot");
      }

      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        schedules: prevDoctor.schedules.map((schedule) =>
          schedule.schedule_id === newSchedule.schedule_id
            ? {
                ...schedule,
                day_of_week: newSchedule.day_of_week,
                start_time: formatTimeToHHmmss(newSchedule.start_time).slice(
                  0,
                  5
                ),
                end_time: formatTimeToHHmmss(newSchedule.end_time).slice(0, 5),
              }
            : schedule
        ),
      }));

      setIsEditingSchedule(false);
    } catch (error) {
      console.error("Error updating time slot:", error);
      setAddScheduleError(error.message);
    } finally {
      setAddScheduleLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="doctor-details-container">
        <button onClick={handleBack} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} className="back-button-icon" />
          Back to Doctors
        </button>
        <div className="loading-state">Loading doctor details...</div>
      </div>
    );
  }

  // Error state
  if (error || !doctor) {
    return (
      <div className="doctor-details-container">
        <button onClick={handleBack} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} className="back-button-icon" />
          Back to Doctors
        </button>
        <div className="error-state">
          {error || "Doctor not found or error loading details."}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-circle"></div>
          <span className="mfu-text">MFU </span>
          <span className="wellness-text">Wellness Center</span>
        </div>
        <div className="navbar-right">
          <button className="notification-btn">
            <FontAwesomeIcon icon={faBell} className="icon" />
          </button>
          <div className="profile">
            <img
              src="/img/profile.png"
              alt="Profile"
              className="profile-image"
            />
            <span className="profile-name">Admin</span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-container">
          <button className="sidebar-btn">
            <img
              src="/img/ChartLineUp.png"
              alt="Dashboard Icon"
              className="sidebar-icon"
            />{" "}
            <Link to="/admindashboard" className="sidebar-link">
              Dashboard
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
            <Link to="/patient" className="sidebar-link">
              Patients
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarAlt} className="sidebar-icon" />
            <Link to="/appointments" className="sidebar-link">
              Appointments
            </Link>
          </button>

          <button className="sidebar-btn active-tab">
            <FontAwesomeIcon icon={faUserMd} className="sidebar-icon" />
            <Link to="/doctors" className="sidebar-link">
              Doctors
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faFileMedical} className="sidebar-icon" />
            <Link to="/recommendations" className="sidebar-link">
              Recommendations
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faHospital} className="sidebar-icon" />
            <Link to="/departments" className="sidebar-link">
              Departments
            </Link>
          </button>

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarDay} className="sidebar-icon" />
            <Link to="/schedules" className="sidebar-link">
              Schedules
            </Link>
          </button>
        </div>

        <button className="sidebar-btn logout">
          <img
            src="/img/material-symbols_logout.png"
            alt="Logout Icon"
            className="sidebar-icon"
          />
          <Link to="/" className="login-link">
            Logout
          </Link>
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <div className="doctor-details-container">
          {/* Back Button */}
          <button onClick={handleBack} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} className="back-button-icon" />
            Back to Doctors
          </button>

          <div className="detail-card">
            {/* Profile Header Section */}
            <div className="profile-header">
              <div className="profile-image-container">
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="profile-image-wrapper"
                >
                  <img
                    src={
                      profileImage ||
                      doctor.imageUrl ||
                      "/api/placeholder/120/120"
                    }
                    className="profile-image text-gray-800"
                    alt="Doctor profile"
                  />
                  <div className="profile-image-overlay">
                    <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                    <span>Upload Photo</span>
                  </div>
                </label>
                {(profileImage || doctor.imageUrl) && (
                  <button
                    onClick={handleRemoveImage}
                    className="remove-image-button"
                    title="Remove profile image"
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
                <h1 className="doctor-name text-gray-500">{doctor.name}</h1>
                <p className="doctor-specialization">{doctor.specialization}</p>
                <div className="contact-info">
                  <p>Email: {doctor.email}</p>
                  <p>Phone: {doctor.phone_no}</p>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="card-section">
              <div className="card-header">
                <h2 className="card-title text-gray-700">
                  Current Schedule Overview
                </h2>
                <button className="add-button" onClick={handleAddNewSchedule}>
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                  Add New Schedule
                </button>
              </div>
              <div className="card-content">
                {doctor.schedules && doctor.schedules.length > 0 ? (
                  <table className="schedule-table">
                    <tbody>
                      {doctor.schedules.map((schedule, index) => (
                        <tr key={index} className="schedule-row">
                          <td className="schedule-day text-gray-500">
                            {schedule.day_of_week}
                          </td>
                          <td className="schedule-times text-gray-600">
                            {schedule.start_time} - {schedule.end_time}
                          </td>
                          <td className="schedule-actions">
                            <div className="action-buttons">
                              <button
                                className="icon-button text-blue-500"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="icon-button text-red-500"
                                onClick={() => handleDeleteTimeSlot(schedule)}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    No schedule information available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {selectedTimeSlot && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Delete Time Slot
                </h2>
                <p className="mb-4 text-gray-600">
                  Are you sure you want to delete the following time slot?
                </p>

                <div className="bg-red-50 p-4 rounded-md mb-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-red-400 mr-2"
                    />
                    <span className="text-red-800 font-medium">Warning</span>
                  </div>
                  <p className="text-red-600 text-sm">
                    This action cannot be undone. The time slot will be
                    permanently removed from the schedule.
                  </p>
                </div>

                {deleteError && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{deleteError}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    onClick={cancelDeleteTimeSlot}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 text-white rounded-md ${
                      deleteLoading
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={confirmDeleteTimeSlot}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete Time Slot"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Schedule Modal */}
          {isAddingSchedule && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Add New Schedule
                </h2>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Day</label>
                  <select
                    name="day_of_week"
                    value={newSchedule.day_of_week}
                    onChange={handleScheduleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-600"
                  >
                    <option value="">Choose a day</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex mb-4 space-x-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={newSchedule.start_time}
                      onChange={handleScheduleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-600"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={newSchedule.end_time}
                      onChange={handleScheduleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-600"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      className="text-blue-400 mr-2"
                    />
                    <span className="text-blue-800 font-medium">
                      Schedule Info
                    </span>
                  </div>
                  <p className="text-blue-600 text-sm">
                    This will add a new time slot to the doctor's schedule.
                  </p>
                </div>

                {addScheduleError && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{addScheduleError}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    onClick={cancelAddSchedule}
                    disabled={addScheduleLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 text-white rounded-md ${
                      addScheduleLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={confirmAddSchedule}
                    disabled={addScheduleLoading}
                  >
                    {addScheduleLoading ? "Adding..." : "Add Schedule"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Schedule Modal */}
          {isEditingSchedule && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Update Schedule
                </h2>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Day</label>
                  <select
                    name="day_of_week"
                    value={newSchedule.day_of_week}
                    onChange={handleScheduleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-600"
                  >
                    <option value="">Choose a day</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex mb-4 space-x-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={newSchedule.start_time}
                      onChange={handleScheduleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-600"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={newSchedule.end_time}
                      onChange={handleScheduleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-600"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      className="text-blue-400 mr-2"
                    />
                    <span className="text-blue-800 font-medium">
                      Schedule Update
                    </span>
                  </div>
                  <p className="text-blue-600 text-sm">
                    This will update the existing time slot in the doctor's
                    schedule.
                  </p>
                </div>

                {addScheduleError && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{addScheduleError}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    onClick={cancelEditSchedule}
                    disabled={addScheduleLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 text-white rounded-md ${
                      addScheduleLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={confirmUpdateSchedule}
                    disabled={addScheduleLoading}
                  >
                    {addScheduleLoading ? "Updating..." : "Update Schedule"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
