import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { X } from "lucide-react";
import { useDoctorProfile } from "../Doctor/hooks/useDoctorProfile";

const DoctorProfile = () => {
  const { doctorData } = useDoctorProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedule, setSchedule] = useState({});
  const [tempSchedule, setTempSchedule] = useState({});

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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

  const saveSchedule = () => {
    setSchedule(tempSchedule);
    setShowScheduleModal(false);
    alert("Schedule updated successfully!");
  };

  const isScheduled = (day, time) => {
    return schedule[day]?.includes(time);
  };

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
          {/* Profile Picture and Password Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Profile Picture */}
            <div>
              <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
              <div className="flex flex-col items-center">
                <img
                  src={doctorData?.image || "/img/profile.png"}
                  alt="Doctor Profile"
                  style={{
                    width: "15rem",
                    height: "15rem",
                    borderRadius: "9999px",
                    objectFit: "cover",
                  }}
                  className="mb-3 shadow-sm border border-gray-200"
                />

                <button className="px-6 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 text-sm">
                  Update
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div>
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
                  className="w-full bg-black text-white py-2 text-sm rounded-md hover:bg-gray-800 transition-colors font-medium mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Schedule</h2>
              <button
                onClick={openScheduleModal}
                className="px-5 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 text-sm"
              >
                Edit Schedule
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold"></th>
                    {timeSlots.map((time) => (
                      <th
                        key={time}
                        className="border border-gray-300 px-4 py-2 text-center font-semibold"
                      >
                        {time}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td className="border border-gray-300 px-4 py-2.5 font-medium">
                        {day}
                      </td>
                      {timeSlots.map((time) => (
                        <td
                          key={time}
                          className={`border border-gray-300 px-4 py-2.5 text-center transition-colors ${
                            isScheduled(day, time)
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          {isScheduled(day, time) ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-semibold text-green-700">
                                  On Duty
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Edit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                Edit Schedule
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Click on time slots to toggle availability
              </p>

              <div className="space-y-4">
                {days.map((day) => (
                  <div
                    key={day}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-gray-800 mb-3">{day}</h4>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((time) => {
                        const isSelected = tempSchedule[day]?.includes(time);
                        return (
                          <button
                            key={time}
                            onClick={() => toggleTimeSlot(day, time)}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              isSelected
                                ? "bg-cyan-500 text-white border-cyan-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSchedule}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
