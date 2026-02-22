import { useEffect } from 'react';
import type { PortfolioEntry } from '../App';
import { submitPortfolio } from '../api/Api';


const RiskAnalysis = ({ portfolio }: { portfolio: PortfolioEntry[] }) => {

    useEffect(() => {
        submitPortfolio(portfolio);
    });

    return (
        <div>
            <h1>Risk Analysis</h1>

        </div>
    )
}

export default RiskAnalysis;
