import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  X,
} from "lucide-react";
import "./styles/patientdetails.css";

const PatientDetails = ({ hn_number, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [expandedAppointments, setExpandedAppointments] = useState({
    scheduled: true,
    pending: true,
    completed: true,
    canceled: true,
    rescheduled: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState({});

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
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
          `https://backend-pg-cm2b.onrender.com/patients/${hn_number}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch patient details");
        }
        const data = await response.json();
        setPatient(data);
        setEditedPatient({
          ...data,
          patient_data: { ...data.patient_data },
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hn_number) {
      fetchPatientDetails();
    }
  }, [hn_number]);

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  useEffect(() => {
    if (isEditing) {
      const height = editedPatient.patient_data?.height || 0;
      const weight = editedPatient.patient_data?.weight || 0;
      const bmi = calculateBMI(height, weight);

      setEditedPatient((prev) => ({
        ...prev,
        patient_data: {
          ...prev.patient_data,
          bmi: bmi,
        },
      }));
    }
  }, [
    editedPatient.patient_data?.height,
    editedPatient.patient_data?.weight,
    isEditing,
  ]);

  const toggleTestExpansion = (testIndex) => {
    setExpandedTests((prev) => ({
      ...prev,
      [testIndex]: !prev[testIndex],
    }));
  };

  const toggleAppointmentSection = (section) => {
    setExpandedAppointments((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPatient({
      ...patient,
      patient_data: { ...patient.patient_data },
    });
  };

  const handleSave = async () => {
    try {
      setSaveError(null);
      setLoading(true);

      const requestData = {
        ...editedPatient,
        ...editedPatient.patient_data,
      };
      delete requestData.patient_data;
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
        `https://backend-pg-cm2b.onrender.com/patients/${hn_number}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update patient details");
      }

      const refetchResponse = await fetch(
        `https://backend-pg-cm2b.onrender.com/patients/${hn_number}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!refetchResponse.ok) {
        throw new Error("Failed to fetch updated patient details");
      }
      const refetchedData = await refetchResponse.json();

      setPatient(refetchedData);
      setEditedPatient({
        ...refetchedData,
        patient_data: { ...refetchedData.patient_data },
      });
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient((prev) => ({
      ...prev,
      patient_data: {
        ...prev.patient_data,
        [name]:
          name === "height" || name === "weight" || name === "age"
            ? Number(value)
            : value,
      },
    }));
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-800",
        icon: <Clock size={14} className="mr-1" />,
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={14} className="mr-1" />,
      },
      canceled: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle size={14} className="mr-1" />,
      },
      scheduled: {
        color: "bg-blue-100 text-blue-800",
        icon: <Calendar size={14} className="mr-1" />,
      },
      rescheduled: {
        color: "bg-purple-100 text-purple-800",
        icon: <Calendar size={14} className="mr-1" />,
      },
    };

    return (
      <span
        className={`status-badge ${
          statusConfig[status]?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusConfig[status]?.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
  };

  if (loading) {
    return (
      <div className="patient-details-container">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={20} className="mr-1" />
          Back to Patients
        </button>
        <div className="loading-message">Loading patient details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-details-container">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={20} className="mr-1" />
          Back to Patients
        </button>
        <div className="error-message">
          Error: {error}. Please try again later.
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-details-container">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={20} className="mr-1" />
          Back to Patients
        </button>
        <div className="no-data-message">No patient data found.</div>
      </div>
    );
  }

  return (
    <div className="patient-details-container">
      <div className="header-section">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={20} className="mr-1" />
          Back to Patients
        </button>

        {!isEditing ? (
          <button onClick={handleEditClick} className="edit-button">
            <Edit size={16} className="mr-2" />
            Edit Patient
          </button>
        ) : (
          <div className="edit-actions">
            <button onClick={handleCancelEdit} className="cancel-button">
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button onClick={handleSave} className="save-button">
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
          </div>
        )}
        {saveError && (
          <div className="save-error">Save failed: {saveError}</div>
        )}
      </div>

      <div className="patient-details-card">
        <div className="section">
          <h2 className="section-title">Personal Information</h2>

          <div className="info-grid">
            {/* Column 1 - Basic Info */}
            <div className="info-column">
              <div className="info-item">
                <p className="info-label">HN Number</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="hn_number"
                    value={editedPatient.hn_number || ""}
                    onChange={handleInputChange}
                    className="info-input"
                  />
                ) : (
                  <p className="info-value">{patient.hn_number || "-"}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedPatient.name || ""}
                    onChange={handleInputChange}
                    className="info-input"
                  />
                ) : (
                  <p className="info-value">{patient.name || "-"}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Citizen ID</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="citizen_id"
                    value={editedPatient.citizen_id || ""}
                    onChange={handleInputChange}
                    className="info-input"
                  />
                ) : (
                  <p className="info-value">{patient.citizen_id || "-"}</p>
                )}
              </div>
            </div>

            {/* Column 2 - Contact Info */}
            <div className="info-column">
              <div className="info-item">
                <p className="info-label">Phone Number</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone_no"
                    value={editedPatient.phone_no || ""}
                    onChange={handleInputChange}
                    className="info-input"
                  />
                ) : (
                  <p className="info-value">{patient.phone_no || "-"}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Registered At</p>
                <p className="info-value">
                  {formatDate(patient.registered_at) || "-"}
                </p>
              </div>
              <div className="info-item">
                <p className="info-label">Last Updated</p>
                <p className="info-value">
                  {formatDate(patient.updated_at) || "-"}
                </p>
              </div>
            </div>

            {/* Column 3 - Demographics */}
            <div className="info-column">
              <div className="info-item">
                <p className="info-label">Gender</p>
                {isEditing ? (
                  <select
                    name="gender"
                    value={editedPatient.patient_data?.gender || ""}
                    onChange={handlePatientDataChange}
                    className="info-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">male</option>
                    <option value="female">female</option>
                  </select>
                ) : (
                  <p className="info-value">
                    {patient.patient_data?.gender || "-"}
                  </p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Blood Type</p>
                {isEditing ? (
                  <select
                    name="blood_type"
                    value={editedPatient.patient_data?.blood_type || ""}
                    onChange={handlePatientDataChange}
                    className="info-input"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="info-value">
                    {patient.patient_data?.blood_type || "-"}
                  </p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Age</p>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={editedPatient.patient_data?.age || ""}
                    onChange={handlePatientDataChange}
                    className="info-input"
                    min="0"
                  />
                ) : (
                  <p className="info-value">
                    {patient.patient_data?.age || "-"}
                  </p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Date of Birth</p>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editedPatient.patient_data?.date_of_birth || ""}
                    onChange={handlePatientDataChange}
                    className="info-input"
                  />
                ) : (
                  <p className="info-value">
                    {formatDate(patient.patient_data?.date_of_birth) || "-"}
                  </p>
                )}
              </div>
            </div>

            {/* Column 4 - Health Metrics */}
            <div className="info-column">
              <div className="info-item">
                <p className="info-label">Height (cm)</p>
                {isEditing ? (
                  <input
                    type="number"
                    name="height"
                    value={editedPatient.patient_data?.height || ""}
                    onChange={handlePatientDataChange}
                    className="info-input"
                    min="0"
                    step="0.1"
                  />
                ) : (
                  <p className="info-value">
                    {patient.patient_data?.height || "-"}
                  </p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Weight (kg)</p>
                {isEditing ? (
                  <input
                    type="number"
                    name="weight"
                    value={editedPatient.patient_data?.weight || ""}
                    onChange={handlePatientDataChange}
                    className="info-input"
                    min="0"
                    step="0.1"
                  />
                ) : (
                  <p className="info-value">
                    {patient.patient_data?.weight || "-"}
                  </p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">BMI</p>
                <p className="info-value">
                  {patient.patient_data?.bmi ||
                    calculateBMI(
                      patient.patient_data?.height,
                      patient.patient_data?.weight
                    ) ||
                    "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Results Section */}
        <div className="section">
          <h2 className="section-title">
            <Calendar size={20} className="mr-2" />
            Lab Tests
          </h2>

          {patient.lab_tests?.length === 0 ? (
            <p className="no-data-text">No lab tests available</p>
          ) : (
            <div className="test-list">
              {patient.lab_tests?.map((test, testIndex) => (
                <div key={testIndex} className="test-card">
                  <button
                    className="test-header"
                    onClick={() => toggleTestExpansion(testIndex)}
                  >
                    <div className="test-title">
                      <span className="test-name">
                        {test.test_name || "Unnamed Test"}
                      </span>
                      <StatusBadge status={test.status} />
                    </div>
                    <div className="test-date">
                      <span className="date-text">
                        Test Date: {formatDate(test.lab_test_date)}
                      </span>
                      {expandedTests[testIndex] ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </button>

                  {expandedTests[testIndex] && (
                    <div className="test-results">
                      {test.results?.length > 0 ? (
                        <div className="results-table-container">
                          <table className="results-table">
                            <thead>
                              <tr>
                                <th>Test Item</th>
                                <th>Result</th>
                                <th>Unit</th>
                                <th>Reference Range</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {test.results.map((item, itemIndex) => (
                                <tr key={itemIndex}>
                                  <td>{item.lab_item_name || "-"}</td>
                                  <td className="result-value">
                                    {item.value || "-"}
                                  </td>
                                  <td>{item.unit || "-"}</td>
                                  <td>{item.normal_range || "-"}</td>
                                  <td>
                                    <span
                                      className={`status-indicator ${
                                        item.lab_item_status === "normal"
                                          ? "normal"
                                          : "abnormal"
                                      }`}
                                    >
                                      {item.lab_item_status || "-"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="no-results-text">
                          No results available for this test
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="appointments-section">
          <h2 className="section-title">
            <Calendar size={20} className="mr-2" />
            Appointments
          </h2>

          {["scheduled", "pending", "completed", "canceled", "rescheduled"].map(
            (status) => {
              const filteredAppointments =
                patient.appointments?.filter(
                  (appt) => appt.status === status
                ) || [];

              if (filteredAppointments.length === 0) return null;

              return (
                <div className="appointment-group" key={status}>
                  <button
                    className="appointment-group-header"
                    onClick={() => toggleAppointmentSection(status)}
                  >
                    <div className="group-title">
                      {status.charAt(0).toUpperCase() + status.slice(1)} (
                      {filteredAppointments.length})
                    </div>
                    {expandedAppointments[status] ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>

                  {expandedAppointments[status] && (
                    <div className="appointment-table-container">
                      <table className="appointment-table">
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>Doctor</th>
                            <th>Department</th>
                            {status === "canceled" && <th>Status</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAppointments.map((appointment, index) => (
                            <tr key={index}>
                              <td>
                                {formatDateTime(
                                  appointment.appointment_date,
                                  appointment.appointment_time
                                )}
                              </td>
                              <td>{appointment.doctor?.name || "-"}</td>
                              <td>{appointment.doctor?.department || "-"}</td>
                              {status === "canceled" && (
                                <td>
                                  <StatusBadge status={appointment.status} />
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
