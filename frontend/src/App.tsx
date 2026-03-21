import './App.css';
import { useState, useEffect } from 'react';
import PortfolioInput from './pages/PortfolioInput';
import RiskAnalysis from './pages/RiskAnalysis';

export interface PortfolioEntry {
  crypto: string;
  allocation: number;
}

function App() {

  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [ethAddress, setEthAddress] = useState<string>("");
  const [isOnInput, setIsOnInput] = useState(true);

  if (isOnInput) {
    return (
      <PortfolioInput 
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        setIsOnInput={setIsOnInput}
        ethAddress={ethAddress}
        setEthAddress={setEthAddress}
      />
    );
  }

  return (
    <RiskAnalysis 
      portfolio={portfolio}
      setPortfolio={setPortfolio}
      setIsOnInput={setIsOnInput}
      ethAddress={ethAddress}
      setEthAddress={setEthAddress}
    />
  )
}

export default App
