import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/auth';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Alert } from 'react-bootstrap';

const ViewOrUpdate = () => {

    const { user } = useAuth();

    const params = useParams()
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [updatableUser, setUpdatableUser] = useState()

    const [username, SetUsername] = useState('')
    const [role, setRole] = useState('')

    const [error, setError] = useState(null);

    async function getUser() {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin//user/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Bearer token added here
                }
            });

            if (response) {

                setUpdatableUser(response.data);
                SetUsername(response.data.username)
                setRole(response.data.role)
            }

        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const newUser = {
            username: username,
            role: role,
            manager_id: null
        }

        if (newUser.username === '') {
            setError('Enter username.');
        }

        if (newUser.password === '') {
            setError('Enter password.');
        }

        if (newUser.role === '') {
            setError('Select role.');
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/admin/update-user/${params.id}`,
                newUser,
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Bearer token added here
                    }
                }
            );

            if (response) {
                navigate('/admin-dashboard');
            }
        } catch (error) {
            console.error('Failed to create user:', error);
        }


    }

    useEffect(() => {
        getUser()
    }, [])

    console.log("User update:", updatableUser)

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    if (user?.role !== 'Admin') {

        return (
            <div className='container text-center'>
                <h1 className='text-muted'>403</h1>
                <p>This action is forbidden</p>
            </div>
        )
    }

    return (
        <>
            <Navbar />
            <div className='container mt-5'>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form noValidate onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="validationCustom01">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Username"
                                defaultValue={username}
                                onChange={(e) => SetUsername(e.target.value)}
                                className='shadow-none'
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="validationCustom02">
                            <Form.Label>Role</Form.Label>
                            <Form.Select aria-label="Default select example" className='shadow-none' onChange={(e) => setRole(e.target.value)}>
                                <option selected disabled>{role}</option>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Employee">Employee</option>
                            </Form.Select>
                        </Form.Group>
                    </Row>
                    <Button type="submit">Update</Button>
                </Form>
            </div>
        </>
    )
}

export default ViewOrUpdate