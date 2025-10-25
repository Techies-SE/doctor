import React, { createContext, useContext, useState, useEffect } from "react";

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://backend-pg-cm2b.onrender.com/doctors/profile", // Adjust URL
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDoctorData(data);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []); // Only runs once!

  return (
    <DoctorContext.Provider value={{ doctorData, loading }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctorProfile = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctorProfile must be used within DoctorProvider");
  }
  return context;
};