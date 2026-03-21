export type PortfolioRiskAnalysis = {
    structure_risk: {
        top1_concentration: number;
        top3_concentration: number;
        hhi_index: number;
    };
    liquidity_risk: {
        liquidity_ratio: number;
        low_liquidity_share: number;
        worst_position_days: number;
        weighted_avg_days: number;
        p50_days: number;
        p90_days: number;
    };
    risk_sensitivity: {
        aggregated_return: number;
        asset_returns: Record<string, number>;
        var: number;
        cvar: number;
    };
    portfolio_value: {
        total_value: number;
        allocation_distribution: Record<string, number>;
    };
    sector_exposure: Record<string, number>;
    risk_score: number;
    stress_test: number;
}