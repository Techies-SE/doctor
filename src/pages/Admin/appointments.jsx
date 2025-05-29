import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/doctorDashboard.css";
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

  if (loading) {
    return (
      <div className="main-content">
        <Navbar />
        <Sidebar />
        <div className="content-area">
          <div className="w-full h-screen p-8 bg-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      
      <div className="main-content">
        <Navbar />
        <Sidebar />
        <div className="content-area">
          <div className="w-full h-screen p-8 bg-white text-red-500">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div
      className="main-content-appointment"
      style={{ marginLeft: "250px", marginTop: "150px" }}
    >
      <Navbar />
      <Sidebar />
      <div className="content-area">
        <div
          className="table-container p-6 font-sans ml-0"
          style={{ marginLeft: "10px" }}
        >
          <div
            className="flex justify-between items-center "
            style={{ marginBottom: "20px" }}
          >
            <h1 className="text-black">Appointment Management</h1>
          </div>

          {/* Stats Cards */}
          <div style={{ overflowX: "auto", width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(150px, 1fr))",
                gap: "16px",
                minWidth: "900px",
                marginBottom: "1.5rem",
              }}
            >
              <div className="bg-white shadow rounded-lg">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {appointmentCount}
                  </div>
                  <div className="text-sm text-gray-500">Total Bookings</div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {pendingCount}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {confirmCount}
                  </div>
                  <div className="text-sm text-gray-500">Confirmed</div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {rescheduleCount}
                  </div>
                  <div className="text-sm text-gray-500">Rescheduled</div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {completeCount}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {cancelCount}
                  </div>
                  <div className="text-sm text-gray-500">Canceled</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
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
                      <td className="p-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              handleApproveAppointment(
                                appointment.appointmentId
                              )
                            }
                            className="border rounded p-1 hover:bg-gray-100"
                            title="Approve"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </button>
                          <button
                            className="border rounded p-1 hover:bg-gray-100"
                            onClick={() =>
                              handleCancelAppointment(appointment.appointmentId)
                            }
                            title="Cancel"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                          <button
                            className="border rounded p-1 hover:bg-gray-100"
                            onClick={() =>
                              handleOpenRescheduleModal(appointment)
                            }
                            title="Reschedule"
                          >
                            <Calendar className="h-4 w-4 text-blue-500" />
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
          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="border rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            {renderPagination()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="border rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              Last
            </button>
          </div>

          {/* Reschedule Modal */}
          {showRescheduleModal && selectedAppointment && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(2px)",
                  WebkitBackdropFilter: "blur(2px)",
                }}
                onClick={handleCloseRescheduleModal}
              />
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">
                    Reschedule Appointment
                  </h2>
                  <button
                    onClick={handleCloseRescheduleModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800">
                      {selectedAppointment.doctor}
                    </h3>
                    <p className="text-gray-500">
                      {selectedAppointment.specialty}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-gray-800">Patient</h3>
                    <p className="text-gray-600">
                      {selectedAppointment.patientName}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-gray-800">
                      Current Appointment
                    </h3>
                    <p className="text-gray-600">
                      {selectedAppointment.date} at {selectedAppointment.time}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-gray-800">
                      Select New Date
                    </h3>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-full p-2 border rounded-md text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-gray-800">
                      Available Time Slots
                    </h3>
                    {availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((time) => (
                          <button
                            key={time}
                            className={`p-2 text-center rounded-md border text-sm ${
                              selectedTimeSlot === time
                                ? "bg-blue-100 text-blue-600 border-blue-300"
                                : "hover:bg-gray-50 text-gray-600"
                            }`}
                            onClick={() => setSelectedTimeSlot(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No available time slots for this date
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={handleCloseRescheduleModal}
                    className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleAppointment}
                    disabled={!selectedTimeSlot}
                    className={`px-4 py-2 rounded-md ${
                      selectedTimeSlot
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Confirm Reschedule
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

const Navbar = () => (
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
        <img src="/img/profile.png" alt="Profile" className="profile-image" />
        <span className="profile-name">Admin</span>
      </div>
    </div>
  </nav>
);

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-container">
      <button className="sidebar-btn">
        <img
          src="/img/ChartLineUp.png"
          alt="Dashboard Icon"
          className="sidebar-icon"
        />
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

      <button className="sidebar-btn active-tab">
        <FontAwesomeIcon icon={faCalendarAlt} className="sidebar-icon" />
        <Link to="/appointments" className="sidebar-link">
          Appointments
        </Link>
      </button>

      <button className="sidebar-btn">
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
);

export default Appointments;
