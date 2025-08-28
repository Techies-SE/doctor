import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../Admin/styles/admin_dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faCalendarAlt,
  faUserMd,
  faFileMedical,
  faHospital,
  faCalendarDay,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { X, Upload } from "lucide-react";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showPatientUploadPopup, setShowPatientUploadPopup] = useState(false);
  const [showLabUploadPopup, setShowLabUploadPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    phone_no: "",
    email: "",
    specialization: "",
    status: "",
    department_id: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    let completedRequests = 0;
    const totalRequests = 5;

    const checkAllComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        setLoading(false); // ✅ Set loading to false when all requests complete
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
          "https://backend-pg-cm2b.onrender.com/dashboard/active-appointments",
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
        setError(
          (prev) => prev || `Error loading appointments: ${err.message}`
        );
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
          "https://backend-pg-cm2b.onrender.com/dashboard/active-patients",
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
        setError((prev) => prev || `Error loading patients: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    const fetchTotalDoctors = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/active-doctors",
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
        setTotalDoctors(countData.total_doctors || 0);
      } catch (err) {
        console.error("Error fetching doctors count:", err);
        setError((prev) => prev || `Error loading doctors: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    const fetchTotalDepartments = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        checkAllComplete();
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/dashboard/active-departments",
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
        setTotalDepartments(countData.total_departments || 0);
      } catch (err) {
        console.error("Error fetching departments count:", err);
        setError((prev) => prev || `Error loading departments: ${err.message}`);
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
          "https://backend-pg-cm2b.onrender.com/dashboard/activity",
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
        setRecentActivity(activityData || []);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        setError((prev) => prev || `Error loading activity: ${err.message}`);
      } finally {
        checkAllComplete();
      }
    };

    // Start all fetch operations
    fetchTotalAppointments();
    fetchTotalPatients();
    fetchTotalDoctors();
    fetchTotalDepartments();
    fetchRecentActivity();
  }, []);
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
    // Fetch departments
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
  // useEffect(() => {
  //   const ctx = document.getElementById("healthChart").getContext("2d");

  //   // Create chart instance
  //   const chartInstance = new Chart(ctx, {
  //     type: "line",
  //     data: {
  //       labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  //       datasets: [
  //         {
  //           label: "Patient Trends",
  //           data: [200, 220, 250, 280, 300],
  //           borderColor: "blue",
  //           borderWidth: 2,
  //           fill: false,
  //         },
  //       ],
  //     },
  //   });

  //   // Cleanup function to destroy chart instance when the component is unmounted
  //   return () => {
  //     if (chartInstance) {
  //       chartInstance.destroy();
  //     }
  //   };
  // }, []);
  const navigate = useNavigate();

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("lastActiveTime");
    navigate("/");
    window.location.reload();
  };
  // Helper function to format the timestamp
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    // For older dates, show the actual date
    return created.toLocaleDateString();
  };
  const handlePatientUploadSuccess = () => {
    // Refresh the patients list after successful upload
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    fetch("https://backend-pg-cm2b.onrender.com/patients", { headers })
      .then((response) => response.json())
      .then((data) => {
        console.log("Patient added successfully");
      })
      .catch((error) => console.error("Error fetching patients:", error));
  };
  const handleLabUploadSuccess = (result) => {
    console.log("Lab data uploaded successfully:", result);
    // if (result.patientId) {
    //   setPatients((prevPatients) =>
    //     prevPatients.map((patient) =>
    //       patient.id === result.patientId
    //         ? { ...patient, lab_data_status: true }
    //         : patient
    //     )
    //   );
    // }
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
        return fetch(
          "https://backend-pg-cm2b.onrender.com/doctors-with-departments",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
  const handleInputChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };
  const getRouteForActivityType = (type) => {
    switch (type.toLowerCase()) {
      case "department":
        return "/departments";
      case "patient":
        return "/patient";
      case "appointment":
        return "/appointments";
      case "doctor":
        return "/doctors";
      default:
        return "/admindashboard"; // fallback to dashboard
    }
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
  if (loading) {
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
            <button className="sidebar-btn active-tab">
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

            {/* <button className="sidebar-btn">
              <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
              <Link to="/recommendations" className="sidebar-link">
                Recommendations
              </Link>
            </button> */}

            <button className="sidebar-btn">
              <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
              <Link to="/departments" className="sidebar-link">
                Departments
              </Link>
            </button>

            {/* <button className="sidebar-btn">
              <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
              <Link to="/schedules" className="sidebar-link">
                Schedules
              </Link>
            </button> */}
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
        <div id="main-content">
          <div className="content-area">
            <div className="w-full h-screen p-8 bg-white">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <button className="sidebar-btn active-tab">
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

            {/* <button className="sidebar-btn">
              <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
              <Link to="/recommendations" className="sidebar-link">
                Recommendations
              </Link>
            </button> */}

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
            <img
              src="/img/material-symbols_logout.png"
              alt="Logout Icon"
              id="sidebar-icon"
            />
            <span className="login-link">Logout</span>
          </button>
        </aside>
        <div id="main-content">
          <div className="content-area">
            <div className="w-full h-screen p-8 bg-white text-red-500">
              Error: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }
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
          <button className="sidebar-btn active-tab">
            <img
              src="/img/ChartLineUp.png"
              alt="Dashboard Icon"
              id="sidebar-icon"
            />
            Dashboard
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

          {/* <button className="sidebar-btn">
            <FontAwesomeIcon icon={faFileMedical} id="sidebar-icon" />
            <Link to="/recommendations" className="sidebar-link">
              Recommendations
            </Link>
          </button> */}

          <button className="sidebar-btn">
            <FontAwesomeIcon icon={faHospital} id="sidebar-icon" />
            <Link to="/departments" className="sidebar-link">
              Departments
            </Link>
          </button>

          {/* <button className="sidebar-btn">
            <FontAwesomeIcon icon={faCalendarDay} id="sidebar-icon" />
            <Link to="/schedules" className="sidebar-link">
              Schedules
            </Link>
          </button> */}
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
      <div id="main-content-dashboard">
        {/* Health Overview */}
        <div className="health-overview">
          <div className="health-card total-patients">
            <div className="card-top">
              <span className="label">Total Patients</span>
              <FontAwesomeIcon icon={faUser} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalPatients}</h3>
              </div>
              <div className="info">
                <p>+12% from last month</p>
              </div>
            </div>
          </div>

          <div className="health-card critical-cases">
            <div className="card-top">
              <span className="label">Active Appointments</span>
              <FontAwesomeIcon icon={faCalendarAlt} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalAppointments}</h3>
              </div>
              <div className="info">
                <p>This week</p>
              </div>
            </div>
          </div>

          <div className="health-card appointments">
            <div className="card-top">
              <span className="label">Doctors</span>
              <FontAwesomeIcon icon={faUserMd} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalDoctors}</h3>
              </div>
              <div className="info">
                <p>Active</p>
              </div>
            </div>
          </div>

          <div className="health-card lab-results">
            <div className="card-top">
              <span className="label">Departments</span>
              <FontAwesomeIcon icon={faHospital} className="health-icon" />
            </div>
            <div className="card-bottom">
              <div className="number">
                <h3>{totalDepartments}</h3>
              </div>
              <div className="info">
                <p>Specialties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="patient-list-card">
          <div className="text-content">
            <div className="patient-header">
              <h3>Recent Activity</h3>
              <div className="patient-controls">
                <input type="text" placeholder="Search..." />
                <button className="filter-btn">
                  <img
                    src="/img/Funnel.png"
                    alt="Filter Icon"
                    className="filter-icon"
                  />{" "}
                  Filter
                </button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.type}</td>
                      <td>{activity.description}</td>
                      <td>{activity.user_name}</td>
                      <td>{formatTimeAgo(activity.created_at)}</td>
                      <td>
                        <Link
                          to={getRouteForActivityType(activity.type)}
                          className="view-all"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {loading
                        ? "Loading activities..."
                        : "No recent activity found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Stats and Quick Actions */}
        <div className="health-trends-container">
          <div className="trends-card">
            <div className="trends-header">
              <h3>System Statistics</h3>
              <select className="month-select">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <canvas id="healthChart"></canvas>
          </div>

          <div className="conditions-card">
            <div className="conditions-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="condition-items">
              <button
                onClick={() => setShowPatientUploadPopup(true)}
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faUser} /> Create Patient
              </button>
              <button
                onClick={() => {
                  setShowLabUploadPopup(true);
                  console.log("Create Lab Data clicked");
                }}
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faCalendarAlt} /> Create Lab Data
              </button>

              <button
                onClick={() => {
                  setShowModal(true);
                }}
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faUserMd} /> Create New Doctor
              </button>
              <button
                onClick={() => {
                  setShowDepartmentModal(true);
                }}
                className="condition-item quick-action"
              >
                <FontAwesomeIcon icon={faCalendarDay} /> Create New Department
              </button>
            </div>
          </div>
        </div>
        <PatientUploadPopup
          show={showPatientUploadPopup}
          onClose={() => setShowPatientUploadPopup(false)}
          onUpload={handlePatientUploadSuccess}
        />
        <LabDataUploadPopup
          show={showLabUploadPopup}
          onClose={() => setShowLabUploadPopup(false)}
          onUpload={handleLabUploadSuccess}
        />
        {/* New Doctor Modal */}
        {showModal && (
          <div className="modal-overlay" style={{ paddingTop: "100px" }}>
            <div className="modal-container">
              <div className="modal-header text-[#242222]">
                <h2>Create New Doctor</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="close-btn-1 "
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              {/* Content - Scrollable */}
              <div className="modal-body">
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
                      style={{ width: "95%" }}
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
                      style={{ width: "95%" }}
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
                      style={{ width: "95%" }}
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
                      style={{ width: "95%" }}
                    />
                  </div>
                  <div className="form-group text-[#242222]">
                    <label>Status</label>
                    <select
                      name="status"
                      value={newDoctor.status}
                      onChange={handleInputChange}
                      required
                      style={{ width: "100%" }}
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
          </div>
        )}
        {/* Create Department Modal */}
        {showDepartmentModal && (
          <div className="modal-overlay" style={{ paddingTop: "60px" }}>
            <div className="modal-container">
              <div className="modal-header text-[#242222]">
                <h2>Create New Department</h2>
                <button
                  onClick={() => setShowDepartmentModal(false)}
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
      </div>
    </div>
  );
};

