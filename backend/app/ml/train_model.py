"""
Career Path Prediction Model Training Script
Uses Scikit-learn Random Forest Classifier
Run: python -m app.ml.train_model
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import pickle
import os

# Sample training dataset
def generate_dataset():
    np.random.seed(42)
    n = 1000
    
    data = []
    careers = [
        "Software Engineer", "Data Scientist", "UX/UI Designer",
        "Financial Analyst", "Cybersecurity Engineer", "Business Analyst",
        "Project Manager", "Marketing Manager"
    ]
    
    for _ in range(n):
        career = np.random.choice(careers)
        
        if career == "Software Engineer":
            row = {
                "math_score": np.random.normal(85, 10),
                "logical_score": np.random.normal(88, 8),
                "creative_score": np.random.normal(60, 15),
                "communication_score": np.random.normal(65, 12),
                "analytical_score": np.random.normal(80, 10),
                "leadership_score": np.random.normal(55, 15),
                "tech_interest": np.random.normal(90, 8),
                "business_interest": np.random.normal(40, 15),
                "design_interest": np.random.normal(45, 15),
                "gpa": np.random.normal(3.4, 0.5),
                "experience_years": np.random.randint(0, 10),
                "education_encoded": np.random.choice([3, 4, 5]),
            }
        elif career == "Data Scientist":
            row = {
                "math_score": np.random.normal(92, 7),
                "logical_score": np.random.normal(88, 8),
                "creative_score": np.random.normal(65, 12),
                "communication_score": np.random.normal(68, 12),
                "analytical_score": np.random.normal(90, 8),
                "leadership_score": np.random.normal(55, 15),
                "tech_interest": np.random.normal(88, 8),
                "business_interest": np.random.normal(55, 15),
                "design_interest": np.random.normal(40, 15),
                "gpa": np.random.normal(3.6, 0.4),
                "experience_years": np.random.randint(0, 8),
                "education_encoded": np.random.choice([4, 5, 6]),
            }
        elif career == "UX/UI Designer":
            row = {
                "math_score": np.random.normal(65, 12),
                "logical_score": np.random.normal(70, 12),
                "creative_score": np.random.normal(92, 7),
                "communication_score": np.random.normal(82, 10),
                "analytical_score": np.random.normal(70, 12),
                "leadership_score": np.random.normal(65, 12),
                "tech_interest": np.random.normal(75, 12),
                "business_interest": np.random.normal(55, 15),
                "design_interest": np.random.normal(95, 5),
                "gpa": np.random.normal(3.2, 0.5),
                "experience_years": np.random.randint(0, 8),
                "education_encoded": np.random.choice([2, 3, 4]),
            }
        elif career == "Financial Analyst":
            row = {
                "math_score": np.random.normal(88, 8),
                "logical_score": np.random.normal(82, 10),
                "creative_score": np.random.normal(55, 15),
                "communication_score": np.random.normal(75, 10),
                "analytical_score": np.random.normal(88, 8),
                "leadership_score": np.random.normal(65, 12),
                "tech_interest": np.random.normal(60, 15),
                "business_interest": np.random.normal(90, 8),
                "design_interest": np.random.normal(35, 15),
                "gpa": np.random.normal(3.5, 0.4),
                "experience_years": np.random.randint(0, 10),
                "education_encoded": np.random.choice([3, 4, 5]),
            }
        elif career == "Cybersecurity Engineer":
            row = {
                "math_score": np.random.normal(80, 10),
                "logical_score": np.random.normal(88, 8),
                "creative_score": np.random.normal(58, 15),
                "communication_score": np.random.normal(65, 12),
                "analytical_score": np.random.normal(85, 8),
                "leadership_score": np.random.normal(60, 12),
                "tech_interest": np.random.normal(92, 7),
                "business_interest": np.random.normal(40, 15),
                "design_interest": np.random.normal(35, 15),
                "gpa": np.random.normal(3.3, 0.5),
                "experience_years": np.random.randint(0, 8),
                "education_encoded": np.random.choice([3, 4, 5]),
            }
        elif career == "Business Analyst":
            row = {
                "math_score": np.random.normal(75, 10),
                "logical_score": np.random.normal(80, 10),
                "creative_score": np.random.normal(65, 12),
                "communication_score": np.random.normal(85, 8),
                "analytical_score": np.random.normal(82, 8),
                "leadership_score": np.random.normal(72, 10),
                "tech_interest": np.random.normal(65, 12),
                "business_interest": np.random.normal(88, 8),
                "design_interest": np.random.normal(45, 15),
                "gpa": np.random.normal(3.3, 0.5),
                "experience_years": np.random.randint(0, 10),
                "education_encoded": np.random.choice([3, 4]),
            }
        elif career == "Project Manager":
            row = {
                "math_score": np.random.normal(72, 12),
                "logical_score": np.random.normal(78, 10),
                "creative_score": np.random.normal(68, 12),
                "communication_score": np.random.normal(90, 7),
                "analytical_score": np.random.normal(78, 10),
                "leadership_score": np.random.normal(90, 7),
                "tech_interest": np.random.normal(65, 12),
                "business_interest": np.random.normal(82, 8),
                "design_interest": np.random.normal(50, 15),
                "gpa": np.random.normal(3.2, 0.5),
                "experience_years": np.random.randint(2, 15),
                "education_encoded": np.random.choice([3, 4]),
            }
        else:  # Marketing Manager
            row = {
                "math_score": np.random.normal(65, 12),
                "logical_score": np.random.normal(68, 12),
                "creative_score": np.random.normal(85, 8),
                "communication_score": np.random.normal(92, 7),
                "analytical_score": np.random.normal(72, 10),
                "leadership_score": np.random.normal(78, 10),
                "tech_interest": np.random.normal(60, 15),
                "business_interest": np.random.normal(85, 8),
                "design_interest": np.random.normal(70, 12),
                "gpa": np.random.normal(3.1, 0.5),
                "experience_years": np.random.randint(0, 10),
                "education_encoded": np.random.choice([3, 4]),
            }
        
        row["career"] = career
        data.append(row)
    
    df = pd.DataFrame(data)
    # Clip values
    score_cols = [c for c in df.columns if c not in ["career", "gpa", "experience_years", "education_encoded"]]
    for col in score_cols:
        df[col] = df[col].clip(0, 100)
    df["gpa"] = df["gpa"].clip(0, 4.0)
    df["experience_years"] = df["experience_years"].clip(0, 20)
    
    return df

def train_model():
    print("🚀 Generating training dataset...")
    df = generate_dataset()
    
    feature_cols = [
        "math_score", "logical_score", "creative_score", "communication_score",
        "analytical_score", "leadership_score", "tech_interest", "business_interest",
        "design_interest", "gpa", "experience_years", "education_encoded"
    ]
    
    X = df[feature_cols]
    y = df["career"]
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)
    
    print("🌲 Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Model Accuracy: {accuracy:.2%}")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    # Save models
    os.makedirs("app/ml/models", exist_ok=True)
    with open("app/ml/models/career_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("app/ml/models/label_encoder.pkl", "wb") as f:
        pickle.dump(le, f)
    with open("app/ml/models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    
    # Save dataset
    df.to_csv("app/ml/training_data.csv", index=False)
    
    print("\n💾 Model saved to app/ml/models/")
    print("📁 Dataset saved to app/ml/training_data.csv")
    
    # Feature importance
    importances = model.feature_importances_
    print("\n🔍 Top Feature Importances:")
    for feat, imp in sorted(zip(feature_cols, importances), key=lambda x: -x[1])[:5]:
        print(f"  {feat}: {imp:.3f}")

if __name__ == "__main__":
    train_model()
