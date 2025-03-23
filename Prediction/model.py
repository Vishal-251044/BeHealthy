import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, classification_report

# ✅ Load dataset
file_path = "student_health_data.xlsx"
df = pd.read_excel(file_path, sheet_name="Sheet1")

# ✅ Handle missing values (fill with median for numerical, mode for categorical)
df.fillna(df.median(numeric_only=True), inplace=True)
df.fillna(df.mode().iloc[0], inplace=True)

# ✅ Encode categorical variables
label_encoders = {}
categorical_cols = [
    "Gender", "Current Education Level", "Location Type", 
    "Consumption of Junk Food", "Intake of Fruits & Vegetables", 
    "Social Interaction Level", "Number of Meals Per Day"
]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le  # Store encoder for later use

# ✅ Improved Risk Score Calculation
df["Risk Score"] = (
    df["Stress Level"] * 2 +  # High stress increases risk
    (df["Mobile/Screen Time Per Day"] / 2) +  # Excess screen time is unhealthy
    (10 - df["Daily Water Intake (liters)"]) +  # Less water intake increases risk
    (df["Hours of Exercise/Gym Workout Per Week"] * -2) +  # More exercise reduces risk
    (df["Consumption of Junk Food"] * 2) +  # Frequent junk food consumption increases risk
    (8 - df["Average Sleep Hours Per Day"]) * 1.5 +  # Less sleep increases risk
    (2 - df["Hours Spent on Outdoor Games/Sports Per Day"]) * 2  # No outdoor activity is bad
)

# ✅ Normalize Risk Score (0-100%)
df["Risk Score"] = (
    (df["Risk Score"] - df["Risk Score"].min()) / 
    (df["Risk Score"].max() - df["Risk Score"].min())
) * 100

# ✅ Define Risk Levels
def classify_risk(score):
    if score >= 66:
        return "High Risk"
    elif score >= 33:
        return "Moderate Risk"
    else:
        return "Low Risk"

df["Risk Level"] = df["Risk Score"].apply(classify_risk)

# ✅ Prepare features and target
X = df.drop(columns=["Risk Score", "Risk Level"])
y = df["Risk Level"]

# ✅ Split dataset (stratified to maintain class balance)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ✅ Scale numerical features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ✅ Train Neural Network model (optimized)
model = MLPClassifier(
    hidden_layer_sizes=(128, 64, 32),  # More neurons for better learning
    activation='relu',  # Best for complex relationships
    solver='adam',  # Adaptive learning
    max_iter=1000,  # More iterations for convergence
    random_state=42
)

model.fit(X_train, y_train)

# ✅ Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")
print(classification_report(y_test, y_pred))

# ✅ Save model & encoders
joblib.dump(model, "health_risk_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")

print("✅ Model trained and saved as health_risk_model.pkl")
