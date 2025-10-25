import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useDoctorProfile } from "../hooks/useDoctorProfile"; 

const Navbar = () => {
  const { doctorData } = useDoctorProfile();

  return (
    <nav id="navbar">
      <div id="navbar-left">
        <div id="logo-circle"></div>
        <span id="mfu-text">MFU</span>
        <span id="wellness-text">Wellness Center</span>
      </div>
      <div id="navbar-right">
        <button id="notification-btn">
          <FontAwesomeIcon icon={faBell} id="icon" />
        </button>
        <div id="profile">
          <img
            src={doctorData?.image || "/img/profile.png"}
            alt="Profile"
            id="profile-image"
          />
          <span id="profile-name">
            {doctorData ? `${doctorData.name}` : "Loading..."}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;