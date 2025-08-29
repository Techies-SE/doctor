import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Patient from "./pages/Patient";
import AdminDashboard from "./pages/Admin/admin_dashboard";
import Patients from "./pages/Admin/patients_list";
import Appointments from "./pages/Admin/appointments";
import Doctors from "./pages/Admin/doctors_list";
import Recommendations from "./pages/Admin/recommendations";
import Departments from "./pages/Admin/departments_list";
import Schedules from "./pages/Admin/schedules";
import DoctorDetails from "./pages/Admin/doctor_details";
import PatientList  from "./pages/PatientList";
import DetailsPage from "./pages/detailspage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/patients" element={<Patient />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/patient" element={<Patients/>}/>
      <Route path="/appointments" element={<Appointments/>}/>
      <Route path="/doctors" element={<Doctors/>}/>
      <Route path="/recommendations" element={<Recommendations/>}/>
      <Route path="/departments" element={<Departments/>}/>
      <Route path="/schedules" element={<Schedules/>}/>
      <Route path="/docdetails" element={<DoctorDetails/>}/>
      <Route path="/patientlists" element={<PatientList/>}/>
      <Route path="/details/:hn_number/:lab_test_id" element={<DetailsPage />}/>
    </Routes>
  );
}

export default App;