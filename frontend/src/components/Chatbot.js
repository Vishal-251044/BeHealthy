import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTimes, FaMicrophone } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import "./Chatbot.css";

const Chatbot = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [responses, setResponses] = useState({});
    const chatBoxRef = useRef(null);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setChat((prevChat) => [...prevChat, userMessage]);
        setLoading(true);

        try {
            const response = await axios.post("https://behealthy-chatbot1.onrender.com/chat", {
                user_response: message,
                category: "mental health",
                responses
            });

            if (response.data.completed) {
                // 🆕 Request Final NLP Analysis
                const analysisResponse = await axios.post("https://behealthy-chatbot1.onrender.com/analyze", { responses });
                const formattedAnalysis = analysisResponse.data.ai_insights;

                const botMessage = { sender: "bot", text: formattedAnalysis };
                setChat((prevChat) => [...prevChat, botMessage]);
            } else {
                const botMessage = { sender: "bot", text: response.data.next_question };
                setChat((prevChat) => [...prevChat, botMessage]);

                setResponses((prevResponses) => ({
                    ...prevResponses,
                    [`Q${Object.keys(prevResponses).length + 1}`]: message
                }));
            }
        } catch (error) {
            const errorMessage = { sender: "bot", text: "⚠️ Error fetching response. Try again!" };
            setChat((prevChat) => [...prevChat, errorMessage]);
        }

        setMessage("");
        setLoading(false);
    };

    const handleVoiceInput = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.start();

        recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript;
            setMessage(voiceText);
        };

        recognition.onerror = () => {
            alert("⚠️ Voice recognition failed. Please try again.");
        };
    };

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chat]);

    return (
        <div className="chatbot-wrapper">
            {!isOpen && (
                <button className="chatbot-icon" onClick={() => setIsOpen(true)}>
                    <RiMentalHealthFill size={30} />
                </button>
            )}

            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <span className="chat-header-text">Check Mental Health</span>
                        <button className="close-button" onClick={() => setIsOpen(false)}>
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <div className="chat-box" ref={chatBoxRef}>
                        {chat.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="chat-message bot typing">Bot is typing...</div>}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Say hello for start.."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={handleVoiceInput} className="voice-button">
                            <FaMicrophone />
                        </button>
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
