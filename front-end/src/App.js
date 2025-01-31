import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import { AuthProvider } from './context/auth'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ViewOrUpdate from './pages/ViewOrUpdate'
import AllTasks from './pages/AllTasks'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/admin-dashboard' element={<AdminDashboard />} />
          <Route path='/manager-dashboard' element={<ManagerDashboard />} />
          <Route path='/employee-dashboard' element={<EmployeeDashboard />} />
          <Route path='/view/:id' element={<ViewOrUpdate />} />
          <Route path='/tasks/:id' element={<AllTasks />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App