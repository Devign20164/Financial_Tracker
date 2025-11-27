import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { AccountCard } from "@/components/AccountCard";
import { TransactionItem } from "@/components/TransactionItem";
import { SpendingChart } from "@/components/SpendingChart";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { TransactionDialog } from "@/components/AddTransactionDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { accounts, loading: accountsLoading, refetch: refetchAccounts } = useAccounts();
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useTransactions();

  const navigate = useNavigate();

  const totalBalance = accounts
    .filter((account) => account.type !== "credit")
    .reduce((sum, account) => sum + account.balance, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_45%)] bg-background pb-16">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6 pb-20">
        <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl shadow-lg">
          <div className="max-w-lg mx-auto">
            <p className="text-primary-foreground/80 text-sm mb-2">Total Balance</p>
            <h1 className="text-4xl font-bold text-primary-foreground mb-6">
              {formatCurrency(totalBalance)}
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-xs text-primary-foreground/80">Income</p>
                </div>
                <p className="text-xl font-bold text-primary-foreground">
                  {formatCurrency(totalIncome)}
                </p>
              </Card>

              <Card className="p-4 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <p className="text-xs text-primary-foreground/80">Expenses</p>
                </div>
                <p className="text-xl font-bold text-primary-foreground">
                  {formatCurrency(totalExpenses)}
                </p>
              </Card>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
          <div className="flex gap-3">
            <TransactionDialog type="income" onSuccess={refetchTransactions}>
              <Button className="flex-1" size="lg">
                <Plus className="h-5 w-5" />
                Add Income
              </Button>
            </TransactionDialog>
            <TransactionDialog type="expense" onSuccess={refetchTransactions}>
              <Button className="flex-1" size="lg">
                <Plus className="h-5 w-5" />
                Add Expense
              </Button>
            </TransactionDialog>
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Accounts
              </h2>
            </div>
            <div className="grid gap-3">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetchAccounts} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
            <SpendingChart transactions={transactions} loading={transactionsLoading} />
            <IncomeExpenseChart transactions={transactions} loading={transactionsLoading} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>View All</Button>
            </div>
            <Card className="divide-y divide-border bg-card shadow-sm">
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} onTransactionUpdated={refetchTransactions} />
              ))}
            </Card>
          </section>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-12 pb-24">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-2xl ring-1 ring-white/15">
          <div className="absolute inset-0">
            <div className="absolute inset-y-0 right-16 w-48 bg-white/10 blur-3xl" />
            <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-white/20 blur-2xl opacity-60" />
          </div>
          <div className="relative p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary-foreground/70">Total Balance</p>
                <h1 className="text-5xl font-bold mt-2">{formatCurrency(totalBalance)}</h1>
                <p className="text-primary-foreground/70 text-sm mt-2">Across all non-credit accounts</p>
              </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-md shadow-inner space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/80">
                    <TrendingUp className="h-4 w-4 text-lime-300" />
                    Income
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-white/70">All time inflow</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/5 p-4 backdrop-blur-md shadow-inner space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/80">
                    <TrendingDown className="h-4 w-4 text-rose-300" />
                    Expenses
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-white/70">All time outflow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shadow-xl">
              <div>
                <p className="text-sm text-muted-foreground">Quick Actions</p>
                <h3 className="text-lg font-semibold">Track finances in seconds</h3>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <TransactionDialog type="income" onSuccess={refetchTransactions}>
                  <Button size="lg" className="flex-1">
                    <Plus className="h-5 w-5" />
                    Add Income
                  </Button>
                </TransactionDialog>
                <TransactionDialog type="expense" onSuccess={refetchTransactions}>
                  <Button size="lg" variant="outline" className="flex-1">
                    <Plus className="h-5 w-5" />
                    Add Expense
                  </Button>
                </TransactionDialog>
              </div>
            </Card>

            {/* Accounts Section */}
            <Card className="p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Accounts
                </h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} onAccountUpdated={refetchAccounts} />
                ))}
              </div>
            </Card>

            {/* Analytics */}
            <section className="space-y-4 mt-6">
              <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-[360px]">
                  <SpendingChart transactions={transactions} loading={transactionsLoading} />
                </div>
                <div className="h-[360px]">
                  <IncomeExpenseChart transactions={transactions} loading={transactionsLoading} />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Recent Transactions */}
            <Card className="p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                  <p className="text-xs text-muted-foreground">Latest five activities</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
                  View All
                </Button>
              </div>
              <div className="divide-y divide-border">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} onTransactionUpdated={refetchTransactions} />
                ))}
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
