import {configureStore} from '@reduxjs/toolkit'
import userReducer from './slices/userSlice.js'


import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage/index.js'


const persistConfig ={
    key : 'root',
    storage: storage.default
}



const persistedReducer = persistReducer(persistConfig, userReducer)


export const store = configureStore({

    reducer:{
        user : persistedReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })

})

export const persistor = persistStore(store)

