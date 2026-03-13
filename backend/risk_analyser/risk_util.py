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
