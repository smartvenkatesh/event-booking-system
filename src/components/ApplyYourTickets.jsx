import React, { useEffect } from 'react'
import { useUser } from '../UserContext'
import axios from 'axios'

const ApplyYourTickets = () => {
    const {} = useUser()
    useEffect(()=>{
        axios.get("http")
    },[])
  return (
    <div>
        <div className='header'>
        <h1>ApplyYourTickets</h1>
        </div>
    </div>
  )
}

export default ApplyYourTickets