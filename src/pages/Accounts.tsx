import { useAccounts } from "@/hooks/useAccounts";
import { AccountCard } from "@/components/AccountCard";
import { AccountDialog } from "@/components/AddAccountDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Accounts = () => {
  const { accounts, loading, refetch } = useAccounts();

  const cashBankAccounts = accounts.filter((a) => a.type === "cash" || a.type === "bank");
  const walletAccounts = accounts.filter((a) => a.type === "wallet");
  const creditAccounts = accounts.filter((a) => a.type === "credit");

  const totalLiquid =
    [...cashBankAccounts, ...walletAccounts].reduce((sum, acc) => sum + acc.balance, 0);
  const totalCreditDebt = creditAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAccounts = accounts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_45%)] bg-background pb-20">
      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
          <AccountDialog onSuccess={refetch}>
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add New Account
            </Button>
          </AccountDialog>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Cash & Bank Accounts</h2>
            <div className="space-y-3">
              {cashBankAccounts.map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
              ))}
              {cashBankAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  No cash or bank accounts found
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Digital Wallets</h2>
            <div className="space-y-3">
              {walletAccounts.map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
              ))}
              {walletAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  No digital wallets found
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Credit Cards</h2>
            <div className="space-y-3">
              {creditAccounts.map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
              ))}
              {creditAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  No credit cards found
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-8 pt-12 pb-24">
          <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/60 text-primary-foreground shadow-2xl ring-1 ring-white/15">
            <div className="p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary-foreground/70">Overview</p>
                <h1 className="text-4xl font-bold mt-2">Accounts</h1>
                <p className="text-sm text-primary-foreground/70 mt-1">
                  Manage your cash, wallets, and credit in one place
                </p>
              </div>
              <div className="grid gap-4 grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-inner space-y-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Total Accounts</p>
                  <p className="text-2xl font-semibold">{totalAccounts}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-inner space-y-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Liquid Assets</p>
                  <p className="text-2xl font-semibold">{formatCurrency(totalLiquid)}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md shadow-inner space-y-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Credit Debt</p>
                  <p className="text-2xl font-semibold">{formatCurrency(totalCreditDebt)}</p>
                </div>
              </div>
              <AccountDialog onSuccess={refetch}>
                <Button size="lg" className="bg-white/90 text-primary hover:bg-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Account
                </Button>
              </AccountDialog>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border/40 bg-card/80 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Cash & Bank</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {cashBankAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
                  ))}
                  {cashBankAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                      No cash or bank accounts found
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-border/40 bg-card/80 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Digital Wallets</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {walletAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
                  ))}
                  {walletAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                      No digital wallets found
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-border/40 bg-card/90 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Credit Cards</h2>
                </div>
                <div className="space-y-4">
                  {creditAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
                  ))}
                  {creditAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                      No credit cards found
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-border/40 bg-card/80 shadow-xl p-6 space-y-3">
                <h3 className="text-lg font-semibold">Totals</h3>
                <div className="grid gap-3">
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/10">
                    <p className="text-xs text-muted-foreground uppercase">Liquid</p>
                    <p className="text-xl font-semibold">{formatCurrency(totalLiquid)}</p>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/10">
                    <p className="text-xs text-muted-foreground uppercase">Credit debt</p>
                    <p className="text-xl font-semibold text-destructive">{formatCurrency(totalCreditDebt)}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
