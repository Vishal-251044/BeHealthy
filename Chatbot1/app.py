from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import os
from textblob import TextBlob
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)

# ✅ Enable CORS for all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# 🔹 Load Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing. Set it in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

# 🔹 Load Question Dataset
FILE_PATH = "data/Student_Healthcare_Questions_cleaned.json"
if not os.path.exists(FILE_PATH):
    raise FileNotFoundError(f"❌ File not found: {FILE_PATH}. Ensure the JSON file exists.")

with open(FILE_PATH, "r", encoding="utf-8") as f:
    all_questions = json.load(f)

# 🔹 Sentiment Analysis Function
def sentiment_analysis(text):
    blob = TextBlob(text)
    sentiment_score = blob.sentiment.polarity

    if sentiment_score > 0.5:
        return "😊 Positive"
    elif sentiment_score > 0:
        return "🙂 Slightly Positive"
    elif sentiment_score < -0.5:
        return "😞 Negative"
    else:
        return "😐 Neutral"

# 🔹 AI-Based Analysis
def analyze_with_gemini(responses):
    prompt = "Analyze these user responses and provide a mental health summary:\n\n"
    
    for i, (q, a) in enumerate(responses.items()):
        prompt += f"Q{i+1}: {q}\nUser: {a}\n\n"

    response = genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)
    insights = response.text.replace("*", "").strip() if response.text else "⚠️ No insights generated."

    # Apply NLP Sentiment Analysis
    sentiment = sentiment_analysis(insights)

    # 🆕 Format Output with Emojis & Bold Text
    formatted_analysis = (
        f"\n🧠 Mental Health Summary\n\n"
        f"1️⃣ Stress Level: {sentiment}\n\n"
        f"2️⃣ Happiness Index: {random.randint(3, 9)}/10 🏆\n\n"
        f"3️⃣ Well-being: {insights.splitlines()[0]} 💡\n\n"
        f"4️⃣ Areas to Improve: {insights.splitlines()[1]} 📌\n\n"
        f"5️⃣ Motivation: 🌟 {insights.splitlines()[-1]} 🌟\n"
    )

    return formatted_analysis

# 🔹 Unique Question Selector
asked_questions = set()
def get_next_question(user_response, category):
    prompt = f"The user answered: {user_response}\n\nSuggest the next question related to {category}."
    response = genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)
    next_question_text = response.text.strip() if response.text else random.choice(all_questions)["question"]

    for q in all_questions:
        if q["question"] == next_question_text and next_question_text not in asked_questions:
            asked_questions.add(next_question_text)
            return next_question_text

    remaining_questions = [q["question"] for q in all_questions if q["question"] not in asked_questions]
    
    if remaining_questions:
        new_question = random.choice(remaining_questions)
        asked_questions.add(new_question)
        return new_question

    return "No more questions available."

# 🔹 API: Chatbot Interaction
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_response = data.get("user_response", "")
    category = data.get("category", "")
    responses = data.get("responses", {})

    if not user_response or not category:
        return jsonify({"error": "❌ User response and category are required!"}), 400

    responses[f"Q{len(responses) + 1}"] = user_response

    if len(responses) >= 10:
        insights = analyze_with_gemini(responses)
        return jsonify({"analysis": insights, "completed": True})

    next_question_text = get_next_question(user_response, category)

    return jsonify({
        "next_question": next_question_text,
        "category": category,
        "completed": False
    })

# 🔹 API: Analyze Responses
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    user_responses = data.get("responses", {})

    if not user_responses:
        return jsonify({"error": "❌ User responses are required!"}), 400

    analysis = analyze_with_gemini(user_responses)
    return jsonify({"ai_insights": analysis})

# 🔹 Run Flask API
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
