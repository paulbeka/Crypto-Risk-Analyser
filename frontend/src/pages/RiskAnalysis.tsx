import { useEffect, useMemo, useState } from 'react';
import type { PortfolioEntry } from '../App';
import { submitPortfolio } from '../api/Api';
import Grid from "@mui/material/Grid";
import {
  Paper,
  Typography,
  LinearProgress,
  Box,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import LoadingPage from '../components/LoadingPage';
import type { PortfolioRiskAnalysis } from '../types/PortfolioRiskAnalysis';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import StatCard from "../components/StatCard";
import PaperCard from "../components/PaperCard";
import CustomButton from '../components/CustomButton';
import { chartColors, dashboardBg, cardBg, borderColor, textPrimary, textSecondary } from '../theme/colors';
import RiskSensitivityModule from "../components/modules/RiskSensitivityModule";
import StressTestModule from "../components/modules/StressTestModule";

function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

function formatPercent(value: number | string | null | undefined, multiplyIfNeeded = false): string {
  const raw = Number(value ?? 0);
  if (!Number.isFinite(raw)) return '0%';
  const normalized = multiplyIfNeeded ? raw * 100 : raw;
  return `${normalized.toFixed(1)}%`;
}

function formatNumber(value: number | string | null | undefined, digits = 2): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return num.toFixed(digits);
}

function clampPercent(value: number | string | null | undefined, multiplyIfNeeded = false): number {
  const raw = Number(value ?? 0);
  if (!Number.isFinite(raw)) return 0;
  const normalized = multiplyIfNeeded ? raw * 100 : raw;
  return Math.max(0, Math.min(100, normalized));
}

function scoreColor(score: number): string {
  if (score < 35) return '#22c55e';
  if (score < 70) return '#f59e0b';
  return '#ef4444';
}

function normalizePortfolioWeight(weight: number): number {
  if (!Number.isFinite(weight)) return 0;
  return weight <= 1 ? weight * 100 : weight;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; payload?: Record<string, unknown> }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Box
      sx={{
        background: '#111827',
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        px: 1.5,
        py: 1,
      }}
    >
      {label ? (
        <Typography variant="body2" sx={{ color: textPrimary, fontWeight: 600 }}>
          {label}
        </Typography>
      ) : null}

      {payload.map((entry, index) => (
        <Typography key={index} variant="body2" sx={{ color: textSecondary }}>
          {entry.name}: {formatNumber(entry.value, 2)}
        </Typography>
      ))}
    </Box>
  );
}

function RiskProgress({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  color?: string;
  subtitle?: string;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography variant="body2" sx={{ color: textSecondary }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: textPrimary, fontWeight: 600 }}>
          {formatPercent(value)}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 10,
          borderRadius: 999,
          backgroundColor: 'rgba(148,163,184,0.15)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            backgroundColor: color ?? '#60a5fa',
          },
        }}
      />

      {subtitle ? (
        <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: textSecondary }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}


