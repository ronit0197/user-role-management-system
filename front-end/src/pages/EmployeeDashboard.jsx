import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Navbar from '../components/Navbar';
import axios from 'axios';

const EmployeeDashboard = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [selectedFile, setSelectedFile] = useState(null);
  const [photos, setPhotos] = useState([])


  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [navigate, token]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/employee/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Bearer token
        },
      });

      console.log('File uploaded successfully:', response.data);
      alert('File uploaded successfully');
      getPhotos()
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const getPhotos = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/employee/photos`, {
        headers: {
          Authorization: `Bearer ${token}` // Bearer token added here
        }
      });
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  useEffect(() => {
    fetchUser(token);
    getPhotos()
  }, []);

  if (user?.role !== 'Employee') {
    return (
      <div className='container text-center'>
        <h1 className='text-muted'>403</h1>
        <p>This action is forbidden</p>
      </div>
    );
  }

  return (
    <div className='container-fluid'>
      <Navbar />
      <form className='border border-1 border-dark p-3 w-50 mt-4' onSubmit={handleUpload}>
        <input type="file" className='form-control' onChange={handleFileChange} />
        <button className='btn btn-primary mt-3' type="submit">
          Upload
        </button>
      </form>

      <div className="row mt-4">
        {
          photos.map((photo, i) => {
            return (
              <div className="col-2 border border-1 border-dark m-1" key={i}>
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/${photo.photo_path}`}
                  alt="Preview"
                  className="w-100"
                />
              </div>
            )
          })
        }
      </div>
    </div>
  );
};

export default EmployeeDashboard;
