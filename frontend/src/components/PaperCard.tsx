import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { cardBg, borderColor, textPrimary } from "../theme/colors";


type PaperCardProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  minHeight?: number;
};


const PaperCard = ({ title, children, action, minHeight = 320 }: PaperCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      background: cardBg,
      color: textPrimary,
      border: `1px solid ${borderColor}`,
      height: '100%',
      minHeight,
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 2 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {action}
    </Stack>

    {children}
  </Paper>
);

export default PaperCard;