const RiskAnalysis = ({ portfolio, setPortfolio, setIsOnInput }: { 
  portfolio: PortfolioEntry[],
  setPortfolio: any,
  setIsOnInput: any
}) => {
  const [riskResult, setRiskResult] = useState<PortfolioRiskAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setError(null);
        const res = await submitPortfolio(portfolio);
        if (isMounted) {
          setRiskResult(res);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to load portfolio risk analysis.');
        }
      }
    };

    if (portfolio.length > 0) {
      run();
    } else {
      setRiskResult(null);
    }

    return () => {
      isMounted = false;
    };
  }, [portfolio]);

  const allocationData = useMemo(
    () =>
      (portfolio ?? []).map((entry) => ({
        asset: entry.crypto,
        weight: normalizePortfolioWeight(Number(entry.allocation)),
      })),
    [portfolio]
  );

  const totalAllocation = useMemo(
    () => allocationData.reduce((sum, item) => sum + item.weight, 0),
    [allocationData]
  );

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: dashboardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 500,
            width: '100%',
            borderRadius: 4,
            background: cardBg,
            color: textPrimary,
            border: `1px solid ${borderColor}`,
          }}
        >
          <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
            Wallet Risk Analytics
          </Typography>
          <Typography sx={{ color: textSecondary }}>{error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (riskResult == null) {
    return <LoadingPage />;
  }

  const liquidityRisk = riskResult.liquidity_risk;
  const structureRisk = riskResult.structure_risk;

  const riskScore = clampPercent(riskResult.risk_score);
  const liquidityFlagged = clampPercent(liquidityRisk.low_liquidity_share);
  const top1 = clampPercent(structureRisk.top1_concentration);
  const top3 = clampPercent(structureRisk.top3_concentration);

  const structureChartData = [
    { name: 'Top 1', value: top1 },
    { name: 'Top 3', value: top3 },
    { name: 'HHI', value: Math.min(Number(structureRisk.hhi_index ?? 0), 100) },
  ];

  const liquidityDaysChartData = [
    { name: 'Worst Position', value: Number(liquidityRisk.worst_position_days ?? 0) },
    { name: 'Weighted Avg', value: Number(liquidityRisk.weighted_avg_days ?? 0) },
    { name: 'P50', value: Number(liquidityRisk.p50_days ?? 0) },
    { name: 'P90', value: Number(liquidityRisk.p90_days ?? 0) },
  ];

  const runNewAnalysis = () => {
    setIsOnInput(true);
    setPortfolio([]);
  }

  return (
    <Box
      sx={{
        p: { xs: 1, md: 10 },
        background: `radial-gradient(circle at top left, rgba(30,41,59,0.55), transparent 32%), ${dashboardBg}`,
        minHeight: '100vh',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: textPrimary, fontWeight: 800 }}>
            Wallet Risk Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: textSecondary, mt: 0.5 }}>
            Portfolio diagnostics, concentration, liquidity, and stress indicators
          </Typography>
        </Box>

        <CustomButton onClick={runNewAnalysis}>
          Run New Analysis
        </CustomButton>

      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(riskResult.portfolio_value)}
            subtitle="Estimated USD value"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Risk Score"
            value={`${formatNumber(riskScore, 0)}/100`}
            subtitle="Aggregate portfolio risk"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Liquidity Flagged"
            value={formatPercent(liquidityFlagged)}
            subtitle="Share of lower-liquidity positions"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PaperCard title="Portfolio Allocation" minHeight={360}>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationData} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                  <XAxis type="number" tick={{ fill: textSecondary }} domain={[0, 'dataMax']} />
                  <YAxis
                    type="category"
                    dataKey="asset"
                    tick={{ fill: textPrimary }}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="weight" radius={[0, 8, 8, 0]}>
                    {allocationData.map((entry, index) => (
                      <Cell key={`${entry.asset}-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Divider sx={{ my: 2, borderColor }} />

            <Stack spacing={1.2}>
              {allocationData.map((p, index) => (
                <Box key={p.asset}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: textPrimary }}>
                      {p.asset}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary }}>
                      {formatPercent(p.weight)}
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, p.weight))}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: 'rgba(148,163,184,0.15)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        backgroundColor: chartColors[index % chartColors.length],
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>

            <Typography variant="caption" sx={{ mt: 2, display: 'block', color: textSecondary }}>
              Total displayed allocation: {formatPercent(totalAllocation)}
            </Typography>
          </PaperCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PaperCard
            title="Aggregated Risk Score"
            minHeight={360}
            action={
              <Chip
                label={riskScore < 35 ? 'Low' : riskScore < 70 ? 'Medium' : 'High'}
                size="small"
                sx={{
                  color: textPrimary,
                  background: `${scoreColor(riskScore)}22`,
                  border: `1px solid ${scoreColor(riskScore)}55`,
                }}
              />
            }
          >
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: 260, height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Risk Score', value: riskScore },
                          { name: 'Remaining', value: Math.max(0, 100 - riskScore) },
                        ]}
                        dataKey="value"
                        innerRadius={70}
                        outerRadius={95}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill={scoreColor(riskScore)} />
                        <Cell fill="rgba(148,163,184,0.15)" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    mt: 9.5,
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="h4" sx={{ color: textPrimary, fontWeight: 800 }}>
                    {formatNumber(riskScore, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary }}>
                    Risk Score
                  </Typography>
                </Box>
              </Box>

              <RiskProgress
                label="Low Liquidity Share"
                value={liquidityFlagged}
                color="#22d3ee"
                subtitle="Proportion of positions that may be harder to exit quickly."
              />
            </Stack>
          </PaperCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PaperCard title="Structure Risk" minHeight={360}>
            <Stack spacing={2.5}>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={structureChartData} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                    <XAxis dataKey="name" tick={{ fill: textSecondary }} />
                    <YAxis tick={{ fill: textSecondary }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {structureChartData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Divider sx={{ borderColor }} />

              <Stack spacing={1.5}>
                <RiskProgress
                  label="Top 1 Concentration"
                  value={top1}
                  color="#60a5fa"
                />
                <RiskProgress
                  label="Top 3 Concentration"
                  value={top3}
                  color="#fbbf24"
                />
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  HHI Index: <Box component="span" sx={{ color: textPrimary, fontWeight: 700 }}>{formatNumber(structureRisk.hhi_index)}</Box>
                </Typography>
              </Stack>
            </Stack>
          </PaperCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PaperCard title="Liquidity Risk" minHeight={360}>
            <Stack spacing={2.5}>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liquidityDaysChartData} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                    <XAxis dataKey="name" tick={{ fill: textSecondary }} />
                    <YAxis tick={{ fill: textSecondary }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {liquidityDaysChartData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={chartColors[(index + 2) % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Divider sx={{ borderColor }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: textSecondary }}>Liquidity Ratio</Typography>
                  <Typography variant="h6" sx={{ color: textPrimary }}>{formatNumber(liquidityRisk.liquidity_ratio)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: textSecondary }}>Low Liquidity Share</Typography>
                  <Typography variant="h6" sx={{ color: textPrimary }}>{formatPercent(liquidityFlagged)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: textSecondary }}>Weighted Avg Days</Typography>
                  <Typography variant="h6" sx={{ color: textPrimary }}>{formatNumber(liquidityRisk.weighted_avg_days)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" sx={{ color: textSecondary }}>Worst Position Days</Typography>
                  <Typography variant="h6" sx={{ color: textPrimary }}>{formatNumber(liquidityRisk.worst_position_days)}</Typography>
                </Grid>
              </Grid>
            </Stack>
          </PaperCard>
        </Grid>

        <RiskSensitivityModule riskResult={riskResult} />

        <StressTestModule riskResult={riskResult} />

      </Grid>
      
      <br />
      <br />
      <br />

      <Grid size={{ xs: 12, lg: 6 }}>
        <PaperCard title="AI Assessment" minHeight={360}>
          <Typography>
            This is the recap of the portfolio risk [use an LLM here]
          </Typography>
        </PaperCard>
      </Grid>
    </Box>
  );
};

export default RiskAnalysis;