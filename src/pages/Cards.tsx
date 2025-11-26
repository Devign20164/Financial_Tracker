import { useState } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { PayNowDialog } from "@/components/PayNowDialog";
import { ViewDetailsDialog } from "@/components/ViewDetailsDialog";

const Cards = () => {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const creditCards = accounts.filter((a) => a.type === "credit");
  const availableAccounts = accounts.filter((a) => a.type !== "credit");

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<typeof creditCards[0] | null>(null);

  const creditCardTransactions = creditCards.map((card) => {
    const cardTransactions = transactions
      .filter((t) => t.account_id === card.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    const monthlySpend = transactions
      .filter((t) => t.account_id === card.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { card, transactions: cardTransactions, monthlySpend };
  });

  if (accountsLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-primary-foreground mb-6">
            Credit Cards
          </h1>

          <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
              <p className="text-sm text-primary-foreground/80">Total Credit Used</p>
            </div>
            <p className="text-3xl font-bold text-primary-foreground">
              {formatCurrency(creditCards.reduce((sum, c) => sum + c.balance, 0))}
            </p>
            <p className="text-sm text-primary-foreground/80 mt-1">
              of {formatCurrency(creditCards.reduce((sum, c) => sum + (c.credit_limit || 0), 0))} available
            </p>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {creditCards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No credit cards found</p>
          </div>
        ) : (
          creditCardTransactions.map(({ card, transactions: cardTrans, monthlySpend }) => {
            const percentage = card.credit_limit ? (card.balance / card.credit_limit) * 100 : 0;
            const isNearLimit = percentage > 80;
            const remaining = (card.credit_limit || 0) - card.balance;

            return (
              <Card key={card.id} className="p-6 space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">•••• {card.id.slice(0, 4)}</p>
                  </div>
                  {isNearLimit && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10">
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      <span className="text-xs font-medium text-warning">Near Limit</span>
                    </div>
                  )}
                </div>

                {/* Balance */}
                <div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(card.balance)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(remaining)} remaining
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Credit Usage</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={cn(
                      "h-2",
                      isNearLimit && "[&>div]:bg-warning"
                    )}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">This Month</p>
                    <p className="font-semibold">{formatCurrency(monthlySpend)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="font-semibold">Dec 15</p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                {cardTrans.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3">Recent Transactions</h4>
                    <div className="space-y-2">
                      {cardTrans.map((t) => (
                        <div key={t.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{t.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <p className="font-semibold text-destructive">
                            -{formatCurrency(t.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCard(card);
                      setPayDialogOpen(true);
                    }}
                  >
                    Pay Now
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedCard(card);
                      setViewDetailsDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pay Now Dialog */}
      {selectedCard && (
        <PayNowDialog
          open={payDialogOpen}
          onOpenChange={setPayDialogOpen}
          creditCard={selectedCard}
          availableAccounts={availableAccounts}
          onPay={(fromAccountId, amount) => {
            // Handle payment logic here
            console.log(`Paying ${formatCurrency(amount)} from account ${fromAccountId} to credit card ${selectedCard.id}`);
            // In a real app, you would update the account balances here
          }}
        />
      )}

      {/* View Details Dialog */}
      {selectedCard && (
        <ViewDetailsDialog
          open={viewDetailsDialogOpen}
          onOpenChange={setViewDetailsDialogOpen}
          creditCard={selectedCard}
        />
      )}
    </div>
  );
};

export default Cards;
