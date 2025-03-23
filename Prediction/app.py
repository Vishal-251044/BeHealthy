from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})  

# ✅ Load trained model & preprocessors
model = joblib.load("health_risk_model.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")

def generate_health_suggestion(student_data, risk_level):
    suggestions = []

    # ✅ Hydration Advice
    if float(student_data.get("Daily Water Intake (liters)", 2)) < 2:
        suggestions.append("💧 Drink more water! Aim for at least 2 liters per day to stay hydrated and support body functions.")

    # ✅ Screen Time Advice
    if float(student_data.get("Mobile/Screen Time Per Day", 0)) > 4:
        suggestions.append("📱 Reduce screen time! Try to limit usage to under 4 hours and take regular eye breaks.")

    # ✅ Sleep Advice
    if float(student_data.get("Average Sleep Hours Per Day", 7)) < 6:
        suggestions.append("😴 Improve sleep schedule! Aim for 7-8 hours of sleep daily for better concentration and health.")

    # ✅ Exercise Advice
    if float(student_data.get("Hours of Exercise/Gym Workout Per Week", 0)) < 2:
        suggestions.append("🏋️‍♂️ Exercise regularly! Try to work out at least 3 times a week to maintain fitness and energy levels.")

    # ✅ Junk Food Advice
    if student_data.get("Consumption of Junk Food", "No") == "Frequent":
        suggestions.append("🍔 Cut down on junk food! Eating too much fast food can lead to long-term health issues. Opt for fruits & veggies.")

    # ✅ Stress Management
    if float(student_data.get("Stress Level", 5)) > 7:
        suggestions.append("🧘‍♂️ Manage stress effectively! Practice relaxation techniques like meditation or hobbies to reduce stress.")

    # ✅ Social Interaction
    if student_data.get("Social Interaction Level", "Moderate") == "Low":
        suggestions.append("🤝 Increase social interactions! Spend more time with friends and family for better mental well-being.")

    # ✅ Outdoor Activity
    if float(student_data.get("Hours Spent on Outdoor Games/Sports Per Day", 0)) < 1:
        suggestions.append("🌳 Spend time outdoors! Engage in outdoor activities to boost mood and physical health.")

    # ✅ Final Risk-Based Summary
    risk_messages = {
        "Low Risk": "🟢 Great job! Your health risk is low. Keep up the good habits! 👍",
        "Moderate Risk": "🟠 Moderate risk detected! Consider improving your habits for better long-term health. ⚠️",
        "High Risk": "🔴 High risk alert! Immediate lifestyle changes are needed to improve your well-being. 🚨"
    }

    # Insert general risk message at the top
    suggestions.insert(0, risk_messages[risk_level])

    return "\n".join(suggestions)  # Format output with line breaks

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Received data:", data) 

        if not data:
            return jsonify({"error": "No data received"}), 400

        # Convert JSON to DataFrame
        df = pd.DataFrame([data])
        print("DataFrame before processing:\n", df)  

        # ✅ Ensure feature names match those used during training
        expected_features = list(scaler.feature_names_in_) 
        received_features = list(df.columns)

        missing_features = set(expected_features) - set(received_features)
        extra_features = set(received_features) - set(expected_features)

        if missing_features:
            print(f"⚠️ Missing features: {missing_features}")
            return jsonify({"error": f"Missing features: {', '.join(missing_features)}"}), 400

        if extra_features:
            print(f"⚠️ Unexpected extra features: {extra_features}")
            return jsonify({"error": f"Unexpected features: {', '.join(extra_features)}"}), 400

        # ✅ Reorder columns to match training order
        df = df[expected_features]
        print("DataFrame after reordering:\n", df)  

        # ✅ Encode categorical features
        for col in label_encoders:
            if col in df.columns:
                known_categories = list(label_encoders[col].classes_)

                # Ensure only known categories are used, replace unknowns with first known category
                df[col] = df[col].apply(lambda x: x if x in known_categories else known_categories[0])
                df[col] = label_encoders[col].transform(df[col].astype(str))
                df[col] = pd.to_numeric(df[col], errors="coerce")

        print("DataFrame after encoding:\n", df)  # Debugging

        # ✅ Convert all values to numeric
        df = df.apply(pd.to_numeric, errors="coerce")
        print("DataFrame after conversion to numeric:\n", df)  # Debugging

        # ✅ Handle NaN values
        if df.isnull().any().any():
            df.fillna(df.median(numeric_only=True), inplace=True)
        print("DataFrame after handling NaN:\n", df)  # Debugging

        # ✅ Scale features correctly (ensures correct order)
        df_scaled = scaler.transform(df)
        print("DataFrame after scaling:\n", df_scaled)  # Debugging

        # ✅ Predict using the model
        risk_level = str(model.predict(df_scaled)[0])

        # ✅ Convert numeric string values to actual numbers before passing to generate_health_suggestion()
        cleaned_data = {}
        for key, value in data.items():
            try:
                cleaned_data[key] = float(value) if str(value).replace('.', '', 1).isdigit() else value
            except ValueError:
                cleaned_data[key] = value  # Keep as is if conversion fails

        print("Cleaned data before generate_health_suggestion():", cleaned_data)  # Debugging
        print("Predicted Risk Level:", risk_level)  

        # ✅ Generate health suggestion
        health_suggestion = generate_health_suggestion(cleaned_data, risk_level)

        return jsonify({"Risk Level": risk_level, "Health Suggestion": health_suggestion})

    except Exception as e:
        print("⚠️ Error:", str(e))  
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
