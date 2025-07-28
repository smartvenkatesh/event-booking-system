import React from "react";
import { Link } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import "../App.css";
const BackButton = ({ destination = "/home" }) => {
  return (
    <div>
      <Link to={destination}>
        <KeyboardArrowLeftIcon fontSize="x-large" className="backbutton" />
      </Link>
    </div>
  );
};

export default BackButton;
