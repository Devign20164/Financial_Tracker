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
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Transaction } from "@/lib/supabase";
import { cn, formatCurrency, sanitizeNumberInput, formatNumberInput } from "@/lib/utils";
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

interface TransactionDialogProps {
  type?: "income" | "expense";
  children?: React.ReactNode;
  transactionToEdit?: Transaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TransactionDialog = ({
  type: initialType,
  children,
  transactionToEdit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: TransactionDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  // Determine type from prop or transaction
  const type = transactionToEdit ? transactionToEdit.type : initialType || "expense";
  const isIncome = type === "income";

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { accounts } = useAccounts();
  const { categories } = useCategories(type);

  // Initialize form when transactionToEdit changes or dialog opens
  useEffect(() => {
    if (transactionToEdit) {
      setAmount(sanitizeNumberInput(transactionToEdit.amount.toString()));
      setCategoryId(transactionToEdit.category_id);
      setAccountId(transactionToEdit.account_id);
      setDescription(transactionToEdit.description || "");
    } else if (!open) {
      // Reset form when closing if not editing
      setAmount("");
      setCategoryId("");
      setAccountId("");
      setDescription("");
    }
  }, [transactionToEdit, open]);

  const handleAmountInput = (value: string) => {
    setAmount(sanitizeNumberInput(value));
  };

  const submitTransaction = async () => {
    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      const transactionData = {
        user_id: user.id,
        account_id: accountId,
        category_id: categoryId,
        type,
        amount: parsedAmount,
        description: description || null,
        date: transactionToEdit ? transactionToEdit.date : new Date().toISOString(),
      };

      let error;

      if (transactionToEdit) {
        const { error: updateError } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transactionToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("transactions")
          .insert(transactionData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: transactionToEdit ? "Transaction Updated" : "Transaction Added",
        description: `${isIncome ? "Income" : "Expense"} ${transactionToEdit ? "updated" : "added"} successfully`,
      });

      if (setOpen) setOpen(false);
      onSuccess?.();

      if (!transactionToEdit) {
        // Reset form only if adding
        setAmount("");
        setCategoryId("");
        setAccountId("");
        setDescription("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${transactionToEdit ? "update" : "add"} transaction`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId || !accountId || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (Number.isNaN(parseFloat(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for the amount.",
        variant: "destructive",
      });
      return;
    }

    if (transactionToEdit) {
      setConfirmSaveOpen(true);
      return;
    }

    await submitTransaction();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        className={cn(
          "max-w-[calc(100%-2rem)] sm:max-w-[380px] rounded-3xl border-2 shadow-2xl",
          isIncome
            ? "border-success/40 bg-gradient-to-b from-success/15 via-background to-background"
            : "border-destructive/40 bg-gradient-to-b from-destructive/15 via-background to-background",
        )}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isIncome ? "bg-success/10" : "bg-destructive/10"}`}>
              {isIncome ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <DialogTitle className="text-xl">
              {transactionToEdit ? "Edit" : "Add"} {isIncome ? "Income" : "Expense"}
            </DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₱</span>
              <Input
                id="amount"
                type="text"
                step="0.01"
                placeholder="0.00"
                value={formatNumberInput(amount)}
                onChange={(e) => handleAmountInput(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account" className="text-sm font-medium">Account *</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen && setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (transactionToEdit ? "Updating..." : "Adding...") : (transactionToEdit ? "Save Changes" : `Add ${isIncome ? "Income" : "Expense"}`)}
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
            This will update the {isIncome ? "income" : "expense"} entry for{" "}
            <span className="font-semibold">{categories.find((c) => c.id === categoryId)?.name || "this transaction"}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
            onClick={async () => {
              setConfirmSaveOpen(false);
              await submitTransaction();
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
