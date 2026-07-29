import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router'
import { store, persistor } from './store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import LoadingScreen from './components/LoadingScreen'



createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<LoadingScreen/>} persistor={persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>

)
