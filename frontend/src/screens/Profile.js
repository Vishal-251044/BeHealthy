import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import StudentInput from "../components/StudentInput";
import { FaDatabase } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import "./Profile.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({ name: "", password: "" });
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            navigate("/login");
        } else {
            setUser(storedUser);
        }
        setTimeout(() => setLoading(false), 1000);
    }, [navigate]);

    const getFirstLetter = (name) => {
        return name.charAt(0).toUpperCase();
    };

    const handleEditClick = () => {
        setShowModal(true);
    };

    const handleChange = (e) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/user/update`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: user.email,
                        name: updatedUser.name,
                        password: updatedUser.password,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                const updatedUserData = { ...user, name: updatedUser.name };
                setUser(updatedUserData);
                localStorage.setItem("user", JSON.stringify(updatedUserData));
                setShowModal(false);
                toast.success("User details updated successfully!");
            } else {
                toast.error("Error updating user details");
            }
        } catch (error) {
            toast.error("Something went wrong! Please try again.");
            console.error("Update Error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div>
            <Navbar />
            <div className="profile-page">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : user ? (
                    <div>
                        <div className="profile-header">
                            <div className="profile-image">{getFirstLetter(user.name)}</div>
                            <div className="profile-info">
                                <p>
                                    <b>Name:</b> {user.name}
                                </p>
                                <p>
                                    <b>Email:</b> {user.email}
                                </p>
                                <button className="logout-button" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                            <div>
                                <FaEdit className="edit-icon" onClick={handleEditClick} />
                            </div>
                        </div>

                        {showModal && (
                            <div className="edit-modal">
                                <div className="modal-content">
                                    <h2>Edit Profile</h2>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Update Name"
                                        value={updatedUser.name}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Update Password"
                                        value={updatedUser.password}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                    <div className="modal-buttons">
                                        <button className="primary-button" onClick={handleUpdate}>
                                            Confirm
                                        </button>
                                        <button
                                            className="secondary-button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div class="data-container">
                            <button className="result-button" onClick={() => navigate('/data')}>
                                Your data <FaDatabase style={{ color: "white" }} />
                            </button>                        </div>
                        <StudentInput />
                    </div>
                ) : null}

            </div>

            <Chatbot />
            <Footer />
        </div>
    );
};

export default Profile;
