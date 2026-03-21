import json, os
import numpy as np

from schemas import Portfolio
from .util import get_market_data
from .risk_util import run_monte_carlo, VaR, CVaR, get_asset_return_data
from .stress_test_util import run_stress_test


LIQ_THRESHOLD = 0.1
ALPHA = 0.10
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATEGORY_PATH = os.path.join(BASE_DIR, "data", "coin_categorisations.json")


def calculate_portfolio_risk(portfolio: list[Portfolio]) -> dict:
    asset_data = {}

    for asset in portfolio:
        try:
            asset_data[asset.crypto] = get_market_data(asset.crypto)
        except:
            asset_data[asset.crypto] = {"prices": [0], "volumes": [0]}

    structure_risk = calculate_portfolio_structure_risk(portfolio)
    liquidity_risk = calculate_portfolio_liquidity_risk(portfolio, asset_data)
    risk_sensitivity = calculate_portfolio_risk_sensitivity(portfolio, asset_data)
    portfolio_value = calculate_portfolio_value(portfolio, asset_data)
    sector_exposure = calculate_sector_exposure(portfolio_value)
    stress_test = calculate_stress_test_risk(portfolio, asset_data)
    risk_score = calculate_risk_score(structure_risk, liquidity_risk, risk_sensitivity)

    return {
        "structure_risk": structure_risk,
        "liquidity_risk": liquidity_risk,
        "risk_sensitivity": risk_sensitivity,
        "portfolio_value": portfolio_value,
        "sector_exposure": sector_exposure,
        "stress_test": stress_test,
        "risk_score": risk_score,
    }


def calculate_portfolio_value(portfolio: list[Portfolio], asset_data: dict) -> float:
    total_value = 0
    allocation_distribution = {}

    for asset in portfolio:
        prices = asset_data.get(asset.crypto, {}).get("prices", [0])
        latest_price = prices[-1] if prices else 0
        value = latest_price * asset.allocation

        allocation_distribution[asset.crypto] = value
        total_value += value

    if total_value == 0:
        return {
            "total_value": 0,
            "allocation_distribution": {k: 0 for k in allocation_distribution}
        }

    for asset in allocation_distribution:
        allocation_distribution[asset] = (allocation_distribution[asset] / total_value) * 100

    return {
        "total_value": total_value,
        "allocation_distribution": allocation_distribution
    }


def calculate_portfolio_structure_risk(portfolio: list[Portfolio]) -> dict:
    total_allocation = sum(asset.allocation for asset in portfolio)

    if total_allocation == 0 or len(portfolio) == 0:
        return {
            "top1_concentration": 0,
            "top3_concentration": 0,
            "hhi_index": 0,
        }

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

    if total_allocation == 0 or len(portfolio) == 0:
        return {
            "liquidity_ratio": 0,
            "low_liquidity_share": 0,
            "worst_position_days": 0,
            "weighted_avg_days": 0,
            "p50_days": 0,
            "p90_days": 0,
        }

    portfolio_weights = [asset.allocation / total_allocation for asset in portfolio]

    liquidity_ratio = 0
    liquidity_values = []
    days_to_liquidate = []

    for i, asset in enumerate(portfolio):
        data = asset_data.get(asset.crypto, {})
        prices = data.get("prices", [0])
        volumes = data.get("volumes", [0])

        latest_price = prices[-1] if prices else 0
        latest_volume = volumes[-1] if volumes else 0

        position_value = latest_price * asset.allocation

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

    worst_position_days = max(finite_days) if finite_days else 0

    weighted_avg_days = sum(
        portfolio_weights[i] * days_to_liquidate[i]
        for i in range(len(days_to_liquidate))
        if np.isfinite(days_to_liquidate[i])
    )

    p50_days = np.percentile(finite_days, 50) if finite_days else 0
    p90_days = np.percentile(finite_days, 90) if finite_days else 0

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

    if total_allocation == 0 or len(portfolio) == 0:
        return {
            "asset_returns": {},
            "aggregated_return": 0,
            "var": 0,
            "cvar": 0
        }

    weights = []

    for asset in portfolio:
        prices = asset_data.get(asset.crypto, {}).get("prices", [0, 0])

        if len(prices) < 2 or prices[0] == 0:
            asset_returns[asset.crypto] = 0
        else:
            asset_returns[asset.crypto] = ((prices[-1] / prices[0]) - 1) * 100

        weight = asset.allocation / total_allocation
        weights.append(weight)

        aggregated_return += asset_returns[asset.crypto] * weight

    try:
        mean_returns, cov_matrix, portfolio_value = get_asset_return_data(asset_data)
        simulations = run_monte_carlo(weights, mean_returns, cov_matrix, portfolio_value)
        var = VaR(simulations)
        cvar = CVaR(simulations)
    except:
        var = 0
        cvar = 0

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
        try:
            scenario_output[scenario] = run_stress_test(portfolio, asset_data, scenario)
        except:
            scenario_output[scenario] = 0

    return scenario_output


def calculate_sector_exposure(portfolio) -> dict:
    categories = {
        "stablecoins": 0,
        "defi": 0,
        "l1": 0,
        "memecoins": 0,
        "other": 0
    }

    if not os.path.exists(CATEGORY_PATH):
        return categories

    try:
        with open(CATEGORY_PATH, "r") as f:
            coin_map = json.load(f)
    except:
        return categories

    coin_to_category = {}
    for category, coins in coin_map.items():
        for coin in coins:
            coin_to_category[coin.lower()] = category.lower()

    allocation_distribution = portfolio.get("allocation_distribution", {})

    for asset in allocation_distribution:
        value = allocation_distribution[asset]
        category = coin_to_category.get(asset.lower(), "other")
        categories[category] += value

    return categories


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