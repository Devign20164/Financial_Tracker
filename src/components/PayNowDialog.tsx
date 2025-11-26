import { useState, useEffect } from "react";
import { Account } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Wallet } from "lucide-react";
import { formatCurrency, sanitizeNumberInput, formatNumberInput } from "@/lib/utils";

interface PayNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditCard: Account;
  availableAccounts: Account[];
  onPay: (fromAccountId: string, amount: number) => void;
}

export const PayNowDialog = ({
  open,
  onOpenChange,
  creditCard,
  availableAccounts,
  onPay,
}: PayNowDialogProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>(sanitizeNumberInput(creditCard.balance.toFixed(2)));

  useEffect(() => {
    if (open) {
      setAmount(sanitizeNumberInput(creditCard.balance.toFixed(2)));
      setSelectedAccountId("");
    }
  }, [creditCard, open]);

  const handleAmountChange = (value: string) => {
    setAmount(sanitizeNumberInput(value));
  };

  const numericAmount = parseFloat(amount || "0");

  const handlePay = () => {
    if (selectedAccountId && numericAmount) {
      onPay(selectedAccountId, numericAmount);
      onOpenChange(false);
      setSelectedAccountId("");
      setAmount(sanitizeNumberInput(creditCard.balance.toFixed(2)));
    }
  };

  const selectedAccount = availableAccounts.find((a) => a.id === selectedAccountId);
  const canPay = !!(selectedAccountId && numericAmount > 0 && (!selectedAccount || numericAmount <= selectedAccount.balance));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Pay Credit Card</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handlePay(); }} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="card" className="text-sm font-medium">Credit Card</Label>
            <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-primary" />
                <p className="font-semibold text-card-foreground">{creditCard.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Balance: {formatCurrency(creditCard.balance)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account" className="text-sm font-medium">Pay From Account *</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId} required>
              <SelectTrigger id="account">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select an account" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccount && (
              <p className="text-xs text-muted-foreground mt-1">
                Available: {formatCurrency(selectedAccount.balance)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₱</span>
              <Input
                id="amount"
                type="text"
                step="0.01"
                min="0"
                value={formatNumberInput(amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="pl-9"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(sanitizeNumberInput(creditCard.balance.toFixed(2)))}
                className="flex-1"
              >
                Pay Full Balance
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(sanitizeNumberInput((creditCard.balance * 0.5).toFixed(2)))}
                className="flex-1"
              >
                Pay 50%
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canPay} className="flex-1">
              Pay Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

