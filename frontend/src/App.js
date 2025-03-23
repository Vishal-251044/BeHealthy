import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import Data from "./screens/Data";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
    // 🚫 Prevent zooming via keyboard shortcuts
    const disableZoomKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["+", "-", "0"].includes(event.key)) {
        event.preventDefault();
      }
    };

    // 🚫 Prevent zooming via Ctrl + Mouse Wheel Scroll
    const disableWheelZoom = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    // 🚫 Prevent pinch zoom on touch devices
    const disableTouchZoom = (event) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("keydown", disableZoomKeys);
    document.addEventListener("wheel", disableWheelZoom, { passive: false });
    document.addEventListener("touchmove", disableTouchZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", disableZoomKeys);
      document.removeEventListener("wheel", disableWheelZoom);
      document.removeEventListener("touchmove", disableTouchZoom);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Protected Profile route */}
        <Route
          path="/profile"
          element={
            <Profile />
          }
        />
        <Route path="/data" element={<Data />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* ✅ Toastify for global notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}

export default App;
