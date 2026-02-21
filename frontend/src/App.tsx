import './App.css';
import { useState } from 'react';
import PortfolioInput from './pages/PortfolioInput';

export interface PortfolioEntry {
  crypto: string;
  allocation: number;
}

function App() {

  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [isOnInput, setIsOnInput] = useState(true);

  if (isOnInput) {
    return <PortfolioInput 
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              setIsOnInput={setIsOnInput}
            />;
  }

  return (
    <>
    </>
  )
}

export default App
