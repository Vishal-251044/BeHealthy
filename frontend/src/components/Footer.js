import React from 'react';
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-logo">BeHealthy</div>
            <div className="footer-text">The Smart AI-Driven Health Risk Prediction system empowers students to monitor their well-being by analyzing self-reported lifestyle data. Using AI/ML models like Random Forest and XGBoost, it predicts risks related to stress, sleep, and nutrition. Personalized recommendations and a data analytics dashboard help students make informed lifestyle choices, preventing long-term health issues and promoting overall well-being.</div>
            <div className="footer-rights">© 2025 BeHealthy. All rights reserved.</div>
        </footer>
    );
};

export default Footer;