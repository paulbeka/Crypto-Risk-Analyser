from schemas import Portfolio

from .price_fetcher import get_prices


def calculate_portfolio_risk(portfolio: list[Portfolio]) -> dict:
    asset_prices = {}

    for asset in portfolio:
       asset_prices[asset.crypto] = get_prices(asset.crypto)

    print(asset_prices)



    