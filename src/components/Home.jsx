import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { Link ,useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from 'axios';
import '../App.css'
import { decodeToken } from '../utils/decodeToken';
import { toast, ToastContainer } from 'react-toastify';
import Dropdown from 'react-bootstrap/Dropdown';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


const Home = () => {
  const{ showEvent,setShowEvent,role,setRole,userId,
        setUserId,setAuthenticated,wait}=useUser()
  const navigate=useNavigate()

  const [ticketShow,setTicketShow]=useState(true)
  const [userName,setUserName] = useState("")
  const [ticketSummary,setTicketSummary] = useState([])

  const [cancelEventId,setCancelEventId] = useState([])
  const [cancelTickets,setCancelTickets] = useState([])
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded) return;
    console.log("decoded", decoded);
    console.log("ticketshow from useEffect",ticketShow);
    handleShowEvents()
    setRole(decoded.role);
    setUserId(decoded._id)
    console.log(decoded._id);
     if(role !== "admin"){
        toast.info(wait || "page refresh")
      }

    if (decoded.role === "user") {
      axios
        .get(`http://localhost:8080/events/register/user/${decoded._id}`, {
          headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        })
        .then((res) => {
          setUserName(res.data.name)
          console.log("allowedRoutes",res.data.name);
          
        })
        .catch((err) => console.log(err));
    }

  }, []);

  const showBuyTickets=()=>{
    if (!userId) return;
    setTicketShow(false)
    axios.get(`http://localhost:8080/events/tickets/summary/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((res) => {
      console.log("Ticket Summary", res.data);
      setTicketSummary(res.data);
      setCancelTickets(res.data.seatNumber)
      setCancelEventId(res.data.eventId)
    })
    .catch((err) => console.error(err));
  }
   

const handleVerifyEvent = (id) => {
  axios
    .put(`http://localhost:8080/events/home/verify/${id}`, { role },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((res) => {
      toast.success("Event verified");
      handleShowEvents();
      
    })
    .catch((err) => {
  console.error("Verification failed:", err.response?.data || err.message);
  toast.error(err.response?.data?.message || "Verification failed");
});
};

const handleApplyTicket = (id) => {
  const seatNumber = prompt("Enter no of tickets:");
  console.log("seatNumber",seatNumber);
  if(seatNumber !== null){
  axios
    .post(`http://localhost:8080/events/home/apply/${id}`, { userId, seatNumber },
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((res) => {
      toast.success(res.data.message);
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Application failed");
    });
  }else{
    toast.info("Your Tickets Cancel")
  }
};


const backToShow = () => {
  setTicketShow(true)
};


  const handleShowEvents=()=>{
    axios.get("http://localhost:8080/events/home",{
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    })
    .then((res)=>{
      setShowEvent(res.data)
      backToShow()
    }).catch((err)=>{
      console.log(err); 
    })
  }

  const handleCancelTicket = (ticketId) => {
  axios
    .post(
      `http://localhost:8080/events/tickets/cancel/${userId}`,
      { ticketId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((res) => {
      toast.success(res.data.message);
      showBuyTickets()
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel ticket");
    });
};


  const handleLogout = () => {
    setAuthenticated(null)
    localStorage.removeItem("token");
    if (role === "admin") {
      navigate('/login')
    }else{
    navigate("/");
    }
  };
  return (
    <div>
      <span className='show-btn' onClick={handleShowEvents}>Show Events</span>
       <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {role !== "admin" ? userName : role}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={showBuyTickets}>Show Tickets</Dropdown.Item>
        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
     {ticketShow ? (<Table striped bordered hover variant='dark'>
      <thead>
        <tr>
          <th>No</th>
          <th>Event Name</th>
          <th>Event Type</th>
          <th>Event Place</th>
          <th>Event Owner</th>
          <th>Phone No</th>
          <th>Address</th>
          <th>Booking Date</th>
          <th>Event Start</th>
          <th>Event End</th>
          {role === "admin" && <th>verify Event</th>}
          {role === "user" && <th>Buy For Ticket</th>}
          {role === "admin" && <th>Edit & Delete</th>}
        </tr>
      </thead>
      <tbody>
        {showEvent.map((events,index)=>(
          <tr key={events._id}>
            {(events.isVerified === true && role === "user" || role === "admin") && <>
            <td>{index + 1}</td>
            <td>{events.eventName}</td>
            <td>{events.eventType}</td>
            <td>{events.eventPlace}</td>
            <td>{events.eventOwner}</td>
            <td>{events.phoneNo}</td>
            <td>{events.address}</td>
            <td>{new Date(events.createdAt).toLocaleString()}</td>
            <td>{new Date(events.startDate).toLocaleString()}</td>
            <td>{new Date(events.endDate).toLocaleString()}</td>
            {role === "admin" && <td>
  {events.isVerified ? (
    "Verified"
  ) : (
    role === "admin" && (
      <Button
        variant="warning"
        size="sm"
        onClick={() => handleVerifyEvent(events._id)}
      >
        Verify
      </Button>
    )
  )}
</td>}
{role === "user" && <td>
  {events.isVerified ? (
    <div className='apply-btn'>
    <Button
      variant="success"
      size="sm"
      onClick={()=>handleApplyTicket(events._id)}
    >
      buy
    </Button>
    </div>
  ) : (
    "Not Available"
  )}
</td>}
{role === "admin" && <td>
  <div className='edit-delete-btn'>
  <Link to={`/events/edit/${events._id}`}>
  <EditIcon color='secondary'/>
  </Link>
  <Link to={`/events/delete/${events._id}`}>
  <DeleteIcon color='error'/>
  </Link>
  </div>
  </td>}
   </>}
            
</tr>))}
      </tbody>
    </Table>):(
      <div>
        <div className='ticket-header'>
          { ticketSummary.map((events,index)=>{
            return(
            <div className='ticket-body' key={index}>
              <span className='eventname'>{events.eventName}</span>
              <span className='eventplace'>{events.eventPlace}</span>
              <span>{new Date(events.startDate).toDateString()} | {new Date(events.startDate).toLocaleTimeString()}</span>
              <h3>Congrats!!!</h3>
              <h5>Your ticked has been booked.</h5>
              <hr />
              <div className='seatno'>
              <span className='text-dark'>{events.seatNumber} tickets</span>
              </div>
              <Button className='mt-3' onClick={backToShow}>Ok</Button>
              <Button className="mt-3"variant="danger" onClick={() => handleCancelTicket(events._id)}>
              Cancel Ticket
              </Button>
            </div>
          )})}
          </div>
      </div>
    )}
    <ToastContainer/>
    </div>
  )
}

export default Home