const PatientUploadPopup = ({ show, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [singlePatient, setSinglePatient] = useState({
    hn_number: "",
    name: "",
    citizen_id: "",
    gender: "",
    date_of_birth: "",
    phone_no: "",
  });
  const [isDragActive, setIsDragActive] = useState(false);

  // Reset all fields when popup is shown
  useEffect(() => {
    if (show) {
      // Reset file
      setFile(null);
      const fileInput = document.getElementById("fileUpload");
      if (fileInput) fileInput.value = "";

      // Reset form fields
      setSinglePatient({
        hn_number: "",
        name: "",
        citizen_id: "",
        phone_no: "",
        date_of_birth: "",
        gender: "",
      });
    }
  }, [show]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSinglePatient({
        hn_number: "",
        name: "",
        citizen_id: "",
        phone_no: "",
        date_of_birth: "",
        gender: "",
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Reset the file input value so the same file can be selected again
    const fileInput = document.getElementById("fileUpload");
    if (fileInput) fileInput.value = "";
  };

  // ... [Previous drag and drop handlers remain the same]
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv") {
      setFile(droppedFile);
      setSinglePatient({
        hn_number: "",
        name: "",
        citizen_id: "",
        phone_no: "",
        date_of_birth: "",
        gender: "",
      });
    }
  };

  const handleSinglePatientChange = (e) => {
    const { name, value } = e.target;
    if (file) setFile(null);
    setSinglePatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ... [Previous upload handlers remain the same]
  const handleBulkUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/upload/patients",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.text();
      alert(result || "Upload successful!");
      onUpload(result);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed.");
    }
  };

  const handleSinglePatientSubmit = async () => {
    if (
      !singlePatient.hn_number ||
      !singlePatient.name ||
      !singlePatient.citizen_id ||
      !singlePatient.phone_no ||
      !singlePatient.date_of_birth ||
      !singlePatient.gender
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/patients",
        {
          method: "POST",
          headers,
          body: JSON.stringify(singlePatient),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Get the error message from the response
        throw new Error(errorData.error || "Failed to create patient");
      }

      const result = await response.json();
      alert("Patient created successfully!");
      onUpload(result);
      onClose();
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Failed to create patient: " + error.message); // Show the error message
    }
  };

  if (!show) return null;

  const isFormFilled = Object.values(singlePatient).some(
    (value) => value !== ""
  );

  return (
    <div className="modal-container1" style={{ paddingTop: "50px" }}>
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="p-4 flex justify-between items-center text-[#242222]">
          <h2 className="text-xl font-bold">Add New Patients</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} textAlign="center" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Bulk Upload Section */}
          <div className="container1">
            <h3 className="text-lg font-semibold mb-3 text-[#242222]">
              Bulk Upload
            </h3>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              } ${file || isFormFilled ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="mb-2 text-[#242222]">
                📁 Drop your CSV file here or
              </p>
              <button
                className="browse-button"
                onClick={() => document.getElementById("fileUpload").click()}
                disabled={isFormFilled}
              >
                Browse Files
              </button>
              <input
                id="fileUpload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isFormFilled}
              />
              {file && (
                <div className="mt-2">
                  <div className="flex items-center justify-center space-x-2">
                    <p className="text-green-600 text-sm">{file.name}</p>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Supported formats: CSV</p>
          </div>

          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">OR</span>
          </div>

          {/* Single Patient Form */}
          <div className="container1">
            <h3 className="text-lg font-semibold mb-3 text-[#242222]">
              Add A Single Patient
            </h3>
            <div
              className={`space-y-3 ${
                file ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HN Number
                </label>
                <input
                  type="text"
                  name="hn_number"
                  placeholder="Enter HN Number"
                  value={singlePatient.hn_number}
                  onChange={handleSinglePatientChange}
                  className="w-full p-2 border rounded-md text-sm placeholder-[#969696] text-[#969696]"
                  disabled={!!file}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Full Name"
                  value={singlePatient.name}
                  onChange={handleSinglePatientChange}
                  className="w-full p-2 border rounded-md text-sm placeholder-[#969696] text-[#969696]"
                  disabled={!!file}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citizen ID
                </label>
                <input
                  type="text"
                  name="citizen_id"
                  placeholder="Enter Citizen ID"
                  value={singlePatient.citizen_id}
                  onChange={handleSinglePatientChange}
                  className="w-full p-2 border rounded-md text-sm placeholder-[#969696] text-[#969696]"
                  disabled={!!file}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={singlePatient.date_of_birth}
                  onChange={handleSinglePatientChange}
                  className="w-full p-2 border rounded-md text-sm text-gray-700"
                  disabled={!!file}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={singlePatient.gender || ""}
                  onChange={handleSinglePatientChange}
                  className="w-full p-2 border rounded-md text-sm text-[#969696]"
                  disabled={!!file}
                >
                  <option value="" disabled>
                    Choose Gender
                  </option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone_no"
                  placeholder="Enter Phone Number"
                  value={singlePatient.phone_no}
                  onChange={handleSinglePatientChange}
                  className="w-full p-2 border rounded-md text-sm placeholder-[#969696] text-[#969696]"
                  disabled={!!file}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 flex justify-end space-x-3">
          {file ? (
            <button
              onClick={handleBulkUpload}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm"
            >
              Upload CSV
            </button>
          ) : isFormFilled ? (
            <button
              onClick={handleSinglePatientSubmit}
              className="add-patient-button"
            >
              Add Patient
            </button>
          ) : null}
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const LabDataUploadPopup = ({ show, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [singleLabData, setSingleLabData] = useState({
    hn_number: "",
    doctor: "",
  });
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labTestsData, setLabTestsData] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [labTests, setLabTests] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Auth Token:", token);
        if (!token) throw new Error("No authentication token found");
        const response = await fetch(
          "https://backend-pg-cm2b.onrender.com/doctors",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    const fetchLabTests = async () => {
      try {
        const response = await fetch(
          "https://backend-pg-cm2b.onrender.com/lab-tests"
        );
        if (!response.ok) throw new Error("Failed to fetch lab tests");
        const data = await response.json();
        setLabTests(data);
      } catch (error) {
        console.error("Error fetching lab tests:", error);
      }
    };

    fetchDoctors();
    fetchLabTests();
  }, []);

  // Reset all fields when popup is shown
  useEffect(() => {
    if (show) {
      // Reset file
      setFile(null);
      setUploadError("");
      setIsUploading(false);
      const fileInput = document.getElementById("labFileUpload");
      if (fileInput) fileInput.value = "";

      // Reset form fields
      setSingleLabData({
        hn_number: "",
        doctor_id: "",
      });
    }
  }, [show]);

  // Fetch lab items when lab tests are selected
  const fetchLabItems = async (labTestId) => {
    try {
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/lab-tests/${labTestId}/items`
      );
      if (!response.ok) throw new Error("Failed to fetch lab items");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching lab items:", error);
      return [];
    }
  };

  const handleLabTestSelection = async (labTestId, isSelected) => {
    if (isSelected) {
      // Add lab test
      const labTest = labTests.find((test) => test.id === parseInt(labTestId));
      if (labTest && !selectedLabTests.find((test) => test.id === labTest.id)) {
        const labItems = await fetchLabItems(labTestId);
        const newLabTest = {
          ...labTest,
          items: labItems,
        };

        setSelectedLabTests((prev) => [...prev, newLabTest]);

        // Initialize lab test data with empty values
        const initialData = {};
        labItems.forEach((item) => {
          initialData[item.lab_item_id] = "";
        });

        setLabTestsData((prev) => ({
          ...prev,
          [labTestId]: initialData,
        }));
      }
    } else {
      // Remove lab test
      setSelectedLabTests((prev) =>
        prev.filter((test) => test.id !== parseInt(labTestId))
      );
      setLabTestsData((prev) => {
        const newData = { ...prev };
        delete newData[labTestId];
        return newData;
      });
    }
  };

  const handleLabItemValueChange = (labTestId, labItemId, value) => {
    setLabTestsData((prev) => ({
      ...prev,
      [labTestId]: {
        ...prev[labTestId],
        [labItemId]: value,
      },
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setUploadError("Only CSV files are supported.");
        return;
      }
      setFile(selectedFile);
      setUploadError("");
      setSingleLabData({
        hn_number: "",
        doctor_id: "",
      });
      setSelectedLabTests([]);
      setLabTestsData({});
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadError("");
    const fileInput = document.getElementById("labFileUpload");
    if (fileInput) fileInput.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv") {
      setFile(droppedFile);
      setUploadError("");
      setSingleLabData({
        hn_number: "",
        doctor_id: "",
      });
      setSelectedLabTests([]);
      setLabTestsData({});
    } else {
      setUploadError("Only CSV files are supported.");
    }
  };

  const handleSingleLabDataChange = (e) => {
    const { name, value } = e.target;
    if (file) setFile(null);

    // Calculate BMI if weight or height changes
    if (name === "weight" || name === "height") {
      const weight =
        name === "weight"
          ? parseFloat(value)
          : parseFloat(singleLabData.weight);
      const height =
        name === "height"
          ? parseFloat(value)
          : parseFloat(singleLabData.height);

      if (weight && height) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
        setSingleLabData((prev) => ({
          ...prev,
          [name]: value,
          bmi: bmi,
        }));
      } else {
        setSingleLabData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setSingleLabData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file); // Changed from "csvFile" to "file"
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }
    try {
      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/bulk/upload-lab-results",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      alert(result.message || "Upload successful!");
      onUpload(result);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSingleLabDataSubmit = async () => {
    // Validate HN number format
    if (!/^\d{9}$/.test(singleLabData.hn_number)) {
      alert("HN Number must be exactly 9 digits.");
      return;
    }

    // Validate required fields
    if (!singleLabData.doctor_id) {
      alert("Please select a doctor.");
      return;
    }

    if (selectedLabTests.length === 0) {
      alert("Please select at least one lab test.");
      return;
    }

    // Validate that all lab items have values
    for (const labTest of selectedLabTests) {
      const testData = labTestsData[labTest.id];
      if (!testData) {
        alert(`Please fill in values for ${labTest.test_name}.`);
        return;
      }

      for (const item of labTest.items) {
        if (
          !testData[item.lab_item_id] ||
          testData[item.lab_item_id].trim() === ""
        ) {
          alert(
            `Please fill in value for ${item.lab_item_name} in ${labTest.test_name}.`
          );
          return;
        }
      }
    }

    setIsUploading(true);
    try {
      // Prepare the data structure for submission - matching backend expectations
      const submissionData = {
        hn_number: singleLabData.hn_number,
        doctor_id: singleLabData.doctor_id,
        lab_tests: selectedLabTests.map((labTest) => ({
          lab_test_id: labTest.id,
          lab_items: labTest.items.map((item) => ({
            lab_item_id: item.lab_item_id,
            lab_item_value: labTestsData[labTest.id][item.lab_item_id],
          })),
        })),
      };

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://backend-pg-cm2b.onrender.com/lab-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create lab data");
      }

      alert("Lab data created successfully!");
      onUpload(result);
      onClose();
    } catch (error) {
      console.error("Error creating lab data:", error);
      alert("Failed to create lab data: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  if (!show) return null;

  const isFormFilled =
    singleLabData.hn_number !== "" ||
    singleLabData.doctor_id !== "" ||
    selectedLabTests.length > 0;

  return (
    <div className="modal-container1" style={{ marginTop: "50px" }}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Lab Data</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} textAlign="center" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Bulk Upload Section */}
          <div className="container1">
            <h3 className="text-lg font-semibold mb-3 text-[#242222]">
              Bulk Upload
            </h3>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              } ${file || isFormFilled ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="mb-2 text-[#969696]">
                📁 Drop your CSV file here or
              </p>
              <button
                className="browse-button"
                onClick={() => document.getElementById("labFileUpload").click()}
                disabled={isFormFilled}
              >
                Browse Files
              </button>
              <input
                id="labFileUpload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isFormFilled}
              />
              {file && (
                <div className="mt-2">
                  <div className="flex items-center justify-center space-x-2">
                    <p className="text-green-600 text-sm">{file.name}</p>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: CSV with columns for hn_number, lab_item_name,
              and lab_item_value
            </p>

            {uploadError && (
              <div className="mt-2 text-red-500 text-sm">{uploadError}</div>
            )}
          </div>

          {/* OR Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Single Lab Data Form */}
          <div className="container1">
            <h3 className="text-lg font-semibold mb-4 text-[#242222]">
              Add Single Lab Data
            </h3>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* HN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hn_number"
                  placeholder="Enter 9-digit HN Number"
                  value={singleLabData.hn_number || ""}
                  onChange={handleSingleLabDataChange}
                  className="w-full p-2 border rounded-md text-sm placeholder-[#969696]"
                  disabled={!!file}
                  maxLength="9"
                />
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  name="doctor_id"
                  value={singleLabData.doctor_id}
                  onChange={handleSingleLabDataChange}
                  className="w-full p-2 border rounded-md text-sm text-[#969696]"
                  disabled={!!file}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lab Tests Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lab Tests <span className="text-red-500">*</span>
              </label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {labTests.map((test) => (
                  <div key={test.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`test-${test.id}`}
                      checked={selectedLabTests.some(
                        (selectedTest) => selectedTest.id === test.id
                      )}
                      onChange={(e) =>
                        handleLabTestSelection(test.id, e.target.checked)
                      }
                      disabled={!!file}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`test-${test.id}`}
                      className="text-sm text-gray-700"
                    >
                      {test.test_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Lab Items Forms */}
            {selectedLabTests.map((labTest) => (
              <div
                key={labTest.id}
                className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg bg-gray-50 shadow-sm"
              >
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#242222]">
                  {labTest.test_name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {labTest.items?.map((item) => (
                    <div key={item.lab_item_id} className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        <span className="block truncate pr-2">
                          {item.lab_item_name}
                        </span>
                        {item.unit && (
                          <span className="text-gray-500 text-xs">
                            ({item.unit})
                          </span>
                        )}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${item.lab_item_name}`}
                        value={
                          labTestsData[labTest.id]?.[item.lab_item_id] || ""
                        }
                        onChange={(e) =>
                          handleLabItemValueChange(
                            labTest.id,
                            item.lab_item_id,
                            e.target.value
                          )
                        }
                        className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md text-sm placeholder-[#969696] 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     transition-all duration-200 hover:border-gray-400"
                        disabled={!!file}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 flex justify-end space-x-3">
            {file ? (
              <button
                onClick={handleBulkUpload}
                className={`bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-600 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload CSV"}
              </button>
            ) : isFormFilled ? (
              <button
                onClick={handleSingleLabDataSubmit}
                className={`bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-600 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Add Lab Data"}
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="cancel-button"
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
