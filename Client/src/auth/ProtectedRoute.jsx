import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

function ProtectedRoute({ children, allowedRoles }) {
    const { isLoggedIn, user } = useSelector(state => state.user)

    if (!isLoggedIn , !user) {
        return <Navigate to="/" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}

export default ProtectedRoute