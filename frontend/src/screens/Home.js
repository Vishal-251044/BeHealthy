import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { CiFaceSmile } from "react-icons/ci";
import { GoGraph } from "react-icons/go";
import { TbMessageChatbotFilled } from "react-icons/tb";
import { TiDocumentText } from "react-icons/ti";
import { TbHealthRecognition } from "react-icons/tb";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import home1img from "../assets/home1.jpg";
import process from "../assets/home2.jpg";
import "./Home.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const text = "Blockchain-Powered AI Health Risk Prediction System...";
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + text[index]);
                setIndex((prev) => prev + 1);
            }, 100);
            return () => clearTimeout(timeout);
        } else {
            const cursorTimeout = setTimeout(() => {
                setCursorVisible(false);
            }, 500);
            return () => clearTimeout(cursorTimeout);
        }
    }, [index]);

    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 500);
        return () => clearInterval(blinkInterval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/contact`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Message sent successfully!", {
                    autoClose: 3000,
                    hideProgressBar: true,
                });
                setFormData({ name: "", email: "", message: "" });
            } else {
                toast.error(data.error || "Failed to send message.", {
                    autoClose: 3000,
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            toast.error("Backend not working! Please try again later.", {
                autoClose: 3000,
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div>
            <Navbar />
            <div className="home1container">
                <div className="home1text">
                    <h1>
                        {displayText.split("").map((char, i) => (
                            <span
                                key={i}
                                style={{
                                    color: i < index ? "#FFD700" : "#0b79c3",
                                    transition: "color 0.5s",
                                }}
                            >
                                {char}
                            </span>
                        ))}
                        <span className="cursor" style={{ opacity: cursorVisible ? 1 : 0 }}>
                            |
                        </span>
                    </h1>
                    <p>
                        Blockchain-powered AI health risk prediction system utilizes AI, machine learning, data analytics, and blockchain to predict student health risks, ensure data security, and provide personalized well-being recommendations.
                    </p>
                    <div className="m">
                        Prioritize your health today for a better, stress-free tomorrow.
                    </div>
                </div>
                <div className="home1image">
                    <img src={home1img} alt="Sustainability" />
                </div>
            </div>

            <div className="features-section">
                <h1>Key Benefits Of This Application</h1>
                <div className="features-grid">
                    {[
                        {
                            icon: <TbHealthRecognition />,
                            title: "AI-Based Health Risk Prediction",
                            description:
                                "Uses AI/ML models to analyze lifestyle data and predict potential health risks.",
                        },
                        {
                            icon: <TiDocumentText />,
                            title: "Personalized Wellness Recommendations",
                            description:
                                "Provides customized health improvement suggestions based on student lifestyle patterns and risk factors.",
                        },
                        {
                            icon: <CiFaceSmile />,
                            title: "AI-Powered Facial Analysis for Health Detection",
                            description:
                                "Uses facial recognition to detect stress, fatigue, and potential health issues based on expressions.",
                        },
                        {
                            icon: <FaLock />,
                            title: "Blockchain-Powered Data Security",
                            description:
                                "Ensures secure, tamper-proof storage of student health records using blockchain technology.",
                        },
                        {
                            icon: <GoGraph />,
                            title: "Data Visualization Dashboard",
                            description:
                                "Visualizes health trends over time, helping students track and improve their well-being.",
                        },
                        {
                            icon: <TbMessageChatbotFilled />,
                            title: "AI Chatbot for Instant Guidance",
                            description:
                                "Offers quick, AI-driven responses for health-related queries and well-being tips.",
                        },
                    ].map(({ icon, title, description }, index) => (
                        <div className="feature" key={index}>
                            <div className="feature-icon">{icon}</div>
                            <h2>{title}</h2>
                            <p>{description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="process">
                <div>
                    <img src={process} alt="Carbon Trading Process" />
                </div>
                <div>
                    <h1>How to Use?</h1>
                    <p>
                        To use the Smart AI-Driven Health Risk Prediction platform, users first log in and access their profile. They input lifestyle data such as diet, sleep patterns, stress levels, and physical activity. The AI/ML model analyzes this data, predicting potential health risks and providing personalized wellness recommendations. Users can also utilize facial recognition to detect stress and fatigue in real time. An AI-powered chatbot offers instant health guidance. A data analytics dashboard visualizes health trends, enabling better decision-making. All sensitive health data is securely stored on the blockchain, ensuring privacy, immutability, and protection from unauthorized access.
                    </p>
                </div>
            </div>

            <div className="contact-us">
                <h2>Contact Us</h2>
                <div>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <label>Message:</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="4"
                            required
                        ></textarea>
                        <button type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Submit"}{" "}
                        </button>
                    </form>
                </div>
            </div>
            <Chatbot />
            <Footer />
        </div>
    );
};

export default Home;
