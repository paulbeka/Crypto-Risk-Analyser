    import { Box, Stack, Typography, Divider, Grid } from "@mui/material";
import PaperCard from "../../components/PaperCard";
import type { RiskModuleProps } from "./types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import {
  chartColors,
  textPrimary,
  textSecondary,
  borderColor,
} from "../../theme/colors";

function formatNumber(value: number | undefined, digits = 4) {
  if (!value) return "0";
  return value.toFixed(digits);
}

export default function RiskSensitivityModule({ riskResult }: RiskModuleProps) {
  const sensitivity = riskResult.risk_sensitivity;

  if (!sensitivity) return null;

  const assetData = Object.entries(sensitivity.asset_returns || {}).map(
    ([asset, value]) => ({
      asset,
      value,
    })
  );

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <PaperCard title="Risk Sensitivity" minHeight={360}>
        <Stack spacing={2.5}>

          <Box sx={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetData}>
                <XAxis dataKey="asset" tick={{ fill: textSecondary }} />
                <YAxis tick={{ fill: textSecondary }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8,8,0,0]}>
                  {assetData.map((entry, index) => (
                    <Cell
                      key={entry.asset}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Divider sx={{ borderColor }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Aggregated Return
              </Typography>
              <Typography variant="h6" sx={{ color: textPrimary }}>
                {formatNumber(sensitivity.aggregated_return)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                VaR
              </Typography>
              <Typography variant="h6" sx={{ color: textPrimary }}>
                {formatNumber(sensitivity.var,2)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                CVaR
              </Typography>
              <Typography variant="h6" sx={{ color: textPrimary }}>
                {formatNumber(sensitivity.cvar,2)}
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </PaperCard>
    </Grid>
  );
}