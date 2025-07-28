import React, { useEffect, useState } from 'react'
import { useUser } from '../UserContext'
import TextField from '@mui/material/TextField';
import './EventRegister.css'
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { encrypt } from '../utils/encrypted';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { toast } from 'react-toastify';

const EventRegister = () => {
  const [eventName, setEventName] = useState("");
  const [eventType,setEventType]=useState("")
  const [eventPlace,setEventPlace]=useState("")
  const [eventOwner,setEventOwner]=useState("")
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");
  const [startDate,setStartDate] = useState("")
  const [endDate,setEndDate] = useState("")
  const navigate=useNavigate()
  const {id} = useParams()

  useEffect(()=>{
    axios.get(`http://localhost:8080/events/home/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res)=>{
        const data=res.data
        setEventName(data.eventName)
        setEventType(data.eventType)
        setEventPlace(data.eventPlace)
        setEventOwner(data.eventOwner)
        setPhoneNo(data.phoneNo)
        setAddress(data.address)
        setStartDate(new Date(data.startDate))
        setEndDate(new Date(data.endDate))
      }).catch((err) => {
         toast.error("an error found.please check console");
        });
  },[])
  const handleEdit=()=>{
    const data={
      eventName,
      eventType,
      eventPlace,
      eventOwner,
      phoneNo,
      address,
      startDate,
      endDate
    }
    const encrypted=encrypt({data})
    console.log('endDate',encrypted)
    axios.put(`http://localhost:8080/events/home/${id}`,encrypted,{
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    })
    .then((res)=>{
      navigate("/home")
    }).catch((err)=>console.log(err))
  }
  return (
    <div className='register-top'>
      <h1>Update Event Form</h1>
      <form className='register-event'>
        <TextField id="outlined-basic" label="EventName" value={eventName} onChange={(e)=>setEventName(e.target.value)}
         variant="outlined" color='dark' size='small'/>
          <FormControl fullWidth>
         <InputLabel color='dark' id="demo-simple-select-label">Event Type</InputLabel>
          <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={eventType}
          label="EventType"
          color='dark'
          size='small'
          onChange={(e)=>setEventType(e.target.value)}
        >
          <MenuItem value="MagicShow">MagicShow</MenuItem>
          <MenuItem value="Movie">Movie</MenuItem>
          <MenuItem value="ProductLaunch">ProductLaunch</MenuItem>
        </Select>
        </FormControl>
         <TextField id="outlined-basic" label="EventPlace" value={eventPlace} onChange={(e)=>setEventPlace(e.target.value)}
         variant="outlined" color='dark' size='small'/>
         <TextField id="outlined-basic" label="EventOwner" value={eventOwner} onChange={(e)=>setEventOwner(e.target.value)}
         variant="outlined" color='dark' size='small'/>
         <TextField id="outlined-basic" label="PhoneNo" value={phoneNo} onChange={(e)=>setPhoneNo(e.target.value)}
         variant="outlined" color='dark' size='small'/>
         <TextField id="outlined-basic" label="Address" value={address} onChange={(e)=>setAddress(e.target.value)}
         variant="outlined" color='dark' size='small'/>
         <LocalizationProvider dateAdapter={AdapterDateFns}>
         <DateTimePicker
         label="Start Date"
         className="startDate"
         value={startDate}
         onChange={(newValue) => setStartDate(newValue)}
         renderInput={(params) => <TextField {...params} size="small" />}
         />
         <DateTimePicker
         label="End Date"
         className="endDate"
         value={endDate}
         onChange={(newValue) => setEndDate(newValue)}
         renderInput={(params) => <TextField {...params} size="small" />}
         />
         </LocalizationProvider>
         <div className='register-btn'>
         <Button variant='contained' color='success' onClick={handleEdit}>Update Event</Button>
         <Button variant='contained' 
         color='error' onClick={()=>navigate("/home")}>Cancel</Button>
         </div>
      </form>
    </div>
  )
}

export default EventRegister