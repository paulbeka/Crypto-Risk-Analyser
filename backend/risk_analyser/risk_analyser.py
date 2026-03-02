from schemas import Portfolio

from .util import get_market_data


LIQ_THRESHOLD = 0.1


def calculate_portfolio_risk(portfolio: list[Portfolio]) -> dict:
    asset_data = {}
    for asset in portfolio:
       asset_data[asset.crypto] = get_market_data(asset.crypto)

    results = {}
    results["structure_risk"] = calculate_portfolio_structure_risk(portfolio)
    results["liquidity_risk"] = calculate_portfolio_liquidity_risk

    return results


def calculate_portfolio_structure_risk(portfolio: list[Portfolio]) -> dict:
    total_allocation = sum(asset.allocation for asset in portfolio)
    weights = [asset.allocation / total_allocation for asset in portfolio]
    weights.sort(reverse=True)

    top1_concentraion = weights[0]
    top3_concentration = sum(weights[:min(len(weights), 3)])
    hhi_index = sum(weight ** 2 for weight in weights)

    return {
        "top1_concentration": top1_concentraion,
        "top3_concentration": top3_concentration,
        "hhi_index": hhi_index
        # TODO: implement stablecoin concentration
    }


def calculate_portfolio_liquidity_risk(portfolio: list[Portfolio], asset_data: dict) -> dict:    
    total_allocation = sum(asset.allocation for asset in portfolio)
    portfolio_weights = [asset.allocation / total_allocation for asset in portfolio]

    liquidity_ratio = 0
    liquidity_values = []
    for i, asset in enumerate(portfolio):
        latest_price = asset_data[asset.crypto]["prices"][-1]
        position_value = latest_price * asset.allocation

        latest_volume = asset_data[asset.crypto["volumes"][-1]]
        liquidity_values.append(position_value / latest_volume)
        liquidity_ratio += (position_value / latest_volume) * portfolio_weights[i]

    low_liquidity_share = sum([portfolio_weights[i] for i, value in enumerate(liquidity_values) if value < LIQ_THRESHOLD])

    return {
        "liqudity_ratio": liquidity_ratio
    }
