import numpy as np


SIGMA_CONST = 0.25


def run_stress_test(portfolio, asset_data, downturn):
    sigma = downturn * SIGMA_CONST

    asset_results = []
    total_value_before = 0
    total_value_after = 0

    for asset in portfolio:
        price = asset_data[asset.crypto]["prices"][-1]

        position_value = price * asset.allocation

        shock = np.random.normal(loc=-downturn, scale=sigma)

        shock = max(shock, -0.95)

        stressed_price = price * (1 + shock)
        stressed_value = stressed_price * asset.allocation

        total_value_before += position_value
        total_value_after += stressed_value

        asset_results.append({
            "asset": asset.crypto,
            "shock": shock,
            "value_before": position_value,
            "value_after": stressed_value,
            "pnl": stressed_value - position_value
        })

    portfolio_pnl = total_value_after - total_value_before
    loss_pct = portfolio_pnl / total_value_before if total_value_before else 0

    return {
        "portfolio_loss": portfolio_pnl,
        "loss_pct": loss_pct,
        "assets": asset_results
    }