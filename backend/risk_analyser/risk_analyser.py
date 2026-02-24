

def calculate_portfolio_risk(portfolio: list[dict]) -> dict:
    print(portfolio)
    total_allocation = sum(entry["allocation"] for entry in portfolio)
    if total_allocation > 100:
        return {"risk_score": 100, "message": "Portfolio allocation exceeds 100%"}
    elif total_allocation < 50:
        return {"risk_score": 25, "message": "Low portfolio allocation"}
    else:
        return {"risk_score": 50, "message": "Balanced portfolio allocation"}
    