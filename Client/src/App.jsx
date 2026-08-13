import { Route, Routes } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import { Toaster } from 'sonner'
import ProtectedRoute from './auth/ProtectedRoute'
import AuthRoute from './auth/AuthRoute'
import Problems from './pages/Problems'
import CodePage from './pages/CodePage'
import Contest from './pages/Contest'
import ContestTest from './pages/ContestTest'


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

         <Route path='/contests' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <Contest />
          </ProtectedRoute>
        } />

        <Route path='/contest/:id' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <ContestDetails />
          </ProtectedRoute>
        } />

        <Route path='/contest/:id/test' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <ContestTest />
          </ProtectedRoute>
        } />

        <Route path='/problems' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <Problems />
          </ProtectedRoute>
        } />

        <Route path='/problem/:problemId' element={
          <ProtectedRoute allowedRoles={["ROLE_CANDIDATE"]}>
            <CodePage />
          </ProtectedRoute>
        } />


        <Route path='/*' element={<h2>No route present</h2>} />

      </Routes>

      <Toaster position='top-center' />
    </>
  )
}

export default App