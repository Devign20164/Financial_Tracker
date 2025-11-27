import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionItem } from "@/components/TransactionItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const Transactions = () => {
  const { transactions, loading, refetch } = useTransactions();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Note: Filtering by category name is tricky since we only have category_id in the transaction object.
  // For a production app, we'd want to join this data or fetch it.
  // For now, we'll filter by description only.
  const filteredTransactions = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) =>
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_45%)] bg-background pb-20">
      {/* Mobile layout (unchanged) */}
      <div className="lg:hidden">
        <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl shadow-lg">
          <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-primary-foreground mb-6">
              Transactions
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-xs text-primary-foreground/80">Total Income</p>
                </div>
                <p className="text-xl font-bold text-primary-foreground">
                  {formatCurrency(totalIncome)}
                </p>
              </Card>

              <Card className="p-4 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <p className="text-xs text-primary-foreground/80">Total Expenses</p>
                </div>
                <p className="text-xl font-bold text-primary-foreground">
                  {formatCurrency(totalExpenses)}
                </p>
              </Card>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>

          <Card className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions found</div>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} onTransactionUpdated={refetch} />
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-8 pt-12 pb-24">
          <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/60 text-primary-foreground shadow-2xl ring-1 ring-white/15">
            <div className="p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary-foreground/70">Overview</p>
                <h1 className="text-4xl font-bold mt-2">Transactions</h1>
                <p className="text-sm text-primary-foreground/70 mt-1">Monitor your cash flow in real-time</p>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-inner space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/80">
                    <TrendingUp className="h-4 w-4 text-lime-300" />
                    Total Income
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-white/70">All time</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md shadow-inner space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/80">
                    <TrendingDown className="h-4 w-4 text-rose-300" />
                    Total Expenses
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-white/70">All time</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="p-6 shadow-xl space-y-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="mt-2 md:mt-0">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expense">Expenses</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="rounded-2xl border border-border/60">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No transactions found</div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} onTransactionUpdated={refetch} />
                  ))
                )}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 shadow-xl space-y-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="rounded-2xl border border-border/50 p-4 bg-card/80">
                  <p className="text-sm text-muted-foreground">Net Flow</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalIncome - totalExpenses)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/50 p-4 bg-card/70 space-y-1">
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-xl font-semibold text-success">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="rounded-xl border border-border/50 p-4 bg-card/70 space-y-1">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="text-xl font-semibold text-destructive">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
