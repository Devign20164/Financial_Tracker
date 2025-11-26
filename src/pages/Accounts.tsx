import { useAccounts } from "@/hooks/useAccounts";
import { AccountCard } from "@/components/AccountCard";
import { AccountDialog } from "@/components/AddAccountDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Accounts = () => {
  const { accounts, loading, refetch } = useAccounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Add Account Button */}
        <AccountDialog onSuccess={refetch}>
          <Button className="w-full" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add New Account
          </Button>
        </AccountDialog>

        {/* Cash & Bank Accounts */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Cash & Bank Accounts</h2>
          <div className="space-y-3">
            {accounts
              .filter((a) => a.type === "cash" || a.type === "bank")
              .map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
              ))}
            {accounts.filter((a) => a.type === "cash" || a.type === "bank").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                No cash or bank accounts found
              </p>
            )}
          </div>
        </section>

        {/* Digital Wallets */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Digital Wallets</h2>
          <div className="space-y-3">
            {accounts
              .filter((a) => a.type === "wallet")
              .map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
              ))}
            {accounts.filter((a) => a.type === "wallet").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                No digital wallets found
              </p>
            )}
          </div>
        </section>

        {/* Credit Cards */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Credit Cards</h2>
          <div className="space-y-3">
            {accounts
              .filter((a) => a.type === "credit")
              .map((account) => (
                <AccountCard key={account.id} account={account} onAccountUpdated={refetch} />
              ))}
            {accounts.filter((a) => a.type === "credit").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                No credit cards found
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Accounts;
