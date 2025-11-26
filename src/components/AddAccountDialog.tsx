import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Account } from "@/lib/supabase";
import { sanitizeNumberInput, formatNumberInput } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AccountDialogProps {
  children?: React.ReactNode;
  accountToEdit?: Account;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AccountDialog = ({
  children,
  accountToEdit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: AccountDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [balance, setBalance] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [statementDate, setStatementDate] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const handleBalanceInput = (value: string) => {
    setBalance(sanitizeNumberInput(value));
  };

  const handleLimitInput = (value: string) => {
    setLimit(sanitizeNumberInput(value));
  };

  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize form when accountToEdit changes or dialog opens
  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBalance(sanitizeNumberInput(accountToEdit.balance.toString()));
      setLimit(accountToEdit.credit_limit ? sanitizeNumberInput(accountToEdit.credit_limit.toString()) : "");
      setStatementDate(accountToEdit.statement_date ? accountToEdit.statement_date.split("T")[0] : "");
      setPaymentDueDate(accountToEdit.payment_due_date ? accountToEdit.payment_due_date.split("T")[0] : "");
    } else if (!open) {
      // Reset form when closing if not editing
      setName("");
      setType("");
      setBalance("");
      setLimit("");
      setStatementDate("");
      setPaymentDueDate("");
    }
  }, [accountToEdit, open]);

  useEffect(() => {
    if (type !== "credit") {
      setLimit("");
      setStatementDate("");
      setPaymentDueDate("");
    }
  }, [type]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "bank": return "Building2";
      case "cash": return "Wallet";
      case "wallet": return "Smartphone";
      case "credit": return "CreditCard";
      default: return "Wallet";
    }
  };

  const submitAccount = async () => {
    setLoading(true);
    try {
      const parsedBalance = parseFloat(balance);
      const parsedLimit = type === "credit" && limit ? parseFloat(limit) : null;

      const accountData = {
        user_id: user.id,
        name,
        type,
        balance: parsedBalance,
        credit_limit: parsedLimit,
        currency: "PHP",
        icon: getIconForType(type),
        is_active: accountToEdit ? accountToEdit.is_active : true,
        statement_date: type === "credit" ? statementDate || null : null,
        payment_due_date: type === "credit" ? paymentDueDate || null : null,
      };

      let error;

      if (accountToEdit) {
        const { error: updateError } = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", accountToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("accounts")
          .insert(accountData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: accountToEdit ? "Account Updated" : "Account Added",
        description: `${name} ${accountToEdit ? "updated" : "added"} successfully`,
      });

      if (setOpen) setOpen(false);
      onSuccess?.();

      if (!accountToEdit) {
        setName("");
        setType("");
        setBalance("");
        setLimit("");
        setStatementDate("");
        setPaymentDueDate("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${accountToEdit ? "update" : "add"} account`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !type || !balance || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (type === "credit" && (!limit || !statementDate || !paymentDueDate)) {
      toast({
        title: "Missing Information",
        description: "Credit cards require limit, statement date, and payment due date.",
        variant: "destructive",
      });
      return;
    }

    const parsedBalance = parseFloat(balance);
    const parsedLimit = type === "credit" && limit ? parseFloat(limit) : null;

    if (Number.isNaN(parsedBalance) || (type === "credit" && (parsedLimit === null || Number.isNaN(parsedLimit)))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter valid numbers for balance and limit.",
        variant: "destructive",
      });
      return;
    }

    if (accountToEdit) {
      setConfirmSaveOpen(true);
      return;
    }

    await submitAccount();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {accountToEdit ? "Edit Account" : "Add New Account"}
            </DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Account Name *</Label>
            <Input
              id="name"
              placeholder="My Bank Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Account Type *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="wallet">Digital Wallet</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance" className="text-sm font-medium">
              {type === "credit" ? "Current Balance (Debt)" : "Balance"} *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₱</span>
              <Input
                id="balance"
                type="text"
                step="0.01"
                placeholder="0.00"
                value={formatNumberInput(balance)}
                onChange={(e) => handleBalanceInput(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          {type === "credit" && (
            <div className="space-y-2">
              <Label htmlFor="limit" className="text-sm font-medium">Credit Limit *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₱</span>
                <Input
                  id="limit"
                  type="text"
                  step="0.01"
                  placeholder="0.00"
                  value={formatNumberInput(limit)}
                  onChange={(e) => handleLimitInput(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          )}

          {type === "credit" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statement-date" className="text-sm font-medium">Statement Date *</Label>
                <Input
                  id="statement-date"
                  type="date"
                  value={statementDate}
                  onChange={(e) => setStatementDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-due-date" className="text-sm font-medium">Payment Due Date *</Label>
                <Input
                  id="payment-due-date"
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen && setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (accountToEdit ? "Updating..." : "Adding...") : (accountToEdit ? "Save Changes" : "Add Account")}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save changes?</AlertDialogTitle>
          <AlertDialogDescription>
            This will update the details for <span className="font-semibold">{name || "this account"}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
            onClick={async () => {
              setConfirmSaveOpen(false);
              await submitAccount();
            }}
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
