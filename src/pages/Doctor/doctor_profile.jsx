import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { X } from "lucide-react";
import { useDoctorProfile } from "../Doctor/hooks/useDoctorProfile";

const DoctorProfile = () => {
  const { doctorData, loading, error } = useDoctorProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedule, setSchedule] = useState({});
  const [tempSchedule, setTempSchedule] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editFormData, setEditFormData] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });
  const [addFormData, setAddFormData] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12) => {
    const [time, period] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}:00`;
  };

  // Generate time slots between start and end time
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const start = convertTo12Hour(startTime);
    const end = convertTo12Hour(endTime);

    let currentIndex = timeSlots.indexOf(start);
    const endIndex = timeSlots.indexOf(end);

    while (currentIndex < endIndex && currentIndex !== -1) {
      slots.push(timeSlots[currentIndex]);
      currentIndex++;
    }

    return slots;
  };

  // Load schedule from doctorData
  useEffect(() => {
    if (doctorData?.schedules) {
      const formattedSchedule = {};

      doctorData.schedules.forEach((scheduleItem) => {
        const day = scheduleItem.day_of_week;
        const slots = generateTimeSlots(
          scheduleItem.start_time,
          scheduleItem.end_time
        );
        formattedSchedule[day] = slots;
      });

      setSchedule(formattedSchedule);
    }
  }, [doctorData]);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    if (!currentPassword || !newPassword) {
      alert("Please fill in all fields!");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/login/doctors/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      alert("An error occurred while updating password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const openScheduleModal = () => {
    setTempSchedule(JSON.parse(JSON.stringify(schedule)));
    setShowScheduleModal(true);
  };

  const toggleTimeSlot = (day, time) => {
    setTempSchedule((prev) => {
      const daySchedule = prev[day] || [];
      if (daySchedule.includes(time)) {
        return {
          ...prev,
          [day]: daySchedule.filter((t) => t !== time),
        };
      } else {
        return {
          ...prev,
          [day]: [...daySchedule, time].sort((a, b) => {
            const timeA =
              parseInt(a.split(":")[0]) +
              (a.includes("PM") && !a.includes("12") ? 12 : 0);
            const timeB =
              parseInt(b.split(":")[0]) +
              (b.includes("PM") && !b.includes("12") ? 12 : 0);
            return timeA - timeB;
          }),
        };
      }
    });
  };

  const saveSchedule = async () => {
    // Validate input
    if (!addFormData.day || addFormData.day === "Choose a day") {
      alert("Please select a day");
      return;
    }
    if (!addFormData.startTime || !addFormData.endTime) {
      alert("Please select both start and end time");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      // Convert times to HH:MM:SS format
      const formattedData = {
        day_of_week: addFormData.day,
        start_time: addFormData.startTime + ":00",
        end_time: addFormData.endTime + ":00",
      };

      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/doctors/schedules",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Schedule added successfully!");
        setShowScheduleModal(false);
        // Reset form
        setAddFormData({ day: "", startTime: "", endTime: "" });
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(data.error || "Failed to add schedule");
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
      alert("An error occurred while adding the schedule. Please try again.");
    }
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setEditFormData({
      day: schedule.day_of_week,
      startTime: schedule.start_time.slice(0, 5), // Format HH:MM
      endTime: schedule.end_time.slice(0, 5),
    });
    setShowEditModal(true);
  };

  const saveEditSchedule = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Convert times to HH:MM:SS format
      const formattedData = {
        day_of_week: editFormData.day,
        start_time: editFormData.startTime + ":00",
        end_time: editFormData.endTime + ":00",
      };

      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/doctors/schedules/${selectedSchedule.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Schedule updated successfully!");
        setShowEditModal(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(data.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("An error occurred while updating the schedule. Please try again.");
    }
  };

  const deleteSchedule = async (scheduleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this schedule?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/doctors/schedules/${scheduleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Schedule deleted successfully!");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("An error occurred while deleting the schedule. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    setIsUploadingImage(true);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/doctors/profile/upload",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // If not JSON, get text response
        const text = await response.text();
        console.error("Non-JSON response:", text);
        data = { error: text || "Server error occurred" };
      }

      if (response.ok) {
        alert("Profile picture updated successfully!");
        // Reset states
        setSelectedImage(null);
        setImagePreview(null);
        // Refresh the page to show updated image
        window.location.reload();
      } else {
        alert(data.error || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const cancelImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="app">
        {/* Navbar */}
        <Navbar />

        {/* Sidebar */}
        <Sidebar activeTab="profile" />

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
                Loading Information
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
  if (error || !doctorData) {
    return (
      <div className="app">
        {/* Navbar */}
        <Navbar />

        {/* Sidebar */}
        <Sidebar activeTab="profile" />

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
                {error ? "Unable to Load Data" : "Doctor Not Found"}
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
                  ? `We encountered an error while loading your information.`
                  : "The data you're looking for could not be found."}
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
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                >
                  Try Again
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

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar activeTab="profile" />

      {/* Main Content */}
      <div
        className="p-8"
        style={{
          paddingLeft: "240px",
          paddingTop: "120px",
          paddingRight: "20px",
          paddingBottom: "20px",
        }}
      >
        <div className="bg-white rounded-lg border-2 border-cyan-400 p-8">
          {/* Profile and Info Section */}
          <div className="mb-8">
            <div style={{ display: "flex", gap: "2rem" }}>
              {/* Profile Picture */}
              <div style={{ flex: "0 0 auto" }}>
                <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
                <div className="flex flex-col items-center">
                  <img
                    src={
                      imagePreview || doctorData?.image || "/img/profile.png"
                    }
                    alt="Doctor Profile"
                    style={{
                      width: "15rem",
                      height: "15rem",
                      borderRadius: "9999px",
                      objectFit: "cover",
                      border: selectedImage
                        ? "3px solid #14b8a6"
                        : "1px solid #e5e7eb",
                    }}
                    className="mb-3 shadow-sm"
                  />

                  {/* Show selected image name if exists */}
                  {selectedImage && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#14b8a6",
                        marginBottom: "0.5rem",
                        textAlign: "center",
                        maxWidth: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Selected: {selectedImage.name}
                    </p>
                  )}

                  <div
                    style={{ display: "flex", gap: "0.5rem", width: "100%" }}
                  >
                    {/* Hidden file input */}
                    <input
                      type="file"
                      id="profileImageInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />

                    {/* Select/Change Image Button */}
                    <button
                      onClick={() =>
                        document.getElementById("profileImageInput").click()
                      }
                      disabled={isUploadingImage}
                      className="px-4 py-1.5 rounded-md transition-colors text-white text-sm"
                      style={{
                        flex: 1,
                        backgroundColor: isUploadingImage
                          ? "#9ca3af"
                          : "#14b8a6",
                        color: isUploadingImage ? "#4b5563" : "#ffffff",
                        cursor: isUploadingImage ? "not-allowed" : "pointer",
                        opacity: isUploadingImage ? 0.6 : 1,
                        height: "30px",
                        border: "none",
                      }}
                      onMouseOver={(e) => {
                        if (!isUploadingImage)
                          e.target.style.backgroundColor = "#0d9488";
                      }}
                      onMouseOut={(e) => {
                        if (!isUploadingImage)
                          e.target.style.backgroundColor = "#14b8a6";
                      }}
                    >
                      {selectedImage ? "Change" : "Select"}
                    </button>

                    {/* Upload Button - only show when image is selected */}
                    {selectedImage && (
                      <>
                        <button
                          onClick={handleImageUpload}
                          disabled={isUploadingImage}
                          className="px-4 py-1.5 rounded-md transition-colors text-white text-sm"
                          style={{
                            flex: 1,
                            backgroundColor: isUploadingImage
                              ? "#9ca3af"
                              : "#14b8a6",
                              color: isUploadingImage ? "#4b5563" : "#ffffff",
                            cursor: isUploadingImage
                              ? "not-allowed"
                              : "pointer",
                            border: "none",
                            opacity: isUploadingImage ? 0.6 : 1,
                            height: "30px",
                          }}
                          onMouseOver={(e) => {
                            if (!isUploadingImage)
                              e.target.style.backgroundColor = "#0d9488";
                          }}
                          onMouseOut={(e) => {
                            if (!isUploadingImage)
                              e.target.style.backgroundColor = "#14b8a6";
                          }}
                        >
                          {isUploadingImage ? "Uploading..." : "Upload"}
                        </button>

                        <button
                          onClick={cancelImageSelection}
                          disabled={isUploadingImage}
                          className="px-4 py-1.5 rounded-md transition-colors text-sm"
                          style={{
                            flex: 1,
                            backgroundColor: isUploadingImage
                              ? "#fca5a5"
                              : "#dc2626",
                            color: isUploadingImage ? "#4b5563" : "#ffffff",
                            cursor: isUploadingImage
                              ? "not-allowed"
                              : "pointer",
                            border: "none",
                            opacity: isUploadingImage ? 0.7 : 1,
                            height: "30px",
                          }}
                          onMouseOver={(e) => {
                            if (!isUploadingImage)
                              e.target.style.backgroundColor = "#b91c1c";
                          }}
                          onMouseOut={(e) => {
                            if (!isUploadingImage)
                              e.target.style.backgroundColor = "#dc2626";
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div style={{ flex: "1" }}>
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      Full Name
                    </label>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {doctorData?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      Email Address
                    </label>
                    <p style={{ fontSize: "0.875rem", color: "#1f2937" }}>
                      {doctorData?.email || "—"}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      Phone Number
                    </label>
                    <p style={{ fontSize: "0.875rem", color: "#1f2937" }}>
                      {doctorData?.phone_no || "—"}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      Specialization
                    </label>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#0891b2",
                      }}
                    >
                      {doctorData?.specialization || "—"}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        marginBottom: "0.25rem",
                        fontWeight: "500",
                      }}
                    >
                      Department
                    </label>
                    <p style={{ fontSize: "0.875rem", color: "#1f2937" }}>
                      {doctorData?.department || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div style={{ flex: "0 0 350px" }}>
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1.5">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-cyan-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1.5">
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-cyan-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1.5">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-cyan-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                    className="w-full text-white py-2 text-sm rounded-md transition-colors font-medium mt-2 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isUpdatingPassword
                        ? "#9ca3af"
                        : "#14b8a6",
                      color: isUpdatingPassword ? "#4b5563" : "#ffffff",
                      border: "none",
                      cursor: isUpdatingPassword ? "not-allowed" : "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (!isUpdatingPassword)
                        e.target.style.backgroundColor = "#0d9488";
                    }}
                    onMouseOut={(e) => {
                      if (!isUpdatingPassword)
                        e.target.style.backgroundColor = "#14b8a6";
                    }}
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Current Schedule Overview
              </h2>
              <button
                onClick={openScheduleModal}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#14b8a6",
                  color: "white",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0d9488")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#14b8a6")}
              >
                <span style={{ fontSize: "1rem" }}>+</span>
                Add New Schedule
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {days.map((day) => {
                const daySchedule = doctorData?.schedules?.find(
                  (schedule) => schedule.day_of_week === day
                );

                if (!daySchedule) return null;

                return (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2rem",
                        flex: "1",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#6b7280",
                          width: "6rem",
                        }}
                      >
                        {day}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#1f2937" }}>
                        {daySchedule.start_time.slice(0, 8)} -{" "}
                        {daySchedule.end_time.slice(0, 8)}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => openEditModal(daySchedule)}
                        style={{
                          padding: "0.375rem",
                          backgroundColor: "#ccfbf1",
                          color: "#0d9488",
                          borderRadius: "0.375rem",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#99f6e4")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#ccfbf1")
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSchedule(daySchedule.id)}
                        style={{
                          padding: "0.375rem",
                          backgroundColor: "#fee2e2",
                          color: "#dc2626",
                          borderRadius: "0.375rem",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#fecaca")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#fee2e2")
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Add Modal */}
      {showScheduleModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.75rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "10px",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Add New Schedule
              </h3>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {/* Select Day */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.375rem",
                  }}
                >
                  Select Day
                </label>
                <select
                  value={addFormData.day}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, day: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    fontSize: "0.875rem",
                    border: "2px solid #14b8a6",
                    borderRadius: "0.5rem",
                    color: "#374151",
                    backgroundColor: "white",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.25rem",
                  }}
                >
                  <option>Choose a day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Inputs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                {/* Start Time */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={addFormData.startTime}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        startTime: e.target.value,
                      })
                    }
                    style={{
                      padding: "0.625rem 0.875rem",
                      fontSize: "0.875rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      color: "#374151",
                    }}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.375rem",
                    }}
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    value={addFormData.endTime}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        endTime: e.target.value,
                      })
                    }
                    style={{
                      padding: "0.625rem 0.875rem",
                      fontSize: "0.875rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      color: "#374151",
                    }}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  padding: "0.875rem 1rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  gap: "0.625rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    backgroundColor: "#14b8a6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  +
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#14b8a6",
                      margin: "0 0 0.125rem 0",
                    }}
                  >
                    Schedule Info
                  </h4>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#14b8a6",
                      margin: 0,
                    }}
                  >
                    This will add a new time slot to the doctor's schedule.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  backgroundColor: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
              >
                Cancel
              </button>
              <button
                onClick={saveSchedule}
                style={{
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "white",
                  backgroundColor: "#14b8a6",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0d9488")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#14b8a6")}
              >
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.75rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "10px",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Edit Schedule
              </h3>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {/* Select Day */}
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.375rem",
                  }}
                >
                  Select Day
                </label>
                <select
                  value={editFormData.day}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, day: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    fontSize: "0.875rem",
                    border: "2px solid #14b8a6",
                    borderRadius: "0.5rem",
                    color: "#374151",
                    backgroundColor: "white",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.25rem",
                  }}
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Inputs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                {/* Start Time */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        startTime: e.target.value,
                      })
                    }
                    style={{
                      padding: "0.625rem 0.875rem",
                      fontSize: "0.875rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      color: "#374151",
                    }}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.375rem",
                    }}
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        endTime: e.target.value,
                      })
                    }
                    style={{
                      padding: "0.625rem 0.875rem",
                      fontSize: "0.875rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      color: "#374151",
                    }}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  padding: "0.875rem 1rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  gap: "0.625rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    backgroundColor: "#14b8a6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#14b8a6",
                      margin: "0 0 0.125rem 0",
                    }}
                  >
                    Update Schedule
                  </h4>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#14b8a6",
                      margin: 0,
                    }}
                  >
                    This will update the selected time slot in the doctor's
                    schedule.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  backgroundColor: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f9fafb")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
              >
                Cancel
              </button>
              <button
                onClick={saveEditSchedule}
                style={{
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "white",
                  backgroundColor: "#14b8a6",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#0d9488")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#14b8a6")}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
