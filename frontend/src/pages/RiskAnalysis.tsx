import { useEffect, useState } from 'react';
import type { PortfolioEntry } from '../App';
import { submitPortfolio } from '../api/Api';
import { Paper } from '@mui/material';

import LoadingPage from '../components/LoadingPage';
import type { PortfolioRiskAnalysis } from '../types/PortfolioRiskAnalysis';


const RiskAnalysis = ({ portfolio }: { portfolio: PortfolioEntry[] }) => {
	const [riskResult, setRiskResult] = useState<PortfolioRiskAnalysis | null>(null);
	
    useEffect(() => {
		submitPortfolio(portfolio)
		.then(res => setRiskResult(res))
		.catch(error => console.log(error));
    }, []);

	if (riskResult == null) {
		return <LoadingPage />
	}

    return (
        <Paper 
            elevation={6}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                maxWidth: 650,
                mx: "auto",
                mt: 8,
                background: "linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)",
            }}>
            <h1>Risk Analysis</h1>

            <div>
                <h3>Structure Risk</h3>
            </div>

            <div>
                <h3>Liqudity Risk</h3>
            </div>

            <div>
                <h3>Risk Sensitivity</h3>
            </div>
        </Paper>
    )
}

export default RiskAnalysis;
