import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { TickerSelector } from "../components/TickerSelector";
import type { PortfolioEntry } from "../App";

type PortfolioInputProps = {
  portfolio: PortfolioEntry[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioEntry[]>>;
  setIsOnInput: React.Dispatch<React.SetStateAction<boolean>>;
};

const PortfolioInput: React.FC<PortfolioInputProps> = ({
  portfolio,
  setPortfolio,
  setIsOnInput,
}) => {
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
    if (portfolio.length === 0) {
      alert("Please add at least one asset to your portfolio.");
      return;
    }

    if (portfolio.some((p) => p.allocation < 0)) {
      alert("Allocations must be 0 or greater.");
      return;
    }

    setIsOnInput(false);
  };

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
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Build Your Crypto Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select assets and define your allocations.
          </Typography>
        </Box>

        <TickerSelector onSelect={handleAddCrypto} />

        <Divider />

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
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <Chip
                    label={crypto}
                    onDelete={() => handleDelete(crypto)}
                    sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                  />

                  <TextField
                    size="small"
                    label="Amount"
                    type="number"
                    value={allocation}
                    onChange={(e) =>
                      handleAllocationChange(crypto, e.target.value)
                    }
                    inputProps={{ min: 0, step: "any" }}
                    sx={{ width: 160 }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Box>

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
            Submit Portfolio
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PortfolioInput;