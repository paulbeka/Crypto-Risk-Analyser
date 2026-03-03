import numpy as np

from schemas import Portfolio
from .util import get_market_data


LIQ_THRESHOLD = 0.1
ALPHA = 0.10 


def calculate_portfolio_risk(portfolio: list[Portfolio]) -> dict:
    asset_data = {}
    for asset in portfolio:
       asset_data[asset.crypto] = get_market_data(asset.crypto)

    results = {}
    results["structure_risk"] = calculate_portfolio_structure_risk(portfolio)
    results["liquidity_risk"] = calculate_portfolio_liquidity_risk(portfolio, asset_data)
    results["risk_sensitivity"] = calculate_portfolio_risk_sensitivity(portfolio, asset_data)

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
    days_to_liquidate = []

    for i, asset in enumerate(portfolio):
        latest_price = asset_data[asset.crypto]["prices"][-1]
        position_value = latest_price * asset.allocation

        latest_volume = asset_data[asset.crypto]["volumes"][-1]

        if latest_volume == 0:
            liquidity_values.append(float("inf"))
            days_to_liquidate.append(float("inf"))
            continue

        liquidity_metric = position_value / latest_volume
        liquidity_values.append(liquidity_metric)
        liquidity_ratio += liquidity_metric * portfolio_weights[i]

        days_i = position_value / (ALPHA * latest_volume)
        days_to_liquidate.append(days_i)

    low_liquidity_share = sum(
        portfolio_weights[i]
        for i, value in enumerate(liquidity_values)
        if value < LIQ_THRESHOLD
    )

    finite_days = [d for d in days_to_liquidate if np.isfinite(d)]

    worst_position_days = max(finite_days) if finite_days else float("inf")

    weighted_avg_days = sum(
        portfolio_weights[i] * days_to_liquidate[i]
        for i in range(len(days_to_liquidate))
        if np.isfinite(days_to_liquidate[i])
    )

    p50_days = np.percentile(finite_days, 50) if finite_days else float("inf")
    p90_days = np.percentile(finite_days, 90) if finite_days else float("inf")

    return {
        "liquidity_ratio": liquidity_ratio,
        "low_liquidity_share": low_liquidity_share,
        "worst_position_days": worst_position_days,
        "weighted_avg_days": weighted_avg_days,
        "p50_days": p50_days,
        "p90_days": p90_days,
    }


def calculate_portfolio_risk_sensitivity(portfolio, asset_data) -> dict:
    return {}
