import { Route, Routes } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import Leaderboard from './pages/Leaderboard'
import PublicProfile from './pages/PublicProfile'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

import Home from './pages/Home'
import { Toaster } from 'sonner'
import ProtectedRoute from './auth/ProtectedRoute'
import AuthRoute from './auth/AuthRoute'


function App() {

  return (
    <>
      <Routes>

        <Route path='/' element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />

        <Route path='/register' element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } />

        <Route path='/home' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <Home />
          </ProtectedRoute>
        } />

        
        <Route path='/profile' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <Profile />
          </ProtectedRoute>
        } />

 <Route path='/leaderboard' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE", "ROLE_RECRUITER", "ROLE_ADMIN"]}>
            <Leaderboard />
          </ProtectedRoute>
        } />


                <Route path='/candidate/profile/:id' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE", "ROLE_RECRUITER", "ROLE_ADMIN"]}>
            <PublicProfile />
          </ProtectedRoute>
        } />

                 <Route path='/admin' element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path='/*' element={<h2>No route present</h2>} />

      </Routes>

      <Toaster position='top-center' />
    </>
  )
}

export default App