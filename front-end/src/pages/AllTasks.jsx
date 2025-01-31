import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Navbar from '../components/Navbar';
import axios from 'axios';

const AllTasks = () => {
    const { user, fetchUser } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const param = useParams()

    const [works, setWorks] = useState([])
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
            fetchWorks();
        }
    }, [user]);

    const fetchWorks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/manager/employees/${param.id}/photos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorks(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setLoading(false);
        }
    };

    const deleteWork = async (photoId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/manager/employees/${param.id}/photos/${photoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorks();
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setLoading(false);
        }
    }

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
                <h4 className='my-3'>Employee works</h4>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="row">
                        {works.length > 0 ? (
                            works.map((photo, i) => (
                                <div className="col-md-3" key={i}>
                                    <div className="card mb-4">
                                        <div className="card-body">
                                            <img src={`${process.env.REACT_APP_API_URL}/uploads/${photo.photo_path}`} alt="" className='image-fluid w-100' style={{ height: "200px", objectFit: "contain" }} />
                                        </div>
                                        <button className='btn btn-danger m-2' onClick={() => deleteWork(photo.id)}>Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No works uploded by this employee.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllTasks