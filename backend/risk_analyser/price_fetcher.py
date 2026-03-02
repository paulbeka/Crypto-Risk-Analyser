import requests
from fastapi import HTTPException


COINGECKO_BASE_API = "https://api.coingecko.com/api/v3"


def get_prices(coin_id: str, days: int = 30, vs_currency: str = "usd") -> list[float]:
    response = requests.get(
        f"{COINGECKO_BASE_API}/coins/{coin_id}/market_chart",
        params={
            "vs_currency": vs_currency,
            "days": days,
            "interval": "daily"
        }
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch prices")

    data = response.json()

    if "prices" not in data:
        raise HTTPException(status_code=404, detail="Price data not found")

    daily_prices = [price_point[1] for price_point in data["prices"]]

    return daily_prices