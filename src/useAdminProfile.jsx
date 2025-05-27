import { useState, useEffect } from 'react';

export const useAdminProfile = () => {
    const [adminData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth Token:', token); // Debug token
      if (!token) throw new Error('No authentication token found');


      const response = await fetch('http://localhost:3000/profile/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch admin profile');
      
      const data = await response.json();
      setDoctorData(data.doctor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return {adminData, loading, error, refresh: fetchData}
}