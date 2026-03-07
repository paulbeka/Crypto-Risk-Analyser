from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import requests

from schemas import Portfolio
from risk_analyser.risk_analyser import calculate_portfolio_risk

app = FastAPI(title="Crypto Portfolio Risk Checker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173/",
        "http://localhost:5173",
        "http://127.0.0.1:5173/",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COINGECKO_BASE = "https://api.coingecko.com/api/v3"


# TODO: implement fetch from wallet chain
@app.get("/wallet/{wallet_address}")
def get_wallet_risk(wallet_address: str):
  return {}


@app.post("/analyse")
def get_portfolio_risk(portfolio: list[Portfolio]):
  return calculate_portfolio_risk(portfolio)


@app.get("/tickers")
def get_ticker_suggestions(query: str = Query(..., min_length=2)):

    response = requests.get(
        f"{COINGECKO_BASE}/search",
        params={"query": query}
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch tickers")

    data = response.json()

    suggestions = [
        coin["id"]
        for coin in data.get("coins", [])[:10]
    ]

    return suggestions