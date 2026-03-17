import { Typography, Grid } from "@mui/material";
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

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <PaperCard title="Stress Test" minHeight={200}>
        <Typography>Stress scenarios coming soon.</Typography>
      </PaperCard>
    </Grid>
  );
}