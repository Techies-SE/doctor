import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import "../../styles/doctorDashboard.css";
import "../Admin/styles/appointments.css";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Calendar,
  CalendarIcon,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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


const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmCount, setConfirmCount] = useState(0);
  const [rescheduleCount, setRescheduleCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);
  const [completeCount, setCompleteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({
    key: "patientName",
    direction: "ascending",
  });

  useEffect(() => {
    
    const fetchCompleteCount = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      try {
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/complete/count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!countResponse.ok) {
          throw new Error("Failed to fetch completed appointments count");
        }
        const countData = await countResponse.json();
        setCompleteCount(countData.total_completed_appointments);
      } catch (err) {
        console.error("Error fetching completed count:", err);
      }
    };
    
    const fetchCancelCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/cancel/count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!countResponse.ok) {
          throw new Error("Failed to fetch canceled appointments count");
        }
        const countData = await countResponse.json();
        setCancelCount(countData.total_canceled_appointments);
      } catch (err) {
        console.error("Error fetching cancel count:", err);
      }
    };

    const fetchRescheduleCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/reschedule/count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!countResponse.ok) {
          throw new Error("Failed to fetch rescheduled appointments count");
        }
        const countData = await countResponse.json();
        setRescheduleCount(countData.total_reschedule_appointments);
      } catch (err) {
        console.error("Error fetching reschedule count:", err);
      }
    };

    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/pending/count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!countResponse.ok) {
          throw new Error("Failed to fetch pending appointments count");
        }
        const countData = await countResponse.json();
        setPendingCount(countData.total_pending_appointments);
      } catch (err) {
        console.error("Error fetching pending count:", err);
      }
    };

    const fetchConfirmCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/confirm/count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!countResponse.ok) {
          throw new Error("Failed to fetch confirmed appointments count");
        }
        const countData = await countResponse.json();
        setConfirmCount(countData.total_confirm_appointments);
      } catch (err) {
        console.error("Error fetching confirm count:", err);
      }
    };

    const fetchAppointmentCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const countResponse = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!countResponse.ok) {
          throw new Error("Failed to fetch total appointments count");
        }
        const countData = await countResponse.json();
        setAppointmentCount(countData.total_appointments);
      } catch (err) {
        console.error("Error fetching appointment count:", err);
      }
    };

    const fetchAppointments = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      try {
        const response = await fetch(
          "https://backend-pg-cm2b.onrender.com/appointments/pending",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await response.json();

        const transformedAppointments = data.pending_appointments.map(
          (appointment) => ({
            id: `APP-${appointment.appointment_id}`,
            appointmentId: appointment.appointment_id,
            patientName: appointment.patient_name,
            date: new Date(appointment.appointment_date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            ),
            rawDate: appointment.appointment_date,
            time: appointment.appointment_time.slice(0, 5),
            doctor: appointment.doctor_name,
            specialty: appointment.specialization,
            status:
              appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1),
            doctorId: appointment.doctor_id,
          })
        );

        setAppointments(transformedAppointments);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCompleteCount();
    fetchCancelCount();
    fetchRescheduleCount();
    fetchAppointmentCount();
    fetchConfirmCount();
    fetchPendingCount();
    fetchAppointments();
  }, []);
  
  const handleApproveAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/appointments/approve/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve appointment");
      }

      const updatedAppointments = appointments.filter(
        (appointment) => appointment.appointmentId !== appointmentId
      );
      setAppointments(updatedAppointments);

      setPendingCount((prevCount) => prevCount - 1);
      setConfirmCount((prevCount) => prevCount + 1);

      alert("Appointment approved successfully!");
    } catch (error) {
      console.error("Error approving appointment:", error);
      alert(`Failed to approve appointment: ${error.message}`);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this appointment?\nYOU CANNOT UNDO THIS ACTION"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/appointments/cancel/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel appointment");
      }

      const updatedAppointments = appointments.filter(
        (appointment) => appointment.appointmentId !== appointmentId
      );
      setAppointments(updatedAppointments);

      setPendingCount((prevCount) => prevCount - 1);
      setCancelCount((prevCount) => prevCount + 1);

      alert("Appointment canceled successfully!");
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert(`Failed to cancel appointment: ${error.message}`);
    }
  };

  const fetchAvailableTimeSlots = async (doctorId, date) => {
    try {
      const formattedDate = date;
      const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/appointments/available-slots/${doctorId}/${formattedDate}`,
        {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }

      const data = await response.json();
      setAvailableTimeSlots(data.available_slots);

      if (!data.available_slots.includes(selectedTimeSlot)) {
        setSelectedTimeSlot("");
      }
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      setAvailableTimeSlots([]);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

    if (selectedAppointment && newDate) {
      fetchAvailableTimeSlots(selectedAppointment.doctorId, newDate);
    }
  };

  const handleOpenRescheduleModal = async (appointment) => {
    setSelectedAppointment(appointment);

    try {
      const appointmentDate = new Date(appointment.rawDate);
      const year = appointmentDate.getFullYear();
      const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
      const day = String(appointmentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setSelectedDate(formattedDate);
      setSelectedTimeSlot(appointment.time);
      setShowRescheduleModal(true);

      await fetchAvailableTimeSlots(appointment.doctorId, formattedDate);
    } catch (error) {
      console.error("Error fetching reschedule data:", error);
      alert(`Failed to load reschedule options: ${error.message}`);
    }
  };

  const handleCloseRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setAvailableTimeSlots([]);
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTimeSlot) {
      alert("Please select a date and time");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
      const response = await fetch(
        `https://backend-pg-cm2b.onrender.com/appointments/${selectedAppointment.appointmentId}/reschedule`,
        {
          method: "PATCH",
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          body: JSON.stringify({
            new_date: selectedDate,
            new_time: `${selectedTimeSlot}:00`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to reschedule appointment"
        );
      }

      const updatedAppointments = appointments.filter(
        (appointment) =>
          appointment.appointmentId !== selectedAppointment.appointmentId
      );
      setAppointments(updatedAppointments);

      setPendingCount((prevCount) => prevCount - 1);
      setRescheduleCount((prevCount) => prevCount + 1);

      handleCloseRescheduleModal();
      alert("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      alert(`Failed to reschedule appointment: ${error.message}`);
    }
  };

  const sortedAppointments = React.useMemo(() => {
    let sortableAppointments = [...appointments];
    sortableAppointments.sort((a, b) => {
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
    return sortableAppointments;
  }, [appointments, sortConfig]);

  const filteredAppointments = sortedAppointments.filter(
    (appointment) =>
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

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
        <span key={index} className="pagination-dots px-3 py-1">
          ...
        </span>
      ) : (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`border rounded px-3 py-1 hover:bg-gray-100 ${
            currentPage === page ? "bg-gray-200" : ""
          }`}
        >
          {page}
        </button>
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-orange-500";
      case "Approved":
        return "text-green-500";
      case "Rescheduled":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
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

      <button className="sidebar-btn active-tab">
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

      <button className="sidebar-btn active-tab">
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

      <button className="sidebar-btn active-tab">
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
    <div id="main-content">
        <div className="bg-white rounded-lg p-6 shadow font-sans">
          <div className="flex justify-between items-center mb-">
            <h1 className="text-black text-2xl font-semibold">Appointment List</h1>
          </div>

          {/* Stats Cards */}
<div className="stats-scroll-container">
  <div className="stats-grid">
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-number">{appointmentCount}</div>
        <div className="stats-card-label">Total Bookings</div>
      </div>
    </div>
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-number">{pendingCount}</div>
        <div className="stats-card-label">Pending</div>
      </div>
    </div>
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-number">{confirmCount}</div>
        <div className="stats-card-label">Confirmed</div>
      </div>
    </div>
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-number">{rescheduleCount}</div>
        <div className="stats-card-label">Rescheduled</div>
      </div>
    </div>
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-number">{completeCount}</div>
        <div className="stats-card-label">Completed</div>
      </div>
    </div>
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-card-number">{cancelCount}</div>
        <div className="stats-card-label">Canceled</div>
      </div>
    </div>
  </div>
</div>


          {/* Search and Filter */}
          <div className="flex items-center mb-6">
            <div id="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-input"
              />
            </div>
            <button id="filter-button">
              <Filter size={18} className="filter-icon" /> Filter by Date
            </button>
          </div>

          {/* Appointments Table */}
          <div className="table-wrapper bg-white shadow rounded-lg">
            <table className="table-content w-full border-collapse">
              <thead>
                <tr className="hover:bg-gray-50 bg-gray-100 text-[#242222]">
                  {[
                    { key: "patientName", label: "Patient Name", width: "20%" },
                    { key: "date", label: "Date & Time", width: "20%" },
                    { key: "doctor", label: "Doctor", width: "20%" },
                    { key: "status", label: "Status", width: "15%" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="p-4 text-left cursor-pointer hover:bg-gray-200"
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  currentAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-300"
                    >
                      <td className="p-4 text-[#595959]">
                        {appointment.patientName}
                      </td>
                      <td className="p-4 text-[#595959]">
                        {appointment.date} {appointment.time}
                      </td>
                      <td className="p-4 text-[#595959]">
                        {appointment.doctor}
                        <div className="text-xs text-gray-500">
                          {appointment.specialty}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
  <div className="action-buttons">
    <button
      onClick={() => handleApproveAppointment(appointment.appointmentId)}
      className="icon-button"
      title="Approve"
    >
      <Check className="icon-green" />
    </button>

    <button
      onClick={() => handleCancelAppointment(appointment.appointmentId)}
      className="icon-button"
      title="Cancel"
    >
      <X className="icon-red" />
    </button>

    <button
      onClick={() => handleOpenRescheduleModal(appointment)}
      className="icon-button"
      title="Reschedule"
    >
      <Calendar className="icon-blue" />
    </button>
  </div>
</td>


                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && filteredAppointments.length > 0 && (
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
          {showRescheduleModal && selectedAppointment ? (
  <div className="reschedule-modal">
    <div className="modal-overlay" onClick={handleCloseRescheduleModal}></div>
    <div className="modal-container">
      {/* Modal Header */}
      <div className="modal-header">
        <h2 className="modal-title">Reschedule Appointment</h2>
        <button onClick={handleCloseRescheduleModal} className="modal-close">
          <X className="icon" />
        </button>
      </div>

      <form onSubmit={handleRescheduleAppointment}>
        {/* Modal Content */}
        <div className="modal-body">
          <div className="section">
            <h3 className="section-title">{selectedAppointment.doctor}</h3>
            <p className="section-subtitle">{selectedAppointment.specialty}</p>
          </div>

          <div className="section">
            <label className="section-label">Patient</label>
            <p>{selectedAppointment.patientName}</p>
          </div>

          <div className="section">
            <label className="section-label">Current Appointment</label>
            <p>
              {selectedAppointment.date} at {selectedAppointment.time}
            </p>
          </div>

          <div className="section">
            <label className="section-label" htmlFor="newDate">
              Select New Date
            </label>
            <input
              id="newDate"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-input"
              required
            />
          </div>

          <div className="section">
            <label className="section-label">Available Time Slots</label>
            {availableTimeSlots.length > 0 ? (
              <div className="time-slot-grid">
                {availableTimeSlots.map((time) => (
                  <label key={time} className="time-slot-label">
                    <input
                      type="radio"
                      name="timeSlot"
                      value={time}
                      checked={selectedTimeSlot === time}
                      onChange={() => setSelectedTimeSlot(time)}
                      className="hidden"
                      required
                    />
                    <div
                      className={`time-slot ${
                        selectedTimeSlot === time ? "selected" : ""
                      }`}
                    >
                      {time}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="no-slots">No available time slots for this date</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={handleCloseRescheduleModal}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn-confirm ${
              !selectedTimeSlot ? "disabled" : ""
            }`}
            disabled={!selectedTimeSlot}
          >
            Confirm Reschedule
          </button>
        </div>
      </form>
    </div>
  </div>
): null}


        </div>
      </div>
    </div>
  
  );
};



export default Appointments;
