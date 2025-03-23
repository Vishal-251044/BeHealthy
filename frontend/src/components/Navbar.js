import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="navbar">
      <div className="logo">BeHealthy</div>

      {location.pathname === "/" ? (
        user ? (
          <FaUserCircle className="home-icon" onClick={() => navigate("/profile")} />
        ) : (
          <button className="login-button" onClick={() => navigate("/login")}>
            Login
          </button>
        )
      ) : location.pathname === "/profile" ? (
        <FaHome className="home-icon" onClick={() => navigate("/")} />
      ) : location.pathname === "/data" ? (
        user && <FaUserCircle className="home-icon" onClick={() => navigate("/profile")} />
      ) : (
        <div className="nav-icons">
          <FaHome className="home-icon" onClick={() => navigate("/")} />
          {user && <FaUserCircle className="home-icon" onClick={() => navigate("/profile")} />}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
