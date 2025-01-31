import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Navbar from '../components/Navbar';
import axios from 'axios';

const ManagerDashboard = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(token);
  }, [fetchUser, token]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (user?.role === 'Manager') {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/manager/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  if (user?.role !== 'Manager') {
    return (
      <div className="container text-center">
        <h1 className="text-muted">403</h1>
        <p>This action is forbidden</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <h4 className='my-3'>My employees</h4>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="row">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <div className="col-md-3" key={employee.id}>
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">{employee.username}</h5>
                      <Link to={`/tasks/${employee.id}`}>View all tasks</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No employees found under your management.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
