import React, { useEffect } from 'react'
import { useAuth } from '../context/auth'
import { useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';

const Dashboard = () => {
    const { user, fetchUser } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUser(token)
    }, [])

    useEffect(() => {
        if (user) {
            if (user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else if (user.role === 'Manager') {
                navigate('/manager-dashboard');
            } else if (user.role === 'Employee') {
                navigate('/employee-dashboard');
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <Container
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: '100vh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}

        >
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
    )
}

export default Dashboard