import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/supabase";

interface IncomeExpenseChartProps {
  transactions?: Transaction[];
  loading?: boolean;
}

export const IncomeExpenseChart = ({ transactions: externalTransactions, loading: externalLoading }: IncomeExpenseChartProps = {}) => {
  const { transactions: hookTransactions, loading: hookLoading } = useTransactions();
  const transactions = externalTransactions ?? hookTransactions;
  const loading = externalTransactions === undefined ? hookLoading : externalLoading ?? false;

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </Card>
    );
  }

  // Group by month
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = date.toLocaleDateString("en-US", { month: "short" });

    const existing = acc.find((item) => item.month === monthKey);
    if (existing) {
      if (transaction.type === "income") {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
    } else {
      acc.push({
        month: monthKey,
        income: transaction.type === "income" ? transaction.amount : 0,
        expenses: transaction.type === "expense" ? transaction.amount : 0,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expenses: number }[]);

  const hasData = monthlyData.some((item) => item.income > 0 || item.expenses > 0);

  if (!hasData) {
    return (
      <Card className="p-6 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground">No income or expense data available</p>
      </Card>
    );
  }

  const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthlyData.sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));

  return (
    <Card className="p-6 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background) / 0.4)",
              border: "1px solid hsl(var(--border) / 0.5)",
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              color: "hsl(var(--foreground))",
            }}
            wrapperStyle={{ outline: "none" }}
            cursor={{ fill: "transparent" }}
            formatter={(value: number, name: string) => [
              formatCurrency(value as number),
              name === "income" ? (
                <span style={{ color: "#22c55e", fontWeight: 600 }}>income</span>
              ) : (
                <span style={{ color: "#f87171", fontWeight: 600 }}>expenses</span>
              ),
            ]}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Legend />
          <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
