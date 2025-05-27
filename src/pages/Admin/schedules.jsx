import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
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
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FiCalendar, FiClock, FiFilter, FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';

const Schedules = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [viewType, setViewType] = useState('week');
  const calendarRef = useRef(null);

  // Fetch doctor schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found");
          return;
        }
        const response = await fetch('http://localhost:3000/schedule/doctors',
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch schedules');
        const data = await response.json();
        if (data.success) {
          setDoctors(data.data);
          setSelectedDoctors(data.data.map(doctor => doctor.doctor_id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Handle view changes
  const handleViewChange = (view) => {
    setViewType(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      switch(view) {
        case 'day': calendarApi.changeView('timeGridDay'); break;
        case 'week': calendarApi.changeView('timeGridWeek'); break;
        case 'month': calendarApi.changeView('dayGridMonth'); break;
        default: calendarApi.changeView('timeGridWeek');
      }
    }
  };

  // Toggle doctor selection
  const toggleDoctorSelection = (doctorId) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  // Toggle all doctors
  const toggleSelectAll = () => {
    setSelectedDoctors(prev => 
      prev.length === doctors.length 
        ? [] 
        : doctors.map(doctor => doctor.doctor_id)
    );
  };

  // Helper functions
  const getDayDate = (day, referenceDate = new Date()) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = days.indexOf(day);
    const refDay = referenceDate.getDay();
    const diff = dayIndex - refDay;
    const targetDate = new Date(referenceDate);
    targetDate.setDate(referenceDate.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const getDoctorColor = (doctorId) => {
    const colors = [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#64748B', '#06B6D4'
    ];
    return colors[doctorId % colors.length];
  };

  const getDoctorInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Generate calendar events
  const getCalendarEvents = () => {
    if (!doctors.length) return [];
    
    // Get current date from calendar if available
    const calendarApi = calendarRef.current?.getApi();
    const currentDate = calendarApi ? calendarApi.getDate() : new Date();

    return doctors
      .filter(doctor => selectedDoctors.includes(doctor.doctor_id))
      .flatMap(doctor => 
        doctor.schedules.map(schedule => ({
          title: doctor.doctor_name,
          start: `${getDayDate(schedule.day, currentDate)}T${schedule.start_time}`,
          end: `${getDayDate(schedule.day, currentDate)}T${schedule.end_time}`,
          extendedProps: { doctorId: doctor.doctor_id },
          color: getDoctorColor(doctor.doctor_id),
          classNames: ['doctor-event'],
          display: 'block', // Ensures events don't overlap
          overlap: false // Prevents event overlapping
        }))
      );
  };

  // Handle when calendar dates change
  const handleDatesSet = () => {
    // Force re-render of events when calendar navigates
    setSelectedDoctors([...selectedDoctors]);
  };

  // Loading state
  if (isLoading) {
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

            <button className="sidebar-btn active-tab">
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
        
        <div className="main-content">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-full"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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

            <button className="sidebar-btn active-tab">
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
        
        <div className="main-content">
          <div className="p-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error loading schedules: {error}</p>
                </div>
              </div>
            </div>
          </div>
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

          <button className="sidebar-btn active-tab">
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
      
      <div className="main-content">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Schedules</h1>
              <p className="text-gray-600 mt-1">Schedule Overview</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => handleViewChange('day')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewType === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Day
                </button>
                <button
                  onClick={() => handleViewChange('week')}
                  className={`px-4 py-2 text-sm font-medium ${viewType === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleViewChange('month')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewType === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-5 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <FiFilter className="text-gray-500 mr-2" />
                <span className="font-medium text-gray-700">Filter Doctors</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {selectedDoctors.length} selected
                </span>
              </div>
              {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {showFilters && (
              <div className="p-5 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {selectedDoctors.length === doctors.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {doctors.map(doctor => (
                    <button
                      key={doctor.doctor_id}
                      onClick={() => toggleDoctorSelection(doctor.doctor_id)}
                      className={`flex items-center p-3 rounded-lg border transition-all ${selectedDoctors.includes(doctor.doctor_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: getDoctorColor(doctor.doctor_id) }}
                      >
                        {getDoctorInitials(doctor.doctor_name)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {doctor.doctor_name.replace('Dr. ', '')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={false}
                events={getCalendarEvents()}
                eventContent={(eventInfo) => (
                  <div className="p-1">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: eventInfo.event.backgroundColor }}
                      ></div>
                      <div className="font-medium truncate text-sm">
                        {eventInfo.event.title.replace('Dr. ', '')}
                      </div>
                    </div>
                    <div className="flex items-center text-xs mt-0.5 text-gray-600">
                      <FiClock className="mr-1" size={10} />
                      {eventInfo.timeText}
                    </div>
                  </div>
                )}
                height="auto"
                slotMinTime="07:00:00"
                slotMaxTime="21:00:00"
                nowIndicator={true}
                editable={false}
                selectable={false}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false,
                  hour12: false
                }}
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false,
                  hour12: false
                }}
                datesSet={handleDatesSet}
                eventDisplay="block"
                eventOverlap={false}
                eventOrder="start"
                allDaySlot={false}
                slotEventOverlap={false}
                eventMaxStack={1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedules;