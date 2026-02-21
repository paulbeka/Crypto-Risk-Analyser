from fastapi import FastAPI

app = FastAPI(title="Crypto Portfolio Risk Checker")

@get("/wallet/{wallet_address}")
def get_wallet_risk(wallet_address: str):
  risk_score = calculate_wallet_risk(wallet_address)
  return {}
  # return {
  #   "wallet_address": wallet_address, 
  #   "": value of portfolio 
  #   % risk
  #   diversification metric
  #   "risk_score": risk_score
  # }
 

@post("/portfolio/get_risk")
def get_portfolio_risk(portfolio: ListPortfolio):
  risk_score = calculate_portfolio_risk(portfolio)
  return {
    "risk_score": risk_score
  }