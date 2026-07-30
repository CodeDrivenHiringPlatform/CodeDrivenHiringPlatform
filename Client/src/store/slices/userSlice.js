import {createSlice} from '@reduxjs/toolkit'



const userSlice = createSlice({
    name : "user",
    initialState :{
        user : null,
        token : "",
        isLoggedIn : false
    },
    reducers :{
        loginAction: (state , {payload})=>
        {
            state.user = payload.user
            state.token = payload.token
            state.isLoggedIn = true
        },

        logoutAction : (state)=>{
            state.user = null
            state.token =""
            state.isLoggedIn = false
        }
    }

})

export default userSlice.reducer
export const {loginAction, logoutAction} = userSlice.actions