import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { getHealthData } from "../utils/blockchainService";
import { FaHospitalAlt } from "react-icons/fa";
import Chatbot from "../components/Chatbot";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./Data.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Data = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [healthData, setHealthData] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [loading, setLoading] = useState(true);
    const [mapUrl, setMapUrl] = useState("");
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            navigate("/login");
        }
    }, [navigate]);

    const fetchHospitals = async () => {
        setLoading(true);

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log("User's Real-Time Coordinates:", latitude, longitude);

                try {
                    const response = await fetch("https://hospitals-map.onrender.com/get-hospitals", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ latitude, longitude }),
                    });

                    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

                    const data = await response.json();

                    if (data.map_url) {
                        setMapUrl(data.map_url);
                        setShowMap(true);
                        toast.success("Hospitals data fetched successfully!");
                    } else {
                        toast.warn("No hospitals found near your location.");
                    }
                } catch (error) {
                    console.error("Error fetching hospital data:", error);
                    toast.error("Error fetching hospital data.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                toast.error("Unable to get your location.");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userEmail = JSON.parse(storedUser).email;
            setEmail(userEmail);
            fetchHealthData(userEmail);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchHealthData = async (userEmail) => {
        try {
            const data = await getHealthData(userEmail);
            if (data && data.length > 0) {
                const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setHealthData(sortedData);
            } else {
                setHealthData([]);
            }
        } catch (error) {
            console.error("Error fetching health data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getRiskLevelValue = (riskLevel) => {
        return [
            { name: "Low", value: riskLevel.includes("Low") ? 25 : 0, color: "#00C853" },
            { name: "Moderate", value: riskLevel.includes("Moderate") ? 60 : 0, color: "#FFA500" },
            { name: "High", value: riskLevel.includes("High") ? 90 : 0, color: "#FF0000" },
        ];
    };

    const getSentimentScore = (riskLevel, suggestion) => {
        let positive = 0, negative = 0, neutral = 0;

        if (riskLevel.includes("Low")) positive += 70;
        if (riskLevel.includes("Moderate")) neutral += 50;
        if (riskLevel.includes("High")) negative += 90;

        if (suggestion.includes("Great job") || suggestion.includes("good habits")) positive += 30;
        if (suggestion.includes("boost mood") || suggestion.includes("outdoors")) positive += 20;
        if (suggestion.includes("exercise") || suggestion.includes("work out")) positive += 15;
        if (suggestion.includes("health issues") || suggestion.includes("junk food")) negative += 40;
        if (suggestion.includes("stress") || suggestion.includes("tired")) negative += 50;

        return [
            { name: "Positive", value: positive, color: "#4CAF50" },
            { name: "Neutral", value: neutral, color: "#FFEB3B" },
            { name: "Negative", value: negative, color: "#F44336" },
        ];
    };

    return (
        <>
            <Navbar />
            <div className="data-container-unique">
                <h1 className="data-title-unique">User Health Data</h1>
                <div className="hospital-container">
                    {!showMap && (
                        <button className="hospital-button" onClick={fetchHospitals}>
                            {loading ? <div className="loading-circle"></div> : <FaHospitalAlt />}
                        </button>
                    )}

                    {showMap && mapUrl && (
                        <div className="map-container">
                            <button className="close-button-map" onClick={() => setShowMap(false)}>❌</button>
                            <iframe src={mapUrl} width="100%" height="500px" title="Hospital Map" style={{ borderRadius: "15px", border: "none" }}></iframe>
                        </div>
                    )}
                </div>

                <h3 className="data-email">
                    <p>
                        <span title={email}>
                            {email.split("@")[0]}
                        </span>
                    </p>
                </h3>

                {loading ? (
                    <p>Loading health data...</p>
                ) : healthData.length > 0 ? (
                    <div className="data-entries-container">
                        {healthData.map((record, index) => {
                            const riskData = getRiskLevelValue(record.riskLevel);
                            const sentimentData = getSentimentScore(record.riskLevel, record.suggestion);

                            return (
                                <div key={index} className="data-box-unique">
                                    <p><strong>Risk Level:</strong> {record.riskLevel}</p>
                                    <p><strong>Suggestion:</strong> {record.suggestion}</p>
                                    <p><strong>Date:</strong> {new Date(record.timestamp).toLocaleString()}</p>

                                    {/* Risk Level Graph */}
                                    <h4 className="graph-title">📊 Risk Level Visualization</h4>
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={riskData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis dataKey="name" tick={{ fill: "#ccc" }} />
                                                <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: "#ccc" }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "black", border: "1px solid #444", color: "white" }}
                                                    itemStyle={{ color: "white" }}
                                                />
                                                <Bar dataKey="value" fill="#8884d8" barSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Sentiment Analysis Graph */}
                                    <h4 className="graph-title">😊 Sentiment Analysis</h4>
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={sentimentData} barCategoryGap="10%">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: "#ccc", fontSize: 12 }}
                                                    interval={isMobile ? 0 : "preserveEnd"}
                                                    angle={isMobile ? -15 : 0}
                                                    dy={isMobile ? 5 : 0}
                                                />
                                                <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: "#ccc" }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "black", border: "1px solid #444", color: "white" }}
                                                    itemStyle={{ color: "white" }}
                                                />
                                                <Bar dataKey="value" fill="#8884d8" barSize={35} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-data">No health data found.</p>
                )}
            </div>
            <Chatbot />
            <Footer />
        </>
    );
};

export default Data;
