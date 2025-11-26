import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/supabase";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const renderActiveShape = (props: any, showCenterDialog: boolean = true) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {showCenterDialog && (
        <>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-semibold">
            {payload.name}
          </text>
          <text x={cx} y={cy} dy={24} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
            {formatCurrency(value)}
          </text>
        </>
      )}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={2}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.3}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
        strokeWidth={2}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="hsl(var(--foreground))"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

interface SpendingChartProps {
  transactions?: Transaction[];
  loading?: boolean;
}

export const SpendingChart = ({ transactions: externalTransactions, loading: externalLoading }: SpendingChartProps = {}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { transactions: hookTransactions, loading: hookLoading } = useTransactions();
  const transactions = externalTransactions ?? hookTransactions;
  const transactionsLoading = externalTransactions === undefined ? hookLoading : externalLoading ?? false;
  const { categories, loading: categoriesLoading } = useCategories();

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    if (transactionsLoading || categoriesLoading) return [];

    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, transaction) => {
        const category = categories.find(c => c.id === transaction.category_id);
        const categoryName = category ? category.name : "Unknown";

        const existing = acc.find((item) => item.name === categoryName);
        if (existing) {
          existing.value += transaction.amount;
        } else {
          acc.push({ name: categoryName, value: transaction.amount });
        }
        return acc;
      }, [] as { name: string; value: number }[]);
  }, [transactions, categories, transactionsLoading, categoriesLoading]);

  const onPieEnter = (_: any, index: number) => {
    // Only show activeShape on hover, not when clicking
    if (index !== selectedIndex) {
      setActiveIndex(index);
    }
  };

  const onPieLeave = () => {
    // Clear hover state, but keep selected state
    setActiveIndex(undefined);
  };

  const onPieClick = (_: any, index: number) => {
    if (index === selectedIndex) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(index);
    }
    // Always clear activeIndex on click so center dialog doesn't show
    setActiveIndex(undefined);
  };

  if (transactionsLoading || categoriesLoading) {
    return (
      <Card className="p-6 flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </Card>
    );
  }

  if (spendingByCategory.length === 0) {
    return (
      <Card className="p-6 flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">No expense data available</p>
      </Card>
    );
  }

  // Calculate total for percentage display
  const total = spendingByCategory.reduce((sum, item) => sum + item.value, 0);

  // Get selected category info
  const selectedCategory = selectedIndex !== null ? spendingByCategory[selectedIndex] : null;
  const selectedPercentage = selectedCategory
    ? ((selectedCategory.value / total) * 100).toFixed(1)
    : null;

  return (
    <Card className="relative p-6">
      {/* Selected percentage display in top right */}
      {selectedPercentage !== null && selectedCategory && (
        <div className="absolute top-4 right-4 z-20 px-4 py-2 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[selectedIndex! % COLORS.length] }}
            />
            <div>
              <div className="text-xs text-muted-foreground">{selectedCategory.name}</div>
              <div className="text-lg font-bold text-foreground">{selectedPercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={(props: any) => renderActiveShape(props, activeIndex !== selectedIndex)}
              data={spendingByCategory}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={onPieClick}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={2}
            >
              {spendingByCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: activeIndex === index ? "brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.3))" : selectedIndex === index ? "brightness(1.1)" : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={80}
              iconType="circle"
              wrapperStyle={{
                paddingTop: "24px",
              }}
              formatter={(value, entry: any) => {
                const item = spendingByCategory.find((d) => d.name === value);
                const percent = item ? ((item.value / total) * 100).toFixed(1) : "0";
                return (
                  <span className="text-foreground/90 text-sm font-medium">
                    {value} <span className="text-muted-foreground">({percent}%)</span>
                  </span>
                );
              }}
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="w-full max-h-32 overflow-y-auto overflow-x-hidden px-2">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                      {payload?.map((entry: any, index: number) => {
                        const item = spendingByCategory.find((d) => d.name === entry.value);
                        const percent = item ? ((item.value / total) * 100).toFixed(1) : "0";
                        return (
                          <div key={`legend-${index}`} className="flex items-center gap-2 min-w-fit">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-foreground/90 text-sm font-medium whitespace-nowrap">
                              {entry.value}
                            </span>
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                              {percent}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
