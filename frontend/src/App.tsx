import './App.css';
import { useState } from 'react';
import PortfolioInput from './pages/PortfolioInput';
import RiskAnalysis from './pages/RiskAnalysis';

export interface PortfolioEntry {
  crypto: string;
  allocation: number;
}

function App() {

  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([
    { crypto: "bitcoin", allocation: 1 }
  ]);
  const [isOnInput, setIsOnInput] = useState(true);

  if (isOnInput) {
    return (
      <PortfolioInput 
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        setIsOnInput={setIsOnInput}
      />
    );
  }

  return (
    <RiskAnalysis portfolio={portfolio} />
  )
}

export default App
