import { Route, Routes } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
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

        <Route path='/*' element={<h2>No route present</h2>} />

      </Routes>

      <Toaster position='top-center' />
    </>
  )
}

export default App