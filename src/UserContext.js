import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [eventName, setEventName] = useState("");
  const [eventType,setEventType]=useState("")
  const [eventPlace,setEventPlace]=useState("")
  const [eventOwner,setEventOwner]=useState("")
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");
  const [userId, setUserIdState] = useState(null);
  const [authenticated,setAuthenticated] = useState(null)
  const [email, setEmail] = useState();
  const [name, setName] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [role, setRole] = useState("");
  const[showEvent,setShowEvent]=useState([])
  const [show,setShow] = useState([])
  const [wait,setWait] = useState("")

  // Load from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserIdState(storedUserId);
      console.log("storedUserid:", storedUserId);
    }
  }, []);

  // Update both state and localStorage
  const setUserId = (id) => {
    if (id) {
      localStorage.setItem("userId", id);
    } else {
      localStorage.removeItem("userId");
    }
    setUserIdState(id);
    setAuthenticated(id)
    console.log("userID:", userId);
  };

  return (
    <UserContext.Provider
      value={{
        wait,
        setWait,
        authenticated,
        setAuthenticated,
        userId,
        setUserId,
        email,
        setEmail,
        name,
        setName,
        eventName,
        setEventName,
        eventType,setEventType,
        eventPlace,setEventPlace,
        eventOwner,setEventOwner,
        phoneNo,
        setPhoneNo,
        address,
        setAddress,
        selectedRoutes,
        setSelectedRoutes,
        role,
        setRole,
        allowedRoutes,
        setAllowedRoutes,
        showEvent,setShowEvent,
        show,setShow
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
