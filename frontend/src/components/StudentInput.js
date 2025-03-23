import React, { useState } from "react";
import { storeHealthData } from "../utils/blockchainService";
import { toast } from "react-toastify";
import "./StudentInput.css";

const StudentInput = () => {
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        "Age": "",
        "Gender": "",
        "Student Height (cm)": "",
        "Student Weight (kg)": "",
        "Current Education Level": "",
        "Location Type": "",
        "Daily Water Intake (liters)": "",
        "Number of Meals Per Day": "",
        "Consumption of Junk Food": "",
        "Intake of Fruits & Vegetables": "",
        "Average Sleep Hours Per Day": "",
        "Stress Level": "",
        "Study Hours Per Day": "",
        "Mobile/Screen Time Per Day": "",
        "Hours Spent on Outdoor Games/Sports Per Day": "",
        "Hours of Exercise/Gym Workout Per Week": "",
        "Social Interaction Level": "",
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === "number" && value < 0) {
            toast.error("⚠️ Please enter a valid non-negative number.");
            return;
        }
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        for (let key in formData) {
            if (!formData[key]) {
                setError(`⚠️ Please fill in: ${key}`);
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetch("https://behealthy-prediction.onrender.com/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch");
            }

            const data = await response.json();
            setResult(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToBlockchain = async () => {
        if (!result) return;
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user?.email;
        if (!email) {
            toast.error("⚠️ User email not found. Please log in again.");
            return;
        }
        const riskLevel = result["Risk Level"];
        const suggestion = result["Health Suggestion"];
        const timestamp = new Date().toISOString();
        try {
            setSaving(true);
            await storeHealthData(email, riskLevel, suggestion, timestamp);
            toast.success("✅ Health data stored successfully on blockchain!");
            setShowModal(false);
        } catch (error) {
            toast.error("❌ Failed to store data on blockchain.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-container">
            <h2 className="input-title">Student Health Risk Analysis</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="student-form" onSubmit={handleSubmit}>
                <label>Age:</label>
                <input type="number" name="Age" onChange={handleChange} placeholder="e.g 18" required />

                <label>Gender:</label>
                <select name="Gender" onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>

                <label>Height (cm):</label>
                <input type="number" name="Student Height (cm)" onChange={handleChange} placeholder="e.g 170" required />

                <label>Weight (kg):</label>
                <input type="number" name="Student Weight (kg)" onChange={handleChange} placeholder="e.g 55" required />

                <label>Current Education Level:</label>
                <select name="Current Education Level" onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="School">School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                </select>

                <label>Location Type:</label>
                <select name="Location Type" onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Village">Village</option>
                    <option value="Urban">Urban</option>
                    <option value="Suburban">Suburban</option>
                </select>

                <label>Daily Water Intake (liters):</label>
                <input type="number" name="Daily Water Intake (liters)" onChange={handleChange} placeholder="e.g 2" required />

                <label>Number of Meals Per Day:</label>
                <input type="number" name="Number of Meals Per Day" onChange={handleChange} placeholder="e.g 5" required />

                <label>Consumption of Junk Food:</label>
                <select name="Consumption of Junk Food" onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Frequent">Frequent</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Rarely">Rarely</option>
                </select>

                <label>Intake of Fruits & Vegetables:</label>
                <select name="Intake of Fruits & Vegetables" onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                </select>

                <label>Average Sleep Hours Per Day:</label>
                <input type="number" name="Average Sleep Hours Per Day" onChange={handleChange} placeholder="e.g 8" required />

                <label className="stress-label">Stress Level:</label>
                <input type="number" name="Stress Level" placeholder="1-10" onChange={handleChange} required/>

                <label>Study Hours Per Day:</label>
                <input type="number" name="Study Hours Per Day" onChange={handleChange} placeholder="e.g 3" required />

                <label>Mobile/Screen Time Per Day:</label>
                <input type="number" name="Mobile/Screen Time Per Day" onChange={handleChange} placeholder="e.g 3" required />

                <label>Hours Spent on Outdoor Games/Sports Per Day:</label>
                <input type="number" name="Hours Spent on Outdoor Games/Sports Per Day" onChange={handleChange} placeholder="e.g 4" required />

                <label>Hours of Exercise/Gym Workout Per Week:</label>
                <input type="number" name="Hours of Exercise/Gym Workout Per Week" onChange={handleChange} placeholder="e.g 8" required />

                <label>Social Interaction Level:</label>
                <select name="Social Interaction Level" onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                </select>

                <button type="submit" className="submit-data" disabled={loading}>
                    {loading ? "Wait..." : "Submit"}
                </button>
            </form>

            {/* Modal to display Risk Level & Suggestions */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Health Risk Analysis</h3>
                        <p><strong>Risk Level:</strong> {result?.["Risk Level"]}</p>
                        <p><strong>Suggestion:</strong> {result?.["Health Suggestion"]}</p>
                        <div className="modal-buttons">
                            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                            <button className="save-btn" onClick={handleSaveToBlockchain} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentInput;
