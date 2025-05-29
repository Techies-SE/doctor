// to discard this file
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell} from '@fortawesome/free-solid-svg-icons';

const Patient = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
  
    const handleModalToggle = () => {
      setIsModalOpen(!isModalOpen);
      setIsBlurred(!isBlurred);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsBlurred(false);
    };
  
    return (
    <div>
      {/* Navbar */}
      <nav id="navbar">
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
            <img src="img/profile.png" alt="Profile Image" id="profile-image" />
            <span id="profile-name">Dr.Smith</span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside id="sidebar">
        <div className="sidebar-container">
          <button className="sidebar-btn">
            <img src="img/ChartLineUp.png" alt="Dashboard Icon" className="sidebar-icon" />
           <Link to="/dashboard" className="dashboard-link">Dashboard</Link>
          </button>
          <button className="sidebar-btn active-tab">
            <img src="img/UsersThree.png" alt="Patients Icon" className="sidebar-icon" /> Patients
          </button>
            <button className="sidebar-btn">
                <img src="/img/Calendar.png" alt="Calendar Icon" className="sidebar-icon" />
                <Link to="/calendar" className="calendar-link">Calendar</Link>
            </button>
        </div>

        <button className="sidebar-btn logout">
          <img src="img/material-symbols_logout.png" alt="Logout Icon" className="sidebar-icon" />
          <Link to="/" className="login-link">Logout</Link>
        </button>
      </aside>

      {/* Main Content */}
      <div className={`main-content ${isBlurred ? 'blur-background' : ''}`}>
        {/* Patient Header */}
        <div className="patient-header">
          <div className="patient-info">
            <h2>Som Chai</h2>
            <p>Male, 32 years | HN-Number: #000000001</p>
          </div>
          <button className="new-recommendation-btn" onClick={handleModalToggle}>
            <img src="img/Plus.png" alt="Recommendation Icon" className="recommendation-icon" /> <span>New Recommendation</span>
          </button>
        </div>

        {/* Health Stats */}
        <div className="health-stats">
          <div className="health-card">
            <h3>Blood Pressure</h3>
            <p className="measurement">120/80 mmHg</p>
            <p className="status normal">Normal</p>
          </div>
          <div className="health-card">
            <h3>Heart Rate</h3>
            <p className="measurement">72 bpm</p>
            <p className="status normal">Normal</p>
          </div>
          <div className="health-card">
            <h3>Blood Sugar</h3>
            <p className="measurement">95 mg/dL</p>
            <p className="status high">High</p>
          </div>
        </div>

        {/* Lab Results & AI Recommendation */}
        <div className="lab-ai-section">
          <div className="latest-lab">
            <h3>Latest Lab Results</h3>
            {/* Lab Card with Toggle */}
            <LabCard title="CBC" details={['Hemoglobin: 14 g/dL', 'White Blood Cells: 6,000 /μL', 'Platelets: 250,000 /μL']} />
            <LabCard title="Glucose Levels" details={['Fasting Blood Sugar: 95 mg/dL', 'Postprandial Glucose: 120 mg/dL']} />
            <LabCard title="Lipid Profile" details={['Cholesterol: 180 mg/dL', 'LDL: 100 mg/dL', 'HDL: 50 mg/dL', 'Triglycerides: 130 mg/dL']} />
          </div>

          <div className="ai-recommendation-container">
            <div className="ai-recommendation">
              <h3>AI Recommendation</h3>
              <p>We recommend adjusting the patient’s diet to lower blood sugar levels.</p>
              <div className="button-group">
                <button className="accept-btn">Accept & Send</button>
                <button className="modify-btn">Modify</button>
              </div>
            </div>
            <div className="previous-messages">
              <h3>Previously Sent Messages</h3>
              <p>No previous recommendations sent.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={handleCloseModal}>&times;</span>
            <h3 className="modal-title">New Recommendation</h3>
            <textarea placeholder="Enter your recommendation..." rows="10"></textarea>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
              <button className="save-btn">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// LabCard Component
const LabCard = ({ title, details }) => (
  <div className="lab-card">
    <input type="checkbox" id={`${title}-toggle`} className="lab-checkbox" />
    <label htmlFor={`${title}-toggle`} className="lab-toggle">
      {title}
      <span className="arrow"></span>
    </label>
    <div className="lab-details">
      {details.map((detail, index) => (
        <p key={index}>{detail}</p>
      ))}
    </div>
  </div>    );


export default Patient;
