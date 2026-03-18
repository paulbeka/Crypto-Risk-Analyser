import numpy as np

from schemas import Portfolio
from .util import get_market_data
from .risk_util import run_monte_carlo, VaR, CVaR, get_asset_return_data
from .stress_test_util import run_stress_test


LIQ_THRESHOLD = 0.1
ALPHA = 0.10


def calculate_portfolio_risk(portfolio: list[Portfolio]) -> dict:
    asset_data = {}

    for asset in portfolio:
        asset_data[asset.crypto] = get_market_data(asset.crypto)

    structure_risk = calculate_portfolio_structure_risk(portfolio)
    liquidity_risk = calculate_portfolio_liquidity_risk(portfolio, asset_data)
    risk_sensitivity = calculate_portfolio_risk_sensitivity(portfolio, asset_data)
    portfolio_value = calculate_portfolio_value(portfolio, asset_data)
    stress_test = calculate_stress_test_risk(portfolio, asset_data)
    risk_score = calculate_risk_score(structure_risk, liquidity_risk, risk_sensitivity)

    return {
        "structure_risk": structure_risk,
        "liquidity_risk": liquidity_risk,
        "risk_sensitivity": risk_sensitivity,
        "portfolio_value": portfolio_value,
        "stress_test": stress_test,
        "risk_score": risk_score,
    }


def calculate_portfolio_value(portfolio: list[Portfolio], asset_data: dict) -> float:
    total_value = 0

    for asset in portfolio:
        latest_price = asset_data[asset.crypto]["prices"][-1]
        total_value += latest_price * asset.allocation

    return total_value


def calculate_portfolio_structure_risk(portfolio: list[Portfolio]) -> dict:
    total_allocation = sum(asset.allocation for asset in portfolio)
    weights = [asset.allocation / total_allocation for asset in portfolio]
    weights.sort(reverse=True)

    top1_concentraion = weights[0]
    top3_concentration = sum(weights[:min(len(weights), 3)])
    hhi_index = sum(weight ** 2 for weight in weights)

    return {
        "top1_concentration": top1_concentraion * 100,
        "top3_concentration": top3_concentration * 100,
        "hhi_index": hhi_index * 100,
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
        if value > LIQ_THRESHOLD
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
        "low_liquidity_share": low_liquidity_share * 100,
        "worst_position_days": worst_position_days,
        "weighted_avg_days": weighted_avg_days,
        "p50_days": p50_days,
        "p90_days": p90_days,
    }


def calculate_portfolio_risk_sensitivity(portfolio, asset_data) -> dict:
    asset_returns = {}
    aggregated_return = 0

    total_allocation = sum(asset.allocation for asset in portfolio)
    weights = []

    for asset in portfolio:
        prices = asset_data[asset.crypto]["prices"]

        returns = [
            (prices[i] - prices[i-1]) / prices[i-1]
            for i in range(1, len(prices))
        ]

        mean_return = sum(returns) / len(returns)

        asset_returns[asset.crypto] = mean_return

        weight = asset.allocation / total_allocation
        weights.append(weight)

        aggregated_return += mean_return * weight


    mean_returns, cov_matrix, portfolio_value = get_asset_return_data(asset_data)

    simulations = run_monte_carlo(weights, mean_returns, cov_matrix, portfolio_value)
    var = VaR(simulations)
    cvar = CVaR(simulations)

    return {
        "asset_returns": asset_returns,
        "aggregated_return": aggregated_return,
        "var": var,
        "cvar": cvar
    }


def calculate_stress_test_risk(portfolio, asset_data) -> dict:
    stress_test_scenarios = [0.1, 0.25, 0.5, 0.75]
    scenario_output = {}

    for scenario in stress_test_scenarios:
        scenario_output[scenario] = run_stress_test(portfolio, asset_data, scenario)

    return scenario_output


def calculate_risk_score(structure_risk, liquidity_risk, risk_sensitivity) -> float:
    structure_score = (
        structure_risk["top1_concentration"] * 0.5
        + structure_risk["top3_concentration"] * 0.3
        + structure_risk["hhi_index"] * 0.2
    )

    liquidity_score = (
        liquidity_risk["liquidity_ratio"] * 0.4
        + liquidity_risk["low_liquidity_share"] * 0.3
        + liquidity_risk["worst_position_days"] * 0.2
        + liquidity_risk["weighted_avg_days"] * 0.1
    )

    risk_sensitivity_score = 0

    total_score = structure_score * 0.4 + liquidity_score * 0.4 + risk_sensitivity_score * 0.2

    return total_score * 100

