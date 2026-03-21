import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Typography, Grid } from "@mui/material";
import PaperCard from "../../components/PaperCard";
import { textSecondary } from "../../theme/colors";
import type { FunctionComponent } from "react";

type AllocationItem = {
  asset: string;
  weight: number;
};

type Props = {
  data?: Record<string, number>;
};

// 👇 Map to nicer display names
const CATEGORY_LABELS: Record<string, string> = {
  stablecoins: "Stablecoins",
  defi: "DeFi",
  l1: "Layer 1",
  memecoins: "Memecoins",
  other: "Other",
};

const CategoryDistributionModule: FunctionComponent<Props> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Grid size={{ xs: 12, lg: 6 }}>
        <PaperCard title="Category Distribution" minHeight={200}>
          <Typography sx={{ color: textSecondary }}>
            No allocation data available.
          </Typography>
        </PaperCard>
      </Grid>
    );
  }

  const allocationData: AllocationItem[] = Object.entries(data).map(
    ([key, value]) => ({
      asset: CATEGORY_LABELS[key] || key.toUpperCase(),
      weight: value,
    })
  );

  const hasData = allocationData.some((item) => item.weight > 0);

  if (!hasData) {
    return (
      <Grid size={{ xs: 12, lg: 6 }}>
        <PaperCard title="Category Distribution" minHeight={200}>
          <Typography sx={{ color: textSecondary }}>
            Allocation data contains no active positions.
          </Typography>
        </PaperCard>
      </Grid>
    );
  }

  const chartColors: string[] = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  type TooltipProps = {
    active?: boolean;
    payload?: {
      value: number;
      payload: AllocationItem;
    }[];
  };

  const CustomTooltip: FunctionComponent<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div
          style={{
            background: "#fff",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <p style={{ margin: 0 }}>{payload[0].payload.asset}</p>
          <p style={{ margin: 0 }}>{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <PaperCard title="Category Distribution" minHeight={300}>
        <Typography sx={{ color: textSecondary, mb: 2 }}>
          Breakdown of portfolio allocation across asset categories.
        </Typography>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={allocationData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: textSecondary }}
              />
              <YAxis
                type="category"
                dataKey="asset"
                tick={{ fill: "white" }}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="weight" radius={[0, 8, 8, 0]}>
                {allocationData.map((entry, index) => (
                  <Cell
                    key={`${entry.asset}-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PaperCard>
    </Grid>
  );
};

export default CategoryDistributionModule;