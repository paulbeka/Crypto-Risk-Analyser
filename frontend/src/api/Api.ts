const BASE_URL = "http://localhost:8000";


export const submitPortfolio = async (portfolio: { crypto: string; allocation: number }[]) => {
  try {
    const response = await fetch(`${BASE_URL}/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ portfolio }),
    });

    if (!response.ok) {
        throw new Error("Failed to submit portfolio");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};


export const getTickerSuggestions = async (query: string) => {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/tickers?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ticker suggestions");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};