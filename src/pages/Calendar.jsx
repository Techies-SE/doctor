import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/calendar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell} from '@fortawesome/free-solid-svg-icons';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendar(currentMonth);
  }, [currentMonth]);

  const changeMonth = (direction) => {
    setCurrentMonth((prev) => (prev + direction + 12) % 12);
  };

  const generateRandomCounts = () => {
    return {
      appointments: Math.max(Math.floor(Math.random() * 6), 1),
      visits: Math.max(Math.floor(Math.random() * 6), 1),
      surgeries: Math.max(Math.floor(Math.random() * 3), 1),
    };
  };

  const generateCalendar = (month) => {
    const daysArray = [];
    const firstDay = new Date(new Date().getFullYear(), month, 1).getDay();
    const daysInMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      daysArray.push({ empty: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push({ day, ...generateRandomCounts() });
    }

    setCalendarDays(daysArray);
  };

  return (
    <div className="calendar-page">
      <div id="navbar">
        <div id="navbar-left">
          <div id="logo-circle"></div>
          {/* <div className="logo-text"> */}
            <span id="mfu-text">MFU</span>{" "}
            <span id="wellness-text">Wellness Center</span>
          {/* </div> */}
        </div>
        <div id="navbar-right">
          <button id="notification-btn">
            <FontAwesomeIcon icon={faBell} id="icon" />
          </button>
          <div id="profile">
            <img src="/img/profile.png" alt="Profile" id="profile-image" />
            <span id="profile-name">Dr. Smith</span>
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <div className="sidebar-container">
          <button className="sidebar-btn">
            <img src="img/ChartLineUp.png" alt="Dashboard Icon" className="sidebar-icon" />
            <Link to="/dashboard" className="dashboard-link">Dashboard</Link>
          </button>
          <button className="sidebar-btn">
            <img src="/img/UsersThree.png" alt="Patients Icon" className="sidebar-icon" />
            <Link to="/patientlists" className="doctorPanel-link">Patients</Link>
          </button>
          <button className="sidebar-btn active-tab">
            <img src="/img/Calendar.png" alt="Calendar" className="sidebar-icon" /> Calendar
          </button>
        </div>
        <button className="sidebar-btn logout">
          <img src="/img/material-symbols_logout.png" alt="Logout Icon" className="sidebar-icon" />
          <Link to="/" className="login-link">Logout</Link>
        </button>
      </aside>

      <div className="main-content">
        <div className="calendar-wrapper">
          <div className="schedule-container">
            <div className="month-selection">
              <button className="month-btn left-btn" onClick={() => changeMonth(-1)}>&#10094;</button>
              <span className="month-text">{monthNames[currentMonth]}</span>
              <button className="month-btn right-btn" onClick={() => changeMonth(1)}>&#10095;</button>
            </div>
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>

            <div className="calendar-days">
              {calendarDays.map((day, index) => (
                <div key={index} className={`calendar-day ${day.empty ? "empty" : ""}`}>
                  {day.empty ? "" : (
                    <>
                      <span className="date">{day.day}</span>
                      {day.appointments && <div className="appointments">Appointment: {day.appointments}</div>}
                      {day.visits && <div className="visits">Visit: {day.visits}</div>}
                      {day.surgeries && <div className="surgeries">Surgery: {day.surgeries}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;



