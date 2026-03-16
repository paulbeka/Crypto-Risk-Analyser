import numpy as np


def run_monte_carlo(
        weights, mean_returns, cov_matrix, portfolio_value,
        n_simulations=1000, T=100):
    
    simulations = np.zeros((T, n_simulations))
    for n in range(n_simulations):
        random_returns = np.random.multivariate_normal(mean_returns, cov_matrix, T)
        portfolio_returns = np.dot(random_returns, weights)
        cumulative_returns = np.cumprod(1 + portfolio_returns) - 1
        simulations[:, n] = portfolio_value * (1 + cumulative_returns)

    return simulations


def VaR(returns, alpha=5):
    return np.percentile(returns, alpha)


def CVaR(returns, alpha=5):
    belowVar = returns <= VaR(returns, alpha=alpha)
    return returns[belowVar].mean()


def getVaRMetrics(initial_portfolio_value, returns, alpha=5):
    return {
        "VaR": initial_portfolio_value - VaR(returns, alpha=alpha),
        "CVaR": initial_portfolio_value - CVaR(returns, alpha=alpha)
    }


def get_asset_return_data(asset_data):

    assets = list(asset_data.keys())
    returns_list = []

    for asset in assets:
        prices = asset_data[asset]["prices"]

        returns = [
            (prices[i] - prices[i-1]) / prices[i-1]
            for i in range(1, len(prices))
        ]

        returns_list.append(returns)

    min_len = min(len(r) for r in returns_list)
    returns_list = [r[-min_len:] for r in returns_list]

    returns_matrix = np.array(returns_list).T
    mean_returns = np.mean(returns_matrix, axis=0)
    cov_matrix = np.cov(returns_matrix, rowvar=False)

    if np.ndim(cov_matrix) == 0:
        cov_matrix = np.array([[cov_matrix]])

    portfolio_value = sum(asset_data[a]["prices"][-1] for a in assets)

    return mean_returns, cov_matrix, portfolio_value
