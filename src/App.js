import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Register from './components/Register'
import Home from './components/Home'
import EventRegister from './components/EventRegister'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import Login from './components/Login'
import DeleteEvents from './components/DeleteEvents'
import EditEvents from './components/EditEvents'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import { useUser } from './UserContext'

const App = () => {
  const{authenticated}=useUser()
  return (
    <>
    {authenticated !== null && <ResponsiveAppBar/>}
    <Routes>
      <Route path='/' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/home/registerEvent' element={<EventRegister/>}/>
      <Route path='/events/delete/:id' element={<DeleteEvents/>}/>
      <Route path='/events/edit/:id' element={<EditEvents/>}/>
      <Route path="/login/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:id" element={<ResetPassword />} />
    </Routes>
    </>
  )
}

export default App