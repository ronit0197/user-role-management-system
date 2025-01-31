import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/auth';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import axios from 'axios';
import { Alert } from 'react-bootstrap';

const AdminDashboard = () => {

  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [allUser, setAllUser] = useState([]);

  const [allManagers, setAllManagers] = useState([])

  const [username, SetUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')

  const [error, setError] = useState(null);

  async function getUsers() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}` // Bearer token added here
        }
      });
      setAllUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  async function getManagers() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/managers`, {
        headers: {
          Authorization: `Bearer ${token}` // Bearer token added here
        }
      });
      setAllManagers(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  async function assignManager(e) {

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/admin/assign-manager`,
        JSON.parse(e),
        {
          headers: {
            Authorization: `Bearer ${token}` // Bearer token added here
          }
        }
      );

      console.log("Response in assign:", response)
      if (response) {
        getUsers()
        getManagers()
      }
    } catch (error) {
      console.error('Failed to assign manager:', error);
    }

  }

  async function deleteUser(params) {
    console.log("Delete user:", params)
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/admin/delete-user/${params}`, {
        headers: {
          Authorization: `Bearer ${token}` // Bearer token added here
        }
      });

      getUsers()
      getManagers()
      console.log("delete response:", response)

    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  useEffect(() => {
    fetchUser(token)
    getUsers()
    getManagers()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault();

    const newUser = {
      username: username,
      password: password,
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/admin/create-user`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}` // Bearer token added here
          }
        }
      );

      if (response) {
        handleClose()
        getUsers()
        getManagers()
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }


  }

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
      <div>
        <Navbar />
        <div className='container-fluid mt-4'>
          <Button variant="success" onClick={handleShow}>
            Register New User
          </Button>
          <div className='mt-3'>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Manager Name</th>
                  <th scope="col">Assign Manager</th>
                  <th scope="col">Delete</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  allUser.map((item, i) => {
                    return (
                      <tr key={i}>
                        <th scope="row">{i + 1}</th>
                        <td>{item.username}</td>
                        <td>{item.role}</td>
                        <td>
                          {
                            item.role === 'Employee'
                              ?
                              item.manager_username === null ? 'No manager assinged' : item.manager_username
                              :
                              ""
                          }
                        </td>
                        <td>
                          {
                            item.role === 'Employee'
                              ?
                              <Form.Select aria-label="Default select example" className='shadow-none' onChange={(e) => assignManager(e.target.value)}>
                                <option selected disabled>{item.manager_username === null ? 'Select a manager' : item.manager_username}</option>
                                {
                                  allManagers.map((manager) => (
                                    <option value={JSON.stringify({ managerId: manager.manager_id, employeeId: item.id })}>{manager.manager_username}</option>
                                  ))
                                }
                              </Form.Select>
                              :
                              ""
                          }
                        </td>
                        <td><button className='btn btn-danger' onClick={() => deleteUser(item.id)}>Delete</button></td>
                        <td><Link className='btn btn-warning' to={`/view/${item.id}`}>View or update</Link></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form noValidate onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
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
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  placeholder="Password"
                  defaultValue={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='shadow-none'
                />
              </Form.Group>
              <Form.Group as={Col} md="4" controlId="validationCustom02">
                <Form.Label>Role</Form.Label>
                <Form.Select aria-label="Default select example" className='shadow-none' onChange={(e) => setRole(e.target.value)}>
                  <option>Select</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Button type="submit">Submit form</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default AdminDashboard