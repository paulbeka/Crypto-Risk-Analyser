import requests
from fastapi import HTTPException


COINGECKO_BASE_API = "https://api.coingecko.com/api/v3"


def get_market_data(coin_id: str, days: int = 30, vs_currency: str = "usd") -> dict:
    response = requests.get(
        f"{COINGECKO_BASE_API}/coins/{coin_id}/market_chart",
        params={
            "vs_currency": vs_currency,
            "days": days,
            "interval": "daily"
        }
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch market data")

    data = response.json()

    if "prices" not in data or "total_volumes" not in data:
        raise HTTPException(status_code=404, detail="Market data incomplete")

    prices = [p[1] for p in data["prices"]]
    volumes = [v[1] for v in data["total_volumes"]]

    return {
        "prices": prices,
        "volumes": volumes
    }