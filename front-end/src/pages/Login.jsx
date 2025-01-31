import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {


    const navigate = useNavigate();

    const { login, error, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await login(username, password);
        if (response) {
            console.log("Response in login:", response)
            navigate('/dashboard')
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <Container className="mt-5 w-50">
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit} className='border border-1 border-muted p-3 rounded mt-3'>
                <Form.Group controlId="formBasicUsername" className='mb-3'>
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className='shadow-none'
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='shadow-none'
                    />
                </Form.Group>

                <Button className='shadow-none mt-4' variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </Form>
        </Container>
    );
};

export default Login;
