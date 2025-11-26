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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Quick Actions */}
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

        {/* Accounts Section */}
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

        {/* Analytics */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
          <SpendingChart transactions={transactions} loading={transactionsLoading} />
          <IncomeExpenseChart transactions={transactions} loading={transactionsLoading} />
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>View All</Button>
          </div>
          <Card className="divide-y divide-border">
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} onTransactionUpdated={refetchTransactions} />
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
