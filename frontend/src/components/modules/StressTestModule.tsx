import { Typography, Grid, Box } from "@mui/material";
import PaperCard from "../../components/PaperCard";
import type { RiskModuleProps } from "./types";
import { textSecondary } from "../../theme/colors";

export default function StressTestModule({ riskResult }: RiskModuleProps) {
  const stress = riskResult.stress_test;

  if (!stress || Object.keys(stress).length === 0) {
    return (
      <Grid size={{ xs: 12, lg: 6 }}>
        <PaperCard title="Stress Test" minHeight={200}>
          <Typography sx={{ color: textSecondary }}>
            No stress scenario results available.
          </Typography>
        </PaperCard>
      </Grid>
    );
  }

  const scenarios = Object.entries(stress).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <PaperCard title="Stress Test" minHeight={200}>
        <Typography>Stress test scenarios based on different drawdowns on assets centered over a normalised distribution.</Typography>
        <br />
        <Box display="flex" flexDirection="column" gap={2}>
          {scenarios.map(([shockLevel, data]) => {
            const shockPct = Math.round(Number(shockLevel) * 100);
            const loss = data.portfolio_loss;
            const lossPct = data.loss_pct * 100;

            return (
              <Box
                key={shockLevel}
                sx={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  pb: 1
                }}
              >
                <Typography fontWeight={600}>
                  {shockPct}% Market Shock
                </Typography>

                <Typography sx={{ color: textSecondary }}>
                  Portfolio Loss: ${Math.abs(loss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Typography>

                <Typography sx={{ color: textSecondary }}>
                  Loss: {lossPct.toFixed(2)}%
                </Typography>
              </Box>
            );
          })}
        </Box>
      </PaperCard>
    </Grid>
  );
}