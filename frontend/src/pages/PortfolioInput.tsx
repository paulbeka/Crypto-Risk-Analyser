import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { TickerSelector } from "../components/TickerSelector";
import type { PortfolioEntry } from "../App";

type PortfolioInputProps = {
  portfolio: PortfolioEntry[];
  ethAddress: string;
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioEntry[]>>;
  setIsOnInput: React.Dispatch<React.SetStateAction<boolean>>;
  setEthAddress: React.Dispatch<React.SetStateAction<string>>;
};

const PortfolioInput: React.FC<PortfolioInputProps> = ({
  portfolio,
  setPortfolio,
  setIsOnInput,
  ethAddress,
  setEthAddress
}) => {
  const [tab, setTab] = useState(0);

  const handleAddCrypto = (crypto: string): void => {
    setPortfolio((prev) => {
      if (prev.some((p) => p.crypto === crypto)) return prev;
      return [...prev, { crypto, allocation: 0 }];
    });
  };

  const handleDelete = (crypto: string): void => {
    setPortfolio((prev) => prev.filter((p) => p.crypto !== crypto));
  };

  const handleAllocationChange = (crypto: string, value: string): void => {
    const next = value === "" ? 0 : Number(value);

    setPortfolio((prev) =>
      prev.map((p) =>
        p.crypto === crypto
          ? { ...p, allocation: Number.isFinite(next) ? next : 0 }
          : p
      )
    );
  };

  const handleSubmit = (): void => {
    if (tab === 0) {
      if (portfolio.length === 0) {
        alert("Please add at least one asset.");
        return;
      }
      if (portfolio.some((p) => p.allocation < 0)) {
        alert("Allocations must be ≥ 0.");
        return;
      }
    } else {
      if (!ethAddress.startsWith("0x") || ethAddress.length !== 42) {
        alert("Please enter a valid Ethereum address.");
        return;
      }
    }

    setIsOnInput(false);
  };

  useEffect(() => {
    setPortfolio([]);
    setEthAddress("");
  }, [tab]);

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
      }}
    >
      <Stack spacing={4}>
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700}>
            Analyse Your Crypto Portfolio
          </Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          centered
        >
          <Tab label="Manual Portfolio" />
          <Tab label="Ethereum Address" />
        </Tabs>

        <Divider />

        {tab === 0 && (
          <>
            <TickerSelector onSelect={handleAddCrypto} />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Selected Assets
              </Typography>

              {portfolio.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No assets selected yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {portfolio.map(({ crypto, allocation }) => (
                    <Box
                      key={crypto}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Chip
                        label={crypto}
                        onDelete={() => handleDelete(crypto)}
                      />

                      <TextField
                        size="small"
                        label="Amount"
                        type="number"
                        value={allocation}
                        onChange={(e) =>
                          handleAllocationChange(crypto, e.target.value)
                        }
                        sx={{ width: 140 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Enter Ethereum Address
            </Typography>

            <TextField
              fullWidth
              label="0x..."
              value={ethAddress}
              onChange={(e) => setEthAddress(e.target.value)}
              placeholder="0x1234...abcd"
            />
          </Box>
        )}

        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Continue
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PortfolioInput;