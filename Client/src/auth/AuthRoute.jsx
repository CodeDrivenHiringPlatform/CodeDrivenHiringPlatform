import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

function AuthRoute({children}) {
    const {isLoggedIn , user} = useSelector(state => state.user)

    if(isLoggedIn)
    {
       if(user.role==='ROLE_CANDIDATE')
        {

          return <Navigate to="/home"/>
        }
        else if(user.role==='ROLE_RECRUITER')
        {
          return <Navigate to="/recruiter"/>
        }
        else{
           return <Navigate to="/admin"/>
        }
       
    }
    else{
         return children
    }
}

export default AuthRoute