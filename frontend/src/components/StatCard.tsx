import type { ReactNode } from "react"; 
import { Paper, Typography } from "@mui/material";
import { cardBg, borderColor, textPrimary, textSecondary } from "../theme/colors";


type StatCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
};


const StatCard = ({ title, value, subtitle }: StatCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      background: cardBg,
      color: textPrimary,
      border: `1px solid ${borderColor}`,
      height: '100%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    }}
  >
    <Typography variant="subtitle2" sx={{ color: textSecondary, letterSpacing: 0.6 }}>
      {title}
    </Typography>

    <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 700 }}>
      {value}
    </Typography>

    {subtitle ? (
      <Typography variant="body2" sx={{ mt: 1, color: textSecondary }}>
        {subtitle}
      </Typography>
    ) : null}
  </Paper>
);

export default StatCard;
