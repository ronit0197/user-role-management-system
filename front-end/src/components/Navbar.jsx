import React from 'react'
import { useAuth } from '../context/auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function userLogout() {
        logout()
        navigate('/');
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <div>
                    <p className="m-0 fw-bold" style={{ fontSize: '15px' }}>Name: {user?.username}</p>
                    <p className='m-0' style={{ fontSize: '12px' }}>Role: {user?.role}</p>
                </div>
                <button className='btn btn-danger' onClick={userLogout}>Logout</button>
            </div>
        </nav>
    )
}

export default Navbar