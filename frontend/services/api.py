import requests

API_URL = "http://localhost:8000/analyze"

def fetch_risk_analysis(portfolio):
    response = requests.post(API_URL, json={"portfolio": portfolio})
    return response.json()